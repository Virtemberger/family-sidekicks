import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema, localBriefOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({ kind: z.enum(["care", "admin"]) });

function safeUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
}

function sampleBrief(kind: "care" | "admin", city: string) {
  if (kind === "care") return {
    mode: "sample" as const,
    notice: "Sample directory preview - these are not live opening hours. Use Live local search and verify before visiting.",
    title: `Care around ${city}`,
    summary: "The production version combines saved family doctors with a sourced local pharmacy directory.",
    items: [
      { kind: "pharmacy" as const, title: "Nearby pharmacy placeholder", summary: "A live result will show a sourced pharmacy and its published hours.", address: city, phone: "", openingHours: "Verify before visiting", sourceName: "German pharmacy emergency finder", sourceUrl: "https://www.aponet.de/apotheke/notdienstsuche" },
    ],
    trace: createTrace(Date.now(), "local-care-v1", ["Sample directory"], "Sample fixture"),
  };
  return {
    mode: "sample" as const,
    notice: "Sample civic brief - live mode searches current official sources.",
    title: `Family services in ${city}`,
    summary: "Pip watches official family-service updates and keeps source verification beside every item.",
    items: [
      { kind: "service" as const, title: `${city} family services`, summary: "Open the official city portal for current appointments, forms and opening rules.", address: city, phone: "", openingHours: "Verify on official site", sourceName: `${city} official portal`, sourceUrl: "https://www.stuttgart.de/" },
    ],
    trace: createTrace(Date.now(), "local-admin-v1", ["Official source placeholder"], "Sample fixture"),
  };
}

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid local brief request", issues: parsed.error.issues }, { status: 400 });
  const { family, kind } = parsed.data;
  if (parsed.data.useSample || !hasOpenAIKey()) return Response.json(sampleBrief(kind, family.city));

  const startedAt = Date.now();
  try {
    const openai = getOpenAI();
    const task = kind === "care"
      ? `Find up to four pharmacies near ${family.city}, ${family.country}. Return only published addresses, phone numbers and opening hours supported by a direct source. Include an emergency pharmacy finder if useful. Do not give medical advice and do not claim a pharmacy is currently open unless the source explicitly supports it.`
      : `Find up to five current official updates or services in ${family.city}, ${family.country} relevant to families with children aged ${family.children.map((child) => child.age).join(" and ")}. Include city hall or citizen-service contact information plus recent family, school, daycare or benefit news. Prefer official municipal or government sources and do not infer deadlines.`;
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "medium" },
      tools: [{ type: "web_search", user_location: { type: "approximate", country: family.country, city: family.city } }],
      tool_choice: "required",
      input: [
        { role: "system", content: "You create a concise sourced local family brief. Every item must be directly supported by its URL. Use empty strings for unavailable address, phone or opening hours. Never invent contact details, office hours, deadlines or medical availability." },
        { role: "user", content: task },
      ],
      text: { format: zodTextFormat(localBriefOutputSchema, `local_${kind}_brief`) },
    });
    if (!response.output_parsed) throw new Error("No structured local brief returned");
    const items = response.output_parsed.items.filter((item) => safeUrl(item.sourceUrl));
    if (!items.length) throw new Error("No local brief items with valid source URLs were found");
    return Response.json({ mode: "live", ...response.output_parsed, items, trace: createTrace(startedAt, `local-${kind}-v1`, ["web_search", "structured_output", "official_source_preference"]) });
  } catch (error) {
    return apiError(error);
  }
}
