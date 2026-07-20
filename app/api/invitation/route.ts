import { z } from "zod";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, IMAGE_MODEL } from "@/lib/openai";

export const runtime = "nodejs";

const inputSchema = z.object({
  imageBrief: z.string().min(20).max(1800),
  useSample: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid invitation request" }, { status: 400 });
  }

  const startedAt = Date.now();
  if (parsed.data.useSample || !hasOpenAIKey()) {
    return Response.json({
      mode: "sample",
      notice: "Sample artwork — connect an OpenAI API key to generate a new invitation.",
      imageUrl: "/images/mia-space-party-sample.png",
      trace: createTrace(startedAt, "invitation-v1", ["Pre-generated sample asset"], "Sample fixture"),
    });
  }

  try {
    const openai = getOpenAI();
    const prompt = `Create a premium portrait children's birthday invitation. ${parsed.data.imageBrief}\nUse a sophisticated editorial screen-print illustration style with deep navy, coral, sunny yellow, mint and white. Keep safe margins. Spell all requested text exactly. No logos, brands, copyrighted characters, QR codes, watermarks or extra text.`;
    const result = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size: "1024x1536",
      quality: "medium",
    });
    const base64 = result.data?.[0]?.b64_json;
    if (!base64) {
      throw new Error("GPT Image 2 returned no image data");
    }

    return Response.json({
      mode: "live",
      imageUrl: `data:image/png;base64,${base64}`,
      trace: createTrace(startedAt, "invitation-v1", ["image_generation"], IMAGE_MODEL),
    });
  } catch (error) {
    return apiError(error);
  }
}
