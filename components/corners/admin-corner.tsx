"use client";

import { Building2, ExternalLink, FileText, FolderOpen, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Trash2, Upload } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import { LocalBriefPanel } from "@/components/local-brief";
import type { FamilyDocument, FamilyProfile, ParentId } from "@/lib/types";

function sizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function categoryFor(name: string): FamilyDocument["category"] {
  const lower = name.toLowerCase();
  if (lower.includes("school")) return "school";
  if (lower.includes("kita") || lower.includes("daycare")) return "daycare";
  if (lower.includes("doctor") || lower.includes("health") || lower.includes("vacc")) return "health";
  if (lower.includes("benefit") || lower.includes("kindergeld")) return "benefits";
  if (lower.includes("passport") || lower.includes("birth")) return "identity";
  return "other";
}

export function AdminCorner({ family, activeParent, onFamilyChange, onContextChange, showToast }: { family: FamilyProfile; activeParent: ParentId; onFamilyChange: (family: FamilyProfile) => void; onContextChange: (context: string) => void; showToast: (message: string) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);

  function uploadDocuments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    const documents: FamilyDocument[] = files.slice(0, 8).map((file, index) => ({ id: `document-${Date.now()}-${index}`, name: file.name, category: categoryFor(file.name), sizeLabel: sizeLabel(file.size), uploadedAt: new Date().toISOString() }));
    onFamilyChange({ ...family, documents: [...documents, ...family.documents].slice(0, 60) });
    showToast(`${documents.length} document${documents.length === 1 ? "" : "s"} added to the local demo vault`);
  }

  function removeDocument(id: string) {
    onFamilyChange({ ...family, documents: family.documents.filter((document) => document.id !== id) });
    showToast("Document metadata removed from this browser");
  }

  return <div className="corner-workbench admin-workbench">
    <div className="workbench-heading"><div><span className="corner-kicker">Pip&apos;s family office</span><h2>Places, documents and public updates in one view</h2><p>Pip connects the family&apos;s own institutions with sourced public information and a conversational checklist builder.</p></div></div>

    <div className="admin-places-grid">{family.institutions.map((institution) => <article key={institution.id}><div className={`admin-place-icon admin-place-${institution.kind}`}><Building2 size={19} /></div><span>{institution.kind.replace("-", " ")}</span><h3>{institution.name}</h3><p><MapPin size={13} />{institution.address}</p><small>{institution.openingHours}</small><div>{institution.phone ? <a href={`tel:${institution.phone}`}><Phone size={14} />Call</a> : null}{institution.email ? <a href={`mailto:${institution.email}`}><Mail size={14} />Email</a> : null}{institution.website ? <a href={institution.website} target="_blank" rel="noreferrer">Official site<ExternalLink size={12} /></a> : null}</div></article>)}{family.institutions.length === 0 ? <div className="admin-empty-place"><Building2 size={24} /><strong>No places saved yet</strong><p>Add school, daycare and city services in Family Memory.</p></div> : null}</div>

    <section className="document-vault">
      <div className="document-vault-heading"><div><FolderOpen size={21} /><div><span>Local document vault</span><h3>{family.documents.length} saved document records</h3><p>The POC stores names and metadata in this browser, not file contents. Production storage would be encrypted and permission-scoped.</p></div></div><button className="corner-button primary" onClick={() => fileInput.current?.click()}><Upload size={16} />Add documents</button><input ref={fileInput} className="visually-hidden" type="file" multiple accept="application/pdf,image/png,image/jpeg,.doc,.docx" onChange={uploadDocuments} /></div>
      <div className="document-list">{family.documents.map((document) => <article key={document.id}><FileText size={18} /><div><strong>{document.name}</strong><span>{document.category} · {document.sizeLabel}</span></div><time>{new Date(document.uploadedAt).toLocaleDateString("en-GB")}</time><button onClick={() => removeDocument(document.id)} aria-label={`Remove ${document.name}`}><Trash2 size={15} /></button></article>)}{!family.documents.length ? <p>No document metadata stored yet.</p> : null}</div>
    </section>

    <LocalBriefPanel kind="admin" family={family} activeParent={activeParent} onContextChange={onContextChange} />
    <div className="capability-boundary"><ShieldCheck size={20} /><div><strong>Official verification stays visible</strong><p>Deadlines, eligibility and legal requirements must be checked with the responsible authority before acting.</p></div></div>
    <div className="capability-live"><MessageCircle size={26} /><div><span>Live Pip conversation</span><strong>Drop a form or describe the outcome you need</strong><p>Pip can turn the process into a checklist and draft the message while the family&apos;s saved institutions remain visible.</p></div></div>
  </div>;
}
