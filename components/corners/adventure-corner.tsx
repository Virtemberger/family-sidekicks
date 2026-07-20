"use client";

import { CalendarPlus, Check, ExternalLink, LoaderCircle, LocateFixed, MapPin, RefreshCw, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import { createEventIcs } from "@/lib/ics";
import type { EventResult, EventSuggestion, FamilyProfile, ParentId } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Event search failed");
  return data as T;
}

export function AdventureCorner({
  family,
  activeParent,
  savedEventIds,
  onSave,
  onContextChange,
  showToast,
}: {
  family: FamilyProfile;
  activeParent: ParentId;
  savedEventIds: string[];
  onSave: (event: EventSuggestion) => void;
  onContextChange: (context: string) => void;
  showToast: (message: string) => void;
}) {
  const [city, setCity] = useState(family.city);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationNote, setLocationNote] = useState("Manual city - location is not stored");
  const [state, setState] = useState<RequestState>("idle");
  const [result, setResult] = useState<EventResult | null>(null);
  const [error, setError] = useState("");

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocationNote(`Geolocation is unavailable - using ${family.city}`);
      return;
    }
    setLocationNote("Waiting for browser permission...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationNote("Coordinates will be used once and not stored");
      },
      () => {
        setCoordinates(null);
        setLocationNote("Location declined - enter a city instead");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  async function findEvents(useSample = false) {
    setState("loading");
    setError("");
    try {
      const eventResult = await postJson<EventResult>("/api/events", {
        activeParent,
        family,
        location: { city, ...coordinates },
        timeframe: "this-weekend",
        useSample,
      });
      setResult(eventResult);
      setState("done");
      onContextChange(`${eventResult.locationLabel}. ${eventResult.summary} Options: ${eventResult.events.map((event) => `${event.title}; ${event.dateLabel} at ${event.time}; ${event.venue}, ${event.city}; ${event.priceLabel}; ${event.ageLabel}; family fit: ${event.whyItFits}; source: ${event.sourceName} ${event.sourceUrl}`).join(" | ")}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Event search failed");
      setState("error");
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
    const text = `${event.title} - ${event.dateLabel} at ${event.time}, ${event.venue}. ${event.sourceUrl}`;
    if (navigator.share) await navigator.share({ title: event.title, text, url: event.sourceUrl });
    else {
      await navigator.clipboard.writeText(text);
      showToast("Event details copied");
    }
  }

  return (
    <div className="corner-workbench">
      <div className="workbench-heading"><div><span className="corner-kicker">Skippy&apos;s workbench</span><h2>Search the real world, then talk it through</h2><p>The result is structured. The conversation stays open for trade-offs, weather and follow-up questions.</p></div><StatusPill mode="live" /></div>
      <div className="corner-controls adventure-controls">
        <label><span>City or area</span><input value={city} onChange={(event) => { setCity(event.target.value); setCoordinates(null); setLocationNote("Manual city - location is not stored"); }} /></label>
        <button className="corner-button secondary" onClick={detectLocation}><LocateFixed size={17} />Use location</button>
        <button className="corner-button primary" onClick={() => void findEvents(false)} disabled={state === "loading"}>{state === "loading" ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}Find weekend plans</button>
      </div>
      <p className="corner-input-note"><MapPin size={14} />{locationNote}</p>

      {state === "idle" ? <div className="corner-empty"><MapPin size={28} /><strong>Skippy is ready to scout</strong><p>Start with {family.city} or use a one-time browser location. Current events require an API key; sample results are labeled.</p></div> : null}
      {state === "error" ? <div className="corner-error"><strong>Live search did not complete</strong><p>{error}</p><div><button onClick={() => void findEvents(false)}><RefreshCw size={15} />Retry</button><button onClick={() => void findEvents(true)}>Load labeled sample</button></div></div> : null}
      {state === "done" && result ? (
        <div className="corner-result">
          <div className="corner-result-intro"><div><StatusPill mode={result.mode} /><h3>{result.locationLabel}</h3><p>{result.summary}</p></div></div>
          {result.notice ? <div className="sample-notice">{result.notice}</div> : null}
          <div className="adventure-list">
            {result.events.map((event) => {
              const saved = savedEventIds.includes(event.id);
              return (
                <article key={event.id}>
                  <div className="adventure-date"><strong>{event.dateLabel.slice(0, 3)}</strong><span>{event.time}</span></div>
                  <div className="adventure-copy"><span>{event.venue} - {event.priceLabel}</span><h3>{event.title}</h3><p>{event.whyItFits}</p><a href={event.sourceUrl} target="_blank" rel="noreferrer">{event.sourceName}<ExternalLink size={12} /></a></div>
                  <div className="adventure-actions"><button className={saved ? "saved" : ""} onClick={() => onSave(event)} disabled={saved}>{saved ? <Check size={16} /> : <CalendarPlus size={16} />}{saved ? "Saved" : "Save"}</button><button title="Export calendar" aria-label={`Export ${event.title} to calendar`} onClick={() => downloadCalendar(event)}><CalendarPlus size={16} /></button><button title="Share" aria-label={`Share ${event.title}`} onClick={() => void shareEvent(event)}><Send size={16} /></button></div>
                </article>
              );
            })}
          </div>
          <TraceStrip trace={result.trace} />
        </div>
      ) : null}
      <div className="corner-commercial"><span>Sponsored preview</span><strong>A picnic box can appear after an outdoor plan is chosen.</strong><p>It never changes Skippy&apos;s organic ranking.</p></div>
    </div>
  );
}
