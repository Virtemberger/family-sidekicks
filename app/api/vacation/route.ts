import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleVacationForFamily } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema, vacationOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  destination: z.string().min(2).max(100),
  destinationSource: z.enum(["family-idea", "romy-recommendation"]).default("family-idea"),
  travelScope: z.enum(["domestic", "nearby", "worldwide"]).default("nearby"),
  startDate: z.string().min(8).max(20),
  endDate: z.string().min(8).max(20),
  pace: z.enum(["relaxed", "balanced", "full"]),
  transport: z.enum(["car", "train", "flight", "open"]),
  accommodation: z.enum(["hotel", "apartment", "resort", "flexible"]).default("flexible"),
  budgetEuro: z.number().int().min(100).max(50000),
  priorities: z.array(z.string().min(2).max(80)).min(1).max(8),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid vacation request", issues: parsed.error.issues }, { status: 400 });
  const { family, destination, destinationSource, travelScope, startDate, endDate, pace, transport, accommodation, budgetEuro, priorities } = parsed.data;
  if (parsed.data.useSample || !hasOpenAIKey()) return Response.json(sampleVacationForFamily(family, destination));

  const startedAt = Date.now();
  try {
    const openai = getOpenAI();
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "medium" },
      input: [
        { role: "system", content: "You are Romy, a calm and operationally realistic family vacation planner. Build a usable outline with protected downtime, age-appropriate pacing and allergy-aware logistics. Treat prices as planning guardrails, not live quotes. Do not claim current availability, opening hours, safety conditions, visa rules or booking status. Do not overfill days." },
        { role: "user", content: `Plan a family vacation to ${destination} from ${startDate} to ${endDate}. The destination came from: ${destinationSource}. Travel scope: ${travelScope}. Starting point: ${family.city}. Transport preference: ${transport}. Accommodation preference: ${accommodation}. Pace: ${pace}. Total budget guardrail: EUR ${budgetEuro}. Priorities: ${priorities.join(", ")}. Travelers: ${family.children.map((child) => `${child.name}, age ${child.age}, interests ${child.interests.join(", ")}, allergies ${child.allergies.join(", ") || "none"}`).join("; ")}. Parents: ${family.parents.map((parent) => `${parent.name} owns ${parent.ownedDomains.join(", ")}`).join("; ")}. Return the exact selected destination, explain why it fits, then create a concise day structure, travel plan, packing highlights and budget notes.` },
      ],
      text: { format: zodTextFormat(vacationOutputSchema, "family_vacation_plan") },
    });
    if (!response.output_parsed) throw new Error("Romy returned no structured vacation plan");
    return Response.json({ mode: "live", ...response.output_parsed, trace: createTrace(startedAt, "vacation-v1", ["structured_output", "shared_family_context", "planning_guardrails"]) });
  } catch (error) { return apiError(error); }
}
