import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleMealForFamily } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema, mealOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  availableMinutes: z.number().int().min(10).max(90),
  pantry: z.array(z.string().max(60)).max(20),
  request: z.string().max(300),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid meal request", issues: parsed.error.issues }, { status: 400 });
  }

  if (parsed.data.useSample || !hasOpenAIKey()) {
    const { family } = parsed.data;
    return Response.json(sampleMealForFamily(family));
  }

  const startedAt = Date.now();
  const { family, availableMinutes, pantry, request: mealRequest, activeParent } = parsed.data;
  const parentProfile = family.parents.find((parent) => parent.id === activeParent) ?? family.parents[0];

  try {
    const openai = getOpenAI();
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "medium" },
      input: [
        {
          role: "system",
          content:
            "You are Kitchen Coach, a practical family meal planner. Allergies are hard constraints. Give a realistic recipe that fits the available time, clearly separate pantry items from shopping gaps, and include one age-appropriate serving adaptation. Do not make medical or nutritional claims.",
        },
        {
          role: "user",
          content: `Plan one dinner in at most ${availableMinutes} minutes. Request: ${mealRequest}. Pantry: ${pantry.join(", ")}. Family: ${family.children
            .map(
              (child) =>
                `${child.name}, age ${child.age}, interests ${child.interests.join(", ")}, allergies ${child.allergies.join(", ") || "none"}, dislikes ${child.dislikes.join(", ") || "none"}`,
            )
            .join("; ")}. Budget: ${family.budget}. Active parent ${parentProfile.name} prefers a ${parentProfile.responseStyle} answer and usually owns ${parentProfile.ownedDomains.join(", ") || "no set domains"}.`,
        },
      ],
      text: { format: zodTextFormat(mealOutputSchema, "family_meal") },
    });

    if (!response.output_parsed) {
      throw new Error("GPT-5.6 Terra returned no structured meal result");
    }

    return Response.json({
      mode: "live",
      ...response.output_parsed,
      trace: createTrace(startedAt, "meals-v1", ["structured_output", "family_context"]),
    });
  } catch (error) {
    return apiError(error);
  }
}
