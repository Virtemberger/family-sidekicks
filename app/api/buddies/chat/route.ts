import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { sampleBuddyReply } from "@/lib/demo-data";
import { apiError, createTrace, getOpenAI, hasOpenAIKey, TEXT_MODEL } from "@/lib/openai";
import { buddyChatOutputSchema, commonFamilyInputSchema, customBuddySchema } from "@/lib/schemas";
import type { BuiltInSidekickId, FamilyMemoryScope, SidekickId } from "@/lib/types";

export const runtime = "nodejs";

const inputSchema = commonFamilyInputSchema.extend({
  buddyId: z.string().min(2).max(80),
  customBuddy: customBuddySchema.optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1200) }))
    .min(1)
    .max(12),
  context: z.object({
    title: z.string().min(2).max(120),
    summary: z.string().min(1).max(8000),
    updatedAt: z.string().min(8).max(40),
  }).optional(),
});

const capabilityPrompts: Record<BuiltInSidekickId, string> = {
  skippy:
    "You are Skippy, the family's practical activity scout. Help a parent narrow options, ask useful follow-up questions and explain family fit. Never invent current event details. When no live search result is provided in context, offer to search instead of claiming an event exists.",
  nori:
    "You are Nori, the family's practical food guide. Allergies are hard constraints. Respect dislikes, time and pantry information. Make one clear recommendation before alternatives. Do not make medical or nutritional claims, and remind the parent to check packaged-food labels where relevant.",
  lumi:
    "You are Lumi, the family's warm storyteller. Help shape age-appropriate stories using only the provided family context. Avoid copyrighted characters, frightening endings and manipulative emotional claims. Keep suggestions concrete and make it easy for the parent to adjust length, mood and child roles.",
  atlas:
    "You are Atlas, the family's patient learning coach. Explain methods instead of completing graded work for the child. Match the child's age and supplied task level, offer a first hint before an answer, and never claim a curriculum standard that was not provided.",
  pippa:
    "You are Pippa, the family's operational celebration producer. Turn creative themes into coherent activities, realistic tasks and allergy-aware food constraints. Never present partner offers or prices as real unless supplied in context.",
  quinn:
    "You are Quinn, the family's playful game host. Create inclusive, factually reliable quizzes and simple spoken games where different ages can participate. Avoid trick questions, humiliating prompts, unsafe dares and rapidly changing facts.",
  moxie:
    "You are Moxie, a guided Buddy designer. Help the parent narrow one recurring need into one clear job, choose only necessary family memory and write explicit boundaries. Never encourage surveillance, manipulation, autonomous purchasing or medical diagnosis.",
  cleo:
    "You are Cleo, a calm first-step care guide, not a clinician. Never diagnose or provide medication dosing. Help organize symptoms and timing, offer low-risk comfort measures, and clearly escalate emergency warning signs to local emergency services or qualified care.",
  pip:
    "You are Pip, a family administration guide. Turn a described process or form into a checklist and draft clear messages. Mark all deadlines, eligibility rules and legal claims as needing verification from the responsible official authority unless a current official source is supplied.",
  romy:
    "You are Romy, a practical family vacation planner. Balance child ages, interests, allergies, budget, travel time and downtime. Distinguish ideas and estimates from verified bookings or current prices. Never claim availability, visa rules, safety conditions or opening hours without a current source.",
};

const builtInIds = new Set<BuiltInSidekickId>(["skippy", "nori", "lumi", "atlas", "pippa", "quinn", "moxie", "cleo", "pip", "romy"]);

function isBuiltInSidekick(id: string): id is BuiltInSidekickId {
  return builtInIds.has(id as BuiltInSidekickId);
}

function scopedFamilyContext(
  scopes: FamilyMemoryScope[],
  family: z.infer<typeof commonFamilyInputSchema>["family"],
  activeParent: "lena" | "jonas",
) {
  const parent = family.parents.find((item) => item.id === activeParent) ?? family.parents[0];
  const facts: string[] = [];
  if (scopes.includes("children")) facts.push(`Children: ${family.children.map((child) => `${child.name}, age ${child.age}`).join("; ")}`);
  if (scopes.includes("preferences")) {
    facts.push(`Preferences: ${family.children.map((child) => `${child.name}: interests ${child.interests.join(", ") || "not set"}; dislikes ${child.dislikes.join(", ") || "none"}`).join("; ")}`);
    facts.push(`Active parent answer style: ${parent.responseStyle}`);
  }
  if (scopes.includes("allergies")) facts.push(`Allergies: ${family.children.map((child) => `${child.name}: ${child.allergies.join(", ") || "none"}`).join("; ")}`);
  if (scopes.includes("location")) facts.push(`Location: ${family.city}, ${family.country}; ${family.radiusKm} km radius`);
  if (scopes.includes("plans")) facts.push("Current family plans: supplied separately when this corner has a saved result");
  return facts.join(". ");
}

