"use client";

import {
  ArrowUpRight,
  CalendarPlus,
  Check,
  ChefHat,
  Clock3,
  ExternalLink,
  LoaderCircle,
  LocateFixed,
  MapPin,
  RefreshCw,
  Send,
  ShoppingBasket,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { EmptyState, StatusPill, TraceStrip } from "@/components/ui";
import { familyProfile } from "@/lib/demo-data";
import { createEventIcs } from "@/lib/ics";
import type { EventResult, EventSuggestion, MealResult, ParentId } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The request failed");
  return data as T;
}

export function PlanView({
  activeParent,
  savedEventIds,
  saveEvent,
  saveMeal,
  showToast,
}: {
  activeParent: ParentId;
  savedEventIds: string[];
  saveEvent: (event: EventSuggestion) => void;
  saveMeal: (meal: MealResult) => void;
  showToast: (message: string) => void;
}) {
  const [city, setCity] = useState("Stuttgart");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationNote, setLocationNote] = useState("Manual city · location is not stored");
  const [eventState, setEventState] = useState<RequestState>("idle");
  const [eventResult, setEventResult] = useState<EventResult | null>(null);
  const [eventError, setEventError] = useState("");
  const [mealState, setMealState] = useState<RequestState>("idle");
  const [mealResult, setMealResult] = useState<MealResult | null>(null);
  const [mealError, setMealError] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [pantry, setPantry] = useState("olive oil, vegetable stock, oregano");

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationNote("Geolocation is not supported — using Stuttgart");
      return;
    }
    setLocationNote("Waiting for browser permission…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationNote("Current coordinates will be used once and not stored");
      },
      () => {
        setCoordinates(null);
        setLocationNote("Location declined — enter a city instead");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  async function findEvents(useSample = false) {
    setEventState("loading");
    setEventError("");
    try {
      const result = await postJson<EventResult>("/api/events", {
        activeParent,
        family: familyProfile,
        location: { city, ...coordinates },
        timeframe: "this-weekend",
        useSample,
      });
      setEventResult(result);
      setEventState("done");
    } catch (error) {
      setEventError(error instanceof Error ? error.message : "Event search failed");
      setEventState("error");
    }
  }

  async function buildMeal(useSample = false) {
    setMealState("loading");
    setMealError("");
    try {
      const result = await postJson<MealResult>("/api/meals", {
        activeParent,
        family: familyProfile,
        availableMinutes: minutes,
        pantry: pantry.split(",").map((item) => item.trim()).filter(Boolean),
        request: "A bright weekday dinner with vegetables that can be served in separate parts for Leo.",
        useSample,
      });
      setMealResult(result);
      setMealState("done");
    } catch (error) {
      setMealError(error instanceof Error ? error.message : "Meal planning failed");
      setMealState("error");
    }
  }

  function downloadCalendar(event: EventSuggestion) {
    const blob = new Blob([createEventIcs(event)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Calendar file created");
  }

  async function shareEvent(event: EventSuggestion) {
    const text = `${event.title} — ${event.dateLabel} at ${event.time}, ${event.venue}. ${event.sourceUrl}`;
    if (navigator.share) {
      await navigator.share({ title: event.title, text, url: event.sourceUrl });
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast("Event details copied");
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">Turn open questions into decisions</p><h1>Plan the family week</h1><p>Live local discovery and one practical dinner — both using the same family context.</p></div>
      </section>

      <section className="tool-section tool-section-green">
        <div className="tool-heading">
          <div className="character-badge character-scout"><MapPin size={21} /></div>
          <div><div className="tool-title-line"><p className="eyebrow">Scout Skippy</p><StatusPill mode="live" /></div><h2>What could work this weekend?</h2><p>Searches current sources and explains why each result fits Mia and Leo.</p></div>
        </div>
        <div className="tool-controls location-controls">
          <label><span>City or area</span><input value={city} onChange={(event) => { setCity(event.target.value); setCoordinates(null); setLocationNote("Manual city · location is not stored"); }} /></label>
          <button className="button button-secondary" onClick={detectLocation}><LocateFixed size={17} />Use my location</button>
          <button className="button button-primary" onClick={() => findEvents(false)} disabled={eventState === "loading"}>{eventState === "loading" ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}Find family plans</button>
        </div>
        <p className="input-note"><MapPin size={14} />{locationNote}</p>

        {eventState === "idle" ? <EmptyState icon={<CalendarPlus size={24} />} title="One search, three usable options" body="The live route uses GPT-5.6 Terra web search. Without an API key, the response is visibly labeled as sample data." /> : null}
        {eventState === "error" ? <div className="error-state"><strong>Live search did not complete</strong><p>{eventError}</p><div><button className="button button-secondary" onClick={() => findEvents(false)}><RefreshCw size={16} />Retry</button><button className="button button-quiet" onClick={() => findEvents(true)}>Load labeled sample</button></div></div> : null}
        {eventState === "done" && eventResult ? (
          <div className="result-block">
            <div className="result-header"><div><StatusPill mode={eventResult.mode} /><h3>{eventResult.locationLabel}</h3><p>{eventResult.summary}</p></div></div>
            {eventResult.notice ? <div className="sample-notice">{eventResult.notice}</div> : null}
            <div className="event-grid">
              {eventResult.events.map((event) => {
                const saved = savedEventIds.includes(event.id);
                return (
                  <article className="event-card" key={event.id}>
                    <div className="event-topline"><span>{event.dateLabel} · {event.time}</span><span>{event.priceLabel}</span></div>
                    <h3>{event.title}</h3>
                    <p className="venue-line"><MapPin size={14} />{event.venue}, {event.city}</p>
                    <p className="event-fit">{event.whyItFits}</p>
                    <div className="event-tags"><span>{event.ageLabel}</span><a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.sourceName}<ExternalLink size={12} /></a></div>
                    <div className="event-actions">
                      <button className={`button ${saved ? "button-saved" : "button-primary"}`} disabled={saved} onClick={() => saveEvent(event)}>{saved ? <Check size={16} /> : <CalendarPlus size={16} />}{saved ? "In family plan" : "Save"}</button>
                      <button className="icon-button" onClick={() => downloadCalendar(event)} aria-label={`Export ${event.title} to calendar`} title="Export calendar"><CalendarPlus size={17} /></button>
                      <button className="icon-button" onClick={() => shareEvent(event)} aria-label={`Share ${event.title}`} title="Share"><Send size={17} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
            <TraceStrip trace={eventResult.trace} />
          </div>
        ) : null}
      </section>

      <section className="tool-section tool-section-blue">
        <div className="tool-heading">
          <div className="character-badge character-kitchen"><ChefHat size={22} /></div>
          <div><div className="tool-title-line"><p className="eyebrow">Kitchen Coach</p><StatusPill mode="live" /></div><h2>Dinner without the debate</h2><p>Nut-free is a hard constraint. Time, pantry and child adaptations shape the answer.</p></div>
        </div>
        <div className="tool-controls meal-controls">
          <label className="time-control"><span>Time</span><div><input type="range" min="15" max="60" step="5" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} /><strong>{minutes} min</strong></div></label>
          <label><span>Already in the pantry</span><input value={pantry} onChange={(event) => setPantry(event.target.value)} /></label>
          <button className="button button-primary" onClick={() => buildMeal(false)} disabled={mealState === "loading"}>{mealState === "loading" ? <LoaderCircle className="spin" size={17} /> : <ChefHat size={17} />}Plan dinner</button>
        </div>

        {mealState === "idle" ? <EmptyState icon={<ShoppingBasket size={24} />} title="A decision, not a recipe search" body="The output separates pantry items, shopping gaps, steps and the adaptation for each child." /> : null}
        {mealState === "error" ? <div className="error-state"><strong>Live meal planning did not complete</strong><p>{mealError}</p><div><button className="button button-secondary" onClick={() => buildMeal(false)}><RefreshCw size={16} />Retry</button><button className="button button-quiet" onClick={() => buildMeal(true)}>Load labeled sample</button></div></div> : null}
        {mealState === "done" && mealResult ? (
          <div className="result-block meal-result">
            <div className="result-header"><div><StatusPill mode={mealResult.mode} /><h3>{mealResult.title}</h3><p>{mealResult.summary}</p></div><span className="time-badge"><Clock3 size={16} />{mealResult.totalMinutes} min</span></div>
            {mealResult.notice ? <div className="sample-notice">{mealResult.notice}</div> : null}
            <div className="meal-layout">
              <div className="meal-main"><h4>Three steps</h4><ol>{mealResult.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="safety-note"><Check size={17} /><div><strong>Allergy check</strong><p>{mealResult.allergyCheck}</p></div></div></div>
              <div className="meal-side"><h4>Shopping gaps</h4><ul>{mealResult.shoppingGaps.map((item) => <li key={item}>{item}</li>)}</ul><h4>For the kids</h4><p>{mealResult.kidAdaptation}</p></div>
            </div>
            <div className="result-actions"><button className="button button-primary" onClick={() => saveMeal(mealResult)}><Users size={16} />Assign dinner to Jonas</button><button className="button button-secondary" onClick={() => showToast("Shopping list copied")}><ShoppingBasket size={16} />Copy shopping list</button></div>
            <TraceStrip trace={mealResult.trace} />
          </div>
        ) : null}
      </section>

      <aside className="micro-sponsored"><span>Sponsored demo</span><div><strong>Ready-made picnic box</strong><p>Appears only after an outdoor plan is selected. It never changes organic ranking.</p></div><button className="text-button" onClick={() => showToast("Demo affiliate link — no tracking active")}>See partner preview <ArrowUpRight size={15} /></button></aside>
    </div>
  );
}
