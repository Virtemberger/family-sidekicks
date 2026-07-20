import { describe, expect, it } from "vitest";
import { birthdayOutputSchema, buddyBlueprintOutputSchema, destinationIdeasOutputSchema, eventOutputSchema, familyProfileSchema, learningOutputSchema, quizOutputSchema, vacationOutputSchema } from "../../lib/schemas";

describe("structured Sidekick outputs", () => {
  it("accepts source URLs as plain strings for Structured Outputs compatibility", () => {
    const result = eventOutputSchema.safeParse({
      locationLabel: "Stuttgart",
      summary: "One verified event",
      events: [{ title: "Family day", dateLabel: "Saturday", time: "10:00", venue: "Museum", city: "Stuttgart", priceLabel: "EUR 5", ageLabel: "Ages 4+", whyItFits: "Hands-on", sourceName: "Museum", sourceUrl: "https://example.com/event" }],
    });
    expect(result.success).toBe(true);
  });

  it("keeps Atlas answers separate from child-facing hints", () => {
    const result = learningOutputSchema.safeParse({ detectedTask: "Add tens", levelAssessment: "Primary level", explanationSteps: ["Split the numbers", "Combine the parts"], practiceTasks: [{ question: "20 + 10", hint: "Count tens", answer: "30" }, { question: "30 + 20", hint: "Count tens", answer: "50" }], parentNote: "Ask for the method", memoryUsed: ["Mia: age 7"] });
    expect(result.success).toBe(true);
  });

  it("requires four quiz choices and explicit Buddy guardrails", () => {
    expect(quizOutputSchema.safeParse({ title: "Trip", intro: "Ready", questions: Array.from({ length: 3 }, () => ({ question: "Q", options: ["A", "B", "C", "D"], correctIndex: 0, explanation: "Because", childFit: "Mixed ages" })), memoryUsed: ["Ages"] }).success).toBe(true);
    expect(buddyBlueprintOutputSchema.safeParse({ name: "Tempo", role: "Routine guide", promise: "Makes one routine easier for the family.", instructions: "Guide one routine carefully and ask before assigning recurring responsibilities.", quickPrompts: ["Build tomorrow", "Prepare tonight", "Make it calmer"], memoryScopes: ["children"], guardrails: ["Never shame", "Never compare"] }).success).toBe(true);
  });

  it("migrates older browser family profiles with safe directory defaults", () => {
    const result = familyProfileSchema.parse({ id: "family", name: "Family", locale: "en-DE", city: "Stuttgart", country: "DE", radiusKm: 25, budget: "medium", children: [{ id: "child", name: "Mia", age: 7, interests: [], allergies: [], dislikes: [] }], parents: [{ id: "lena", name: "Lena", responseStyle: "supportive", ownedDomains: [], accent: "coral" }, { id: "jonas", name: "Jonas", responseStyle: "direct", ownedDomains: [], accent: "blue" }] });
    expect(result.children[0].gender).toBe("unspecified");
    expect(result.careContacts).toEqual([]);
    expect(result.documents).toEqual([]);
    expect(result.parents[0].email).toBe("");
  });

  it("requires shareable party copy and a bounded vacation structure", () => {
    expect(birthdayOutputSchema.safeParse({ title: "Party", concept: "A coherent party plan", guestExperience: ["Arrive", "Play"], budgetBreakdown: [{ label: "Food", amount: "50" }, { label: "Play", amount: "30" }], tasks: Array.from({ length: 3 }, (_, index) => ({ id: `task-${index}`, label: "Do task", timing: "Soon", owner: "shared" })), imageBrief: "A safe invitation image", invitationMessage: "Please join our family celebration on Saturday at 15:00. Reply to Lena with allergies." }).success).toBe(true);
    expect(vacationOutputSchema.safeParse({ destination: "Lake Garda", recommendationReason: "Short travel with a mix of water and quiet family time.", title: "Trip", summary: "A calm family trip", familyFit: "Works for both children", days: Array.from({ length: 2 }, (_, index) => ({ label: `Day ${index + 1}`, title: "Slow day", activities: ["One activity", "Downtime"] })), travelPlan: ["Short transfer", "Save confirmations"], packingHighlights: ["Snacks", "Water", "Rain layer"], budgetNotes: ["Daily guardrail", "Keep a buffer"] }).success).toBe(true);
  });

  it("requires Romy to return exactly three comparable destination ideas", () => {
    const ideas = Array.from({ length: 3 }, (_, index) => ({ destination: `Destination ${index + 1}`, locationLabel: "Europe", whyItFits: "Balances child interests and adult downtime.", travelEffort: "About four hours", budgetFit: "Fits the planning guardrail", familyHighlight: "One memorable shared activity", caveat: "Availability and current prices need verification." }));
    expect(destinationIdeasOutputSchema.safeParse({ intro: "Three distinct directions", ideas }).success).toBe(true);
    expect(destinationIdeasOutputSchema.safeParse({ intro: "Too few", ideas: ideas.slice(0, 2) }).success).toBe(false);
  });
});
