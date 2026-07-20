"use client";

import { ArrowLeft, ArrowRight, BedDouble, Building2, Check, CheckCircle2, Compass, Globe2, Home, Hotel, LoaderCircle, Luggage, MapPinned, Plane, RefreshCw, Route, Search, Sparkles, TrainFront, WalletCards } from "lucide-react";
import { useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import type { DestinationIdeasResult, FamilyProfile, ParentId, TravelScope, VacationResult } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";
type ConnectorId = "check24" | "airbnb" | "hotel-search";
const priorityOptions = ["Beach time", "Nature", "Culture", "Great food", "Child activities", "Slow mornings", "One adult highlight", "Low transfers"];

const connectorConfig: Array<{ id: ConnectorId; name: string; role: string; icon: typeof Hotel }> = [
  { id: "check24", name: "CHECK24", role: "Compare package, hotel and transport options", icon: Search },
  { id: "airbnb", name: "Airbnb", role: "Find family homes with kitchen and separate bedrooms", icon: Home },
  { id: "hotel-search", name: "Hotel Search", role: "Compare family rooms and flexible cancellation", icon: Hotel },
];

export function VacationCorner({ family, activeParent, onResult, onContextChange, showToast }: { family: FamilyProfile; activeParent: ParentId; onResult: (result: VacationResult) => void; onContextChange: (context: string) => void; showToast: (message: string) => void }) {
  const [step, setStep] = useState(1);
  const [destinationMode, setDestinationMode] = useState<"known" | "inspire">("inspire");
  const [destination, setDestination] = useState("");
  const [destinationSource, setDestinationSource] = useState<"family-idea" | "romy-recommendation">("family-idea");
  const [travelScope, setTravelScope] = useState<TravelScope>("nearby");
  const [maxTravelHours, setMaxTravelHours] = useState(6);
  const [startDate, setStartDate] = useState("2026-09-05");
  const [endDate, setEndDate] = useState("2026-09-10");
  const [pace, setPace] = useState<"relaxed" | "balanced" | "full">("balanced");
  const [transport, setTransport] = useState<"car" | "train" | "flight" | "open">("open");
  const [accommodation, setAccommodation] = useState<"hotel" | "apartment" | "resort" | "flexible">("flexible");
  const [budgetEuro, setBudgetEuro] = useState(1800);
  const [priorities, setPriorities] = useState(["Nature", "Child activities", "Slow mornings"]);
  const [ideasState, setIdeasState] = useState<RequestState>("idle");
  const [ideas, setIdeas] = useState<DestinationIdeasResult | null>(null);
  const [ideasError, setIdeasError] = useState("");
  const [state, setState] = useState<RequestState>("idle");
  const [result, setResult] = useState<VacationResult | null>(null);
  const [error, setError] = useState("");
  const [connector, setConnector] = useState<ConnectorId | null>(null);

  function togglePriority(priority: string) { setPriorities((current) => current.includes(priority) ? current.length === 1 ? current : current.filter((item) => item !== priority) : [...current, priority].slice(0, 6)); }

  async function findIdeas(useSample = false) {
    setIdeasState("loading"); setIdeasError(""); setIdeas(null);
    try {
      const response = await fetch("/api/destination-ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ family, activeParent, travelScope, maxTravelHours, startDate, endDate, budgetEuro, priorities, useSample }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Destination inspiration failed");
      setIdeas(data as DestinationIdeasResult); setIdeasState("done");
    } catch (requestError) { setIdeasError(requestError instanceof Error ? requestError.message : "Destination inspiration failed"); setIdeasState("error"); }
  }

  function selectIdea(value: string) {
    setDestination(value); setDestinationSource("romy-recommendation"); setStep(2);
  }

  async function build(useSample = false) {
    setState("loading"); setError(""); setConnector(null);
    try {
      const response = await fetch("/api/vacation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ family, activeParent, destination, destinationSource, travelScope, startDate, endDate, pace, transport, accommodation, budgetEuro, priorities, useSample }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Vacation planning failed");
      const plan = data as VacationResult; setResult(plan); setState("done"); setStep(4); onResult(plan); onContextChange(`${plan.destination}. ${plan.title}. Dates: ${startDate} to ${endDate}. Budget guardrail: EUR ${budgetEuro}. Travel scope: ${travelScope}; transport: ${transport}; stay: ${accommodation}; pace: ${pace}; priorities: ${priorities.join(", ")}. Summary: ${plan.summary}. Recommendation: ${plan.recommendationReason}. Family fit: ${plan.familyFit}. Itinerary: ${plan.days.map((day) => `${day.label} - ${day.title}: ${day.activities.join(", ")}`).join(" | ")}. Travel plan: ${plan.travelPlan.join("; ")}. Packing: ${plan.packingHighlights.join("; ")}. Budget notes: ${plan.budgetNotes.join("; ")}.`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Vacation planning failed"); setState("error"); }
  }

  function resetJourney() {
    setStep(1); setDestination(""); setDestinationSource("family-idea"); setIdeas(null); setIdeasState("idle"); setResult(null); setState("idle"); setConnector(null);
  }

  const scopeCopy: Record<TravelScope, { title: string; detail: string; icon: typeof Globe2 }> = {
    domestic: { title: `Stay in ${family.country}`, detail: "Keep planning and travel friction low", icon: MapPinned },
    nearby: { title: "Stay within reach", detail: `Roughly ${maxTravelHours} hours from ${family.city}`, icon: TrainFront },
    worldwide: { title: "Explore the world", detail: "Long-haul ideas are welcome", icon: Globe2 },
  };

  return <div className="corner-workbench vacation-workbench romy-workbench">
    <div className="workbench-heading"><div><span className="corner-kicker">Romy&apos;s guided trip studio</span><h2>Start with the family decision, not a booking form</h2><p>Romy first helps decide where, then how far, then how the trip should feel. Booking partners appear only after the family plan is approved.</p></div><StatusPill mode="live" /></div>

    <div className="romy-progress">{[{ n: 1, label: "Where?" }, { n: 2, label: "Travel frame" }, { n: 3, label: "Trip style" }, { n: 4, label: "Plan + connect" }].map((item) => <button key={item.n} className={step === item.n ? "active" : step > item.n ? "done" : ""} disabled={item.n > step || (item.n === 4 && !result)} onClick={() => setStep(item.n)}><span>{step > item.n ? <Check size={13} /> : item.n}</span><strong>{item.label}</strong></button>)}</div>

    {step === 1 ? <section className="romy-step romy-destination-step"><div className="romy-question"><span>First question</span><h3>Do you already know where you want to go?</h3><p>Both answers are useful. Romy can work from your idea or narrow the world to three family-fit options.</p></div><div className="romy-choice-cards"><button className={destinationMode === "known" ? "active" : ""} onClick={() => setDestinationMode("known")}><MapPinned size={22} /><strong>We have an idea</strong><span>Start from a destination already on your list</span></button><button className={destinationMode === "inspire" ? "active" : ""} onClick={() => setDestinationMode("inspire")}><Sparkles size={22} /><strong>Recommend something</strong><span>Let Romy suggest three different directions</span></button></div>{destinationMode === "known" ? <div className="romy-known-destination"><label><span>Where are you thinking?</span><input value={destination} placeholder="e.g. Lake Garda, Denmark or Japan" onChange={(event) => { setDestination(event.target.value); setDestinationSource("family-idea"); }} /></label><button className="corner-button primary" disabled={destination.trim().length < 2} onClick={() => setStep(2)}>Use this destination<ArrowRight size={16} /></button></div> : <><div className="romy-scope-grid">{(Object.keys(scopeCopy) as TravelScope[]).map((scope) => { const item = scopeCopy[scope]; const Icon = item.icon; return <button className={travelScope === scope ? "active" : ""} key={scope} onClick={() => setTravelScope(scope)}><Icon size={21} /><strong>{item.title}</strong><span>{item.detail}</span></button>; })}</div>{travelScope === "nearby" ? <label className="romy-hours"><span>Maximum comfortable travel time</span><input type="range" min={2} max={12} value={maxTravelHours} onChange={(event) => setMaxTravelHours(Number(event.target.value))} /><strong>{maxTravelHours} hours</strong></label> : null}<button className="corner-button primary romy-ideas-button" onClick={() => void findIdeas(false)} disabled={ideasState === "loading"}>{ideasState === "loading" ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}Ask Romy for 3 ideas</button>{ideasState === "error" ? <div className="corner-error"><strong>Live inspiration did not complete</strong><p>{ideasError}</p><button onClick={() => void findIdeas(true)}>Load labeled sample ideas</button></div> : null}{ideas ? <div className="romy-ideas"><div><StatusPill mode={ideas.mode} /><p>{ideas.intro}</p></div>{ideas.ideas.map((idea) => <article key={idea.destination}><span>{idea.locationLabel}</span><h4>{idea.destination}</h4><p>{idea.whyItFits}</p><dl><div><dt>Travel</dt><dd>{idea.travelEffort}</dd></div><div><dt>Budget</dt><dd>{idea.budgetFit}</dd></div><div><dt>Best family angle</dt><dd>{idea.familyHighlight}</dd></div></dl><small>{idea.caveat}</small><button onClick={() => selectIdea(idea.destination)}>Choose {idea.destination}<ArrowRight size={14} /></button></article>)}<TraceStrip trace={ideas.trace} /></div> : null}</>}</section> : null}

    {step === 2 ? <section className="romy-step"><button className="romy-back" onClick={() => setStep(1)}><ArrowLeft size={14} />Back</button><div className="romy-question"><span>Travel frame</span><h3>How far and how fixed should the journey be?</h3><p>Selected destination: <strong>{destination}</strong>. Dates, travel effort and budget now set the realistic frame.</p></div><div className="corner-controls romy-frame-controls"><label><span>From</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label><span>Until</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label><label><span>Budget EUR</span><input type="number" min={100} max={50000} value={budgetEuro} onChange={(event) => setBudgetEuro(Number(event.target.value))} /></label><label><span>Transport preference</span><select value={transport} onChange={(event) => setTransport(event.target.value as typeof transport)}><option value="open">Romy can recommend</option><option value="car">Car</option><option value="train">Train</option><option value="flight">Flight</option></select></label></div><div className="romy-scope-grid compact">{(Object.keys(scopeCopy) as TravelScope[]).map((scope) => { const item = scopeCopy[scope]; const Icon = item.icon; return <button className={travelScope === scope ? "active" : ""} key={scope} onClick={() => setTravelScope(scope)}><Icon size={18} /><strong>{item.title}</strong></button>; })}</div><button className="corner-button primary romy-next" onClick={() => setStep(3)}>Define the trip style<ArrowRight size={16} /></button></section> : null}

    {step === 3 ? <section className="romy-step"><button className="romy-back" onClick={() => setStep(2)}><ArrowLeft size={14} />Back</button><div className="romy-question"><span>Trip personality</span><h3>What should this vacation feel like?</h3><p>Choose the pace, preferred stay and the few things that matter most. Romy protects downtime instead of filling every hour.</p></div><div className="romy-style-grid"><div><span>Pace</span><div className="segmented-control">{(["relaxed", "balanced", "full"] as const).map((item) => <button className={pace === item ? "active" : ""} onClick={() => setPace(item)} key={item}>{item}</button>)}</div></div><div><span>Stay</span><div className="romy-stay-options">{(["hotel", "apartment", "resort", "flexible"] as const).map((item) => <button className={accommodation === item ? "active" : ""} onClick={() => setAccommodation(item)} key={item}><BedDouble size={15} />{item}</button>)}</div></div></div><div className="romy-priorities"><span>What matters to your family?</span><div className="quiz-topic-chips">{priorityOptions.map((priority) => <button className={priorities.includes(priority) ? "active" : ""} key={priority} onClick={() => togglePriority(priority)}>{priorities.includes(priority) ? <Check size={13} /> : null}{priority}</button>)}</div></div><button className="corner-button primary romy-build" onClick={() => void build(false)} disabled={state === "loading"}>{state === "loading" ? <LoaderCircle className="spin" size={17} /> : <Compass size={17} />}Build our family trip</button>{state === "error" ? <div className="corner-error"><strong>Live vacation planning did not complete</strong><p>{error}</p><div><button onClick={() => void build(false)}><RefreshCw size={15} />Retry</button><button onClick={() => void build(true)}>Load labeled sample plan</button></div></div> : null}</section> : null}

    {step === 4 && result ? <section className="romy-step romy-result-step"><div className="corner-result vacation-result"><div className="vacation-result-heading"><div><StatusPill mode={result.mode} /><span>{result.destination}</span><h3>{result.title}</h3><p>{result.summary}</p></div><Compass size={30} /></div>{result.notice ? <div className="sample-notice">{result.notice}</div> : null}<div className="vacation-fit"><strong>Why Romy recommends this shape</strong><p>{result.recommendationReason}</p><p>{result.familyFit}</p></div><div className="vacation-days">{result.days.map((day) => <article key={`${day.label}-${day.title}`}><span>{day.label}</span><h4>{day.title}</h4>{day.activities.map((activity) => <p key={activity}>{activity}</p>)}</article>)}</div><div className="vacation-lists"><section><Route size={18} /><span>Travel plan</span>{result.travelPlan.map((item) => <p key={item}>{item}</p>)}</section><section><Luggage size={18} /><span>Packing highlights</span>{result.packingHighlights.map((item) => <p key={item}>{item}</p>)}</section><section><WalletCards size={18} /><span>Budget guardrails</span>{result.budgetNotes.map((item) => <p key={item}>{item}</p>)}</section></div><TraceStrip trace={result.trace} /></div>

      <section className="romy-connectors"><div className="romy-connector-heading"><div><span>Next layer · simulated MCP handoff</span><h3>Search bookable options without re-entering the family brief</h3><p>The connector would receive destination, dates, travelers, budget, allergy notes and stay preferences. No partner is connected and no booking occurs in this POC.</p></div><CheckCircle2 size={24} /></div><div className="romy-connector-grid">{connectorConfig.map((item) => { const Icon = item.icon; return <button className={connector === item.id ? "active" : ""} key={item.id} onClick={() => setConnector(item.id)}><div><Icon size={20} /><span>Demo MCP</span></div><strong>{item.name}</strong><p>{item.role}</p><em>Open connector preview<ArrowRight size={13} /></em></button>; })}</div>{connector ? <div className="romy-connector-preview"><div><span>Simulated result from {connectorConfig.find((item) => item.id === connector)?.name}</span><strong>3 family-fit options for {result.destination}</strong><p>Illustrative inventory only. Prices, ratings and availability are deliberately not presented as live.</p></div><div className="romy-offer-list"><article><Building2 size={17} /><div><strong>Central family base</strong><span>Separate sleeping area · breakfast option</span></div><b>Sample fit 92%</b></article><article><Home size={17} /><div><strong>Quiet home with kitchen</strong><span>Two bedrooms · flexible family rhythm</span></div><b>Sample fit 88%</b></article><article><Plane size={17} /><div><strong>Transport + stay bundle</strong><span>One transfer · family luggage included</span></div><b>Sample fit 84%</b></article></div><button onClick={() => showToast("Connector demo only - no partner request or booking was created")}>Continue to partner <span>Simulation</span><ArrowRight size={14} /></button></div> : null}</section><button className="corner-button secondary romy-restart" onClick={resetJourney}><RefreshCw size={15} />Plan another trip</button></section> : null}
  </div>;
}
