import { z } from "zod";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, IMAGE_MODEL } from "@/lib/openai";
import { commonFamilyInputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  title: z.string().min(1).max(100),
  synopsis: z.string().min(10).max(500),
  scene: z.string().min(10).max(700),
});

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid story illustration request" }, { status: 400 });
  const startedAt = Date.now();
  if (parsed.data.useSample || !hasOpenAIKey()) {
    return Response.json({
      mode: "sample",
      notice: "Sample character artwork - Live AI creates a new scene from the story.",
      imageUrl: "/images/sidekick-lumi.png",
      trace: createTrace(startedAt, "story-image-v1", ["Pre-generated character asset"], "Sample fixture"),
    });
  }

  const { family, title, synopsis, scene } = parsed.data;
  try {
    const openai = getOpenAI();
    const prompt = `Create one square children's storybook illustration for the original story "${title}". Story summary: ${synopsis}. Scene to illustrate: ${scene}. The children are fictional illustrated characters inspired only by these non-visual facts: ${family.children.map((child) => `${child.name}, age ${child.age}, interests ${child.interests.join(", ")}`).join("; ")}. Warm handcrafted paper-cut and clay texture, deep navy, coral, sunny yellow, forest green and cream. Emotionally safe, expressive, readable composition. No text, logos, brands, copyrighted characters, photorealistic faces or watermark.`;
    const result = await openai.images.generate({ model: IMAGE_MODEL, prompt, size: "1024x1024", quality: "low" });
    const base64 = result.data?.[0]?.b64_json;
    if (!base64) throw new Error("GPT Image 2 returned no story illustration");
    return Response.json({
      mode: "live",
      imageUrl: `data:image/png;base64,${base64}`,
      trace: createTrace(startedAt, "story-image-v1", ["image_generation"], IMAGE_MODEL),
    });
  } catch (error) {
    return apiError(error);
  }
}
