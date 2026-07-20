"use client";

import { Check, CircleDashed, FlaskConical, X } from "lucide-react";

const rows = [
  ["Live in this POC", "Shared daily task status, personal Home shortcuts per parent, persistent Workbench Memory connecting every Corner to its chat, current events, meals, stories, learning, parties, games, care/admin dashboards, guided vacations and custom Buddy creation"],
  ["Real browser actions", "Screenshot and document upload, geolocation, print, .ics export, WhatsApp/email handoff, local persistence and image download"],
  ["Clearly simulated", "Home forecast, school schedule, lunch defaults and unsaved local suggestion; premium continuity, CHECK24/Airbnb/hotel MCP handoffs, sponsored placement, OAuth, payments and affiliate tracking"],
  ["Bounded preview", "Cleo and Pip combine live conversation with local directories and optional sourced web briefs; health diagnosis, automatic sending, cloud files and cross-device sync remain out of scope"],
];

export function JudgeDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={`judge-drawer ${open ? "judge-drawer-open" : ""}`} aria-hidden={!open}>
      <div className="judge-header">
        <div>
          <p className="eyebrow">OpenAI Build Week 2026</p>
          <h2>Prototype / Judge View</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close judge view" title="Close">
          <X size={18} />
        </button>
      </div>
      <p className="judge-intro">
        This is an interactive product concept, not a production service. The labels below keep the technical boundary explicit.
      </p>
      <div className="judge-rows">
        {rows.map(([label, body], index) => (
          <div className="judge-row" key={label}>
            <div className={`judge-row-icon judge-icon-${index}`}>
              {index === 0 ? <Check size={17} /> : index === 1 ? <FlaskConical size={17} /> : <CircleDashed size={17} />}
            </div>
            <div>
              <strong>{label}</strong>
              <p>{body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="judge-stack">
        <p className="eyebrow">Implementation</p>
        <div className="stack-grid">
          <span>Next.js</span><span>TypeScript</span><span>Responses API</span><span>Structured outputs</span><span>GPT-5.6 Terra</span><span>Codex</span>
        </div>
      </div>
      <div className="judge-note">
        <strong>No hidden fallback</strong>
        <p>When a live call is unavailable, the interface says &quot;Sample result&quot; and identifies the fixture in the execution trace.</p>
      </div>
    </aside>
  );
}
