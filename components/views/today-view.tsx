"use client";

import Image from "next/image";
import { ArrowRight, CalendarPlus, ChefHat, Gift, MoonStar, Sparkles, Users } from "lucide-react";
import { getDashboardCopy, parentById } from "@/lib/demo-data";
import type { AppView, ParentId, SharedArtifact } from "@/lib/types";

export function TodayView({
  activeParent,
  artifacts,
  navigate,
  openPremium,
}: {
  activeParent: ParentId;
  artifacts: SharedArtifact[];
  navigate: (view: AppView) => void;
  openPremium: () => void;
}) {
  const copy = getDashboardCopy(activeParent);
  const parent = parentById(activeParent);

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Wednesday · Weber family</p>
          <h1>{copy.greeting}</h1>
          <p>{copy.summary}</p>
        </div>
        <button className="button button-secondary" onClick={() => navigate("family")}><Users size={17} />Family context</button>
      </section>

      <section className="family-band">
        <div className="family-band-copy">
          <p className="eyebrow">One shared context</p>
          <h2>Less coordinating. More family time.</h2>
          <p>
            {activeParent === "lena"
              ? "Mia's birthday needs one decision. Jonas has dinner. The weekend is still open."
              : "Dinner is yours. Lena is moving the birthday forward. Pick one weekend plan and you're done."}
          </p>
          <div className="family-facts"><span>Mia · 7</span><span>Leo · 4</span><span>Nut-free</span><span>25 km</span></div>
        </div>
        <div className="family-band-image">
          <Image src="/images/weber-family.png" alt="The fictional Weber family planning their week together" fill priority sizes="(max-width: 800px) 100vw, 45vw" />
        </div>
      </section>

      <section>
        <div className="section-heading"><div><p className="eyebrow">Your focus</p><h2>Useful now</h2></div><span className="section-note">Personalized for {parent.name}</span></div>
        <div className="focus-grid">
          {activeParent === "lena" ? (
            <>
              <button className="focus-card focus-coral" onClick={() => navigate("create")}><span className="focus-icon"><Gift size={19} /></span><span className="focus-meta">6 weeks left</span><strong>Mia&apos;s space party</strong><p>Approve the concept and invitation.</p><ArrowRight size={18} /></button>
              <button className="focus-card focus-green" onClick={() => navigate("plan")}><span className="focus-icon"><CalendarPlus size={19} /></span><span className="focus-meta">Weekend open</span><strong>Choose one good plan</strong><p>Three ideas matched to both kids.</p><ArrowRight size={18} /></button>
              <button className="focus-card focus-yellow" onClick={openPremium}><span className="focus-icon"><Sparkles size={19} /></span><span className="focus-meta">Premium preview</span><strong>Build next week</strong><p>Meals, pickups and one bright spot.</p><ArrowRight size={18} /></button>
            </>
          ) : (
            <>
              <button className="focus-card focus-blue" onClick={() => navigate("plan")}><span className="focus-icon"><ChefHat size={19} /></span><span className="focus-meta">25 minutes</span><strong>Make dinner easy</strong><p>Nut-free, one pan, three shopping gaps.</p><ArrowRight size={18} /></button>
              <button className="focus-card focus-green" onClick={() => navigate("plan")}><span className="focus-icon"><CalendarPlus size={19} /></span><span className="focus-meta">Weekend open</span><strong>Pick Saturday</strong><p>One recommendation, not twenty tabs.</p><ArrowRight size={18} /></button>
              <button className="focus-card focus-navy" onClick={() => navigate("ask")}><span className="focus-icon"><MoonStar size={19} /></span><span className="focus-meta">8 minute story</span><strong>Bedtime with Mia</strong><p>A moon-base mystery is ready to shape.</p><ArrowRight size={18} /></button>
            </>
          )}
        </div>
      </section>

      <section className="two-column-section">
        <div>
          <div className="section-heading"><div><p className="eyebrow">Shared plan</p><h2>What the family knows</h2></div></div>
          <div className="timeline-panel">
            {artifacts.length ? artifacts.slice(0, 5).map((artifact) => (
              <div className="timeline-row" key={artifact.id}>
                <span className={`timeline-marker marker-${artifact.type}`} />
                <div><strong>{artifact.title}</strong><p>{artifact.detail}</p></div>
                <span className="timeline-owner">{artifact.owner === "shared" ? "Both" : parentById(artifact.owner).name}</span>
              </div>
            )) : (
              <div className="timeline-empty"><CalendarPlus size={22} /><div><strong>Your shared plan starts here</strong><p>Save an event, assign dinner or create Mia&apos;s party.</p></div><button className="text-button" onClick={() => navigate("plan")}>Plan the weekend <ArrowRight size={15} /></button></div>
            )}
          </div>
        </div>

        <aside className="sponsored-card">
          <span className="sponsored-label">Sponsored demo placement</span>
          <div className="sponsor-visual"><span>12</span><small>recycled<br />cards</small></div>
          <h3>Turn Mia&apos;s invitation into something she can hand out</h3>
          <p>Paper & Post · Stuttgart · matched to the active birthday project.</p>
          <button className="button button-dark" onClick={() => navigate("create")}>See print preview</button>
          <small>Simulated partner. No ranking influence or affiliate tracking is active.</small>
        </aside>
      </section>

      <section className="context-note">
        <Sparkles size={18} />
        <div><strong>Why these priorities?</strong><p>{copy.focus.join(" · ")} — based on responsibilities and current family projects, not gender.</p></div>
      </section>
    </div>
  );
}
