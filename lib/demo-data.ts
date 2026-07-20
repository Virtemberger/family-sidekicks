import type {
  BuddyBlueprint,
  BirthdayResult,
  DestinationIdeasResult,
  EventResult,
  FamilyProfile,
  HubState,
  LearningResult,
  MealResult,
  ParentId,
  QuizResult,
  SidekickConfig,
  SidekickId,
  StoryResult,
  TravelScope,
  VacationResult,
} from "@/lib/types";

export const familyProfile: FamilyProfile = {
  id: "weber-family",
  name: "Weber family",
  locale: "en-DE",
  city: "Stuttgart",
  country: "DE",
  radiusKm: 25,
  budget: "medium",
  children: [
    {
      id: "mia",
      name: "Mia",
      age: 7,
      interests: ["space", "drawing"],
      allergies: [],
      dislikes: ["mushrooms"],
      gender: "female",
    },
    {
      id: "leo",
      name: "Leo",
      age: 4,
      interests: ["dinosaurs", "animals"],
      allergies: ["tree nuts", "peanuts"],
      dislikes: [],
      gender: "male",
    },
  ],
  parents: [
    {
      id: "lena",
      name: "Lena",
      responseStyle: "supportive",
      ownedDomains: ["Celebrations", "Weekly planning", "Community"],
      accent: "coral",
      email: "lena.weber@example.com",
      phone: "+49 170 555 0142",
    },
    {
      id: "jonas",
      name: "Jonas",
      responseStyle: "direct",
      ownedDomains: ["Meals", "Travel", "Bedtime"],
      accent: "blue",
      email: "jonas.weber@example.com",
      phone: "+49 171 555 0187",
    },
  ],
  careContacts: [
    { id: "dr-klein", kind: "pediatrician", name: "Dr. Anna Klein", specialty: "Pediatrics - demo contact", phone: "+49 711 555 0110", address: "Stuttgart-West", openingHours: "Mon-Fri 08:00-12:00, Tue/Thu 14:00-17:00" },
    { id: "dr-vogel", kind: "dentist", name: "Dr. Max Vogel", specialty: "Family dentistry - demo contact", phone: "+49 711 555 0120", address: "Stuttgart-Mitte", openingHours: "Mon-Thu 08:00-17:00, Fri 08:00-13:00" },
    { id: "pharmacy-demo", kind: "pharmacy", name: "Family Pharmacy", specialty: "Demo directory listing", phone: "+49 711 555 0130", address: "Near Stuttgart city center", openingHours: "Demo hours: Mon-Sat 08:00-20:00 - verify before visiting" },
  ],
  appointments: [
    { id: "mia-dental", childId: "mia", title: "Dental check-up", date: "2026-08-12", time: "15:30", contactId: "dr-vogel" },
    { id: "leo-check", childId: "leo", title: "Preventive check and vaccination review", date: "2026-10-05", time: "09:00", contactId: "dr-klein" },
  ],
  institutions: [
    { id: "stuttgart-city", kind: "city-hall", name: "Stuttgart Citizens Service", address: "Eberhardstrasse 39, Stuttgart", phone: "+49 711 216-0", email: "", openingHours: "Demo directory - verify current appointment and opening rules", website: "https://www.stuttgart.de/" },
    { id: "mia-school", kind: "school", name: "Mia's primary school", address: "Stuttgart - demo profile", phone: "+49 711 555 0201", email: "school@example.com", openingHours: "Office: Mon-Fri 08:00-12:00 - demo", website: "" },
    { id: "leo-daycare", kind: "daycare", name: "Leo's daycare", address: "Stuttgart - demo profile", phone: "+49 711 555 0202", email: "daycare@example.com", openingHours: "Mon-Fri 07:30-16:30 - demo", website: "" },
  ],
  documents: [
    { id: "doc-school-list", name: "School supply list - Mia.pdf", category: "school", childId: "mia", sizeLabel: "184 KB", uploadedAt: "2026-07-10T18:30:00.000Z" },
  ],
};

