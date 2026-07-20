"use client";

import Image from "next/image";
import { ArrowRight, CalendarDays, Check, ChevronRight, Clock3, CloudRain, ListChecks, MapPin, Settings2, Sun, X } from "lucide-react";
import { useState } from "react";
import { sidekicks } from "@/lib/demo-data";
import type { BuddyMessage, BuddyWorkbenchContext, CustomBuddy, FamilyProfile, ParentId, SharedArtifact, SidekickConfig, SidekickId, SidekickView } from "@/lib/types";

const focusCopy: Record<string, string> = {
  skippy: "Check what fits the family this weekend",
  nori: "Decide tonight's allergy-safe dinner",
  lumi: "Prepare a familiar bedtime story",
  atlas: "Review today's homework together",
  pippa: "Continue the birthday guest plan",
  quinn: "Start a quick game for everyone",
  moxie: "Build a new helper for your family",
  cleo: "Review care contacts and appointments",
  pip: "Handle the school trip paperwork",
  romy: "Continue the next family trip",
};

export function CrewHome({
  activeParent,
  family,
  artifacts,
  messages,
  contexts,
  completedTaskIds,
  featuredIds,
  customBuddies,
  navigate,
  onToggleTask,
  onFeaturedIdsChange,
}: {
  activeParent: ParentId;
  family: FamilyProfile;
  artifacts: SharedArtifact[];
  messages: Partial<Record<SidekickId, BuddyMessage[]>>;
  contexts: Partial<Record<SidekickId, BuddyWorkbenchContext>>;
  completedTaskIds: string[];
  featuredIds: SidekickId[];
  customBuddies: CustomBuddy[];
  navigate: (view: SidekickView) => void;
  onToggleTask: (taskId: string) => void;
  onFeaturedIdsChange: (sidekickIds: SidekickId[]) => void;
}) {
  const parent = family.parents.find((item) => item.id === activeParent) ?? family.parents[0];
  const [firstChild, secondChild = firstChild] = family.children;
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [draftIds, setDraftIds] = useState<SidekickId[]>(featuredIds);
  const allSidekicks: SidekickConfig[] = [...sidekicks, ...customBuddies];
  const focusedSidekicks = featuredIds
    .map((id) => allSidekicks.find((sidekick) => sidekick.id === id))
    .filter((sidekick): sidekick is SidekickConfig => Boolean(sidekick));
  const school = family.institutions.find((item) => item.kind === "school");
  const daycare = family.institutions.find((item) => item.kind === "daycare");
  const latestMeal = artifacts.find((item) => item.type === "meal");
  const latestEvent = artifacts.find((item) => item.type === "event");
  const upcomingAppointment = family.appointments[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const dailyTasks: { id: string; title: string; detail: string; due: string; owner: ParentId | "shared"; buddyId: SidekickId; action: string }[] = [
    { id: "home-field-trip", title: `${firstChild.name}'s field trip consent`, detail: school?.name ?? "Primary school", due: "Due today", owner: "lena", buddyId: "pip", action: "Open Pip" },
    { id: "home-homework", title: `Has ${firstChild.name} finished the homework?`, detail: "Math practice and reading", due: "Check by 16:30", owner: "jonas", buddyId: "atlas", action: "Ask Atlas" },
    { id: "home-rain-kit", title: `Pack rain trousers for ${secondChild.name}`, detail: daycare?.name ?? "Daycare", due: "For tomorrow", owner: "shared", buddyId: "pip", action: "Open details" },
    { id: "home-guest-list", title: `Confirm ${firstChild.name}'s birthday guest list`, detail: "7 replies received, 2 still open", due: "This week", owner: "lena", buddyId: "pippa", action: "Open Pippa" },
  ];
  const orderedTasks = [...dailyTasks].sort((a, b) => {
    const priority = (owner: ParentId | "shared") => owner === activeParent ? 0 : owner === "shared" ? 1 : 2;
    return priority(a.owner) - priority(b.owner);
  });
  const openTaskCount = dailyTasks.filter((task) => !completedTaskIds.includes(task.id)).length;
  const completedToday = dailyTasks.length - openTaskCount;
  const appointmentLabel = upcomingAppointment
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${upcomingAppointment.date}T12:00:00`))
    : "Not scheduled";

  function openCustomizer() {
    setDraftIds(featuredIds);
    setCustomizerOpen(true);
  }

  function toggleFeatured(sidekickId: SidekickId) {
    setDraftIds((current) => current.includes(sidekickId)
      ? current.filter((id) => id !== sidekickId)
      : current.length < 3 ? [...current, sidekickId] : current);
  }

  return (
    <div className="crew-home daily-home">
      <header className="daily-brief">
        <div>
          <span>{greeting}, {parent.name}<em>Demo family day</em></span>
          <h1>Your family today.</h1>
          <p>{openTaskCount} things need attention. Dinner, tomorrow&apos;s weather and the next school deadline are already in view.</p>
        </div>
        <div className="daily-brief-counts">
          <span><strong>{openTaskCount}</strong> open</span>
          <span><strong>{completedToday}</strong> done</span>
          <span><strong>{artifacts.length}</strong> saved</span>
        </div>
      </header>

      <div className="daily-primary-grid">
        <section className="daily-panel daily-attention">
          <div className="daily-section-heading"><div><span>Needs attention</span><h2>Your next decisions</h2></div><ListChecks size={20} /></div>
          <div className="daily-task-list">
            {orderedTasks.map((task) => {
              const buddy = allSidekicks.find((item) => item.id === task.buddyId);
              const complete = completedTaskIds.includes(task.id);
              const owner = task.owner === "shared" ? "Shared" : family.parents.find((item) => item.id === task.owner)?.name ?? task.owner;
              return <div className={`daily-task ${complete ? "complete" : ""}`} key={task.id}>
                <button className="daily-task-check" onClick={() => onToggleTask(task.id)} aria-label={`${complete ? "Reopen" : "Complete"} ${task.title}`} aria-pressed={complete}>{complete ? <Check size={15} /> : null}</button>
                <div className="daily-task-copy"><strong>{task.title}</strong><span>{task.detail}</span><small>{task.due} - {owner}</small></div>
                {buddy ? <button className="daily-task-action" onClick={() => navigate(task.buddyId)}><span><Image src={buddy.image} alt="" fill sizes="32px" /></span>{task.action}<ChevronRight size={14} /></button> : null}
              </div>;
            })}
          </div>
        </section>

        <section className="daily-panel daily-weather">
          <div className="daily-section-heading"><div><span>Demo forecast - {family.city}</span><h2>Weather</h2></div><Sun size={22} /></div>
          <div className="weather-now"><Sun size={34} /><div><strong>24 C</strong><span>Mostly sunny</span></div><small>Today</small></div>
          <div className="weather-next"><CloudRain size={24} /><div><strong>19 C - Showers</strong><span>Rain from 08:00</span></div><small>Tomorrow</small></div>
          <p>Pack {secondChild.name}&apos;s rain trousers tonight. The afternoon should stay dry.</p>
        </section>
      </div>

      <div className="daily-middle-grid">
        <section className="daily-panel daily-timeline">
          <div className="daily-section-heading"><div><span>Demo schedule - Today</span><h2>Family timeline</h2></div><CalendarDays size={20} /></div>
          <div className="timeline-list">
            <div><time>07:45</time><span /><p><strong>{secondChild.name} - Daycare</strong><small>{daycare?.name ?? "Daycare"}</small></p></div>
            <div><time>08:00</time><span /><p><strong>{firstChild.name} - School</strong><small>{school?.name ?? "Primary school"}</small></p></div>
            <div><time>12:15</time><span /><p><strong>{firstChild.name}&apos;s lunch</strong><small>Vegetable pasta - fruit yoghurt</small></p></div>
            <div><time>12:30</time><span /><p><strong>{secondChild.name}&apos;s lunch</strong><small>Rice with vegetables - nut-free</small></p></div>
            <div><time>16:30</time><span /><p><strong>Homework check</strong><small>{family.parents.find((item) => item.id === "jonas")?.name ?? "Parent"} - Math and reading</small></p></div>
            <div><time>18:30</time><span /><p><strong>Family dinner</strong><small>{latestMeal?.title ?? "Lemony tomato orzo"}</small></p></div>
          </div>
        </section>

        <div className="daily-essentials">
          <section className="daily-panel daily-meals">
            <div className="daily-visual-copy"><div><span>{latestMeal ? "Saved dinner" : "Demo dinner"} - Tonight</span><h2>{latestMeal?.title ?? "Lemony tomato orzo"}</h2><p>25 minutes - nut-free - vegetables can be served separately.</p><button onClick={() => navigate("nori")}>Plan with Nori <ArrowRight size={14} /></button></div><div className="daily-visual"><Image src="/images/sidekick-nori.png" alt="Nori" fill sizes="150px" /></div></div>
          </section>
          <section className="daily-panel daily-nearby">
            <div className="daily-visual-copy"><div><span>{latestEvent ? "Saved event" : "Demo suggestion"} - Near you today</span><h2>{latestEvent?.title ?? "Family astronomy workshop"}</h2><p>{latestEvent?.detail ?? `16:00 - 4.2 km - Fits ${firstChild.name}'s interest in ${firstChild.interests[0] ?? "discovery"}.`}</p><button onClick={() => navigate("skippy")}><MapPin size={13} />Check with Skippy</button></div><div className="daily-visual"><Image src="/images/sidekick-skippy.png" alt="Skippy" fill sizes="150px" /></div></div>
          </section>
        </div>
      </div>

      <section className="daily-week">
        <div className="daily-section-heading"><div><span>Next seven days</span><h2>This week</h2></div><Clock3 size={20} /></div>
        <div className="week-items">
          <button onClick={() => navigate("pip")}><span>Today</span><strong>Field trip consent</strong><small>{firstChild.name} - needs signature</small><ChevronRight size={15} /></button>
          <button onClick={() => navigate("skippy")}><span>Saturday</span><strong>Family time is still open</strong><small>Skippy has a weather-fit idea</small><ChevronRight size={15} /></button>
          <button onClick={() => navigate("pippa")}><span>Next week</span><strong>Birthday guest replies</strong><small>2 parents have not replied</small><ChevronRight size={15} /></button>
          <button onClick={() => navigate("cleo")}><span>{appointmentLabel}</span><strong>{upcomingAppointment?.title ?? "Care check"}</strong><small>{firstChild.name} - upcoming</small><ChevronRight size={15} /></button>
        </div>
      </section>

      <section className="home-crew-section">
        <div className="daily-section-heading"><div><span>Personal to {parent.name}</span><h2>Continue with your crew</h2></div><button className="customize-home" onClick={openCustomizer}><Settings2 size={15} />Choose three</button></div>
        <div className="home-crew-grid">
          {focusedSidekicks.map((sidekick) => {
            const context = contexts[sidekick.id];
            const messageCount = messages[sidekick.id]?.length ?? 0;
            return <button className={`home-crew-card home-crew-${sidekick.accent}`} key={sidekick.id} onClick={() => navigate(sidekick.id)}>
              <div className="home-crew-image"><Image src={sidekick.image} alt={`${sidekick.name}, ${sidekick.role}`} fill sizes="180px" /></div>
              <div><span>{sidekick.corner}</span><h3>{sidekick.name}</h3><p>{context?.title ?? focusCopy[sidekick.id] ?? sidekick.promise}</p><small>{context ? "Continue current work" : messageCount ? `${messageCount} messages` : "Ready when you are"}</small></div>
              <ArrowRight size={18} />
            </button>;
          })}
        </div>
      </section>

      {customizerOpen ? <div className="home-customizer-backdrop" onClick={() => setCustomizerOpen(false)}>
        <section className="home-customizer" role="dialog" aria-modal="true" aria-labelledby="home-customizer-title" onClick={(event) => event.stopPropagation()}>
          <header><div><span>{parent.name}&apos;s home</span><h2 id="home-customizer-title">Choose three Sidekicks</h2><p>These shortcuts are personal. Family tasks and shared results stay the same for both parents.</p></div><button onClick={() => setCustomizerOpen(false)} aria-label="Close home customization"><X size={18} /></button></header>
          <div className="home-customizer-grid">{allSidekicks.map((sidekick) => {
            const selected = draftIds.includes(sidekick.id);
            const disabled = !selected && draftIds.length >= 3;
            return <button key={sidekick.id} className={selected ? "selected" : ""} disabled={disabled} aria-pressed={selected} onClick={() => toggleFeatured(sidekick.id)}><span><Image src={sidekick.image} alt="" fill sizes="52px" /></span><div><strong>{sidekick.name}</strong><small>{sidekick.role}</small></div>{selected ? <Check size={17} /> : null}</button>;
          })}</div>
          <footer><span>{draftIds.length} of 3 selected</span><button disabled={draftIds.length !== 3} onClick={() => { onFeaturedIdsChange(draftIds); setCustomizerOpen(false); }}>Save my home crew</button></footer>
        </section>
      </div> : null}
    </div>
  );
}
