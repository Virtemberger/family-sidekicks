import OpenAI from "openai";
import type { TraceInfo } from "@/lib/types";

export const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || "gpt-5.6-terra";
export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function createTrace(
  startedAt: number,
  promptVersion: string,
  tools: string[],
  model = TEXT_MODEL,
): TraceInfo {
  return {
    model,
    tools,
    durationMs: Date.now() - startedAt,
    promptVersion,
    generatedAt: new Date().toISOString(),
  };
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "The AI request failed";
  return Response.json(
    {
      error: message,
      canUseSample: true,
    },
    { status: 502 },
  );
}
