"use client";

import { ExternalLink, LoaderCircle, MapPin, Phone, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import type { FamilyProfile, LocalBriefResult, ParentId } from "@/lib/types";

export function LocalBriefPanel({ kind, family, activeParent, onContextChange }: { kind: "care" | "admin"; family: FamilyProfile; activeParent: ParentId; onContextChange?: (context: string) => void }) {
  const [result, setResult] = useState<LocalBriefResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(useSample = false) {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/local-brief", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, family, activeParent, useSample }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Local search failed");
      const brief = data as LocalBriefResult;
      setResult(brief);
      onContextChange?.(`${brief.title}. ${brief.summary} Results: ${brief.items.map((item) => `${item.title}: ${item.summary}; ${item.address}; ${item.openingHours}; phone ${item.phone}; source ${item.sourceName} ${item.sourceUrl}`).join(" | ")}`);
    } catch (searchError) { setError(searchError instanceof Error ? searchError.message : "Local search failed"); }
    finally { setLoading(false); }
  }

  return <section className="local-brief-panel">
    <div className="local-brief-heading"><div><span>{kind === "care" ? "Live pharmacy directory" : "Live official family brief"}</span><h3>{kind === "care" ? `Pharmacies near ${family.city}` : `What changed around families in ${family.city}?`}</h3><p>{kind === "care" ? "Published hours and contact details stay attached to their source." : "Current local services and family-policy news from official sources."}</p></div><button className="corner-button secondary" onClick={() => void search(false)} disabled={loading}>{loading ? <LoaderCircle className="spin" size={16} /> : <Search size={16} />}Search live</button></div>
    {!result && !error ? <div className="local-brief-idle"><Search size={20} /><span>Not searched yet</span><p>Live search is optional so the POC does not spend API budget in the background.</p></div> : null}
    {error ? <div className="corner-error compact"><strong>Live local search did not complete</strong><p>{error}</p><button onClick={() => void search(true)}><RefreshCw size={14} />Load labeled sample</button></div> : null}
    {result ? <><div className="local-brief-summary"><StatusPill mode={result.mode} /><strong>{result.title}</strong><p>{result.summary}</p>{result.notice ? <small>{result.notice}</small> : null}</div><div className="local-brief-items">{result.items.map((item, index) => <article key={`${item.sourceUrl}-${index}`}><span>{item.kind}</span><h4>{item.title}</h4><p>{item.summary}</p>{item.address ? <small><MapPin size={13} />{item.address}</small> : null}{item.openingHours ? <small>{item.openingHours}</small> : null}<div>{item.phone ? <a href={`tel:${item.phone}`}><Phone size={13} />Call</a> : null}<a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName}<ExternalLink size={12} /></a></div></article>)}</div><TraceStrip trace={result.trace} /></> : null}
  </section>;
}