export const initialHubState: HubState = {
  family: familyProfile,
  activeParent: "lena",
  homeSidekickIds: {
    lena: ["pippa", "skippy", "pip"],
    jonas: ["nori", "lumi", "romy"],
  },
  sharedArtifacts: [],
  savedEventIds: [],
  completedTaskIds: [],
  buddyMessages: {},
  buddyContexts: {},
  customBuddies: [],
  invitationGenerated: false,
};

export const sidekicks: SidekickConfig[] = [
  {
    id: "skippy",
    name: "Skippy",
    corner: "Adventure Corner",
    role: "Family scout",
    promise: "Turns an open weekend into a short list that fits both kids.",
    image: "/images/sidekick-skippy.png",
    accent: "mint",
    quickPrompts: [
      "What works this Saturday if it rains?",
      "Find something both kids will enjoy",
      "Keep the whole outing under EUR 40",
    ],
  },
  {
    id: "nori",
    name: "Nori",
    corner: "Kitchen Corner",
    role: "Family food guide",
    promise: "Makes one safe dinner decision from time, pantry and preferences.",
    image: "/images/sidekick-nori.png",
    accent: "yellow",
    quickPrompts: [
      "What can I cook from our pantry?",
      "Leo refuses food that is mixed together",
      "Give me three easy dinners for this week",
    ],
  },
  {
    id: "lumi",
    name: "Lumi",
    corner: "Story Corner",
    role: "Family storyteller",
    promise: "Builds a familiar story world around the children in front of you.",
    image: "/images/sidekick-lumi.png",
    accent: "blue",
    quickPrompts: [
      "Tell a seven-minute moon story",
      "Make Leo the dinosaur expert",
      "Continue the moon-rover story from yesterday",
    ],
  },
  {
    id: "atlas",
    name: "Atlas",
    corner: "Learning Corner",
    role: "Learning coach",
    promise: "Reads the task in front of your child, explains it, then creates practice at the same level.",
    image: "/images/sidekick-atlas.png",
    accent: "lavender",
    quickPrompts: ["Explain this without giving away the answer", "Create three similar exercises", "What skill is this testing?"],
  },
  {
    id: "pippa",
    name: "Pippa",
    corner: "Party Corner",
    role: "Celebration producer",
    promise: "Turns one birthday idea into a coherent plan, shared tasks and a printable invitation.",
    image: "/images/sidekick-pippa.png",
    accent: "coral",
    quickPrompts: ["Plan a space party for Mia", "Keep the party under EUR 150", "Make the activities work for mixed ages"],
  },
  {
    id: "quinn",
    name: "Quinn",
    corner: "Fun Corner",
    role: "Family game host",
    promise: "Starts quick games where younger children, older siblings and adults can all join in.",
    image: "/images/sidekick-quinn.png",
    accent: "yellow",
    quickPrompts: ["Make a five-question family quiz", "Start a silly would-you-rather round", "Give us three things to act out"],
  },
  {
    id: "moxie",
    name: "Moxie",
    corner: "Buddy Workshop",
    role: "Buddy builder",
    promise: "Guides families from a recurring need to a useful, bounded Sidekick of their own.",
    image: "/images/sidekick-moxie.png",
    accent: "lavender",
    quickPrompts: ["Help me define one useful job", "Which family memory should this Buddy see?", "Make the guardrails clearer"],
  },
  {
    id: "cleo",
    name: "Cleo",
    corner: "Care Corner",
    role: "Calm first-step guide",
    promise: "Organizes symptoms and next steps without pretending to diagnose a child.",
    image: "/images/sidekick-cleo.png",
    accent: "blue",
    quickPrompts: ["Help me organize what happened", "Which warning signs mean urgent care?", "Prepare a concise note for our pediatrician"],
  },
  {
    id: "pip",
    name: "Pip",
    corner: "Admin Corner",
    role: "Family admin guide",
    promise: "Turns forms and family bureaucracy into a short checklist with visible source boundaries.",
    image: "/images/sidekick-pip.png",
    accent: "mint",
    quickPrompts: ["Turn this form into a checklist", "What information should I gather first?", "Draft a clear message to the authority"],
  },
  {
    id: "romy",
    name: "Romy",
    corner: "Vacation Corner",
    role: "Family trip planner",
    promise: "Turns dates, budget and family preferences into a realistic trip everyone can handle.",
    image: "/images/sidekick-romy.png",
    accent: "coral",
    quickPrompts: ["Plan five relaxed days by the sea", "Balance one adult highlight with one child highlight each day", "Create the packing shortlist"],
  },
];

