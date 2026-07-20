"use client";

import { Check, ChefHat, Clock3, LoaderCircle, RefreshCw, ShoppingBasket, Users } from "lucide-react";
import { useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import type { FamilyProfile, MealResult, ParentId } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Meal planning failed");
  return data as T;
}

export function KitchenCorner({
  family,
  activeParent,
  onSave,
  onContextChange,
  showToast,
}: {
  family: FamilyProfile;
  activeParent: ParentId;
  onSave: (meal: MealResult) => void;
  onContextChange: (context: string) => void;
  showToast: (message: string) => void;
}) {
  const [minutes, setMinutes] = useState(25);
  const [pantry, setPantry] = useState("olive oil, vegetable stock, oregano");
  const [request, setRequest] = useState(`Bright weekday dinner with easy serving options for ${family.children[0].name}`);
  const [state, setState] = useState<RequestState>("idle");
  const [result, setResult] = useState<MealResult | null>(null);
  const [error, setError] = useState("");

  async function buildMeal(useSample = false) {
    setState("loading");
    setError("");
    try {
      const meal = await postJson<MealResult>("/api/meals", {
        activeParent,
        family,
        availableMinutes: minutes,
        pantry: pantry.split(",").map((item) => item.trim()).filter(Boolean),
        request,
        useSample,
      });
      setResult(meal);
      setState("done");
      onContextChange(`${meal.title}. ${meal.summary} Total time: ${meal.totalMinutes} minutes. Ingredients: ${meal.ingredients.join("; ")}. Pantry used: ${meal.pantryUsed.join(", ") || "none"}. Shopping gaps: ${meal.shoppingGaps.join(", ") || "none"}. Steps: ${meal.steps.map((step, index) => `${index + 1}. ${step}`).join(" ")} Kid adaptation: ${meal.kidAdaptation}. Allergy check: ${meal.allergyCheck}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Meal planning failed");
      setState("error");
    }
  }

  const allergyFacts = family.children.flatMap((child) => child.allergies.map((allergy) => `${child.name}: ${allergy}`));
  const mealOwner = family.parents.find((parent) => parent.id === "jonas") ?? family.parents[1];

  return (
    <div className="corner-workbench">
      <div className="workbench-heading"><div><span className="corner-kicker">Nori&apos;s workbench</span><h2>One dinner decision, with the family rules already applied</h2><p>Allergies are a hard boundary. Preferences, time and pantry shape the recommendation.</p></div><StatusPill mode="live" /></div>
      <div className="corner-controls kitchen-controls">
        <label className="corner-range"><span>Available time</span><div><input type="range" min="15" max="60" step="5" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /><strong>{minutes} min</strong></div></label>
        <label><span>Already in the pantry</span><input value={pantry} onChange={(event) => setPantry(event.target.value)} /></label>
        <label className="kitchen-request"><span>What should dinner feel like?</span><input value={request} onChange={(event) => setRequest(event.target.value)} /></label>
        <button className="corner-button primary" onClick={() => void buildMeal(false)} disabled={state === "loading"}>{state === "loading" ? <LoaderCircle className="spin" size={17} /> : <ChefHat size={17} />}Let Nori decide</button>
      </div>

      <div className="hard-memory-strip"><Check size={16} /><strong>{allergyFacts.length ? "Hard family rule" : "Family safety check"}</strong><span>{allergyFacts.join(" + ") || "No allergies recorded"}</span><em>Always applied</em></div>

      {state === "idle" ? <div className="corner-empty"><ShoppingBasket size={28} /><strong>Nori already knows the non-negotiables</strong><p>Change the pantry or dinner request, then create a structured result. You can keep refining it in the conversation.</p></div> : null}
      {state === "error" ? <div className="corner-error"><strong>Live planning did not complete</strong><p>{error}</p><div><button onClick={() => void buildMeal(false)}><RefreshCw size={15} />Retry</button><button onClick={() => void buildMeal(true)}>Load labeled sample</button></div></div> : null}
      {state === "done" && result ? (
        <div className="corner-result">
          <div className="corner-result-intro"><div><StatusPill mode={result.mode} /><h3>{result.title}</h3><p>{result.summary}</p></div><span className="corner-time"><Clock3 size={16} />{result.totalMinutes} min</span></div>
          {result.notice ? <div className="sample-notice">{result.notice}</div> : null}
          <div className="recipe-layout">
            <div className="recipe-steps"><h4>Three moves</h4><ol>{result.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>
            <aside><h4>Shopping gaps</h4><ul>{result.shoppingGaps.map((item) => <li key={item}>{item}</li>)}</ul><h4>Serve it to the kids</h4><p>{result.kidAdaptation}</p></aside>
          </div>
          <div className="allergy-proof"><Check size={18} /><div><strong>Allergy check</strong><p>{result.allergyCheck}</p></div></div>
          <div className="corner-result-actions"><button className="corner-button primary" onClick={() => onSave(result)}><Users size={16} />Assign dinner to {mealOwner.name}</button><button className="corner-button secondary" onClick={() => showToast("Shopping list copied")}><ShoppingBasket size={16} />Copy shopping list</button></div>
          <TraceStrip trace={result.trace} />
        </div>
      ) : null}
      <div className="corner-commercial"><span>Partner preview</span><strong>Missing ingredients could be handed to a grocery partner.</strong><p>No order, price claim or tracking is active in this POC.</p></div>
    </div>
  );
}
