"use client";

import { AlertTriangle, CalendarClock, ChevronRight, Clock3, HeartPulse, Lightbulb, MapPin, MessageCircle, Phone, RefreshCw, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { LocalBriefPanel } from "@/components/local-brief";
import type { FamilyProfile, ParentId } from "@/lib/types";

export function CareCorner({ family, activeParent, onContextChange }: { family: FamilyProfile; activeParent: ParentId; onContextChange: (context: string) => void }) {
  const [tipIndex, setTipIndex] = useState(0);
  const tips = useMemo(() => family.children.flatMap((child) => [
    { child: child.name, title: "Growing bodies are not miniature adult bodies", fact: `At age ${child.age}, bones are still developing at growth plates. Temporary aches can occur, but recurring, one-sided, swollen or activity-limiting pain should be discussed with a clinician.`, action: "For mild discomfort after an active day, calm rest, gentle stretching and a warm pack may help. Do not use Cleo for medication dosing." },
    { child: child.name, title: "A short symptom timeline helps the doctor", fact: "Start time, temperature, fluids, sleep, behavior and what changed are often more useful than a long unstructured description.", action: "Cleo can turn your notes into a concise doctor handover in the chat." },
  ]), [family.children]);
  const tip = tips[tipIndex % Math.max(tips.length, 1)];
  const doctors = family.careContacts.filter((item) => item.kind !== "pharmacy");
  const pharmacies = family.careContacts.filter((item) => item.kind === "pharmacy");

  return <div className="corner-workbench care-workbench">
    <div className="workbench-heading"><div><span className="corner-kicker">Cleo&apos;s care desk</span><h2>Contacts, upcoming care and a calm first step</h2><p>The dashboard uses saved Family Memory. The chat stays the place for questions, symptom organization and next-step guidance.</p></div></div>
    <div className="capability-boundary urgent"><AlertTriangle size={20} /><div><strong>Not a diagnosis or emergency service</strong><p>Trouble breathing, seizures, unusual difficulty waking or immediate danger require local emergency care now.</p></div></div>

    <div className="care-overview-grid">
      <section className="care-contacts"><div className="care-section-title"><Stethoscope size={18} /><div><span>Saved care team</span><strong>{doctors.length} family contacts</strong></div></div>{doctors.map((contact) => <article key={contact.id}><div><span>{contact.kind}</span><h3>{contact.name}</h3><p>{contact.specialty}</p></div><a href={`tel:${contact.phone}`}><Phone size={15} />Call</a><small><MapPin size={13} />{contact.address}</small><small><Clock3 size={13} />{contact.openingHours}</small></article>)}{doctors.length === 0 ? <p className="care-empty">Add doctors in Family Memory to keep them one tap away.</p> : null}</section>
      <section className="care-timeline"><div className="care-section-title"><CalendarClock size={18} /><div><span>Next care moments</span><strong>Checks and vaccinations</strong></div></div>{family.appointments.map((appointment) => { const child = family.children.find((item) => item.id === appointment.childId); const contact = family.careContacts.find((item) => item.id === appointment.contactId); return <article key={appointment.id}><time>{appointment.date}<small>{appointment.time}</small></time><div><span>{child?.name || "Family"}</span><h3>{appointment.title}</h3><p>{contact?.name || "Contact not linked"}</p></div><ChevronRight size={16} /></article>; })}{family.appointments.length === 0 ? <p className="care-empty">No upcoming care appointments saved.</p> : null}</section>
    </div>

    {tip ? <section className="care-insight"><Lightbulb size={23} /><div><span>Did you know? · personalized for {tip.child}</span><h3>{tip.title}</h3><p>{tip.fact}</p><strong>{tip.action}</strong></div><button onClick={() => setTipIndex((current) => current + 1)} aria-label="Show another care insight"><RefreshCw size={16} /></button></section> : null}

    <section className="saved-pharmacies"><div className="care-section-title"><HeartPulse size={18} /><div><span>Saved pharmacies</span><strong>From Family Memory</strong></div></div>{pharmacies.map((pharmacy) => <article key={pharmacy.id}><div><h3>{pharmacy.name}</h3><p>{pharmacy.address}</p><small>{pharmacy.openingHours}</small></div><a href={`tel:${pharmacy.phone}`}><Phone size={15} />Call</a></article>)}{!pharmacies.length ? <p>No pharmacy saved yet.</p> : null}</section>
    <LocalBriefPanel kind="care" family={family} activeParent={activeParent} onContextChange={onContextChange} />
    <div className="capability-live"><MessageCircle size={26} /><div><span>Live Cleo conversation</span><strong>Use the chat panel for the situation in front of you</strong><p>Cleo can structure symptoms and prepare a doctor note while keeping its safety boundary visible.</p></div></div>
  </div>;
}