export const featuredSidekicks = sidekicks.filter((sidekick) => ["skippy", "nori", "lumi"].includes(sidekick.id));
export const secondarySidekicks = sidekicks.filter((sidekick) => !["skippy", "nori", "lumi"].includes(sidekick.id));

export function sidekickById(id: SidekickId) {
  return sidekicks.find((sidekick) => sidekick.id === id) ?? sidekicks[0];
}

function childFact(child: FamilyProfile["children"][number]) {
  return `${child.name}: age ${child.age}, ${child.interests.join(" and ") || "interests not set"}`;
}

function allergyFacts(family: FamilyProfile) {
  return family.children.flatMap((child) => child.allergies.map((allergy) => `${child.name}: ${allergy}`));
}

export function sampleBuddyReply(id: SidekickId, message: string, family: FamilyProfile = familyProfile, activeParent: ParentId = "lena") {
  const lower = message.toLowerCase();
  const [firstChild, secondChild = firstChild] = family.children;
  const parent = family.parents.find((item) => item.id === activeParent) ?? family.parents[0];
  const allergies = allergyFacts(family);
  const allergyBoundary = allergies.length ? allergies.join(", ") : "no recorded allergies";

  if (id === "nori") {
    return {
      reply: lower.includes("bean")
        ? `I will leave beans out. With ${allergyBoundary} as the safety boundary, I would make a lemony tomato orzo and serve the vegetables separately for ${firstChild.name}. The short shopping list is orzo, tomatoes and feta.`
        : `For tonight I would choose lemony tomato orzo: 25 minutes, one pan and easy to serve in separate parts for ${firstChild.name}. I am treating ${allergyBoundary} as the safety boundary${secondChild.dislikes.length ? ` and keeping ${secondChild.dislikes.join(" and ")} out for ${secondChild.name}` : ""}.`,
      memoryUsed: [
        ...allergies,
        ...family.children.filter((child) => child.dislikes.length).map((child) => `${child.name}: dislikes ${child.dislikes.join(", ")}`),
        `${parent.name}: family meal view`,
        "25-minute preference",
      ].slice(0, 5),
      suggestedPrompts: ["Show the three cooking steps", "Swap feta for something milder", "Add this to the family plan"],
    };
  }

  if (id === "lumi") {
    return {
      reply: `I would make ${firstChild.name} the expert on ${firstChild.interests[0] || "maps"} and ${secondChild.name} the guide who knows all about ${secondChild.interests[0] || "animals"}. Seven calm minutes, one funny surprise, and a safe ending where they solve the problem together.`,
      memoryUsed: [childFact(firstChild), childFact(secondChild), `${parent.name}: bedtime view`],
      suggestedPrompts: ["Write the full story", "Make it gentler", `Let ${firstChild.name} lead the final scene`],
    };
  }

  if (id === "atlas") {
    return {
      reply: `Start by asking ${firstChild.name} to explain what the task wants in their own words. I can inspect a screenshot, identify the underlying skill and create new practice without simply revealing the original answer.`,
      memoryUsed: [childFact(firstChild), `${parent.name}: ${parent.responseStyle} answers`],
      suggestedPrompts: ["Analyze a screenshot", "Create three similar tasks", "Give only the first hint"],
    };
  }

  if (id === "pippa") {
    return {
      reply: `I would build the party around ${firstChild.name}'s interest in ${firstChild.interests[0] || "a favorite theme"}, keep the guest journey to three clear moments and treat ${allergyBoundary} as a hard food constraint.`,
      memoryUsed: [childFact(firstChild), ...allergies, `Family budget: ${family.budget}`].slice(0, 5),
      suggestedPrompts: ["Create the full party plan", "Split the tasks between us", "Design the invitation"],
    };
  }

  if (id === "quinn") {
    return {
      reply: `I can run a quick quiz for ${firstChild.name}, movement rounds for ${secondChild.name}, or a whole-family story game. Pick a theme, difficulty and length, then everyone gets a real chance to score.`,
      memoryUsed: [childFact(firstChild), childFact(secondChild)],
      suggestedPrompts: ["Create five questions", "Start a would-you-rather round", "Give us three charades"],
    };
  }

  if (id === "moxie") {
    return {
      reply: "Let us begin with one repeated family job, not a personality. Tell me what regularly costs you time, who the Buddy should help, and what it must never decide on its own.",
      memoryUsed: [`${parent.name}: ${parent.responseStyle} answers`],
      suggestedPrompts: ["Define the Buddy's single job", "Choose memory access", "Write two guardrails"],
    };
  }

  if (id === "cleo") {
    return {
      reply: "I can help you record symptoms, timing and warning signs, but I cannot diagnose. If a child has trouble breathing, is unusually hard to wake, has a seizure or you believe there is immediate danger, contact emergency services now.",
      memoryUsed: family.children.map((child) => `${child.name}: age ${child.age}`).slice(0, 3),
      suggestedPrompts: ["Organize the symptom timeline", "Prepare a doctor note", "Show urgent warning signs"],
    };
  }

  if (id === "pip") {
    return {
      reply: `I can turn the process into a checklist for ${family.city}, but current deadlines and eligibility must be verified against the responsible authority. Start by sharing the form title or the outcome you need.`,
      memoryUsed: [`Location: ${family.city}, ${family.country}`, childFact(firstChild)],
      suggestedPrompts: ["Make a document checklist", "Draft the email", "List what needs official verification"],
    };
  }

  if (id === "romy") {
    return {
      reply: `I can turn one destination and a date range into a calm family plan. I will balance ${firstChild.name}'s ${firstChild.interests[0] || "interests"}, ${secondChild.name}'s age and the family's ${family.budget} budget without filling every hour.`,
      memoryUsed: [childFact(firstChild), childFact(secondChild), `Family budget: ${family.budget}`, `${family.city}: starting point`],
      suggestedPrompts: ["Build a five-day plan", "Keep one slow afternoon per day", "Create our packing shortlist"],
    };
  }

  return {
    reply: `For the children I would keep the plan compact and hands-on. I can build one role around ${firstChild.interests[0] || "exploring"} for ${firstChild.name} and another around ${secondChild.interests[0] || "animals"} for ${secondChild.name}. I can search current ${family.city} sources and keep the radius to ${family.radiusKm} km.`,
    memoryUsed: [`${family.city}: ${family.radiusKm} km radius`, childFact(firstChild), childFact(secondChild), `Family budget: ${family.budget}`],
    suggestedPrompts: ["Search this weekend live", "Only indoor options", "Keep it under EUR 40"],
  };
}

