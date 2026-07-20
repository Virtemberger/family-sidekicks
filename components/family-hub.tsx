"use client";

import Image from "next/image";
import { BookOpenText, Brain, CalendarDays, ChefHat, Compass, FlaskConical, Grid2X2, Home, MapPin, RotateCcw, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BuddyChat } from "@/components/buddy-chat";
import { AdventureCorner } from "@/components/corners/adventure-corner";
import { AdminCorner } from "@/components/corners/admin-corner";
import { BuddyBuilderCorner } from "@/components/corners/buddy-builder-corner";
import { CareCorner } from "@/components/corners/care-corner";
import { CapabilityCorner } from "@/components/corners/capability-corner";
import { MoreCorners } from "@/components/corners/crew-home";
import { CrewHome } from "@/components/corners/daily-home";
import { KitchenCorner } from "@/components/corners/kitchen-corner";
import { LearningCorner } from "@/components/corners/learning-corner";
import { PartyCorner } from "@/components/corners/party-corner";
import { QuizCorner } from "@/components/corners/quiz-corner";
import { StoryCorner } from "@/components/corners/story-corner";
import { VacationCorner } from "@/components/corners/vacation-corner";
import { FamilyMemory } from "@/components/family-memory";
import { JudgeDrawer } from "@/components/judge-drawer";
import { initialHubState, sidekickById, sidekicks } from "@/lib/demo-data";
import { familyProfileSchema } from "@/lib/schemas";
import type { BirthdayResult, BuddyMessage, BuddyWorkbenchContext, BuiltInSidekickId, CustomBuddy, EventSuggestion, FamilyProfile, HubState, LearningResult, MealResult, ParentId, QuizResult, SharedArtifact, SidekickId, SidekickView, StoryResult, VacationResult } from "@/lib/types";

const STORAGE_KEY = "family-sidekicks-state-v5";
const LEGACY_STORAGE_KEYS = ["family-sidekicks-state-v4", "family-sidekicks-state-v3", "family-sidekicks-state-v2"];

const mobileNavItems: { id: SidekickView; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Crew home", icon: Home },
  { id: "skippy", label: "Skippy", icon: Compass },
  { id: "nori", label: "Nori", icon: ChefHat },
  { id: "lumi", label: "Lumi", icon: BookOpenText },
  { id: "more", label: "More corners", icon: Grid2X2 },
];

const builtInSidekickIds = new Set<BuiltInSidekickId>(["skippy", "nori", "lumi", "atlas", "pippa", "quinn", "moxie", "cleo", "pip", "romy"]);

function isBuiltInSidekickView(view: SidekickView): view is BuiltInSidekickId {
  return builtInSidekickIds.has(view as BuiltInSidekickId);
}

function migrateLegacyDemoFamily(family: FamilyProfile) {
  if (family.id !== initialHubState.family.id) return family;
  return {
    ...family,
    children: family.children.map((child) => {
      const demoChild = initialHubState.family.children.find((item) => item.id === child.id);
      return { ...child, gender: child.gender === "unspecified" && demoChild ? demoChild.gender : child.gender };
    }),
    parents: family.parents.map((parent) => {
      const demoParent = initialHubState.family.parents.find((item) => item.id === parent.id);
      return { ...parent, email: parent.email || demoParent?.email || "", phone: parent.phone || demoParent?.phone || "" };
    }),
    careContacts: family.careContacts.length ? family.careContacts : initialHubState.family.careContacts,
    appointments: family.appointments.length ? family.appointments : initialHubState.family.appointments,
    institutions: family.institutions.length ? family.institutions : initialHubState.family.institutions,
    documents: family.documents.length ? family.documents : initialHubState.family.documents,
  };
}

