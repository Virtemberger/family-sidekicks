"use client";

import { Brain, Check, ChevronLeft, ChevronRight, Hammer, LoaderCircle, RefreshCw, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import type { BuddyBlueprint, CustomBuddy, FamilyMemoryScope, FamilyProfile, ParentId } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";
const memoryOptions: { id: FamilyMemoryScope; label: string; detail: string }[] = [
  { id: "children", label: "Children", detail: "Names and ages" },
  { id: "preferences", label: "Preferences", detail: "Interests and dislikes" },
  { id: "allergies", label: "Allergies", detail: "Hard safety constraints" },
  { id: "location", label: "Location", detail: "City and radius" },
  { id: "plans", label: "Family plans", detail: "Saved shared outputs" },
];

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Buddy creation failed");
  return data as T;
}

export function BuddyBuilderCorner({ family, activeParent, onCreate, onContextChange }: { family: FamilyProfile; activeParent: ParentId; onCreate: (buddy: CustomBuddy) => void; onContextChange: (context: string) => void }) {
  const [step, setStep] = useState(1);
  const [job, setJob] = useState("Help our family prepare school bags and clothes the evening before busy mornings.");
  const [audience, setAudience] = useState<"parent" | "child" | "whole-family">("whole-family");
  const [tone, setTone] = useState<"calm" | "playful" | "direct" | "encouraging">("calm");
  const [scopes, setScopes] = useState<FamilyMemoryScope[]>(["children", "preferences", "plans"]);
  const [boundary, setBoundary] = useState("It must never shame, score or compare family members.");
  const [state, setState] = useState<RequestState>("idle");
  const [blueprint, setBlueprint] = useState<BuddyBlueprint | null>(null);
  const [error, setError] = useState("");
  const [installed, setInstalled] = useState(false);

  function toggleScope(scope: FamilyMemoryScope) {
    setScopes((current) => current.includes(scope) ? current.length === 1 ? current : current.filter((item) => item !== scope) : [...current, scope]);
  }

  async function design(useSample = false) {
    setState("loading"); setError(""); setInstalled(false);
    try {
      const result = await postJson<BuddyBlueprint>("/api/buddy-builder", { activeParent, family, job, audience, tone, memoryScopes: scopes, boundary, useSample });
      setBlueprint(result); setState("done"); setStep(3); onContextChange(`${result.name}. Role: ${result.role}. Promise: ${result.promise}. Instructions: ${result.instructions}. Starter actions: ${result.quickPrompts.join("; ")}. Memory access: ${result.memoryScopes.join(", ")}. Guardrails: ${result.guardrails.join("; ")}.`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Buddy creation failed"); setState("error"); }
  }

  function installBuddy() {
    if (!blueprint || installed) return;
    const buddy: CustomBuddy = {
      id: `custom-${Date.now()}`,
      name: blueprint.name,
      corner: "My Family Corner",
      role: blueprint.role,
      promise: blueprint.promise,
      image: "/images/sidekick-moxie.png",
      accent: "coral",
      quickPrompts: blueprint.quickPrompts,
      instructions: blueprint.instructions,
      memoryScopes: blueprint.memoryScopes,
      guardrails: blueprint.guardrails,
      createdAt: new Date().toISOString(),
    };
    onCreate(buddy); setInstalled(true);
  }

  return <div className="corner-workbench builder-workbench">
    <div className="workbench-heading"><div><span className="corner-kicker">Moxie&apos;s Buddy workshop</span><h2>Build a useful helper without learning prompt engineering</h2><p>Start with one repeated family job. Moxie turns it into a named capability with deliberate memory access and visible limits.</p></div><StatusPill mode="live" /></div>
    <div className="builder-steps">{[1, 2, 3].map((item) => <div className={step === item ? "active" : step > item ? "done" : ""} key={item}><span>{step > item ? <Check size={13} /> : item}</span><strong>{item === 1 ? "The job" : item === 2 ? "Memory + limits" : "Your Buddy"}</strong></div>)}</div>

    {step === 1 ? <section className="builder-panel"><div className="builder-panel-icon"><Hammer size={24} /></div><span>Step 1</span><h3>What should become easier?</h3><p>Choose one outcome that happens repeatedly. A narrow Buddy is more useful than a general assistant.</p><label className="corner-textarea"><span>Recurring family job</span><textarea value={job} onChange={(event) => setJob(event.target.value)} rows={4} maxLength={500} /></label><div className="builder-choice"><span>Who is it for?</span>{(["parent", "child", "whole-family"] as const).map((item) => <button className={audience === item ? "active" : ""} onClick={() => setAudience(item)} key={item}>{item === "whole-family" ? "Whole family" : item}</button>)}</div><div className="builder-actions"><button className="corner-button primary" onClick={() => setStep(2)} disabled={job.trim().length < 10}>Choose memory <ChevronRight size={15} /></button></div></section> : null}

    {step === 2 ? <section className="builder-panel"><div className="builder-panel-icon"><Brain size={24} /></div><span>Step 2</span><h3>Give it only the context it needs</h3><p>Every selected memory area is shown to the family and sent only when this Buddy is used.</p><div className="memory-scope-grid">{memoryOptions.map((option) => { const selected = scopes.includes(option.id); return <button className={selected ? "selected" : ""} onClick={() => toggleScope(option.id)} key={option.id}><span>{selected ? <Check size={14} /> : null}</span><strong>{option.label}</strong><small>{option.detail}</small></button>; })}</div><div className="builder-settings"><label><span>Voice</span><select value={tone} onChange={(event) => setTone(event.target.value as typeof tone)}><option value="calm">Calm</option><option value="playful">Playful</option><option value="direct">Direct</option><option value="encouraging">Encouraging</option></select></label><label className="corner-textarea"><span>One thing it must never do</span><textarea value={boundary} onChange={(event) => setBoundary(event.target.value)} rows={3} maxLength={400} /></label></div>{state === "error" ? <div className="corner-error"><strong>Live blueprint did not complete</strong><p>{error}</p><div><button onClick={() => void design(false)}><RefreshCw size={15} />Retry</button><button onClick={() => void design(true)}>Load labeled sample</button></div></div> : null}<div className="builder-actions"><button className="corner-button secondary" onClick={() => setStep(1)}><ChevronLeft size={15} />Back</button><button className="corner-button primary" onClick={() => void design(false)} disabled={state === "loading" || boundary.trim().length < 5}>{state === "loading" ? <LoaderCircle className="spin" size={16} /> : <WandSparkles size={16} />}Design my Buddy</button></div></section> : null}

    {step === 3 && blueprint ? <section className="builder-blueprint"><div className="blueprint-identity"><div><Sparkles size={25} /></div><span>Ready to join the crew</span><h3>{blueprint.name}</h3><strong>{blueprint.role}</strong><p>{blueprint.promise}</p></div>{blueprint.notice ? <div className="sample-notice">{blueprint.notice}</div> : null}<div className="blueprint-columns"><div><span>Starter actions</span>{blueprint.quickPrompts.map((prompt) => <p key={prompt}>{prompt}</p>)}</div><div><span>Can read</span>{blueprint.memoryScopes.map((scope) => <p key={scope}><Brain size={13} />{memoryOptions.find((option) => option.id === scope)?.label ?? scope}</p>)}</div><div><span>Guardrails</span>{blueprint.guardrails.map((guardrail) => <p key={guardrail}><ShieldCheck size={13} />{guardrail}</p>)}</div></div><details><summary>View the generated capability instructions</summary><p>{blueprint.instructions}</p></details><div className="builder-actions"><button className="corner-button secondary" onClick={() => setStep(2)}><ChevronLeft size={15} />Refine</button><button className="corner-button primary" onClick={installBuddy} disabled={installed}>{installed ? <Check size={16} /> : <Sparkles size={16} />}{installed ? `${blueprint.name} joined the crew` : "Add to our family"}</button></div><TraceStrip trace={blueprint.trace} /></section> : null}
  </div>;
}
