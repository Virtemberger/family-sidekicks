import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleLearningForFamily } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema, learningOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  childId: z.string().min(1).max(80),
  subject: z.string().min(2).max(60),
  goal: z.enum(["explain", "practice", "both"]),
  request: z.string().min(3).max(600),
  imageDataUrl: z
    .string()
    .max(8_000_000)
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/)
    .optional(),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid learning request", issues: parsed.error.issues }, { status: 400 });
  }

  const { family, childId, subject, goal, request: parentRequest, imageDataUrl } = parsed.data;
  if (parsed.data.useSample || !hasOpenAIKey()) {
    return Response.json(sampleLearningForFamily(family));
  }

  const child = family.children.find((item) => item.id === childId) ?? family.children[0];
  const startedAt = Date.now();
  const userText = `Support ${child.name}, age ${child.age}, with ${subject}. Goal: ${goal}. Parent request: ${parentRequest}. Interests that may be used only when helpful: ${child.interests.join(", ") || "not set"}. Locale: ${family.locale}. ${imageDataUrl ? "Inspect the attached screenshot and transcribe only what is legible." : "No screenshot was attached; work from the parent's description."}`;
  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string; detail: "auto" }
  > = [{ type: "input_text", text: userText }];
  if (imageDataUrl) content.push({ type: "input_image", image_url: imageDataUrl, detail: "auto" });

  try {
    const openai = getOpenAI();
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "medium" },
      input: [
        {
          role: "system",
          content:
            "You are Atlas, a patient learning coach for families. Analyze the visible task, identify the underlying skill, explain the method in age-appropriate steps, and create new tasks at the same difficulty. Do not claim a curriculum standard unless supplied. Do not complete graded work on the child's behalf: provide scaffolding first, while answers are included separately for the parent. If the image is unclear, state exactly what cannot be read.",
        },
        { role: "user", content },
      ],
      text: { format: zodTextFormat(learningOutputSchema, "learning_support") },
    });
    if (!response.output_parsed) throw new Error("Atlas returned no structured learning result");
    return Response.json({
      mode: "live",
      ...response.output_parsed,
      trace: createTrace(startedAt, "learning-v1", [imageDataUrl ? "vision" : "text_input", "structured_output", "shared_family_context"]),
    });
  } catch (error) {
    return apiError(error);
  }
}
