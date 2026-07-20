import { expect, test, type Page } from "@playwright/test";

async function openNavigation(page: Page, name: string) {
  const desktopNavigation = page.getByLabel("Sidekick corners");
  if (await desktopNavigation.isVisible()) {
    await desktopNavigation.getByRole("button", { name, exact: true }).click();
    return;
  }
  await page.getByLabel("Mobile Sidekick navigation").getByRole("button", { name, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    if (request.method() !== "POST") return route.continue();
    const body = request.postDataJSON() as Record<string, unknown>;
    await route.continue({
      headers: { ...request.headers(), "content-type": "application/json" },
      postData: JSON.stringify({ ...body, useSample: true }),
    });
  });
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("moves through three Sidekick corners with one shared family memory", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Your family today." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Weather" })).toBeVisible();
  const fieldTripTask = page.getByRole("button", { name: "Complete Mia's field trip consent" });
  await fieldTripTask.click();
  await expect(page.getByRole("button", { name: "Reopen Mia's field trip consent" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Jonas/ }).click();
  await expect(page.getByText("Personal to Jonas")).toBeVisible();
  await page.getByRole("button", { name: /Lena/ }).click();
  await page.getByRole("button", { name: "Choose three" }).click();
  const homeCustomizer = page.getByRole("dialog", { name: "Choose three Sidekicks" });
  await homeCustomizer.getByRole("button", { name: "Pip Family admin guide", exact: true }).click();
  await homeCustomizer.getByRole("button", { name: "Atlas Learning coach", exact: true }).click();
  await homeCustomizer.getByRole("button", { name: "Save my home crew" }).click();
  await expect(page.locator(".home-crew-section").getByRole("heading", { name: "Atlas" })).toBeVisible();

  await page.getByRole("button", { name: "Open family profile", exact: true }).click();
  await page.getByRole("button", { name: "Edit family" }).click();
  await page.getByLabel("Family name").fill("River family");
  await page.getByLabel("City", { exact: true }).fill("Cologne");
  const firstChild = page.locator("article").filter({ hasText: "Child 1" });
  await firstChild.getByLabel("Name", { exact: true }).fill("Ava");
  await firstChild.getByLabel("Interests, comma-separated").fill("music, painting");
  await firstChild.getByLabel("Allergies", { exact: true }).fill("sesame");
  await page.getByRole("button", { name: "Save and apply" }).click();
  await expect(page.getByRole("heading", { name: "What every Sidekick knows about River family" })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Demo forecast - Cologne", { exact: true })).toBeVisible();
  await expect(page.getByText("Ava's field trip consent", { exact: true })).toBeVisible();

  await openNavigation(page, "Skippy");
  await expect(page.getByRole("heading", { name: "Skippy" })).toBeVisible();
  await page.getByRole("button", { name: "Find weekend plans" }).click();
  await expect(page.getByRole("main").getByText("Sample result", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cologne - 25 km" })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).first().click();
  await page.getByRole("button", { name: "What works this Saturday if it rains?" }).click();
  await expect(page.getByText(/search current Cologne sources/)).toBeVisible();

  await openNavigation(page, "Nori");
  await expect(page.getByRole("heading", { name: "Nori" })).toBeVisible();
  await expect(page.getByText(/Ava: sesame/).first()).toBeVisible();
  await page.getByRole("button", { name: "Let Nori decide" }).click();
  await expect(page.getByText("Sunny tomato orzo with hidden vegetables")).toBeVisible();
  await expect(page.getByText(/excludes Ava: sesame/)).toBeVisible();
  const noriChat = page.getByLabel("Chat with Nori");
  await expect(noriChat.getByText("Current meal plan", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "How can I serve dinner for Ava?" }).click();
  await expect(page.getByText("Memory used")).toBeVisible();
  await expect(noriChat.getByText("Workbench: Current meal plan", { exact: true })).toBeVisible();

  await openNavigation(page, "Lumi");
  await expect(page.getByRole("heading", { name: "Lumi" })).toBeVisible();
  await page.getByRole("button", { name: "Create tonight's story" }).click();
  await expect(page.getByRole("heading", { name: "Ava and the Lantern Map" })).toBeVisible();
  await page.getByRole("button", { name: "Tell a seven-minute story about music" }).click();
  await expect(page.getByText(/make Ava the expert on music/)).toBeVisible();

  await openNavigation(page, "Crew home");
  await expect(page.getByRole("heading", { name: "Lemony tomato orzo" })).toBeVisible();
});

test("opens the extended workbenches and guided Buddy workshop", async ({ page }) => {
  await openNavigation(page, "More corners");
  await expect(page.getByRole("heading", { name: "More family jobs, still one shared memory" })).toBeVisible();

  await page.locator("article").filter({ hasText: "Atlas" }).getByRole("button", { name: /Open corner/ }).click();
  await expect(page.getByRole("heading", { name: "Atlas" })).toBeVisible();
  await expect(page.getByText("Show the task. Learn the method. Practice the skill.")).toBeVisible();

  await openNavigation(page, "More corners");
  await page.locator("article").filter({ hasText: "Pippa" }).getByRole("button", { name: /Open corner/ }).click();
  await expect(page.getByRole("heading", { name: "Pippa" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add friend details" })).toBeVisible();

  await openNavigation(page, "More corners");
  await page.locator("article").filter({ hasText: "Quinn" }).getByRole("button", { name: /Open corner/ }).click();
  await expect(page.getByRole("heading", { name: "Quinn" })).toBeVisible();
  await expect(page.getByText("Who is playing?")).toBeVisible();
  await expect(page.getByText("Would you rather?", { exact: true })).toBeVisible();

  await openNavigation(page, "More corners");
  await page.locator("article").filter({ hasText: "Care Corner" }).getByRole("button", { name: /Open corner/ }).click();
  await expect(page.getByText("Saved care team")).toBeVisible();
  await expect(page.getByLabel("Chat with Cleo").getByText("Current care desk", { exact: true })).toBeVisible();

  await openNavigation(page, "More corners");
  await page.locator("article").filter({ hasText: "Admin Corner" }).getByRole("button", { name: /Open corner/ }).click();
  await expect(page.getByText("Local document vault")).toBeVisible();
  await expect(page.getByLabel("Chat with Pip").getByText("Current family office", { exact: true })).toBeVisible();

  await openNavigation(page, "More corners");
  await page.locator("article").filter({ hasText: "Vacation Corner" }).getByRole("button", { name: /Open corner/ }).click();
  await expect(page.getByText("Do you already know where you want to go?")).toBeVisible();
  await expect(page.getByRole("button", { name: /Recommend something/ })).toBeVisible();
  await page.getByRole("button", { name: /We have an idea/ }).click();
  await page.getByLabel("Where are you thinking?").fill("Lake Garda");
  await page.getByRole("button", { name: "Use this destination" }).click();
  await page.getByRole("button", { name: "Define the trip style" }).click();
  await page.getByRole("button", { name: "Build our family trip" }).click();
  await expect(page.getByRole("heading", { name: "Lake Garda, at family pace" })).toBeVisible();
  const romyChat = page.getByLabel("Chat with Romy");
  await expect(romyChat.getByText("Current trip plan", { exact: true })).toBeVisible();
  await romyChat.getByRole("button", { name: "Create the packing shortlist" }).click();
  await expect(romyChat.getByText("Workbench: Current trip plan", { exact: true })).toBeVisible();

  await page.reload();
  await openNavigation(page, "More corners");
  await page.locator("article").filter({ hasText: "Vacation Corner" }).getByRole("button", { name: /Open corner/ }).click();
  await expect(page.getByLabel("Chat with Romy").getByText("Current trip plan", { exact: true })).toBeVisible();

  await openNavigation(page, "More corners");
  await page.locator("article").filter({ hasText: "Moxie" }).getByRole("button", { name: /Open corner/ }).click();
  await expect(page.getByText("Build a useful helper without learning prompt engineering")).toBeVisible();
  await expect(page.getByLabel("Chat with Moxie").getByText("Current Buddy workshop", { exact: true })).toBeVisible();
});
