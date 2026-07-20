import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleBirthday } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { birthdayOutputSchema, commonFamilyInputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  childName: z.string().min(1).max(40),
  theme: z.string().min(2).max(80),
  guestCount: z.number().int().min(2).max(40),
  guestNames: z.array(z.string().min(1).max(60)).max(40).default([]),
  guestContacts: z.array(z.object({ childName: z.string().min(1).max(60), parentName: z.string().max(80), phone: z.string().max(60), email: z.string().email().or(z.literal("")) })).max(40).default([]),
  budgetEuro: z.number().int().min(30).max(2000),
  partyDate: z.string().min(8).max(20).default("2026-08-22"),
  partyTime: z.string().min(4).max(10).default("15:00"),
  partyLocation: z.string().min(2).max(180).default("Family home"),
  hostName: z.string().min(1).max(80).default("Family"),
  hostEmail: z.string().email().or(z.literal("")).default(""),
  hostPhone: z.string().max(60).default(""),
});

function sampleResponse() {
  return {
    ...sampleBirthday,
    trace: { ...sampleBirthday.trace, generatedAt: new Date().toISOString() },
  };
}

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid birthday request", issues: parsed.error.issues }, { status: 400 });
  }

  if (parsed.data.useSample || !hasOpenAIKey()) {
    return Response.json(sampleResponse());
  }

  const startedAt = Date.now();
  const { family, childName, theme, guestCount, guestNames, guestContacts, budgetEuro, partyDate, partyTime, partyLocation, hostName, hostEmail, hostPhone } = parsed.data;
  const child = family.children.find((item) => item.name === childName) ?? family.children[0];

  try {
    const openai = getOpenAI();
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "medium" },
      input: [
        {
          role: "system",
          content:
            "You are Pippa, an inventive but operationally realistic family celebration planner. Build a cohesive two-hour experience, respect allergies, stay inside budget, and divide work between the two parents and shared tasks. The image brief must specify short exact invitation text and avoid copyrighted characters or brands. Also produce a warm plain-text invitation message that can be sent by email or messaging app and includes the supplied date, time, place and host contact details.",
        },
        {
          role: "user",
          content: `Create a ${theme} birthday for ${childName}, age ${child.age}, with ${guestCount} children and a EUR ${budgetEuro} budget in ${family.city}. Named guests: ${guestNames.join(", ") || "not entered yet"}. Guest parent records are available for invitation handoff but must not be repeated in public invitation copy: ${guestContacts.map((guest) => `${guest.childName} - parent ${guest.parentName || "not set"}`).join("; ") || "none"}. Date and time: ${partyDate} at ${partyTime}. Place: ${partyLocation}. Host contact: ${hostName}, ${hostPhone || "no phone supplied"}, ${hostEmail || "no email supplied"}. Interests: ${child.interests.join(", ")}. Family allergies: ${family.children.flatMap((item) => item.allergies).join(", ") || "none"}. Lena owns celebrations and planning; Jonas owns food and logistics. Produce a concise concept, guest journey, realistic budget, tasks, a portrait invitation image brief and a ready-to-send invitation message. The image may use only these exact short text lines: ${childName.toUpperCase()}'S BIRTHDAY, ${partyDate}, ${partyTime}.`,
        },
      ],
      text: { format: zodTextFormat(birthdayOutputSchema, "birthday_plan") },
    });

    if (!response.output_parsed) {
      throw new Error("GPT-5.6 Terra returned no structured birthday result");
    }

    return Response.json({
      mode: "live",
      ...response.output_parsed,
      trace: createTrace(startedAt, "birthday-v2", ["structured_output", "family_context", "invitation_context"]),
    });
  } catch (error) {
    return apiError(error);
  }
}
