"use client";

import Image from "next/image";
import { CalendarCheck, Check, CheckCircle2, Clock, Download, Gift, ImageIcon, LoaderCircle, Mail, MapPin, MessageCircle, PackageCheck, Plus, RefreshCw, Send, Sparkles, Trash2, UserRoundPlus, Users } from "lucide-react";
import { useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import type { BirthdayResult, FamilyProfile, ParentId, TraceInfo } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";
interface InvitationResponse { mode: "live" | "sample"; notice?: string; imageUrl: string; trace: TraceInfo }
interface FriendDetails { id: string; childName: string; parentName: string; phone: string; email: string }

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Party planning failed");
  return data as T;
}

function partyCalendarFile(title: string, date: string, time: string, location: string, description: string) {
  const start = new Date(`${date}T${time}:00`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const format = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Family Sidekicks//Pippa//EN", "BEGIN:VEVENT", `UID:pippa-${date}-${time}@family-sidekicks.demo`, `DTSTAMP:${format(new Date())}`, `DTSTART:${format(start)}`, `DTEND:${format(end)}`, `SUMMARY:${escape(title)}`, `LOCATION:${escape(location)}`, `DESCRIPTION:${escape(description)}`, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
}

export function PartyCorner({
  family,
  activeParent,
  completedTaskIds,
  invitationDataUrl,
  invitationGenerated,
  onPlan,
  onInvitation,
  onToggleTask,
  onContextChange,
  showToast,
}: {
  family: FamilyProfile;
  activeParent: ParentId;
  completedTaskIds: string[];
  invitationDataUrl?: string;
  invitationGenerated: boolean;
  onPlan: (plan: BirthdayResult) => void;
  onInvitation: (imageUrl: string) => void;
  onToggleTask: (taskId: string) => void;
  onContextChange: (context: string) => void;
  showToast: (message: string) => void;
}) {
  const [childName, setChildName] = useState(family.children[0].name);
  const [theme, setTheme] = useState("Astronaut space academy");
  const [friends, setFriends] = useState<FriendDetails[]>([
    { id: "friend-emma", childName: "Emma", parentName: "Sarah", phone: "+49 170 555 0211", email: "sarah@example.com" },
    { id: "friend-noah", childName: "Noah", parentName: "Daniel", phone: "+49 170 555 0212", email: "daniel@example.com" },
  ]);
  const [budget, setBudget] = useState(150);
  const [partyDate, setPartyDate] = useState("2026-08-22");
  const [partyTime, setPartyTime] = useState("15:00");
  const [partyLocation, setPartyLocation] = useState("Weber family home, Stuttgart");
  const hostParent = family.parents.find((parent) => parent.id === activeParent) ?? family.parents[0];
  const [hostName, setHostName] = useState(hostParent.name);
  const [hostEmail, setHostEmail] = useState(hostParent.email);
  const [hostPhone, setHostPhone] = useState(hostParent.phone);
  const [planState, setPlanState] = useState<RequestState>("idle");
  const [plan, setPlan] = useState<BirthdayResult | null>(null);
  const [planError, setPlanError] = useState("");
  const [imageState, setImageState] = useState<RequestState>(invitationGenerated ? "done" : "idle");
  const [imageMode, setImageMode] = useState<"live" | "sample">("sample");
  const [imageTrace, setImageTrace] = useState<TraceInfo | null>(null);
  const [imageError, setImageError] = useState("");

  function updateFriend(id: string, patch: Partial<FriendDetails>) {
    setFriends((current) => current.map((friend) => friend.id === id ? { ...friend, ...patch } : friend));
  }

  function addFriend() {
    setFriends((current) => [...current, { id: `friend-${Date.now()}`, childName: "", parentName: "", phone: "", email: "" }]);
  }

  async function buildPlan(useSample = false) {
    setPlanState("loading"); setPlanError("");
    try {
      const namedFriends = friends.filter((friend) => friend.childName.trim());
      const result = await postJson<BirthdayResult>("/api/birthday", { activeParent, family, childName, theme, guestCount: Math.max(2, namedFriends.length), guestNames: namedFriends.map((friend) => friend.childName.trim()), guestContacts: namedFriends.map(({ childName: guestChild, parentName, phone, email }) => ({ childName: guestChild.trim(), parentName: parentName.trim(), phone: phone.trim(), email: email.trim() })), budgetEuro: budget, partyDate, partyTime, partyLocation, hostName, hostEmail, hostPhone, useSample });
      setPlan(result); setPlanState("done"); onPlan(result); onContextChange(`${result.title}. ${result.concept}. Celebration: ${partyDate} at ${partyTime}, ${partyLocation}. Birthday child: ${childName}. Theme: ${theme}. Invited children: ${namedFriends.map((friend) => `${friend.childName.trim()}${friend.parentName.trim() ? ` (parent: ${friend.parentName.trim()})` : ""}`).join(", ") || "not named"}. Guest experience: ${result.guestExperience.join("; ")}. Budget EUR ${budget}: ${result.budgetBreakdown.map((item) => `${item.label} ${item.amount}`).join("; ")}. Tasks: ${result.tasks.map((task) => `${task.label} (${task.timing}, ${task.owner})`).join("; ")}. Invitation copy: ${result.invitationMessage}. Host: ${hostName}; phone and email are available in the party desk.`);
    } catch (requestError) { setPlanError(requestError instanceof Error ? requestError.message : "Party planning failed"); setPlanState("error"); }
  }

  async function generateInvitation(useSample = false) {
    if (!plan) return;
    setImageState("loading"); setImageError("");
    try {
      const result = await postJson<InvitationResponse>("/api/invitation", { imageBrief: plan.imageBrief, useSample });
      onInvitation(result.imageUrl); setImageMode(result.mode); setImageTrace(result.trace); setImageState("done");
    } catch (requestError) { setImageError(requestError instanceof Error ? requestError.message : "Invitation generation failed"); setImageState("error"); }
  }

  function downloadInvitation() {
    const link = document.createElement("a"); link.href = invitationDataUrl || "/images/mia-space-party-sample.png"; link.download = `${childName.toLowerCase()}-party-invitation.png`; link.click();
  }

  function downloadCalendarBlocker() {
    if (!plan) return;
    const blob = new Blob([partyCalendarFile(`${childName}'s birthday`, partyDate, partyTime, partyLocation, plan.invitationMessage)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `${childName.toLowerCase()}-birthday.ics`; link.click(); URL.revokeObjectURL(url);
    showToast("Calendar blocker downloaded - no calendar account was connected");
  }

  function openWhatsAppDraft(friend?: FriendDetails) {
    if (!plan) return;
    const phone = friend?.phone.replace(/[^0-9]/g, "") ?? "";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(plan.invitationMessage)}`, "_blank", "noopener,noreferrer");
    showToast("WhatsApp handoff opened - nothing was sent automatically");
  }

  function openEmailDraft(friend?: FriendDetails) {
    if (!plan) return;
    window.location.href = `mailto:${friend?.email ?? ""}?subject=${encodeURIComponent(`${childName}'s birthday invitation`)}&body=${encodeURIComponent(plan.invitationMessage)}`;
    showToast("Email draft opened - recipient selection remains with the parent");
  }

  return <div className="corner-workbench party-workbench">
    <div className="workbench-heading"><div><span className="corner-kicker">Pippa&apos;s production desk</span><h2>One theme becomes one manageable project</h2><p>Concept, guest journey, family task split, allergy boundary and invitation all stay connected.</p></div><StatusPill mode="live" /></div>
    <div className="corner-controls party-controls">
      <label><span>Birthday child</span><select value={childName} onChange={(event) => setChildName(event.target.value)}>{family.children.map((child) => <option key={child.id}>{child.name}</option>)}</select></label>
      <label><span>Theme</span><input value={theme} onChange={(event) => setTheme(event.target.value)} /></label>
      <div className="party-guest-count"><span>Invited children</span><strong>{friends.filter((friend) => friend.childName.trim()).length}</strong></div>
      <label><span>Budget EUR</span><input type="number" min={30} max={2000} value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></label>
      <label><span>Date</span><input type="date" value={partyDate} onChange={(event) => setPartyDate(event.target.value)} /></label>
      <label><span>Start time</span><input type="time" value={partyTime} onChange={(event) => setPartyTime(event.target.value)} /></label>
      <label className="party-wide-input"><span>Place</span><input value={partyLocation} maxLength={180} onChange={(event) => setPartyLocation(event.target.value)} /></label>
      <fieldset className="party-contact-fields"><legend>Reply contact from Family Memory</legend><label><span>Name</span><input value={hostName} onChange={(event) => setHostName(event.target.value)} /></label><label><span>Mobile / WhatsApp</span><input type="tel" value={hostPhone} onChange={(event) => setHostPhone(event.target.value)} /></label><label><span>Email</span><input type="email" value={hostEmail} onChange={(event) => setHostEmail(event.target.value)} /></label></fieldset>
      <section className="pippa-friend-editor"><div className="pippa-friend-heading"><div><UserRoundPlus size={19} /><div><span>Guest families</span><strong>Add friend details once, invite them directly later</strong></div></div><button type="button" onClick={addFriend}><Plus size={15} />Add friend details</button></div><div className="pippa-friend-list">{friends.map((friend, index) => <article key={friend.id}><div className="pippa-friend-number">{index + 1}</div><label><span>Child&apos;s name</span><input value={friend.childName} placeholder="Friend" onChange={(event) => updateFriend(friend.id, { childName: event.target.value })} /></label><label><span>Parent&apos;s name</span><input value={friend.parentName} placeholder="Parent" onChange={(event) => updateFriend(friend.id, { parentName: event.target.value })} /></label><label><span>WhatsApp / phone</span><input type="tel" value={friend.phone} placeholder="+49 ..." onChange={(event) => updateFriend(friend.id, { phone: event.target.value })} /></label><label><span>Email</span><input type="email" value={friend.email} placeholder="parent@example.com" onChange={(event) => updateFriend(friend.id, { email: event.target.value })} /></label><button type="button" onClick={() => setFriends((current) => current.filter((item) => item.id !== friend.id))} aria-label={`Remove friend ${index + 1}`}><Trash2 size={15} /></button></article>)}</div></section>
      <button className="corner-button primary" onClick={() => void buildPlan(false)} disabled={planState === "loading"}>{planState === "loading" ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}Create party project</button>
    </div>
    {planState === "idle" ? <div className="corner-empty"><Gift size={28} /><strong>Pippa starts with the child, not a generic party template</strong><p>The plan will automatically account for interests, ages, allergies, family roles and budget.</p></div> : null}
    {planState === "error" ? <div className="corner-error"><strong>Live party planning did not complete</strong><p>{planError}</p><div><button onClick={() => void buildPlan(false)}><RefreshCw size={15} />Retry</button><button onClick={() => void buildPlan(true)}>Load labeled sample</button></div></div> : null}
    {planState === "done" && plan ? <div className="corner-result party-result">
      <div className="party-result-heading"><div><StatusPill mode={plan.mode} /><h3>{plan.title}</h3><p>{plan.concept}</p></div><CalendarCheck size={28} /></div>
      {plan.notice ? <div className="sample-notice">{plan.notice}</div> : null}
      <div className="party-facts"><span><CalendarCheck size={15} />{partyDate}</span><span><Clock size={15} />{partyTime}</span><span><MapPin size={15} />{partyLocation}</span><span><Users size={15} />{friends.filter((friend) => friend.childName.trim()).length} named guests</span></div>
      <div className="party-grid"><section><span>Guest journey</span>{plan.guestExperience.map((item, index) => <div className="party-journey" key={item}><strong>{index + 1}</strong><p>{item}</p></div>)}</section><section className="party-budget"><span>Budget guardrail</span>{plan.budgetBreakdown.map((item) => <div key={item.label}><p>{item.label}</p><strong>{item.amount}</strong></div>)}<small>Illustrative estimates, not merchant quotes.</small></section></div>
      <div className="party-tasks"><span>Shared production list</span>{plan.tasks.map((task) => { const done = completedTaskIds.includes(task.id); return <button key={task.id} className={done ? "done" : ""} onClick={() => onToggleTask(task.id)}><em>{done ? <Check size={13} /> : null}</em><span><strong>{task.label}</strong><small>{task.timing}</small></span><b>{task.owner === "shared" ? "Both" : family.parents.find((parent) => parent.id === task.owner)?.name}</b></button>; })}</div>
      <TraceStrip trace={plan.trace} />
      <div className="pippa-share-center"><div><span>Connector handoff</span><h3>Ready-to-send invitation</h3><p>{plan.invitationMessage}</p><small>WhatsApp and email open a draft. Pippa never sends on the family&apos;s behalf.</small><div className="pippa-recipient-list">{friends.filter((friend) => friend.childName.trim()).map((friend) => <article key={`invite-${friend.id}`}><div><strong>{friend.childName}</strong><span>{friend.parentName || "Parent contact"}</span></div><button disabled={!friend.phone} onClick={() => openWhatsAppDraft(friend)}><MessageCircle size={14} />WhatsApp</button><button disabled={!friend.email} onClick={() => openEmailDraft(friend)}><Mail size={14} />Email</button></article>)}</div></div><div className="pippa-share-actions"><button onClick={() => openWhatsAppDraft()}><MessageCircle size={16} />Generic WhatsApp</button><button onClick={() => openEmailDraft()}><Mail size={16} />Generic email</button><button onClick={downloadCalendarBlocker}><CalendarCheck size={16} />Calendar blocker</button><button onClick={() => { void navigator.clipboard.writeText(plan.invitationMessage); showToast("Invitation text copied"); }}><Send size={16} />Copy text</button></div></div>
      <div className="pippa-invitation"><div className="pippa-invitation-image"><Image src={invitationDataUrl || "/images/mia-space-party-sample.png"} alt="Birthday invitation preview" fill unoptimized sizes="280px" /><span>{invitationDataUrl ? imageMode === "live" ? "Generated now" : "Sample" : "Sample preview"}</span></div><div><span>GPT Image 2</span><h3>Turn the approved plan into an invitation</h3><p>One image generation per browser session protects the POC budget. Nothing is ordered or paid.</p>{imageState === "error" ? <div className="corner-error compact"><strong>Image generation did not complete</strong><p>{imageError}</p><button onClick={() => void generateInvitation(true)}>Use labeled sample</button></div> : null}<div className="pippa-image-actions"><button className="corner-button primary" onClick={() => void generateInvitation(false)} disabled={!plan || imageState === "loading" || invitationGenerated}>{imageState === "loading" ? <LoaderCircle className="spin" size={16} /> : invitationGenerated ? <CheckCircle2 size={16} /> : <ImageIcon size={16} />}{invitationGenerated ? "Invitation ready" : "Generate invitation"}</button><button className="corner-button secondary" onClick={downloadInvitation}><Download size={16} />Download</button></div>{imageTrace ? <TraceStrip trace={imageTrace} /> : null}</div></div>
      <div className="corner-commercial"><span>Simulated partner</span><strong>Print recycled matte invitations after approval.</strong><p>No checkout or payment occurs in this POC.</p><button onClick={() => showToast("Demo checkout only - no order or payment was created")}><PackageCheck size={14} />Preview checkout</button></div>
    </div> : null}
  </div>;
}
