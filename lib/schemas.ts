import { z } from "zod";

export const eventSchema = z.object({
  title: z.string(),
  dateLabel: z.string(),
  time: z.string(),
  venue: z.string(),
  city: z.string(),
  priceLabel: z.string(),
  ageLabel: z.string(),
  whyItFits: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().min(8).max(500),
});

export const eventOutputSchema = z.object({
  locationLabel: z.string(),
  summary: z.string(),
  events: z.array(eventSchema).min(1).max(4),
});

export const mealOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  totalMinutes: z.number().int().min(5).max(120),
  ingredients: z.array(z.string()).min(3).max(14),
  pantryUsed: z.array(z.string()).max(10),
  shoppingGaps: z.array(z.string()).max(10),
  steps: z.array(z.string()).min(2).max(6),
  kidAdaptation: z.string(),
  allergyCheck: z.string(),
});

export const birthdayOutputSchema = z.object({
  title: z.string(),
  concept: z.string(),
  guestExperience: z.array(z.string()).min(2).max(5),
  budgetBreakdown: z.array(z.object({ label: z.string(), amount: z.string() })).min(2).max(6),
  tasks: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        timing: z.string(),
        owner: z.enum(["lena", "jonas", "shared"]),
      }),
    )
    .min(3)
    .max(7),
  imageBrief: z.string(),
  invitationMessage: z.string().min(40).max(1200),
});

export const buddyChatOutputSchema = z.object({
  reply: z.string().min(1).max(2400),
  memoryUsed: z.array(z.string().min(1).max(100)).max(5),
  suggestedPrompts: z.array(z.string().min(1).max(100)).min(1).max(3),
});

export const storyOutputSchema = z.object({
  title: z.string().min(1).max(100),
  synopsis: z.string().min(1).max(280),
  story: z.string().min(300).max(7000),
  readTimeMinutes: z.number().int().min(3).max(15),
  memoryUsed: z.array(z.string().min(1).max(100)).min(1).max(5),
});

export const learningOutputSchema = z.object({
  detectedTask: z.string().min(1).max(500),
  levelAssessment: z.string().min(1).max(400),
  explanationSteps: z.array(z.string().min(1).max(500)).min(2).max(6),
  practiceTasks: z
    .array(
      z.object({
        question: z.string().min(1).max(500),
        hint: z.string().min(1).max(300),
        answer: z.string().min(1).max(500),
      }),
    )
    .min(2)
    .max(6),
  parentNote: z.string().min(1).max(500),
  memoryUsed: z.array(z.string().min(1).max(100)).min(1).max(5),
});

export const quizOutputSchema = z.object({
  title: z.string().min(1).max(100),
  intro: z.string().min(1).max(300),
  questions: z
    .array(
      z.object({
        question: z.string().min(1).max(300),
        options: z.array(z.string().min(1).max(120)).length(4),
        correctIndex: z.number().int().min(0).max(3),
        explanation: z.string().min(1).max(300),
        childFit: z.string().min(1).max(200),
      }),
    )
    .min(3)
    .max(10),
  memoryUsed: z.array(z.string().min(1).max(100)).min(1).max(5),
});

export const vacationOutputSchema = z.object({
  destination: z.string().min(2).max(120),
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  recommendationReason: z.string().min(1).max(500),
  familyFit: z.string().min(1).max(500),
  days: z.array(z.object({
    label: z.string().min(1).max(60),
    title: z.string().min(1).max(120),
    activities: z.array(z.string().min(1).max(300)).min(2).max(5),
  })).min(2).max(8),
  travelPlan: z.array(z.string().min(1).max(300)).min(2).max(8),
  packingHighlights: z.array(z.string().min(1).max(160)).min(3).max(10),
  budgetNotes: z.array(z.string().min(1).max(240)).min(2).max(6),
});

export const destinationIdeasOutputSchema = z.object({
  intro: z.string().min(1).max(400),
  ideas: z.array(z.object({
    destination: z.string().min(2).max(120),
    locationLabel: z.string().min(2).max(120),
    whyItFits: z.string().min(1).max(320),
    travelEffort: z.string().min(1).max(240),
    budgetFit: z.string().min(1).max(280),
    familyHighlight: z.string().min(1).max(280),
    caveat: z.string().min(1).max(280),
  })).length(3),
});

