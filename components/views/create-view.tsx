"use client";

import Image from "next/image";
import {
  Check,
  CheckCircle2,
  Download,
  Gift,
  ImageIcon,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  Palette,
  Printer,
  RefreshCw,
  Rocket,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { EmptyState, StatusPill, TraceStrip } from "@/components/ui";
import { familyProfile } from "@/lib/demo-data";
import type { BirthdayResult, ParentId, TraceInfo } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request failed");
  return data as T;
}

interface InvitationResponse {
  mode: "live" | "sample";
  notice?: string;
  imageUrl: string;
  trace: TraceInfo;
}

export function CreateView({
  activeParent,
  completedTaskIds,
  invitationDataUrl,
  invitationGenerated,
  saveBirthday,
  setInvitation,
  toggleTask,
  openPremium,
  openCheckout,
  showToast,
}: {
  activeParent: ParentId;
  completedTaskIds: string[];
  invitationDataUrl?: string;
  invitationGenerated: boolean;
  saveBirthday: (plan: BirthdayResult) => void;
  setInvitation: (url: string) => void;
  toggleTask: (taskId: string) => void;
  openPremium: () => void;
  openCheckout: () => void;
  showToast: (message: string) => void;
}) {
  const [theme, setTheme] = useState("Astronaut space academy");
  const [guestCount, setGuestCount] = useState(12);
  const [budget, setBudget] = useState(140);
  const [planState, setPlanState] = useState<RequestState>("idle");
  const [plan, setPlan] = useState<BirthdayResult | null>(null);
  const [planError, setPlanError] = useState("");
  const [imageState, setImageState] = useState<RequestState>(invitationGenerated ? "done" : "idle");
  const [imageMode, setImageMode] = useState<"live" | "sample">("sample");
  const [imageNotice, setImageNotice] = useState("");
  const [imageTrace, setImageTrace] = useState<TraceInfo | null>(null);
  const [imageError, setImageError] = useState("");

  async function buildPlan(useSample = false) {
    setPlanState("loading");
    setPlanError("");
    try {
      const result = await postJson<BirthdayResult>("/api/birthday", {
        activeParent,
        family: familyProfile,
        childName: "Mia",
        theme,
        guestCount,
        budgetEuro: budget,
        useSample,
      });
      setPlan(result);
      saveBirthday(result);
      setPlanState("done");
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "Birthday planning failed");
      setPlanState("error");
    }
  }

  async function generateInvitation(useSample = false) {
    if (!plan) return;
    setImageState("loading");
    setImageError("");
    try {
      const result = await postJson<InvitationResponse>("/api/invitation", { imageBrief: plan.imageBrief, useSample });
      setInvitation(result.imageUrl);
      setImageMode(result.mode);
      setImageNotice(result.notice ?? "");
      setImageTrace(result.trace);
      setImageState("done");
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image generation failed");
      setImageState("error");
    }
  }

  function downloadInvitation() {
    const link = document.createElement("a");
    link.href = invitationDataUrl || "/images/mia-space-party-sample.png";
    link.download = "mia-space-party-invitation.png";
    link.click();
    showToast("Invitation download started");
  }

  const invitationSrc = invitationDataUrl || "/images/mia-space-party-sample.png";

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">Create a family moment</p><h1>Mia&apos;s birthday project</h1><p>Concept, work split, invitation and partner handoff in one shared place.</p></div>
        <span className="project-countdown"><strong>6</strong>weeks to go</span>
      </section>

      <section className="tool-section tool-section-coral">
        <div className="tool-heading">
          <div className="character-badge character-party"><Rocket size={22} /></div>
          <div><div className="tool-title-line"><p className="eyebrow">Party Pilot</p><StatusPill mode="live" /></div><h2>Turn a theme into a complete little world</h2><p>Built around Mia, the guest count, budget, family responsibilities and Leo&apos;s allergy.</p></div>
        </div>
        <div className="tool-controls birthday-controls">
          <label><span>Theme</span><input value={theme} onChange={(event) => setTheme(event.target.value)} /></label>
          <label><span>Young guests</span><input type="number" min="2" max="40" value={guestCount} onChange={(event) => setGuestCount(Number(event.target.value))} /></label>
          <label><span>Budget</span><div className="currency-input"><span>€</span><input type="number" min="30" max="2000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></div></label>
          <button className="button button-primary" onClick={() => buildPlan(false)} disabled={planState === "loading"}>{planState === "loading" ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}Create party plan</button>
        </div>

        {planState === "idle" ? <EmptyState icon={<Gift size={24} />} title="One project, not twelve browser tabs" body="Generate the concept first. The invitation uses the approved concept as its image brief." /> : null}
        {planState === "error" ? <div className="error-state"><strong>Live planning did not complete</strong><p>{planError}</p><div><button className="button button-secondary" onClick={() => buildPlan(false)}><RefreshCw size={16} />Retry</button><button className="button button-quiet" onClick={() => buildPlan(true)}>Load labeled sample</button></div></div> : null}

        {planState === "done" && plan ? (
          <div className="result-block birthday-result">
            <div className="result-header"><div><StatusPill mode={plan.mode} /><h3>{plan.title}</h3><p>{plan.concept}</p></div></div>
            {plan.notice ? <div className="sample-notice">{plan.notice}</div> : null}
            <div className="birthday-layout">
              <div>
                <h4>Guest journey</h4>
                <div className="journey-list">{plan.guestExperience.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div>
                <h4>Shared tasks</h4>
                <div className="task-list">{plan.tasks.map((task) => { const done = completedTaskIds.includes(task.id); return <button className={done ? "task-done" : ""} key={task.id} onClick={() => toggleTask(task.id)}><span className="task-check">{done ? <Check size={14} /> : null}</span><span><strong>{task.label}</strong><small>{task.timing}</small></span><em>{task.owner === "shared" ? "Both" : task.owner === "lena" ? "Lena" : "Jonas"}</em></button>; })}</div>
              </div>
              <aside className="budget-panel"><h4>Budget guardrail</h4>{plan.budgetBreakdown.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.amount}</strong></div>)}<div className="budget-total"><span>Planned</span><strong>€{budget}</strong></div><small>Illustrative estimates, not merchant quotes.</small></aside>
            </div>
            <TraceStrip trace={plan.trace} />
          </div>
        ) : null}
      </section>

      <section className="invitation-section">
        <div className="invitation-preview">
          <div className="invitation-image-wrap">
            <Image src={invitationSrc} alt="Mia's sample space birthday invitation" width={1024} height={1536} unoptimized />
            <span className="image-mode-label">{invitationDataUrl ? (imageMode === "live" ? "Generated now" : "Sample artwork") : "Sample artwork"}</span>
          </div>
        </div>
        <div className="invitation-controls">
          <p className="eyebrow">GPT Image 2</p>
          <h2>The invitation is part of the plan</h2>
          <p>Party Pilot turns the approved family context into a constrained image brief. The browser receives only the generated image, never the API key.</p>
          <div className="image-boundary"><Palette size={18} /><div><strong>Exact constraints</strong><p>Mia · space · portrait · two text lines · no brands or copyrighted characters</p></div></div>
          {imageNotice ? <div className="sample-notice">{imageNotice}</div> : null}
          {imageState === "error" ? <div className="error-state compact"><strong>Image generation did not complete</strong><p>{imageError}</p><button className="button button-quiet" onClick={() => generateInvitation(true)}>Use labeled sample artwork</button></div> : null}
          <div className="invitation-actions">
            <button className="button button-primary" onClick={() => generateInvitation(false)} disabled={!plan || imageState === "loading" || invitationGenerated}>{imageState === "loading" ? <LoaderCircle className="spin" size={17} /> : invitationGenerated ? <CheckCircle2 size={17} /> : <ImageIcon size={17} />}{invitationGenerated ? "Invitation ready" : "Generate invitation"}</button>
            <button className="button button-secondary" onClick={downloadInvitation}><Download size={17} />Download</button>
          </div>
          {!plan ? <p className="input-note">Create the party plan before generating a new image.</p> : null}
          {imageTrace ? <TraceStrip trace={imageTrace} /> : null}
        </div>
      </section>

      <section className="partner-band">
        <div className="partner-icon"><Printer size={23} /></div>
        <div><span className="sponsored-label">Simulated print partner</span><h3>Print 12 recycled matte invitations</h3><p>Paper & Post · €24.90 concept price · no order is placed in this POC.</p></div>
        <button className="button button-dark" onClick={openCheckout}><PackageCheck size={17} />Preview checkout</button>
      </section>

      <section className="premium-row">
        <div><LockKeyhole size={20} /><div><p className="eyebrow">Premium preview</p><h3>Keep every family project moving</h3><p>Proactive reminders, reusable guest lists and shared projects across devices.</p></div></div>
        <button className="button button-secondary" onClick={openPremium}>Preview premium</button>
      </section>
    </div>
  );
}
