import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleStoryForFamily } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema, storyOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  request: z.string().min(3).max(500),
  durationMinutes: z.number().int().min(3).max(15),
  mood: z.enum(["gentle", "funny", "adventurous"]),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid story request", issues: parsed.error.issues }, { status: 400 });
  }
  if (parsed.data.useSample || !hasOpenAIKey()) {
    const { family } = parsed.data;
    return Response.json(sampleStoryForFamily(family));
  }

  const { family, request: storyRequest, durationMinutes, mood, activeParent } = parsed.data;
  const parentProfile = family.parents.find((parent) => parent.id === activeParent) ?? family.parents[0];
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
            "You are Lumi, a skilled family storyteller. Write an original age-appropriate bedtime story with a calm, emotionally safe ending. Use family interests naturally, never expose private profile details as a list, and do not use copyrighted characters or brands. Match the requested reading time and keep the prose enjoyable for an adult reading aloud.",
        },
        {
          role: "user",
          content: `Create a ${durationMinutes}-minute ${mood} story. Parent request: ${storyRequest}. Reader: ${parentProfile.name}. Children: ${family.children
            .map((child) => `${child.name}, ${child.age}, interests ${child.interests.join(", ")}`)
            .join("; ")}. Return the complete story and list the family facts used.`,
        },
      ],
      text: { format: zodTextFormat(storyOutputSchema, "family_story") },
    });
    if (!response.output_parsed) throw new Error("Lumi returned no structured story");
    return Response.json({
      mode: "live",
      ...response.output_parsed,
      trace: createTrace(startedAt, "stories-v1", ["structured_output", "shared_family_context"]),
    });
  } catch (error) {
    return apiError(error);
  }
}
