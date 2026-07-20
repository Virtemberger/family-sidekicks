"use client";

import {
  CalendarDays,
  Check,
  ChevronRight,
  CreditCard,
  HeartHandshake,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Trash2,
  Users,
  Utensils,
} from "lucide-react";
import { familyProfile, parentById } from "@/lib/demo-data";
import type { ParentId } from "@/lib/types";

const integrations = [
  { name: "Google Calendar", detail: "Create confirmed family events", icon: CalendarDays },
  { name: "Gmail", detail: "Preview a message before sending", icon: Mail },
  { name: "Family circle", detail: "Share one plan, never the full profile", icon: Users },
  { name: "Payments", detail: "Partner checkout with explicit consent", icon: CreditCard },
];

export function FamilyView({ activeParent, openIntegration }: { activeParent: ParentId; openIntegration: (name: string) => void }) {
  const parent = parentById(activeParent);
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">Shared facts, individual experiences</p><h1>The Weber family context</h1><p>Everyone sees the same family. Each parent controls their own priorities, tone and private space.</p></div>
        <span className="context-owner"><span className={`avatar avatar-${activeParent}`}>{parent.name[0]}</span>Viewing as {parent.name}</span>
      </section>

      <section className="family-profile-grid">
        <div className="family-summary-panel">
          <div className="family-title"><div className="brand-mark"><HeartHandshake size={21} /></div><div><p className="eyebrow">Shared household</p><h2>{familyProfile.name}</h2></div></div>
          <div className="profile-facts"><div><MapPin size={17} /><span><strong>Stuttgart</strong><small>25 km travel radius</small></span></div><div><Utensils size={17} /><span><strong>Nut-free household</strong><small>Leo: peanuts and tree nuts</small></span></div><div><ShieldCheck size={17} /><span><strong>Synthetic demo data</strong><small>Browser-only, no account</small></span></div></div>
          <button className="button button-secondary">Review shared facts</button>
        </div>
        <div className="children-panel">
          <p className="eyebrow">Children</p>
          {familyProfile.children.map((child) => <div className="child-row" key={child.id}><span className={`avatar avatar-${child.id}`}>{child.name[0]}</span><div><strong>{child.name} · {child.age}</strong><p>{child.interests.join(" · ")}</p></div><span className="child-constraint">{child.allergies.length ? "Nut allergy" : child.dislikes.length ? "No mushrooms" : "No constraints"}</span></div>)}
        </div>
      </section>

      <section>
        <div className="section-heading"><div><p className="eyebrow">Two parents, two surfaces</p><h2>Responsibilities and response style</h2></div><span className="section-note">Editable per person</span></div>
        <div className="parent-cards">
          {familyProfile.parents.map((profile) => <article className={`parent-card ${activeParent === profile.id ? "parent-card-active" : ""}`} key={profile.id}><div className="parent-card-head"><span className={`avatar avatar-${profile.id}`}>{profile.name[0]}</span><div><h3>{profile.name}</h3><p>{profile.responseStyle === "supportive" ? "Warm context + clear next steps" : "Recommendation first + concise detail"}</p></div>{activeParent === profile.id ? <span className="active-label"><Check size={13} />Active view</span> : null}</div><div className="responsibility-list">{profile.ownedDomains.map((domain) => <span key={domain}>{domain}</span>)}</div><button className="text-button">Edit personal view <ChevronRight size={15} /></button></article>)}
        </div>
      </section>

      <section>
        <div className="section-heading"><div><p className="eyebrow">Comfort features</p><h2>Connections with visible boundaries</h2></div><span className="section-note">All connectors are simulated</span></div>
        <div className="integration-grid">
          {integrations.map((integration) => { const Icon = integration.icon; return <button key={integration.name} onClick={() => openIntegration(integration.name)}><span className="integration-icon"><Icon size={19} /></span><span><strong>{integration.name}</strong><small>{integration.detail}</small></span><em>Demo</em><ChevronRight size={16} /></button>; })}
        </div>
      </section>

      <section className="privacy-grid">
        <div className="privacy-panel"><LockKeyhole size={21} /><div><p className="eyebrow">Private by default</p><h3>Personal support stays personal</h3><p>Reflections, surprise ideas and private notes never enter the shared family plan without a deliberate action.</p></div></div>
        <div className="privacy-panel"><ShieldCheck size={21} /><div><p className="eyebrow">Memory control</p><h3>Every remembered fact is inspectable</h3><p>A production version would show why a fact was stored, where it is used and how to delete it.</p></div></div>
        <button className="delete-demo"><Trash2 size={18} /><span><strong>Delete demo family</strong><small>Use “Reset demo family” to remove browser state.</small></span></button>
      </section>
    </div>
  );
}
