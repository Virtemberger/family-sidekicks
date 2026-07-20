import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleQuizForFamily } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema, quizOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  questionCount: z.number().int().min(3).max(10),
  difficulty: z.enum(["easy", "family-mix", "tricky"]),
  categories: z.array(z.string().min(2).max(40)).min(1).max(6),
  players: z.array(z.string().min(1).max(60)).min(1).max(10).default(["Family"]),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid quiz request", issues: parsed.error.issues }, { status: 400 });
  const { family, questionCount, difficulty, categories, players } = parsed.data;
  if (parsed.data.useSample || !hasOpenAIKey()) return Response.json(sampleQuizForFamily(family, categories));

  const startedAt = Date.now();
  try {
    const openai = getOpenAI();
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "low" },
      input: [
        {
          role: "system",
          content:
            "You are Quinn, an excellent family game host. Create factually reliable, timeless multiple-choice questions with exactly four distinct options and one unambiguous answer. Match the selected difficulty while ensuring the family can play together. Avoid misleading trick questions, stereotypes, rapidly changing facts and copyrighted quiz wording.",
        },
        {
          role: "user",
          content: `Create exactly ${questionCount} questions at ${difficulty} difficulty. Topics: ${categories.join(", ")}. Players in turn order: ${players.join(", ")}. Family: ${family.children.map((child) => `${child.name}, age ${child.age}, interests ${child.interests.join(", ")}`).join("; ")}. Balance the round so questions can rotate through those players. Explain each answer in one sentence and identify why the question fits the intended age mix.`,
        },
      ],
      text: { format: zodTextFormat(quizOutputSchema, "family_fun_quiz") },
    });
    if (!response.output_parsed) throw new Error("Quinn returned no structured quiz");
    return Response.json({
      mode: "live",
      ...response.output_parsed,
      trace: createTrace(startedAt, "fun-quiz-v2", ["structured_output", "shared_family_context"]),
    });
  } catch (error) {
    return apiError(error);
  }
}