export const localBriefOutputSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(400),
  items: z.array(z.object({
    kind: z.enum(["pharmacy", "service", "news"]),
    title: z.string().min(1).max(160),
    summary: z.string().min(1).max(500),
    address: z.string().max(240),
    phone: z.string().max(80),
    openingHours: z.string().max(240),
    sourceName: z.string().min(1).max(120),
    sourceUrl: z.string().min(8).max(500),
  })).min(1).max(5),
});

export const buddyBlueprintOutputSchema = z.object({
  name: z.string().min(2).max(24),
  role: z.string().min(2).max(60),
  promise: z.string().min(10).max(180),
  instructions: z.string().min(30).max(1400),
  quickPrompts: z.array(z.string().min(3).max(100)).length(3),
  memoryScopes: z.array(z.enum(["children", "preferences", "allergies", "location", "plans"])).min(1).max(5),
  guardrails: z.array(z.string().min(3).max(180)).min(2).max(5),
});

export const customBuddySchema = z.object({
  id: z.string().min(8).max(80),
  name: z.string().min(2).max(24),
  role: z.string().min(2).max(60),
  promise: z.string().min(10).max(180),
  instructions: z.string().min(30).max(1400),
  quickPrompts: z.array(z.string().min(3).max(100)).length(3),
  memoryScopes: z.array(z.enum(["children", "preferences", "allergies", "location", "plans"])).min(1).max(5),
  guardrails: z.array(z.string().min(3).max(180)).min(2).max(5),
});

export const familyProfileSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  locale: z.string().min(2).max(20),
  city: z.string().min(2).max(80),
  country: z.string().length(2),
  radiusKm: z.number().min(1).max(100),
  budget: z.enum(["low", "medium", "high"]),
  children: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        name: z.string().min(1).max(40),
        age: z.number().min(0).max(17),
        interests: z.array(z.string().max(40)).max(10),
        allergies: z.array(z.string().max(60)).max(10),
        dislikes: z.array(z.string().max(40)).max(10),
        gender: z.enum(["female", "male", "nonbinary", "unspecified"]).default("unspecified"),
      }),
    )
    .min(1)
    .max(6),
  parents: z
    .array(
      z.object({
        id: z.enum(["lena", "jonas"]),
        name: z.string().min(1).max(40),
        responseStyle: z.enum(["supportive", "direct"]),
        ownedDomains: z.array(z.string().max(60)).max(10),
        accent: z.enum(["coral", "blue"]),
        email: z.string().email().or(z.literal("")).default(""),
        phone: z.string().max(60).default(""),
      }),
    )
    .length(2),
  careContacts: z.array(z.object({
    id: z.string().min(1).max(80),
    kind: z.enum(["pediatrician", "dentist", "specialist", "pharmacy"]),
    name: z.string().min(1).max(100),
    specialty: z.string().max(100),
    phone: z.string().max(60),
    address: z.string().max(200),
    openingHours: z.string().max(200),
  })).max(20).default([]),
  appointments: z.array(z.object({
    id: z.string().min(1).max(80),
    childId: z.string().min(1).max(80),
    title: z.string().min(1).max(120),
    date: z.string().max(20),
    time: z.string().max(20),
    contactId: z.string().max(80),
  })).max(30).default([]),
  institutions: z.array(z.object({
    id: z.string().min(1).max(80),
    kind: z.enum(["city-hall", "school", "daycare", "other"]),
    name: z.string().min(1).max(120),
    address: z.string().max(200),
    phone: z.string().max(60),
    email: z.string().email().or(z.literal("")),
    openingHours: z.string().max(200),
    website: z.string().max(300),
  })).max(20).default([]),
  documents: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().min(1).max(180),
    category: z.enum(["school", "daycare", "health", "benefits", "identity", "other"]),
    childId: z.string().max(80).optional(),
    sizeLabel: z.string().max(40),
    uploadedAt: z.string().max(40),
  })).max(60).default([]),
});

export const commonFamilyInputSchema = z.object({
  activeParent: z.enum(["lena", "jonas"]),
  family: familyProfileSchema,
  useSample: z.boolean().optional(),
});
