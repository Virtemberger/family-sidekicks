"use client";

import Image from "next/image";
import { BookOpenText, Check, Clock3, Download, ImageIcon, LoaderCircle, MoonStar, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import type { FamilyProfile, ParentId, StoryResult, TraceInfo } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";
interface IllustrationResponse { mode: "live" | "sample"; notice?: string; imageUrl: string; trace: TraceInfo }

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Story generation failed");
  return data as T;
}

export function StoryCorner({
  family,
  activeParent,
  latestStory,
  onStory,
  onContextChange,
}: {
  family: FamilyProfile;
  activeParent: ParentId;
  latestStory?: StoryResult;
  onStory: (story: StoryResult) => void;
  onContextChange: (context: string) => void;
}) {
  const [request, setRequest] = useState(`${family.children[0].name} and ${family.children[1]?.name ?? family.children[0].name} solve a gentle mystery together`);
  const [duration, setDuration] = useState(7);
  const [mood, setMood] = useState<"gentle" | "funny" | "adventurous">("gentle");
  const [state, setState] = useState<RequestState>(latestStory ? "done" : "idle");
  const [story, setStory] = useState<StoryResult | null>(latestStory ?? null);
  const [error, setError] = useState("");
  const [imageState, setImageState] = useState<RequestState>("idle");
  const [illustration, setIllustration] = useState<IllustrationResponse | null>(null);
  const [imageError, setImageError] = useState("");

  async function createStory(useSample = false) {
    setState("loading");
    setError("");
    try {
      const result = await postJson<StoryResult>("/api/stories", {
        activeParent,
        family,
        request,
        durationMinutes: duration,
        mood,
        useSample,
      });
      setStory(result);
      setState("done");
      setIllustration(null);
      setImageState("idle");
      onStory(result);
      onContextChange(`${result.title}. ${result.synopsis} Reading time: ${result.readTimeMinutes} minutes. Full story: ${result.story} Family details used: ${result.memoryUsed.join(", ")}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Story generation failed");
      setState("error");
    }
  }

  async function createIllustration(useSample = false) {
    if (!story) return;
    setImageState("loading");
    setImageError("");
    try {
      const result = await postJson<IllustrationResponse>("/api/story-image", {
        activeParent,
        family,
        title: story.title,
        synopsis: story.synopsis,
        scene: story.story.slice(0, 650),
        useSample,
      });
      setIllustration(result);
      setImageState("done");
    } catch (requestError) {
      setImageError(requestError instanceof Error ? requestError.message : "Story illustration failed");
      setImageState("error");
    }
  }

  function downloadIllustration() {
    if (!illustration) return;
    const link = document.createElement("a");
    link.href = illustration.imageUrl;
    link.download = `${story?.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "story"}-illustration.png`;
    link.click();
  }

  const [firstChild, secondChild = firstChild] = family.children;
  const activeParentName = family.parents.find((parent) => parent.id === activeParent)?.name ?? "The reader";

  return (
    <div className="corner-workbench story-workbench">
      <div className="workbench-heading"><div><span className="corner-kicker">Lumi&apos;s workbench</span><h2>A story world that becomes familiar over time</h2><p>Shape the first version here, then ask Lumi to change roles, pace, mood or ending in the conversation.</p></div><StatusPill mode="live" /></div>
      <div className="corner-controls story-controls">
        <label className="story-request"><span>Tonight&apos;s spark</span><input value={request} onChange={(event) => setRequest(event.target.value)} /></label>
        <label><span>Reading time</span><select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={5}>5 minutes</option><option value={7}>7 minutes</option><option value={10}>10 minutes</option><option value={12}>12 minutes</option></select></label>
        <label><span>Mood</span><select value={mood} onChange={(event) => setMood(event.target.value as typeof mood)}><option value="gentle">Gentle</option><option value="funny">Funny</option><option value="adventurous">Adventurous</option></select></label>
        <button className="corner-button primary" onClick={() => void createStory(false)} disabled={state === "loading"}>{state === "loading" ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}Create tonight&apos;s story</button>
      </div>

      <div className="story-memory-strip"><MoonStar size={17} /><span>{firstChild.name} brings {firstChild.interests[0] || "curiosity"}.</span><span>{secondChild.name} brings {secondChild.interests[0] || "the surprise"}.</span><em>{activeParentName}: {activeParent === "jonas" ? "short version first" : "richer setup"}</em></div>

      {state === "idle" ? <div className="corner-empty"><BookOpenText size={28} /><strong>Lumi has the characters, not yet the plot</strong><p>Create a first story, then use the conversation to reshape it without explaining the family again.</p></div> : null}
      {state === "error" ? <div className="corner-error"><strong>Live story did not complete</strong><p>{error}</p><div><button onClick={() => void createStory(false)}><RefreshCw size={15} />Retry</button><button onClick={() => void createStory(true)}>Load labeled sample</button></div></div> : null}
      {state === "done" && story ? (
        <article className="corner-result story-result">
          <div className="story-title-row"><div><StatusPill mode={story.mode} /><h3>{story.title}</h3><p>{story.synopsis}</p></div><span><Clock3 size={15} />{story.readTimeMinutes} min</span></div>
          {story.notice ? <div className="sample-notice">{story.notice}</div> : null}
          <div className="story-paper">{story.story.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <div className="story-illustration">
            {illustration ? <div className="story-illustration-image"><Image src={illustration.imageUrl} alt={`Illustration for ${story.title}`} fill unoptimized sizes="(max-width: 760px) 100vw, 420px" /><span>{illustration.mode === "live" ? "Generated for this story" : "Labeled sample"}</span></div> : <div className="story-illustration-empty"><ImageIcon size={27} /><strong>Illustrate one scene</strong><p>Optional and on demand, so a text story never triggers image cost by itself.</p></div>}
            <div><span>GPT Image 2</span><h4>A new picture for this exact story</h4><p>Lumi sends the title, synopsis, first scene and non-visual family interests. It does not invent a real child&apos;s likeness.</p>{illustration?.notice ? <div className="sample-notice">{illustration.notice}</div> : null}{imageState === "error" ? <div className="corner-error compact"><strong>Image generation did not complete</strong><p>{imageError}</p><button onClick={() => void createIllustration(true)}>Use labeled sample</button></div> : null}<div className="story-image-actions"><button className="corner-button primary" onClick={() => void createIllustration(false)} disabled={imageState === "loading" || Boolean(illustration)}>{imageState === "loading" ? <LoaderCircle className="spin" size={16} /> : illustration ? <Check size={16} /> : <Sparkles size={16} />}{illustration ? "Illustration ready" : "Generate illustration"}</button>{illustration ? <button className="corner-button secondary" onClick={downloadIllustration}><Download size={16} />Download</button> : null}</div>{illustration ? <TraceStrip trace={illustration.trace} /> : null}</div>
          </div>
          <div className="story-facts"><Check size={16} /><span>Personalized with</span>{story.memoryUsed.map((item) => <em key={item}>{item}</em>)}</div>
          <TraceStrip trace={story.trace} />
        </article>
      ) : null}
      <div className="corner-commercial"><span>Premium preview</span><strong>Recurring characters and yesterday&apos;s story could carry across devices.</strong><p>This browser-only POC stores no cloud story history.</p></div>
    </div>
  );
}
