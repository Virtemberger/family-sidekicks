import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleEventsForFamily } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema, eventOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const inputSchema = commonFamilyInputSchema.extend({
  location: z.object({
    city: z.string().min(2).max(80),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
  timeframe: z.enum(["today", "this-weekend", "next-weekend"]),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid event request", issues: parsed.error.issues }, { status: 400 });
  }

  if (parsed.data.useSample || !hasOpenAIKey()) {
    const { family, location } = parsed.data;
    return Response.json(sampleEventsForFamily(family, location.city));
  }

  const startedAt = Date.now();
  const { family, location, timeframe, activeParent } = parsed.data;
  const coordinateContext =
    location.latitude !== undefined && location.longitude !== undefined
      ? `Coordinates: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}. Use them only for this search.`
      : "";

  try {
    const openai = getOpenAI();
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "medium" },
      tools: [
        {
          type: "web_search",
          user_location:
            location.latitude !== undefined
              ? { type: "approximate", country: family.country }
              : {
                  type: "approximate",
                  country: family.country,
                  city: location.city,
                  region: "Baden-Württemberg",
                },
        },
      ],
      tool_choice: "required",
      input: [
        {
          role: "system",
          content:
            "You are Scout Skippy, a precise family activity researcher. Search the current web. Return only events whose date, venue and source are supported by the source URL. Never invent availability, prices or exact travel times. Prefer official organizers. Explain family fit in one sentence. The result is for a parent, not a child.",
        },
        {
          role: "user",
          content: `Find up to four family activities for ${timeframe} near ${location.city}, within roughly ${family.radiusKm} km. ${coordinateContext}\nChildren: ${family.children
            .map(
              (child) =>
                `${child.name}, ${child.age}, interests ${child.interests.join(", ")}, allergies ${child.allergies.join(", ") || "none"}`,
            )
            .join("; ")}. Budget: ${family.budget}. Active parent: ${activeParent}. Use current event information and direct source URLs.`,
        },
      ],
      text: { format: zodTextFormat(eventOutputSchema, "family_events") },
    });

    if (!response.output_parsed) {
      throw new Error("GPT-5.6 Terra returned no structured event result");
    }

    const events = response.output_parsed.events.filter((event) => isSafeHttpUrl(event.sourceUrl));
    if (!events.length) {
      throw new Error("Skippy found no events with a valid source URL");
    }

    return Response.json({
      mode: "live",
      ...response.output_parsed,
      events: events.map((event, index) => ({
        ...event,
        id: `live-event-${index + 1}`,
      })),
      trace: createTrace(startedAt, "events-v1", ["web_search", "structured_output"]),
    });
  } catch (error) {
    return apiError(error);
  }
}