export function FamilyHub() {
  const [view, setView] = useState<SidekickView>("home");
  const [hubState, setHubState] = useState<HubState>(initialHubState);
  const [judgeOpen, setJudgeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const currentStored = window.localStorage.getItem(STORAGE_KEY);
        const stored = currentStored ?? LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<HubState>;
          const storedFamily = familyProfileSchema.safeParse(parsed.family);
          setHubState({
            ...initialHubState,
            ...parsed,
            family: storedFamily.success ? currentStored ? storedFamily.data : migrateLegacyDemoFamily(storedFamily.data) : initialHubState.family,
            buddyMessages: parsed.buddyMessages ?? {},
            buddyContexts: parsed.buddyContexts ?? {},
            homeSidekickIds: parsed.homeSidekickIds ?? initialHubState.homeSidekickIds,
            customBuddies: parsed.customBuddies ?? [],
          });
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        hydratedRef.current = true;
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydratedRef.current) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hubState));
  }, [hubState]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function switchParent(parentId: ParentId) {
    setHubState((current) => ({ ...current, activeParent: parentId }));
    const parent = hubState.family.parents.find((item) => item.id === parentId);
    setToast(`Switched to ${parent?.name ?? "parent"}'s view`);
  }

  function saveEvent(event: EventSuggestion) {
    setHubState((current) => {
      if (current.savedEventIds.includes(event.id)) return current;
      const artifact: SharedArtifact = {
        id: `event-${event.id}`,
        type: "event",
        title: event.title,
        detail: `${event.dateLabel} - ${event.time} - ${event.venue}`,
        owner: "shared",
        createdBy: current.activeParent,
        createdAt: new Date().toISOString(),
      };
      return { ...current, savedEventIds: [...current.savedEventIds, event.id], sharedArtifacts: [artifact, ...current.sharedArtifacts] };
    });
    setToast("Skippy saved this to the shared family output");
  }

  function saveMeal(meal: MealResult) {
    const mealOwner = hubState.family.parents.find((parent) => parent.id === "jonas") ?? hubState.family.parents[1];
    setHubState((current) => {
      const artifact: SharedArtifact = {
        id: `meal-${Date.now()}`,
        type: "meal",
        title: meal.title,
        detail: `${meal.totalMinutes} minutes - assigned to ${mealOwner.name}`,
        owner: "jonas",
        createdBy: current.activeParent,
        createdAt: new Date().toISOString(),
      };
      return { ...current, sharedArtifacts: [artifact, ...current.sharedArtifacts] };
    });
    setToast(`Nori assigned dinner to ${mealOwner.name}`);
  }

  function saveStory(story: StoryResult) {
    setHubState((current) => {
      const artifact: SharedArtifact = {
        id: `story-${Date.now()}`,
        type: "story",
        title: story.title,
        detail: `${story.readTimeMinutes} minute story - ready for bedtime`,
        owner: "shared",
        createdBy: current.activeParent,
        createdAt: new Date().toISOString(),
      };
      return { ...current, latestStory: story, sharedArtifacts: [artifact, ...current.sharedArtifacts.filter((item) => item.type !== "story")] };
    });
    setToast("Lumi saved tonight's story");
  }

  function saveLearning(result: LearningResult) {
    setHubState((current) => {
      const artifact: SharedArtifact = {
        id: `learning-${Date.now()}`,
        type: "learning",
        title: result.detectedTask,
        detail: `${result.practiceTasks.length} matching practice tasks created`,
        owner: "shared",
        createdBy: current.activeParent,
        createdAt: new Date().toISOString(),
      };
      return { ...current, sharedArtifacts: [artifact, ...current.sharedArtifacts.filter((item) => item.type !== "learning")] };
    });
    setToast("Atlas saved the practice set to the shared output");
  }

  function saveQuiz(quiz: QuizResult) {
    setHubState((current) => {
      const artifact: SharedArtifact = {
        id: `quiz-${Date.now()}`,
        type: "quiz",
        title: quiz.title,
        detail: `${quiz.questions.length} questions ready for family play`,
        owner: "shared",
        createdBy: current.activeParent,
        createdAt: new Date().toISOString(),
      };
      return { ...current, sharedArtifacts: [artifact, ...current.sharedArtifacts.filter((item) => item.type !== "quiz")] };
    });
    setToast("Quinn saved the quiz to the shared output");
  }

  function saveVacation(plan: VacationResult) {
    setHubState((current) => {
      const artifact: SharedArtifact = { id: `vacation-${Date.now()}`, type: "vacation", title: plan.title, detail: `${plan.days.length} family-paced days planned`, owner: "shared", createdBy: current.activeParent, createdAt: new Date().toISOString() };
      return { ...current, sharedArtifacts: [artifact, ...current.sharedArtifacts.filter((item) => item.type !== "vacation")] };
    });
    setToast("Romy saved the vacation outline to the shared output");
  }

  function saveBirthday(plan: BirthdayResult) {
    setHubState((current) => {
      const artifact: SharedArtifact = {
        id: `birthday-${Date.now()}`,
        type: "birthday",
        title: plan.title,
        detail: `${plan.tasks.length} production tasks in the shared project`,
        owner: "shared",
        createdBy: current.activeParent,
        createdAt: new Date().toISOString(),
      };
      return { ...current, sharedArtifacts: [artifact, ...current.sharedArtifacts.filter((item) => item.type !== "birthday")] };
    });
    setToast("Pippa saved the birthday project");
  }

  function setInvitation(imageUrl: string) {
    setHubState((current) => ({ ...current, invitationDataUrl: imageUrl, invitationGenerated: true }));
    setToast("Pippa added the invitation to the project");
  }

  function toggleTask(taskId: string) {
    setHubState((current) => ({ ...current, completedTaskIds: current.completedTaskIds.includes(taskId) ? current.completedTaskIds.filter((id) => id !== taskId) : [...current.completedTaskIds, taskId] }));
  }

  function createCustomBuddy(buddy: CustomBuddy) {
    setHubState((current) => {
      const artifact: SharedArtifact = {
        id: `buddy-${buddy.id}`,
        type: "buddy",
        title: `${buddy.name} joined the crew`,
        detail: buddy.promise,
        owner: "shared",
        createdBy: current.activeParent,
        createdAt: new Date().toISOString(),
      };
      return { ...current, customBuddies: [...current.customBuddies, buddy], sharedArtifacts: [artifact, ...current.sharedArtifacts] };
    });
    setView(buddy.id);
    setToast(`${buddy.name} is ready to use`);
  }

  function setBuddyMessages(sidekickId: SidekickId, messages: BuddyMessage[]) {
    setHubState((current) => ({ ...current, buddyMessages: { ...current.buddyMessages, [sidekickId]: messages } }));
  }

  function setBuddyContext(sidekickId: SidekickId, title: string, summary: string) {
    const context: BuddyWorkbenchContext = { title, summary: summary.trim().slice(0, 7900), updatedAt: new Date().toISOString() };
    setHubState((current) => ({ ...current, buddyContexts: { ...current.buddyContexts, [sidekickId]: context } }));
  }

  function setHomeSidekicks(sidekickIds: SidekickId[]) {
    setHubState((current) => ({
      ...current,
      homeSidekickIds: { ...current.homeSidekickIds, [current.activeParent]: sidekickIds },
    }));
    setToast("Your home crew has been updated");
  }

  function saveFamily(family: FamilyProfile) {
    setHubState((current) => ({ ...initialHubState, family, activeParent: current.activeParent, homeSidekickIds: current.homeSidekickIds, customBuddies: current.customBuddies }));
    setToast(`${family.name} is now the shared Sidekick memory`);
  }

  function updateFamilyMemory(family: FamilyProfile) {
    setHubState((current) => ({ ...current, family }));
  }

  function resetDemo() {
    setHubState(initialHubState);
    setView("home");
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("Sidekick demo reset");
  }

  const customSidekick = hubState.customBuddies.find((buddy) => buddy.id === view);
  const activeSidekick = customSidekick ?? (isBuiltInSidekickView(view) ? sidekickById(view) : null);
  const { family } = hubState;
  const fallbackContext: BuddyWorkbenchContext | undefined = !activeSidekick ? undefined
    : activeSidekick.id === "cleo" ? {
      title: "Current care desk",
      summary: `Saved care contacts: ${family.careContacts.map((item) => `${item.name} (${item.kind}); ${item.specialty}; ${item.phone}; ${item.address}; ${item.openingHours}`).join(" | ") || "none"}. Upcoming appointments: ${family.appointments.map((item) => `${item.title} on ${item.date} at ${item.time}`).join(" | ") || "none"}.`,
      updatedAt: "1970-01-01T00:00:00.000Z",
    }
    : activeSidekick.id === "pip" ? {
      title: "Current family office",
      summary: `Saved institutions: ${family.institutions.map((item) => `${item.name} (${item.kind}); ${item.address}; ${item.phone}; ${item.email}; ${item.openingHours}; ${item.website}`).join(" | ") || "none"}. Document metadata: ${family.documents.map((item) => `${item.name} (${item.category}, ${item.sizeLabel})`).join(" | ") || "none"}.`,
      updatedAt: "1970-01-01T00:00:00.000Z",
    }
    : activeSidekick.id === "moxie" ? {
      title: "Current Buddy workshop",
      summary: `Installed custom Buddys: ${hubState.customBuddies.map((buddy) => `${buddy.name}: ${buddy.promise}; memory ${buddy.memoryScopes.join(", ")}; guardrails ${buddy.guardrails.join("; ")}`).join(" | ") || "none yet"}.`,
      updatedAt: "1970-01-01T00:00:00.000Z",
    }
    : activeSidekick.id.startsWith("custom-") ? {
      title: "Installed capability",
      summary: `${activeSidekick.name}. Role: ${activeSidekick.role}. Promise: ${activeSidekick.promise}. Instructions: ${activeSidekick.instructions}. Starter actions: ${activeSidekick.quickPrompts.join("; ")}. Memory access: ${activeSidekick.memoryScopes?.join(", ") || "none"}. Guardrails: ${activeSidekick.guardrails?.join("; ") || "none"}.`,
      updatedAt: customSidekick?.createdAt ?? "1970-01-01T00:00:00.000Z",
    }
    : undefined;
  const activeBuddyContext = activeSidekick ? hubState.buddyContexts[activeSidekick.id] ?? fallbackContext : undefined;
  const todayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className={`sidekick-shell active-parent-${hubState.activeParent} ${activeSidekick ? "has-buddy-chat" : ""}`}>
      <aside className="sidekick-sidebar">
        <button className="sidekick-brand" onClick={() => setView("home")}><span><Users size={20} /></span><div><strong>Family Sidekicks</strong><small>{family.name}</small></div></button>
        <nav className="sidekick-sidebar-nav" aria-label="Sidekick corners">
          <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}><span className="sidekick-nav-icon"><Home size={18} /></span><span>Crew home</span></button>
          <span className="sidekick-nav-label">Your Sidekicks</span>
          {sidekicks.map((sidekick) => (
            <button key={sidekick.id} aria-label={sidekick.name} className={view === sidekick.id ? "active" : ""} onClick={() => setView(sidekick.id)}>
              <span className="sidekick-nav-avatar"><Image src={sidekick.image} alt="" fill sizes="34px" loading="eager" /></span>
              <span className="sidekick-nav-copy"><strong>{sidekick.name}</strong><small>{sidekick.corner.replace(" Corner", "")}</small></span>
              {(hubState.buddyMessages[sidekick.id]?.length ?? 0) > 0 ? <em /> : null}
            </button>
          ))}
          <button className={view === "more" ? "active" : ""} onClick={() => setView("more")}><span className="sidekick-nav-icon"><Grid2X2 size={18} /></span><span>More corners</span></button>
          {hubState.customBuddies.length ? <span className="sidekick-nav-label">Built by your family</span> : null}
          {hubState.customBuddies.map((sidekick) => (
            <button key={sidekick.id} className={view === sidekick.id ? "active" : ""} onClick={() => setView(sidekick.id)}>
              <span className="sidekick-nav-avatar"><Image src={sidekick.image} alt="" fill sizes="34px" loading="eager" /></span>
              <span className="sidekick-nav-copy"><strong>{sidekick.name}</strong><small>{sidekick.role}</small></span>
              {(hubState.buddyMessages[sidekick.id]?.length ?? 0) > 0 ? <em /> : null}
            </button>
          ))}
        </nav>
        <div className="sidekick-sidebar-bottom">
          <button className={view === "family" ? "active" : ""} onClick={() => setView("family")}><span className="sidekick-nav-icon"><Brain size={18} /></span><span>Family memory</span></button>
          <button onClick={() => setJudgeOpen(true)}><span className="sidekick-nav-icon"><FlaskConical size={18} /></span><span>Judge view</span></button>
          <button onClick={resetDemo}><span className="sidekick-nav-icon"><RotateCcw size={17} /></span><span>Reset demo</span></button>
        </div>
      </aside>

      <header className="sidekick-topbar">
        <div className="daily-header-context"><CalendarDays size={17} /><div><strong>{todayLabel}</strong><span><MapPin size={11} />{family.city}</span></div></div>
        <button className="topbar-family" onClick={() => setView("family")} aria-label="Open family profile" title="Family profile"><Users size={18} /></button>
        <div className="sidekick-parent-switch" aria-label="Switch parent view">
          {family.parents.map((parent) => <button key={parent.id} className={hubState.activeParent === parent.id ? "active" : ""} onClick={() => switchParent(parent.id)} aria-pressed={hubState.activeParent === parent.id}><span>{parent.name[0]}</span>{parent.name}</button>)}
        </div>
        <button className="topbar-judge" onClick={() => setJudgeOpen(true)} aria-label="Open judge view"><FlaskConical size={18} /></button>
      </header>

      <main className="sidekick-main">
        <div className="sidekick-canvas">
          {view === "home" ? <CrewHome activeParent={hubState.activeParent} family={family} artifacts={hubState.sharedArtifacts} messages={hubState.buddyMessages} contexts={hubState.buddyContexts} completedTaskIds={hubState.completedTaskIds} featuredIds={hubState.homeSidekickIds[hubState.activeParent]} customBuddies={hubState.customBuddies} navigate={setView} onToggleTask={toggleTask} onFeaturedIdsChange={setHomeSidekicks} /> : null}
          {activeSidekick ? (
            <>
              <section className={`corner-hero corner-hero-${activeSidekick.accent}`}>
                <div className="corner-hero-copy"><span>{activeSidekick.corner}</span><h1>{activeSidekick.name}</h1><strong>{activeSidekick.role}</strong><p>{activeSidekick.promise}</p><div><Brain size={15} />{activeSidekick.id.startsWith("custom-") ? "Uses only the selected family memory" : "Starts with the shared family memory"}</div></div>
                <div className="corner-hero-portrait"><Image src={activeSidekick.image} alt={`${activeSidekick.name}, ${activeSidekick.role}`} fill priority sizes="(max-width: 800px) 42vw, 290px" /></div>
              </section>
              {view === "skippy" ? <AdventureCorner family={family} activeParent={hubState.activeParent} savedEventIds={hubState.savedEventIds} onSave={saveEvent} onContextChange={(context) => setBuddyContext("skippy", "Current event shortlist", context)} showToast={setToast} /> : null}
              {view === "nori" ? <KitchenCorner family={family} activeParent={hubState.activeParent} onSave={saveMeal} onContextChange={(context) => setBuddyContext("nori", "Current meal plan", context)} showToast={setToast} /> : null}
              {view === "lumi" ? <StoryCorner family={family} activeParent={hubState.activeParent} latestStory={hubState.latestStory} onStory={saveStory} onContextChange={(context) => setBuddyContext("lumi", "Current story", context)} /> : null}
              {view === "atlas" ? <LearningCorner family={family} activeParent={hubState.activeParent} onResult={saveLearning} onContextChange={(context) => setBuddyContext("atlas", "Current learning set", context)} /> : null}
              {view === "pippa" ? <PartyCorner family={family} activeParent={hubState.activeParent} completedTaskIds={hubState.completedTaskIds} invitationDataUrl={hubState.invitationDataUrl} invitationGenerated={hubState.invitationGenerated} onPlan={saveBirthday} onInvitation={setInvitation} onToggleTask={toggleTask} onContextChange={(context) => setBuddyContext("pippa", "Current party project", context)} showToast={setToast} /> : null}
              {view === "quinn" ? <QuizCorner family={family} activeParent={hubState.activeParent} onQuiz={saveQuiz} onContextChange={(context) => setBuddyContext("quinn", "Current family game", context)} /> : null}
              {view === "romy" ? <VacationCorner family={family} activeParent={hubState.activeParent} onResult={saveVacation} onContextChange={(context) => setBuddyContext("romy", "Current trip plan", context)} showToast={setToast} /> : null}
              {view === "moxie" ? <BuddyBuilderCorner family={family} activeParent={hubState.activeParent} onCreate={createCustomBuddy} onContextChange={(context) => setBuddyContext("moxie", "Current Buddy blueprint", context)} /> : null}
              {view === "cleo" ? <CareCorner family={family} activeParent={hubState.activeParent} onContextChange={(context) => setBuddyContext("cleo", "Current local care brief", context)} /> : null}
              {view === "pip" ? <AdminCorner family={family} activeParent={hubState.activeParent} onFamilyChange={updateFamilyMemory} onContextChange={(context) => setBuddyContext("pip", "Current official family brief", context)} showToast={setToast} /> : null}
              {view.startsWith("custom-") ? <CapabilityCorner sidekick={activeSidekick} family={family} /> : null}
            </>
          ) : null}
          {view === "more" ? <MoreCorners navigate={setView} customBuddies={hubState.customBuddies} /> : null}
          {view === "family" ? <FamilyMemory family={family} activeParent={hubState.activeParent} onSave={saveFamily} showToast={setToast} /> : null}
        </div>
        {activeSidekick ? <BuddyChat key={activeSidekick.id} family={family} sidekick={activeSidekick} activeParent={hubState.activeParent} messages={hubState.buddyMessages[activeSidekick.id] ?? []} context={activeBuddyContext} onMessagesChange={(messages) => setBuddyMessages(activeSidekick.id, messages)} /> : null}
      </main>

      <nav className="sidekick-mobile-nav" aria-label="Mobile Sidekick navigation">
        {mobileNavItems.map((item) => { const Icon = item.icon; return <button key={item.id} aria-label={item.label} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><Icon size={19} /><span>{item.id === "home" ? "Home" : item.id === "more" ? "More" : sidekickById(item.id as SidekickId).name}</span></button>; })}
      </nav>

      <JudgeDrawer open={judgeOpen} onClose={() => setJudgeOpen(false)} />
      {judgeOpen ? <div className="drawer-backdrop" onClick={() => setJudgeOpen(false)} /> : null}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </div>
  );
}
