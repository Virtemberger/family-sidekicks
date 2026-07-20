"use client";

import { Brain, Building2, CalendarClock, Check, Download, MapPin, Pencil, Plus, Save, ShieldCheck, Sparkles, Stethoscope, Trash2, Upload, X } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { familyProfileSchema } from "@/lib/schemas";
import type { CareContact, ChildProfile, FamilyAppointment, FamilyInstitution, FamilyProfile, ParentId, ParentProfile } from "@/lib/types";

function cloneFamily(family: FamilyProfile) {
  return JSON.parse(JSON.stringify(family)) as FamilyProfile;
}

function listFromInput(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 10);
}

export function FamilyMemory({
  family,
  activeParent,
  onSave,
  showToast,
}: {
  family: FamilyProfile;
  activeParent: ParentId;
  onSave: (family: FamilyProfile) => void;
  showToast: (message: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FamilyProfile>(() => cloneFamily(family));
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function updateFamily(patch: Partial<FamilyProfile>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function updateChild(index: number, patch: Partial<ChildProfile>) {
    setDraft((current) => ({
      ...current,
      children: current.children.map((child, childIndex) => (childIndex === index ? { ...child, ...patch } : child)),
    }));
  }

  function updateParent(index: number, patch: Partial<ParentProfile>) {
    setDraft((current) => ({
      ...current,
      parents: current.parents.map((parent, parentIndex) => (parentIndex === index ? { ...parent, ...patch } : parent)),
    }));
  }

  function addChild() {
    if (draft.children.length >= 6) return;
    setDraft((current) => ({
      ...current,
      children: [
        ...current.children,
        { id: `child-${Date.now()}`, name: "", age: 5, interests: [], allergies: [], dislikes: [], gender: "unspecified" },
      ],
    }));
  }

  function updateCareContact(index: number, patch: Partial<CareContact>) {
    setDraft((current) => ({ ...current, careContacts: current.careContacts.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  }

  function addCareContact() {
    setDraft((current) => ({ ...current, careContacts: [...current.careContacts, { id: `care-${Date.now()}`, kind: "pediatrician", name: "", specialty: "", phone: "", address: "", openingHours: "" }] }));
  }

  function updateInstitution(index: number, patch: Partial<FamilyInstitution>) {
    setDraft((current) => ({ ...current, institutions: current.institutions.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  }

  function addInstitution() {
    setDraft((current) => ({ ...current, institutions: [...current.institutions, { id: `institution-${Date.now()}`, kind: "other", name: "", address: "", phone: "", email: "", openingHours: "", website: "" }] }));
  }

  function updateAppointment(index: number, patch: Partial<FamilyAppointment>) {
    setDraft((current) => ({ ...current, appointments: current.appointments.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  }

  function addAppointment() {
    setDraft((current) => ({ ...current, appointments: [...current.appointments, { id: `appointment-${Date.now()}`, childId: current.children[0]?.id ?? "", title: "", date: "", time: "", contactId: "" }] }));
  }

  function removeChild(index: number) {
    if (draft.children.length === 1) {
      setError("Family Memory needs at least one child for this demo.");
      return;
    }
    setDraft((current) => ({ ...current, children: current.children.filter((_, childIndex) => childIndex !== index) }));
  }

  function saveProfile() {
    const normalized = {
      ...draft,
      id: draft.id || `family-${Date.now()}`,
      name: draft.name.trim(),
      city: draft.city.trim(),
      country: draft.country.trim().toUpperCase(),
      children: draft.children.map((child) => ({ ...child, name: child.name.trim() })),
      parents: draft.parents.map((parent) => ({ ...parent, name: parent.name.trim() })),
    };
    const parsed = familyProfileSchema.safeParse(normalized);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Please check the family details.");
      return;
    }
    setError("");
    onSave(parsed.data);
    setEditing(false);
  }

  function exportProfile() {
    const blob = new Blob([JSON.stringify(family, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${family.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "family"}-memory.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Family Memory exported");
  }

  async function importProfile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = familyProfileSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) throw new Error("This file is not a valid Family Memory export.");
      setDraft(cloneFamily(parsed.data));
      onSave(parsed.data);
      setEditing(false);
      setError("");
      showToast("Family Memory imported");
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Family Memory import failed.");
    }
  }

  const allergyCount = family.children.reduce((count, child) => count + child.allergies.length, 0);

  return (
    <div className="secondary-view family-memory-view">
      <header className="memory-header">
        <div>
          <span className="corner-kicker">One source of truth</span>
          <h1>{editing ? "Configure your family memory" : `What every Sidekick knows about ${family.name}`}</h1>
          <p>Saved only in this browser for the POC. Every Sidekick receives the same profile and shows which facts it used.</p>
        </div>
        <div className="memory-header-actions">
          {editing ? (
            <>
              <button className="corner-button secondary" onClick={() => { setDraft(cloneFamily(family)); setEditing(false); setError(""); }}><X size={16} />Cancel</button>
              <button className="corner-button primary" onClick={saveProfile}><Save size={16} />Save memory</button>
            </>
          ) : (
            <>
              <button className="memory-icon-button" onClick={exportProfile} title="Export Family Memory" aria-label="Export Family Memory"><Download size={17} /></button>
              <button className="memory-icon-button" onClick={() => fileInput.current?.click()} title="Import Family Memory" aria-label="Import Family Memory"><Upload size={17} /></button>
              <button className="corner-button primary" onClick={() => setEditing(true)}><Pencil size={16} />Edit family</button>
            </>
          )}
          <input ref={fileInput} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importProfile(event)} />
        </div>
      </header>

      <div className="memory-proof-bar">
        <span><Brain size={16} /><strong>{family.children.length}</strong> child profiles</span>
        <span><ShieldCheck size={16} /><strong>{allergyCount}</strong> hard safety facts</span>
        <span><MapPin size={16} /><strong>{family.city}</strong> within {family.radiusKm} km</span>
        <span><Check size={16} />Persists after reload</span>
      </div>

      {error ? <div className="memory-form-error" role="alert">{error}</div> : null}

      {editing ? (
        <div className="memory-editor">
          <section className="memory-editor-section">
            <div className="memory-editor-heading"><div><span>Household</span><h2>Shared basics</h2></div><p>Location shapes Scout results. Budget guides trade-offs.</p></div>
            <div className="memory-form-grid memory-form-grid-household">
              <label><span>Family name</span><input value={draft.name} maxLength={80} onChange={(event) => updateFamily({ name: event.target.value })} /></label>
              <label><span>City</span><input value={draft.city} maxLength={80} onChange={(event) => updateFamily({ city: event.target.value })} /></label>
              <label><span>Country code</span><input value={draft.country} maxLength={2} onChange={(event) => updateFamily({ country: event.target.value })} /></label>
              <label><span>Search radius</span><div className="memory-range"><input type="range" min="1" max="100" value={draft.radiusKm} onChange={(event) => updateFamily({ radiusKm: Number(event.target.value) })} /><strong>{draft.radiusKm} km</strong></div></label>
              <label><span>Budget style</span><select value={draft.budget} onChange={(event) => updateFamily({ budget: event.target.value as FamilyProfile["budget"] })}><option value="low">Value first</option><option value="medium">Balanced</option><option value="high">Convenience first</option></select></label>
            </div>
          </section>

          <section className="memory-editor-section">
            <div className="memory-editor-heading"><div><span>Parents</span><h2>Two personal views</h2></div><p>Names and answer style change; the family facts stay shared.</p></div>
            <div className="memory-parent-editors">
              {draft.parents.map((parent, index) => (
                <article key={parent.id}>
                  <div className={`memory-avatar memory-avatar-${parent.id}`}>{parent.name[0] || index + 1}</div>
                  <label><span>Parent name</span><input value={parent.name} maxLength={40} onChange={(event) => updateParent(index, { name: event.target.value })} /></label>
                  <label><span>Answer style</span><select value={parent.responseStyle} onChange={(event) => updateParent(index, { responseStyle: event.target.value as ParentProfile["responseStyle"] })}><option value="supportive">Supportive + detailed</option><option value="direct">Direct + concise</option></select></label>
                  <label><span>Email for family invitations</span><input type="email" value={parent.email} maxLength={120} onChange={(event) => updateParent(index, { email: event.target.value })} /></label>
                  <label><span>Mobile / WhatsApp</span><input type="tel" value={parent.phone} maxLength={60} onChange={(event) => updateParent(index, { phone: event.target.value })} /></label>
                  <label><span>Usually owns</span><input value={parent.ownedDomains.join(", ")} maxLength={240} onChange={(event) => updateParent(index, { ownedDomains: listFromInput(event.target.value) })} /></label>
                </article>
              ))}
            </div>
          </section>

          <section className="memory-editor-section">
            <div className="memory-editor-heading"><div><span>Children</span><h2>The facts Sidekicks personalize with</h2></div><button className="corner-button secondary" onClick={addChild} disabled={draft.children.length >= 6}><Plus size={16} />Add child</button></div>
            <div className="memory-child-editors">
              {draft.children.map((child, index) => (
                <article key={child.id}>
                  <div className="memory-child-editor-head"><div className="memory-avatar">{child.name[0] || index + 1}</div><strong>Child {index + 1}</strong><button onClick={() => removeChild(index)} title="Remove child" aria-label={`Remove child ${index + 1}`}><Trash2 size={16} /></button></div>
                  <div className="memory-form-grid">
                    <label><span>Name</span><input value={child.name} maxLength={40} onChange={(event) => updateChild(index, { name: event.target.value })} /></label>
                    <label><span>Age</span><input type="number" min="0" max="17" value={child.age} onChange={(event) => updateChild(index, { age: Number(event.target.value) })} /></label>
                    <label><span>Gender (optional)</span><select value={child.gender} onChange={(event) => updateChild(index, { gender: event.target.value as ChildProfile["gender"] })}><option value="unspecified">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="nonbinary">Non-binary</option></select></label>
                    <label className="memory-wide-field"><span>Interests, comma-separated</span><input value={child.interests.join(", ")} maxLength={240} onChange={(event) => updateChild(index, { interests: listFromInput(event.target.value) })} /></label>
                    <label><span>Allergies</span><input value={child.allergies.join(", ")} maxLength={240} placeholder="None recorded" onChange={(event) => updateChild(index, { allergies: listFromInput(event.target.value) })} /></label>
                    <label><span>Dislikes</span><input value={child.dislikes.join(", ")} maxLength={240} placeholder="None recorded" onChange={(event) => updateChild(index, { dislikes: listFromInput(event.target.value) })} /></label>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="memory-editor-section">
            <div className="memory-editor-heading"><div><span>Care directory</span><h2>Doctors, dentists and pharmacies</h2></div><button className="corner-button secondary" onClick={addCareContact}><Plus size={16} />Add contact</button></div>
            <div className="memory-directory-editors">
              {draft.careContacts.map((contact, index) => <article key={contact.id}>
                <div className="memory-directory-head"><Stethoscope size={18} /><strong>{contact.name || `Care contact ${index + 1}`}</strong><button onClick={() => setDraft((current) => ({ ...current, careContacts: current.careContacts.filter((_, itemIndex) => itemIndex !== index) }))} aria-label={`Remove care contact ${index + 1}`}><Trash2 size={15} /></button></div>
                <div className="memory-form-grid">
                  <label><span>Type</span><select value={contact.kind} onChange={(event) => updateCareContact(index, { kind: event.target.value as CareContact["kind"] })}><option value="pediatrician">Pediatrician</option><option value="dentist">Dentist</option><option value="specialist">Specialist</option><option value="pharmacy">Pharmacy</option></select></label>
                  <label><span>Name</span><input value={contact.name} onChange={(event) => updateCareContact(index, { name: event.target.value })} /></label>
                  <label><span>Specialty / note</span><input value={contact.specialty} onChange={(event) => updateCareContact(index, { specialty: event.target.value })} /></label>
                  <label><span>Phone</span><input type="tel" value={contact.phone} onChange={(event) => updateCareContact(index, { phone: event.target.value })} /></label>
                  <label className="memory-wide-field"><span>Address</span><input value={contact.address} onChange={(event) => updateCareContact(index, { address: event.target.value })} /></label>
                  <label className="memory-wide-field"><span>Opening hours</span><input value={contact.openingHours} onChange={(event) => updateCareContact(index, { openingHours: event.target.value })} /></label>
                </div>
              </article>)}
            </div>
          </section>

          <section className="memory-editor-section">
            <div className="memory-editor-heading"><div><span>Family network</span><h2>School, daycare and public services</h2></div><button className="corner-button secondary" onClick={addInstitution}><Plus size={16} />Add place</button></div>
            <div className="memory-directory-editors">
              {draft.institutions.map((institution, index) => <article key={institution.id}>
                <div className="memory-directory-head"><Building2 size={18} /><strong>{institution.name || `Place ${index + 1}`}</strong><button onClick={() => setDraft((current) => ({ ...current, institutions: current.institutions.filter((_, itemIndex) => itemIndex !== index) }))} aria-label={`Remove institution ${index + 1}`}><Trash2 size={15} /></button></div>
                <div className="memory-form-grid">
                  <label><span>Type</span><select value={institution.kind} onChange={(event) => updateInstitution(index, { kind: event.target.value as FamilyInstitution["kind"] })}><option value="city-hall">City service</option><option value="school">School</option><option value="daycare">Daycare</option><option value="other">Other</option></select></label>
                  <label><span>Name</span><input value={institution.name} onChange={(event) => updateInstitution(index, { name: event.target.value })} /></label>
                  <label><span>Phone</span><input type="tel" value={institution.phone} onChange={(event) => updateInstitution(index, { phone: event.target.value })} /></label>
                  <label><span>Email</span><input type="email" value={institution.email} onChange={(event) => updateInstitution(index, { email: event.target.value })} /></label>
                  <label className="memory-wide-field"><span>Address</span><input value={institution.address} onChange={(event) => updateInstitution(index, { address: event.target.value })} /></label>
                  <label className="memory-wide-field"><span>Opening hours</span><input value={institution.openingHours} onChange={(event) => updateInstitution(index, { openingHours: event.target.value })} /></label>
                </div>
              </article>)}
            </div>
          </section>

          <section className="memory-editor-section">
            <div className="memory-editor-heading"><div><span>Care timeline</span><h2>Upcoming checks and vaccinations</h2></div><button className="corner-button secondary" onClick={addAppointment}><Plus size={16} />Add appointment</button></div>
            <div className="memory-appointment-editors">
              {draft.appointments.map((appointment, index) => <article key={appointment.id}>
                <CalendarClock size={17} />
                <select value={appointment.childId} onChange={(event) => updateAppointment(index, { childId: event.target.value })}>{draft.children.map((child) => <option value={child.id} key={child.id}>{child.name || "Child"}</option>)}</select>
                <input aria-label="Appointment title" placeholder="Appointment" value={appointment.title} onChange={(event) => updateAppointment(index, { title: event.target.value })} />
                <input aria-label="Appointment date" type="date" value={appointment.date} onChange={(event) => updateAppointment(index, { date: event.target.value })} />
                <input aria-label="Appointment time" type="time" value={appointment.time} onChange={(event) => updateAppointment(index, { time: event.target.value })} />
                <select aria-label="Care contact" value={appointment.contactId} onChange={(event) => updateAppointment(index, { contactId: event.target.value })}><option value="">No linked contact</option>{draft.careContacts.map((contact) => <option value={contact.id} key={contact.id}>{contact.name}</option>)}</select>
                <button onClick={() => setDraft((current) => ({ ...current, appointments: current.appointments.filter((_, itemIndex) => itemIndex !== index) }))} aria-label={`Remove appointment ${index + 1}`}><Trash2 size={15} /></button>
              </article>)}
            </div>
          </section>

          <div className="memory-save-band"><ShieldCheck size={20} /><div><strong>Local POC storage</strong><p>Saving replaces the current demo profile and clears generated results so old facts cannot leak into a new family.</p></div><button className="corner-button primary" onClick={saveProfile}><Save size={16} />Save and apply</button></div>
        </div>
      ) : (
        <>
          <div className="memory-ledger">
            <section><span>Family location</span><MapPin size={20} /><h2>{family.city}</h2><p>{family.radiusKm} km radius - coordinates are never stored</p><div><em>{family.budget} budget</em><em>{family.country}</em></div></section>
            {family.children.map((child, index) => <section key={child.id}><span>Child profile</span><div className={`memory-avatar memory-avatar-child-${index}`}>{child.name[0]}</div><h2>{child.name}, {child.age}</h2><p>{child.interests.join(" + ") || "Interests not set"}</p><div>{child.allergies.length ? child.allergies.map((item) => <em key={item}>Allergy: {item}</em>) : <em>No recorded allergies</em>}{child.dislikes.map((item) => <em key={item}>Dislikes: {item}</em>)}</div></section>)}
          </div>
          <div className="parent-memory-grid">{family.parents.map((parent) => <section className={activeParent === parent.id ? "active" : ""} key={parent.id}><span>{activeParent === parent.id ? "Active view" : "Parent profile"}</span><h2>{parent.name}</h2><p>{parent.responseStyle === "supportive" ? "Warm context and clear next steps" : "Short recommendation first"}</p><div>{parent.ownedDomains.map((domain) => <em key={domain}>{domain}</em>)}</div></section>)}</div>
          <div className="memory-directory-summary">
            <section><Stethoscope size={20} /><div><span>Care network</span><strong>{family.careContacts.length} saved contacts</strong><p>{family.careContacts.slice(0, 3).map((item) => item.name).join(" · ") || "No doctors or pharmacies saved yet"}</p></div></section>
            <section><CalendarClock size={20} /><div><span>Care timeline</span><strong>{family.appointments.length} upcoming appointments</strong><p>{family.appointments[0]?.title || "No checks or vaccinations scheduled"}</p></div></section>
            <section><Building2 size={20} /><div><span>Family network</span><strong>{family.institutions.length} saved places</strong><p>{family.institutions.slice(0, 3).map((item) => item.name).join(" · ") || "No schools, daycare or services saved yet"}</p></div></section>
          </div>
          <div className="memory-boundary"><Sparkles size={19} /><div><strong>Portable now, cloud-ready later</strong><p>Export and import make the browser profile tangible for the demo. A production build would replace this adapter with encrypted account storage and per-field consent.</p></div></div>
        </>
      )}
    </div>
  );
}