export function sampleLearningForFamily(family: FamilyProfile): LearningResult {
  const child = family.children[0];
  return {
    mode: "sample",
    notice: "Sample learning result - upload a worksheet and use Live AI for visual analysis.",
    detectedTask: "Add two-digit numbers by separating tens and ones.",
    levelAssessment: `A short primary-school arithmetic task suitable for ${child.name}'s age range.`,
    explanationSteps: ["Read the operation and circle the tens.", "Add the ones first.", "Add the tens, then combine both parts."],
    practiceTasks: [
      { question: "24 + 13 = ?", hint: "Add 4 + 3, then 20 + 10.", answer: "37" },
      { question: "31 + 26 = ?", hint: "Separate both numbers into tens and ones.", answer: "57" },
      { question: "42 + 15 = ?", hint: "Start with the ones column.", answer: "57" },
    ],
    parentNote: "Ask for the method before the result. Stop after one successful transfer task.",
    memoryUsed: [childFact(child), `Locale: ${family.locale}`],
    trace: { model: "Sample fixture", tools: ["No image analysis"], durationMs: 0, promptVersion: "learning-v1", generatedAt: new Date().toISOString() },
  };
}

export function sampleQuizForFamily(family: FamilyProfile, topics: string[] = ["space", "animals", "funny science"]): QuizResult {
  const [firstChild, secondChild = firstChild] = family.children;
  return {
    mode: "sample",
    notice: "Sample quiz - live mode creates a fresh round from your chosen topics and family.",
    title: "The Weber family challenge",
    intro: `Quick questions for ${firstChild.name}, ${secondChild.name} and the grown-ups, mixed from ${topics.join(", ")}.`,
    questions: [
      { question: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Mercury"], correctIndex: 0, explanation: "Iron minerals make Mars look reddish.", childFit: `${firstChild.name}'s space interest` },
      { question: "Which animal is the largest living land animal?", options: ["Giraffe", "Elephant", "Rhino", "Hippo"], correctIndex: 1, explanation: "The African elephant is the largest living land animal.", childFit: `${secondChild.name}'s animal interest` },
      { question: "Which part of a plant usually takes in water from the soil?", options: ["Roots", "Flowers", "Fruit", "Seeds"], correctIndex: 0, explanation: "Roots absorb water and minerals from the soil.", childFit: "Shared nature round" },
    ],
    memoryUsed: [childFact(firstChild), childFact(secondChild), `Topics: ${topics.join(", ")}`],
    trace: { model: "Sample fixture", tools: ["Structured family context"], durationMs: 0, promptVersion: "fun-quiz-v2", generatedAt: new Date().toISOString() },
  };
}

export function sampleVacationForFamily(family: FamilyProfile, destination: string): VacationResult {
  const [firstChild, secondChild = firstChild] = family.children;
  return {
    mode: "sample",
    notice: "Sample vacation plan - live mode creates a new plan from your dates and priorities.",
    destination,
    title: `${destination}, at family pace`,
    summary: "A five-day outline with one anchor activity each day, protected downtime and short logistics blocks.",
    recommendationReason: `${destination} offers a manageable mix of shared activities and flexible downtime for this demo family.`,
    familyFit: `${firstChild.name} gets a ${firstChild.interests[0] || "creative"} mission, ${secondChild.name} gets hands-on discovery, and the adults keep two unplanned afternoons.`,
    days: [
      { label: "Day 1", title: "Arrive without pressure", activities: ["Check in and orient nearby", "Choose one easy family dinner"] },
      { label: "Day 2", title: "The shared highlight", activities: ["One bookable morning experience", "Quiet afternoon and playground option"] },
      { label: "Day 3", title: "Explore in small doses", activities: ["Short local discovery route", "Family choice evening"] },
    ],
    travelPlan: ["Keep transfers under two hours where possible", "Book only the first major activity before departure", "Save addresses and offline confirmations"],
    packingHighlights: ["Allergy-safe travel snacks", "Reusable water bottles", "One familiar bedtime item per child", "Light rain layers"],
    budgetNotes: ["Use a daily family spending guardrail", "Keep a 15 percent buffer for weather changes"],
    trace: { model: "Sample fixture", tools: ["Structured family context"], durationMs: 0, promptVersion: "vacation-v1", generatedAt: new Date().toISOString() },
  };
}

export function sampleDestinationIdeasForFamily(family: FamilyProfile, scope: TravelScope): DestinationIdeasResult {
  const [firstChild, secondChild = firstChild] = family.children;
  const ideasByScope: Record<TravelScope, Array<[string, string, string]>> = {
    domestic: [["Black Forest", "Germany", "Short transfers and nature"], ["Lake Constance", "Germany", "Water, cycling and flexible day trips"], ["Berlin", "Germany", "Museums, parks and urban discovery"]],
    nearby: [["Lake Garda", "Northern Italy", "Lake days with compact family excursions"], ["Alsace", "France", "Small towns, food and easy drives"], ["Tyrol", "Austria", "Mountain lifts and child-friendly nature"]],
    worldwide: [["Costa Rica", "Central America", "Wildlife and nature discovery"], ["Japan", "East Asia", "Trains, food and city discovery"], ["Canada", "North America", "Space, nature and road-trip flexibility"]],
  };
  return {
    mode: "sample",
    notice: "Sample inspiration - live mode creates three new ideas from your family and travel frame.",
    intro: `Three starting points for ${family.name}, balancing ${firstChild.name}'s ${firstChild.interests[0] || "interests"} and ${secondChild.name}'s age.`,
    ideas: ideasByScope[scope].map(([destination, locationLabel, highlight]) => ({ destination, locationLabel, whyItFits: `${highlight}; one anchor activity per day leaves room for both children.`, travelEffort: scope === "domestic" ? `Low to moderate from ${family.city}` : scope === "nearby" ? `Moderate from ${family.city}` : `High - long-haul planning required`, budgetFit: `Compatible with a ${family.budget} budget when booked with a buffer`, familyHighlight: highlight, caveat: scope === "worldwide" ? "Flight time, entry rules and health guidance require current verification." : "Availability and seasonal conditions require current verification." })),
    trace: { model: "Sample fixture", tools: ["Structured family context"], durationMs: 0, promptVersion: "destination-ideas-v2", generatedAt: new Date().toISOString() },
  };
}

export const sampleBuddyBlueprint: BuddyBlueprint = {
  mode: "sample",
  notice: "Sample blueprint - live mode invents a new configuration from your answers.",
  name: "Tempo",
  role: "Morning routine guide",
  promise: "Turns the family's morning into a short, calm sequence without nagging the children.",
  instructions: "Create one realistic morning sequence at a time. Use ages and preferences to keep steps understandable. Ask before changing responsibilities. Never shame, score or compare family members.",
  quickPrompts: ["Build tomorrow's 30-minute routine", "Make the handover calmer", "What can we prepare tonight?"],
  memoryScopes: ["children", "preferences", "plans"],
  guardrails: ["Never shame or rank family members", "Do not make health or school decisions", "Ask before assigning a recurring responsibility"],
  trace: { model: "Sample fixture", tools: ["Guided configuration"], durationMs: 0, promptVersion: "buddy-builder-v1", generatedAt: new Date().toISOString() },
};

export const sampleStory: StoryResult = {
  mode: "sample",
  notice: "Sample result - connect an OpenAI API key for a newly generated story.",
  title: "The Moon Map and the Tiny Roar",
  synopsis: "Mia draws a route across the moon while Leo identifies the surprising owner of a very small roar.",
  story:
    "Mia had drawn nearly every corner of the moon base, except for the silver path behind the quiet crater. That path was new. It had not been there yesterday. Leo crouched beside it and pointed to three tiny footprints. 'Dinosaur,' he whispered. Mia opened her map and added three careful stars.\n\nThey followed the prints past the sleeping solar panels until a very small roar rolled out from behind a moon rock. It was not a dinosaur. It was a lost rover with a squeaky wheel, trying very hard to sound brave. Leo knew exactly what brave creatures needed: someone to walk beside them.\n\nMia drew a bright yellow route home. Leo counted every turn. Together they guided the rover back to the warm lights of the base, where its wheel was fixed and its tiny roar became a happy hum. Before bed, Mia added one last note to the map: No one is lost when we look together.",
  readTimeMinutes: 7,
  memoryUsed: ["Mia: space and drawing", "Leo: dinosaurs", "Ages 7 and 4", "Gentle bedtime ending"],
  trace: {
    model: "Sample fixture",
    tools: ["Shared family context"],
    durationMs: 0,
    promptVersion: "stories-v1",
    generatedAt: new Date().toISOString(),
  },
};

export const sampleEvents: EventResult = {
  mode: "sample",
  notice: "Sample result — connect an OpenAI API key for a current web search.",
  locationLabel: "Stuttgart · 25 km",
  summary: "Three low-friction ideas matched to Mia and Leo. Dates are illustrative in sample mode.",
  events: [
    {
      id: "wilhelma-discovery",
      title: "Animal discovery morning",
      dateLabel: "Saturday",
      time: "10:00",
      venue: "Wilhelma",
      city: "Stuttgart",
      priceLabel: "€€",
      ageLabel: "Ages 3–10",
      whyItFits: "Leo gets animals; Mia can bring a field-sketch booklet. Easy to leave before everyone is tired.",
      sourceName: "Wilhelma",
      sourceUrl: "https://www.wilhelma.de/",
    },
    {
      id: "stadtpalais-family",
      title: "Hands-on city lab",
      dateLabel: "Saturday",
      time: "14:00",
      venue: "StadtPalais",
      city: "Stuttgart",
      priceLabel: "€",
      ageLabel: "Ages 6+",
      whyItFits: "A creative indoor option for Mia, with enough interactive elements to keep Leo moving.",
      sourceName: "StadtPalais Stuttgart",
      sourceUrl: "https://www.stadtpalais-stuttgart.de/",
    },
    {
      id: "planetarium-space",
      title: "Family journey through space",
      dateLabel: "Sunday",
      time: "11:30",
      venue: "Carl-Zeiss Planetarium",
      city: "Stuttgart",
      priceLabel: "€€",
      ageLabel: "Ages 5+",
      whyItFits: "A strong match for Mia's space phase and a compact first planetarium experience for Leo.",
      sourceName: "Planetarium Stuttgart",
      sourceUrl: "https://www.planetarium-stuttgart.de/",
    },
  ],
  trace: {
    model: "Sample fixture",
    tools: ["No live tools"],
    durationMs: 0,
    promptVersion: "events-v1",
    generatedAt: new Date().toISOString(),
  },
};

export const sampleMeal: MealResult = {
  mode: "sample",
  notice: "Sample result — generated from the Weber family fixture.",
  title: "Sunny tomato orzo with hidden vegetables",
  summary: "One pan, 25 minutes, nut-free, and easy to serve deconstructed for Leo.",
  totalMinutes: 25,
  ingredients: ["orzo", "cherry tomatoes", "courgette", "carrot", "spinach", "feta", "lemon"],
  pantryUsed: ["olive oil", "vegetable stock", "oregano"],
  shoppingGaps: ["orzo", "cherry tomatoes", "feta"],
  steps: [
    "Grate the courgette and carrot; halve the tomatoes.",
    "Toast the orzo, add vegetables and stock, then simmer for 12 minutes.",
    "Fold in spinach, lemon and feta. Keep Leo's portion separate before mixing.",
  ],
  kidAdaptation: "Serve Leo's orzo, tomatoes and feta in separate sections; let Mia add a lemon-star garnish.",
  allergyCheck: "No peanuts or tree nuts. Check the stock and feta labels for cross-contamination.",
  trace: {
    model: "Sample fixture",
    tools: ["Structured family context"],
    durationMs: 0,
    promptVersion: "meals-v1",
    generatedAt: new Date().toISOString(),
  },
};

export function sampleStoryForFamily(family: FamilyProfile): StoryResult {
  const [firstChild, secondChild = firstChild] = family.children;
  const firstInterest = firstChild.interests[0] || "drawing";
  const secondInterest = secondChild.interests[0] || "animals";
  return {
    ...sampleStory,
    title: `${firstChild.name} and the Lantern Map`,
    synopsis: `${firstChild.name} uses ${firstInterest} while ${secondChild.name} follows a clue inspired by ${secondInterest}.`,
    story: `${firstChild.name} found a folded map under the last book on the shelf. It showed a path of tiny lanterns leading past a quiet hill. Because ${firstChild.name} loved ${firstInterest}, every empty corner of the map soon had a careful new mark. ${secondChild.name} spotted the first clue: a small sign shaped like something from the world of ${secondInterest}.\n\nThey followed the lanterns together. At every turn, one child noticed what the other had missed. The path ended beside a little wooden box that was not locked at all. Inside were two blank cards and a note: Draw the next safe path for someone else.\n\n${firstChild.name} drew the route while ${secondChild.name} chose where the lanterns should glow. Then they placed the new map back on the shelf. When the room became quiet again, both children knew the best adventures were the ones that helped everyone find their way home.`,
    memoryUsed: [childFact(firstChild), childFact(secondChild), "Gentle bedtime ending"],
    trace: { ...sampleStory.trace, generatedAt: new Date().toISOString() },
  };
}

export function sampleMealForFamily(family: FamilyProfile): MealResult {
  const [firstChild] = family.children;
  const allergies = allergyFacts(family);
  return {
    ...sampleMeal,
    notice: `Sample result - personalized from ${family.name}'s browser profile.`,
    summary: `One pan, 25 minutes, ${allergies.length ? `avoids ${allergies.join(", ")}` : "no recorded allergy constraints"}, and is easy to serve in separate parts.`,
    kidAdaptation: `Serve the components separately for ${firstChild.name}; let each child choose one familiar topping.`,
    allergyCheck: allergies.length
      ? `The recipe excludes ${allergies.join(", ")}. Check every packaged-food label for cross-contamination.`
      : "No allergies are recorded in Family Memory. Check the profile and packaged-food labels before serving.",
    trace: { ...sampleMeal.trace, generatedAt: new Date().toISOString() },
  };
}

export function sampleEventsForFamily(family: FamilyProfile, city = family.city): EventResult {
  const [firstChild, secondChild = firstChild] = family.children;
  return {
    ...sampleEvents,
    locationLabel: `${city} - ${family.radiusKm} km`,
    summary: `Three illustrative ideas shaped around ${firstChild.name} and ${secondChild.name}. Dates are not current in sample mode.`,
    events: sampleEvents.events.map((event, index) => ({
      ...event,
      id: `sample-event-${index + 1}`,
      whyItFits:
        index === 0
          ? `${secondChild.name} gets a ${secondChild.interests[0] || "hands-on"} angle; ${firstChild.name} gets a small ${firstChild.interests[0] || "discovery"} mission.`
          : index === 1
            ? `A flexible option that can be adapted to ages ${firstChild.age} and ${secondChild.age}.`
            : `A focused outing linked to ${firstChild.name}'s interest in ${firstChild.interests[0] || "discovery"}.`,
    })),
    trace: { ...sampleEvents.trace, generatedAt: new Date().toISOString() },
  };
}

export const sampleBirthday: BirthdayResult = {
  mode: "sample",
  notice: "Sample result - live mode uses GPT-5.6 Terra and GPT Image 2.",
  title: "Mission Mia: Space Academy",
  concept: "A two-hour astronaut training mission where twelve young cadets earn three stamps before launch cake.",
  guestExperience: [
    "Design a mission patch at arrival",
    "Complete a moon-rock relay and planet hunt",
    "Record a ten-second message from mission control",
  ],
  budgetBreakdown: [
    { label: "Decor and print", amount: "€35" },
    { label: "Food and cake", amount: "€55" },
    { label: "Activities", amount: "€30" },
    { label: "Buffer", amount: "€20" },
  ],
  tasks: [
    { id: "invite", label: "Approve and send invitations", timing: "This week", owner: "lena" },
    { id: "venue", label: "Confirm home-base layout", timing: "4 weeks before", owner: "shared" },
    { id: "food", label: "Order nut-free cake", timing: "2 weeks before", owner: "jonas" },
    { id: "kit", label: "Prepare mission kits", timing: "3 days before", owner: "lena" },
  ],
  imageBrief:
    "Portrait invitation for Mia's 7th space party. Friendly child astronaut, rocket, Saturn, navy, coral, yellow and mint. Exact text: MIA'S SPACE PARTY and SATURDAY · 15:00.",
  invitationMessage: "Mia is turning 7! Please join us for her Space Academy party on Saturday at 15:00 in Stuttgart. Please reply to Lena and let us know about any allergies. We would love to celebrate with you.",
  trace: {
    model: "Sample fixture",
    tools: ["Structured family context"],
    durationMs: 0,
    promptVersion: "birthday-v1",
    generatedAt: new Date().toISOString(),
  },
};

export const parentById = (id: ParentId) =>
  familyProfile.parents.find((parent) => parent.id === id) ?? familyProfile.parents[0];

export function getDashboardCopy(parentId: ParentId) {
  return parentId === "lena"
    ? {
        greeting: "Good evening, Lena",
        summary: "Two decisions and one bright spot for the Weber week.",
        focus: ["Mia's birthday", "Weekend plan", "Family circle"],
      }
    : {
        greeting: "Evening, Jonas",
        summary: "The short version: dinner, Saturday, then story time.",
        focus: ["Dinner in 25", "Weekend pick", "Bedtime"],
      };
}