function sampleResponse(buddyId: SidekickId, message: string, family: z.infer<typeof commonFamilyInputSchema>["family"], activeParent: "lena" | "jonas", context?: z.infer<typeof inputSchema>["context"], customBuddy?: z.infer<typeof customBuddySchema>) {
  if (customBuddy) {
    return {
      mode: "sample" as const,
      notice: "Sample conversation - connect an OpenAI API key for a live custom Buddy response.",
      reply: `I am ${customBuddy.name}. I will help with ${customBuddy.role.toLowerCase()} using only ${customBuddy.memoryScopes.join(", ")} memory. For “${message}”, I would first ask for the one missing detail that changes the next useful step.`,
      memoryUsed: [...customBuddy.memoryScopes.map((scope) => `Allowed memory: ${scope}`), ...(context ? [`Workbench: ${context.title}`] : [])],
      suggestedPrompts: customBuddy.quickPrompts,
      trace: createTrace(Date.now(), `buddy-custom-v2`, ["Scoped family context", ...(context ? ["Workbench context"] : [])], "Sample fixture"),
    };
  }
  const sample = sampleBuddyReply(buddyId, message, family, activeParent);
  return {
    mode: "sample" as const,
    notice: "Sample conversation - connect an OpenAI API key for a live Sidekick response.",
    ...sample,
    reply: `${context ? `I have ${context.title.toLowerCase()} open. ` : ""}${sample.reply}`,
    memoryUsed: [...sample.memoryUsed, ...(context ? [`Workbench: ${context.title}`] : [])],
    trace: createTrace(Date.now(), `buddy-${buddyId}-v2`, ["Shared family context", ...(context ? ["Workbench context"] : [])], "Sample fixture"),
  };
}

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid Sidekick conversation", issues: parsed.error.issues }, { status: 400 });
  }

  const { buddyId, messages, family, activeParent, context, customBuddy } = parsed.data;
  if (!isBuiltInSidekick(buddyId) && (!customBuddy || customBuddy.id !== buddyId)) {
    return Response.json({ error: "Unknown Sidekick configuration" }, { status: 400 });
  }
  const lastMessage = messages.at(-1)?.content ?? "Help me";
  if (parsed.data.useSample || !hasOpenAIKey()) {
    return Response.json(sampleResponse(buddyId as SidekickId, lastMessage, family, activeParent, context, customBuddy));
  }

  const startedAt = Date.now();
  try {
    const openai = getOpenAI();
    const parentProfile = family.parents.find((parent) => parent.id === activeParent) ?? family.parents[0];
    const fullFamilyContext = `Family: ${family.name}, ${family.city}, ${family.radiusKm} km radius, ${family.budget} budget. Children: ${family.children
      .map(
        (child) =>
          `${child.name}, age ${child.age}, interests ${child.interests.join(", ") || "not set"}, allergies ${child.allergies.join(", ") || "none"}, dislikes ${child.dislikes.join(", ") || "none"}`,
      )
      .join("; ")}. Active parent: ${parentProfile.name}; answer style ${parentProfile.responseStyle}; usually owns ${parentProfile.ownedDomains.join(", ") || "not set"}. Care contacts: ${family.careContacts.map((item) => `${item.name} (${item.kind})`).join(", ") || "none"}. Upcoming care: ${family.appointments.map((item) => `${item.title} on ${item.date}`).join(", ") || "none"}. Institutions: ${family.institutions.map((item) => `${item.name} (${item.kind})`).join(", ") || "none"}. Stored document metadata: ${family.documents.map((item) => item.name).join(", ") || "none"}.`;
    const familyContext = customBuddy ? scopedFamilyContext(customBuddy.memoryScopes, family, activeParent) : fullFamilyContext;
    const capabilityPrompt = customBuddy
      ? `You are ${customBuddy.name}, the family's custom ${customBuddy.role}. ${customBuddy.instructions} Guardrails: ${customBuddy.guardrails.join("; ")}. Use only the supplied scoped memory.`
      : capabilityPrompts[buddyId as BuiltInSidekickId];
    const cornerContext = customBuddy && context?.title !== "Installed capability" && !customBuddy.memoryScopes.includes("plans") ? undefined : context;
    const response = await openai.responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: "low" },
      input: [
        {
          role: "system",
          content: `${capabilityPrompt} You are one member of Family Sidekicks. You must list only the facts actually used. Respond conversationally in English, lead with a useful answer, and finish with up to three short next prompts. Never claim memory beyond the supplied context.`,
        },
        {
          role: "user",
          content: `${familyContext}${cornerContext ? ` Connected workbench result: ${cornerContext.title}. ${cornerContext.summary}. Treat this as the current object the parent is referring to. If your answer uses it, include "Workbench: ${cornerContext.title}" in memoryUsed.` : ""}\nConversation:\n${messages
            .map((message) => `${message.role}: ${message.content}`)
            .join("\n")}`,
        },
      ],
      text: { format: zodTextFormat(buddyChatOutputSchema, "sidekick_reply") },
    });

    if (!response.output_parsed) throw new Error("The Sidekick returned no structured response");
    return Response.json({
      mode: "live",
      ...response.output_parsed,
      trace: createTrace(startedAt, `buddy-${isBuiltInSidekick(buddyId) ? buddyId : "custom"}-v2`, ["structured_output", customBuddy ? "scoped_family_context" : "shared_family_context", ...(cornerContext ? ["workbench_context"] : [])]),
    });
  } catch (error) {
    return apiError(error);
  }
}
