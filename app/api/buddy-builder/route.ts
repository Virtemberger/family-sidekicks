import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleBuddyBlueprint } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { buddyBlueprintOutputSchema, commonFamilyInputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const memoryScope = z.enum(["children", "preferences", "allergies", "location", "plans"]);
const inputSchema = commonFamilyInputSchema.extend({
  job: z.string().min(10).max(500),
  audience: z.enum(["parent", "child", "whole-family"]),
  tone: z.enum(["calm", "playful", "direct", "encouraging"]),
  memoryScopes: z.array(memoryScope).min(1).max(5),
  boundary: z.string().min(5).max(400),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid Buddy blueprint request", issues: parsed.error.issues }, { status: 400 });
  if (parsed.data.useSample || !hasOpenAIKey()) return Response.json({ ...sampleBuddyBlueprint, trace: { ...sampleBuddyBlueprint.trace, generatedAt: new Date().toISOString() } });

  const { family, job, audience, tone, memoryScopes, boundary } = parsed.data;
  const startedAt = Date.now();
  try {
    const openai = getOpenAI();
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "medium" },
      input: [
        {
          role: "system",
          content:
            "You are Moxie, a guided designer for small family AI helpers. Turn one recurring job into one narrow, understandable Buddy. Give it a short friendly name, a concrete promise, three useful starters and explicit limits. The instructions must explain what it does, how it uses selected memory, when it asks a follow-up and what it must never decide. Do not create medical diagnosis, surveillance, manipulation, grading or autonomous purchasing capabilities.",
        },
        {
          role: "user",
          content: `Family need: ${job}. Audience: ${audience}. Tone: ${tone}. Allowed memory: ${memoryScopes.join(", ")}. User boundary: ${boundary}. Family profile summary: ${family.children.map((child) => `${child.name}, age ${child.age}`).join("; ")}; location ${family.city}. Return the selected memory scopes unchanged unless one creates a safety conflict.`,
        },
      ],
      text: { format: zodTextFormat(buddyBlueprintOutputSchema, "buddy_blueprint") },
    });
    if (!response.output_parsed) throw new Error("Moxie returned no Buddy blueprint");
    return Response.json({
      mode: "live",
      ...response.output_parsed,
      trace: createTrace(startedAt, "buddy-builder-v1", ["guided_configuration", "structured_output"]),
    });
  } catch (error) {
    return apiError(error);
  }
}
