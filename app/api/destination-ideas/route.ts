import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleDestinationIdeasForFamily } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema, destinationIdeasOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  travelScope: z.enum(["domestic", "nearby", "worldwide"]),
  maxTravelHours: z.number().int().min(1).max(24),
  startDate: z.string().min(8).max(20),
  endDate: z.string().min(8).max(20),
  budgetEuro: z.number().int().min(100).max(50000),
  priorities: z.array(z.string().min(2).max(80)).min(1).max(8),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid destination inspiration request", issues: parsed.error.issues }, { status: 400 });
  const { family, travelScope, maxTravelHours, startDate, endDate, budgetEuro, priorities } = parsed.data;
  if (parsed.data.useSample || !hasOpenAIKey()) return Response.json(sampleDestinationIdeasForFamily(family, travelScope));

  const startedAt = Date.now();
  const scopeRule = travelScope === "domestic" ? `Stay inside ${family.country}.` : travelScope === "nearby" ? `Stay within roughly ${maxTravelHours} hours of travel from ${family.city}; neighboring countries are allowed.` : "Worldwide ideas are allowed.";
  try {
    const openai = getOpenAI();
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "medium" },
      input: [
        { role: "system", content: "You are Romy, a thoughtful family destination advisor. Return exactly three genuinely distinct destination directions. Use durable destination knowledge, not live prices or availability. Balance child interests, age, allergies, adult energy, travel effort and budget. State one honest caveat for every option. Never imply that entry rules, safety, weather or bookings are verified. Make every comparison field one concise, complete sentence. Keep whyItFits under 220 characters and every other idea field under 160 characters. Never end a field mid-sentence." },
        { role: "user", content: `${scopeRule} Travel dates: ${startDate} to ${endDate}. Travel effort limit: ${maxTravelHours} hours. Budget guardrail: EUR ${budgetEuro}. Priorities: ${priorities.join(", ")}. Starting point: ${family.city}. Family: ${family.children.map((child) => `${child.name}, age ${child.age}, interests ${child.interests.join(", ")}, allergies ${child.allergies.join(", ") || "none"}`).join("; ")}. Give three concise, scan-friendly options and explain why each fits.` },
      ],
      text: { format: zodTextFormat(destinationIdeasOutputSchema, "family_destination_ideas") },
    });
    if (!response.output_parsed) throw new Error("Romy returned no destination ideas");
    return Response.json({ mode: "live", ...response.output_parsed, trace: createTrace(startedAt, "destination-ideas-v2", ["structured_output", "family_context", "travel_scope"]) });
  } catch (error) { return apiError(error); }
}
