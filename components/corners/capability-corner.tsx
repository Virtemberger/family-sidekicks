"use client";

import { AlertTriangle, Brain, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import type { CustomBuddy, FamilyProfile, SidekickConfig } from "@/lib/types";

export function CapabilityCorner({ sidekick, family }: { sidekick: SidekickConfig; family: FamilyProfile }) {
  const custom = sidekick.id.startsWith("custom-") ? sidekick as CustomBuddy : null;
  const isCare = sidekick.id === "cleo";
  const isAdmin = sidekick.id === "pip";
  return <div className="corner-workbench capability-workbench">
    <div className="workbench-heading"><div><span className="corner-kicker">{sidekick.name}&apos;s workbench</span><h2>{custom ? "A family-built capability, ready to talk" : isCare ? "Calm structure before the next care decision" : "Turn family admin into the next concrete step"}</h2><p>{sidekick.promise}</p></div></div>
    <div className="capability-live"><MessageCircle size={26} /><div><span>Live conversation</span><strong>Use the panel on the right to start</strong><p>{sidekick.name} receives the relevant {family.name} context and must show which memory facts influenced the answer.</p></div></div>
    {custom ? <div className="capability-columns"><section><Brain size={19} /><span>Allowed memory</span>{custom.memoryScopes.map((scope) => <p key={scope}><CheckCircle2 size={13} />{scope}</p>)}</section><section><ShieldCheck size={19} /><span>Guardrails</span>{custom.guardrails.map((guardrail) => <p key={guardrail}>{guardrail}</p>)}</section></div> : null}
    {isCare ? <div className="capability-boundary urgent"><AlertTriangle size={20} /><div><strong>Not a diagnosis or emergency service</strong><p>Trouble breathing, seizures, unusual difficulty waking or immediate danger require local emergency care now.</p></div></div> : null}
    {isAdmin ? <div className="capability-boundary"><ShieldCheck size={20} /><div><strong>Official verification stays visible</strong><p>Deadlines, eligibility and legal requirements must be checked with the responsible authority before acting.</p></div></div> : null}
  </div>;
}
