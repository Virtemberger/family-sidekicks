"use client";

import Image from "next/image";
import { ArrowRight, Brain, CakeSlice, FileText, GraduationCap, HeartPulse, LockKeyhole, Luggage, Users } from "lucide-react";
import { featuredSidekicks, secondarySidekicks } from "@/lib/demo-data";
import type { BuddyMessage, CustomBuddy, FamilyProfile, ParentId, SharedArtifact, SidekickId, SidekickView } from "@/lib/types";

function pulseFor(sidekickId: SidekickId, family: FamilyProfile) {
  const [firstChild, secondChild = firstChild] = family.children;
  const allergies = family.children.flatMap((child) => child.allergies);
  const copy: Record<string, { label: string; title: string; detail: string }> = {
    skippy: { label: `${family.city} weekend`, title: "Three ways to get the family out", detail: `${firstChild.name} gets ${firstChild.interests[0] || "a discovery mission"}; ${secondChild.name} gets ${secondChild.interests[0] || "a hands-on role"}.` },
    nori: { label: "25 minutes", title: "Dinner can be one decision", detail: `${allergies.length ? `${allergies.join(" + ")} excluded` : "No recorded allergies"}; preferences stay visible.` },
    lumi: { label: "Tonight", title: "A familiar story world is ready", detail: `${firstChild.name} brings ${firstChild.interests[0] || "curiosity"}. ${secondChild.name} brings ${secondChild.interests[0] || "a surprise"}.` },
  };
  return copy[sidekickId];
}

export function CrewHome({
  activeParent,
  family,
  artifacts,
  messages,
  customBuddies,
  navigate,
}: {
  activeParent: ParentId;
  family: FamilyProfile;
  artifacts: SharedArtifact[];
  messages: Partial<Record<SidekickId, BuddyMessage[]>>;
  customBuddies: CustomBuddy[];
  navigate: (view: SidekickView) => void;
}) {
  const parent = family.parents.find((item) => item.id === activeParent) ?? family.parents[0];
  return (
    <div className="crew-home">
      <section className="crew-home-intro">
        <div><span className="corner-kicker">Good evening, {parent.name}</span><h1>Your family has a crew now.</h1><p>Each Sidekick owns one corner of family life. They work differently, but all start with the same {family.name} memory.</p></div>
        <button onClick={() => navigate("family")}><Brain size={18} />Open family memory</button>
      </section>

      <section className="crew-pulse">
        <div className="crew-section-heading"><div><span>Working now</span><h2>Three Sidekicks, three useful outcomes</h2></div><p>Not three blank chats.</p></div>
        <div className="crew-rows">
          {featuredSidekicks.map((sidekick) => {
            const pulse = pulseFor(sidekick.id, family);
            const messageCount = messages[sidekick.id]?.length ?? 0;
            return (
              <button className={`crew-row crew-row-${sidekick.accent}`} key={sidekick.id} onClick={() => navigate(sidekick.id)}>
                <div className="crew-row-portrait"><Image src={sidekick.image} alt={`${sidekick.name}, ${sidekick.role}`} fill sizes="190px" /></div>
                <div className="crew-row-name"><span>{sidekick.corner}</span><strong>{sidekick.name}</strong><em>{sidekick.role}</em></div>
                <div className="crew-row-task"><span>{pulse.label}</span><h3>{pulse.title}</h3><p>{pulse.detail}</p></div>
                <div className="crew-row-status">{messageCount ? <span>{messageCount} messages</span> : <span>Ready to talk</span>}<ArrowRight size={20} /></div>
              </button>
            );
          })}
        </div>
      </section>

      {customBuddies.length ? <section className="custom-crew-band"><div><Brain size={20} /><span>Built by this family</span><strong>{customBuddies.length} custom Buddy{customBuddies.length === 1 ? "" : "s"}</strong></div><div>{customBuddies.map((buddy) => <button key={buddy.id} onClick={() => navigate(buddy.id)}><span>{buddy.name[0]}</span><strong>{buddy.name}</strong><em>{buddy.role}</em><ArrowRight size={15} /></button>)}</div></section> : null}

      <section className="shared-output-band">
        <div><Users size={20} /><span>Shared family output</span><strong>{artifacts.length ? `${artifacts.length} result${artifacts.length === 1 ? "" : "s"} saved across the crew` : "Nothing saved yet"}</strong></div>
        <div className="shared-output-list">
          {artifacts.length ? artifacts.slice(0, 3).map((artifact) => <span key={artifact.id}><em>{artifact.type}</em>{artifact.title}</span>) : <p>Events, dinners and stories become shared family artifacts, not trapped chat messages.</p>}
        </div>
      </section>

      <section className="crew-coming">
        <div className="crew-section-heading"><div><span>More corners</span><h2>The crew grows around proven family needs</h2></div><button onClick={() => navigate("more")}>See the roadmap <ArrowRight size={16} /></button></div>
        <div className="coming-strip"><span><HeartPulse size={18} />Cleo - Care</span><span><GraduationCap size={18} />Atlas - School</span><span><FileText size={18} />Pip - Admin</span><span><CakeSlice size={18} />Pippa - Parties</span><span><Luggage size={18} />Romy - Vacation</span></div>
      </section>
    </div>
  );
}

export function MoreCorners({ navigate, customBuddies }: { navigate: (view: SidekickView) => void; customBuddies: CustomBuddy[] }) {
  return (
    <div className="secondary-view">
      <header><span className="corner-kicker">The extended crew</span><h1>More family jobs, still one shared memory</h1><p>Learning, parties, play, care, administration, vacations and custom capabilities each get a purpose-built workbench plus an open conversation.</p></header>
      <div className="preview-corners active-corners">{secondarySidekicks.map((sidekick) => <article className={sidekick.id === "atlas" || sidekick.id === "pippa" || sidekick.id === "romy" ? "priority" : ""} key={sidekick.id}><div className="preview-portrait"><Image src={sidekick.image} alt="" fill sizes="160px" /></div><span>Live workbench + conversation</span><h2>{sidekick.name}</h2><strong>{sidekick.corner}</strong><p>{sidekick.promise}</p><button onClick={() => navigate(sidekick.id)}>Open corner <ArrowRight size={14} /></button></article>)}</div>
      {customBuddies.length ? <section className="my-buddies"><div className="crew-section-heading"><div><span>Built by your family</span><h2>My Buddies</h2></div></div><div>{customBuddies.map((buddy) => <button key={buddy.id} onClick={() => navigate(buddy.id)}><span>{buddy.name[0]}</span><div><strong>{buddy.name}</strong><p>{buddy.promise}</p></div><ArrowRight size={17} /></button>)}</div></section> : null}
      <div className="premium-concept"><LockKeyhole size={21} /><div><span>Premium principle</span><strong>Monetize continuity, not anxiety.</strong><p>Cross-device memory, proactive weekly planning and deeper projects can be premium. Safety, core family context and transparency stay outside the paywall.</p></div></div>
    </div>
  );
}
