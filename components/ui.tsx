"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import type { ResultMode, TraceInfo } from "@/lib/types";

export function StatusPill({ mode, children }: { mode?: ResultMode | "preview" | "real"; children?: ReactNode }) {
  const label = children ?? (mode === "live" ? "Live AI" : mode === "sample" ? "Sample result" : mode === "real" ? "Real action" : "Concept preview");
  return <span className={`status-pill status-${mode ?? "preview"}`}>{label}</span>;
}

export function TraceStrip({ trace }: { trace: TraceInfo }) {
  return (
    <div className="trace-strip" aria-label="AI execution trace">
      <span>{trace.model}</span>
      <span>{trace.tools.join(" + ")}</span>
      <span>{trace.durationMs ? `${(trace.durationMs / 1000).toFixed(1)}s` : "fixture"}</span>
      <span>{trace.promptVersion}</span>
    </div>
  );
}

export interface ModalContent {
  eyebrow: string;
  title: string;
  body: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function Modal({ content, onClose }: { content: ModalContent | null; onClose: () => void }) {
  if (!content) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog" title="Close">
          <X size={18} />
        </button>
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="modal-title">{content.title}</h2>
        <div className="modal-body">{content.body}</div>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onClose}>Close</button>
          {content.actionLabel ? (
            <button className="button button-primary" onClick={() => { content.onAction?.(); onClose(); }}>
              {content.actionLabel}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}
