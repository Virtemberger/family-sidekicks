"use client";

import {
  ArrowUpRight,
  BookOpenText,
  Check,
  HeartPulse,
  LockKeyhole,
  MessageCircleQuestion,
  MoonStar,
  Phone,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { StatusPill } from "@/components/ui";

type AskMode = "care" | "explain" | "story";

export function AskView({ openPremium }: { openPremium: () => void }) {
  const [mode, setMode] = useState<AskMode>("care");

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">Calm help, matched to the moment</p><h1>Ask without starting from zero</h1><p>The family context changes the format, boundaries and language of every answer.</p></div>
      </section>

      <div className="segmented-control ask-segments" role="tablist" aria-label="Choose a help preview">
        <button className={mode === "care" ? "segment-active" : ""} onClick={() => setMode("care")}><HeartPulse size={17} />First Aid Guide</button>
        <button className={mode === "explain" ? "segment-active" : ""} onClick={() => setMode("explain")}><MessageCircleQuestion size={17} />Explain it</button>
        <button className={mode === "story" ? "segment-active" : ""} onClick={() => setMode("story")}><MoonStar size={17} />Bedtime</button>
      </div>

      {mode === "care" ? (
        <section className="care-preview">
          <div className="care-intro">
            <div><div className="tool-title-line"><p className="eyebrow">First Aid Guide</p><StatusPill mode="preview" /></div><h2>“Leo has a fever and it is late.”</h2><p>A production flow would ask one question at a time, surface red flags first and prepare a concise note for professional care. It would not diagnose.</p></div>
            <div className="care-safety"><ShieldAlert size={22} /><div><strong>Safety before personalization</strong><p>This fixed preview does not use a generative medical answer.</p></div></div>
          </div>
          <div className="care-columns">
            <div className="care-steps">
              <h3>What the flow would collect</h3>
              {["Is Leo breathing normally and responding as usual?", "Exact temperature, measurement method and time", "Fluids, urination and any additional symptoms", "Relevant medication already given"].map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}
            </div>
            <aside className="care-escalation">
              <span className="sponsored-label">Official German services</span>
              <h3>Escalation is always visible</h3>
              <p><strong>112</strong> for a life-threatening emergency, including severe breathing difficulty or loss of consciousness.</p>
              <p><strong>116117</strong> for urgent medical help outside regular practice hours when it cannot wait until the next day.</p>
              <div className="care-actions"><a className="button button-danger" href="tel:112"><Phone size={16} />Call 112</a><a className="button button-secondary" href="https://www.116117.de/de/aerztlicher-bereitschaftsdienst.php" target="_blank" rel="noreferrer">Open 116117 <ArrowUpRight size={15} /></a></div>
              <small>Source: Kassenärztliche Bundesvereinigung. Germany-only preview.</small>
            </aside>
          </div>
        </section>
      ) : null}

      {mode === "explain" ? (
        <section className="explain-preview">
          <div className="explain-question"><span className="avatar avatar-mia">M</span><div><p>Mia, 7</p><h2>“Why does the moon follow our car?”</h2></div></div>
          <div className="explain-answer">
            <div className="answer-header"><span className="character-badge character-explain"><Sparkles size={20} /></span><div><p className="eyebrow">Ask-Me Buddy · age 7</p><strong>A short answer first</strong></div></div>
            <p className="answer-lead">The moon is so far away that it hardly seems to move when your car moves. Nearby trees rush past, but the moon stays in almost the same spot — so it feels like it is coming with you.</p>
            <div className="try-it"><Check size={17} /><div><strong>Try it together</strong><p>Hold one finger close to your face and look at a faraway lamp. Move sideways. Which one seems to move more?</p></div></div>
            <button className="text-button">Make it shorter for Leo <ArrowUpRight size={15} /></button>
          </div>
        </section>
      ) : null}

      {mode === "story" ? (
        <section className="story-preview">
          <div className="story-copy"><p className="eyebrow">Bedtime · Jonas&apos;s view</p><h2>The Moon Base That Lost Its Roar</h2><p>An eight-minute mystery starring Mia, a shy moon rover and Leo&apos;s tiny dinosaur — with calm pacing and no scary ending.</p><div className="story-settings"><span>8 min</span><span>Ages 4 & 7</span><span>Gentle</span><span>Space + dinosaurs</span></div><button className="button button-primary"><BookOpenText size={17} />Open story preview</button></div>
          <div className="story-art"><MoonStar size={52} /><span>Chapter 1</span><strong>A very small roar crossed a very large moon…</strong></div>
        </section>
      ) : null}

      <section className="premium-row">
        <div><LockKeyhole size={20} /><div><p className="eyebrow">Premium preview</p><h3>Private parent space</h3><p>Reflect, sort a hard moment and choose one next step. Never shared with a partner by default.</p></div></div>
        <button className="button button-secondary" onClick={openPremium}>Preview premium</button>
      </section>
    </div>
  );
}
