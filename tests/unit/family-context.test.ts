import { describe, expect, it } from "vitest";
import { familyProfile, featuredSidekicks, getDashboardCopy, parentById, sampleBuddyBlueprint, sampleBuddyReply, sampleLearningForFamily, sampleMeal, sampleMealForFamily, sampleQuizForFamily, sampleStory, sampleStoryForFamily, sidekicks } from "../../lib/demo-data";

describe("demo family context", () => {
  it("keeps the child allergy as a hard product input", () => {
    const leo = familyProfile.children.find((child) => child.id === "leo");
    expect(leo?.allergies).toEqual(["tree nuts", "peanuts"]);
    expect(sampleMeal.allergyCheck.toLowerCase()).toContain("tree nuts");
  });

  it("personalizes parent priorities without changing the shared family", () => {
    expect(parentById("lena").responseStyle).toBe("supportive");
    expect(parentById("jonas").responseStyle).toBe("direct");
    expect(getDashboardCopy("lena").focus).not.toEqual(getDashboardCopy("jonas").focus);
    expect(familyProfile.id).toBe("weber-family");
  });

  it("keeps three featured Sidekicks while giving the extended crew distinct jobs", () => {
    expect(featuredSidekicks.map((sidekick) => sidekick.id)).toEqual(["skippy", "nori", "lumi"]);
    expect(sidekicks.map((sidekick) => sidekick.id)).toEqual(["skippy", "nori", "lumi", "atlas", "pippa", "quinn", "moxie", "cleo", "pip", "romy"]);
    expect(new Set(sidekicks.map((sidekick) => sidekick.corner)).size).toBe(sidekicks.length);
    expect(sampleBuddyReply("nori", "No beans please").memoryUsed).toContain("Leo: tree nuts");
    expect(sampleStory.memoryUsed).toContain("Mia: space and drawing");
  });

  it("personalizes learning, quiz and Buddy blueprints without exposing every memory area", () => {
    expect(sampleLearningForFamily(familyProfile).memoryUsed).toContain("Mia: age 7, space and drawing");
    expect(sampleQuizForFamily(familyProfile, ["Space", "Animals"]).memoryUsed).toContain("Topics: Space, Animals");
    expect(sampleBuddyBlueprint.memoryScopes).not.toContain("allergies");
    expect(sampleBuddyBlueprint.guardrails.length).toBeGreaterThanOrEqual(2);
  });

  it("personalizes sample mode from an edited browser profile", () => {
    const customFamily = {
      ...familyProfile,
      name: "River family",
      city: "Cologne",
      children: [
        { ...familyProfile.children[0], name: "Ava", interests: ["music"], allergies: ["sesame"] },
        { ...familyProfile.children[1], name: "Noah", interests: ["trains"], allergies: [] },
      ],
    };

    expect(sampleBuddyReply("skippy", "Plan Saturday", customFamily).reply).toContain("Cologne");
    expect(sampleMealForFamily(customFamily).allergyCheck).toContain("Ava: sesame");
    expect(sampleStoryForFamily(customFamily).story).toContain("Noah");
  });
});
