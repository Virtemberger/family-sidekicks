"use client";

import Image from "next/image";
import { Camera, Check, Eye, GraduationCap, ImagePlus, LoaderCircle, Printer, RefreshCw, Sparkles, X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import type { FamilyProfile, LearningResult, ParentId } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Learning analysis failed");
  return data as T;
}

function prepareImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) return reject(new Error("Use a PNG, JPG or WebP screenshot."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The screenshot could not be read."));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error("The screenshot could not be opened."));
      image.onload = () => {
        const maxEdge = 1600;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Image processing is unavailable in this browser."));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function LearningCorner({
  family,
  activeParent,
  onResult,
  onContextChange,
}: {
  family: FamilyProfile;
  activeParent: ParentId;
  onResult: (result: LearningResult) => void;
  onContextChange: (context: string) => void;
}) {
  const [childId, setChildId] = useState(family.children[0].id);
  const [subject, setSubject] = useState("Math");
  const [goal, setGoal] = useState<"explain" | "practice" | "both">("both");
  const [request, setRequest] = useState("Explain the method first, then create three similar tasks at the same level.");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [state, setState] = useState<RequestState>("idle");
  const [result, setResult] = useState<LearningResult | null>(null);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState<number[]>([]);
  const [includeAnswers, setIncludeAnswers] = useState(true);

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const prepared = await prepareImage(file);
      if (prepared.length > 8_000_000) throw new Error("The screenshot is still too large after resizing.");
      setImageDataUrl(prepared);
      setFileName(file.name);
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "The screenshot could not be prepared.");
    }
  }

  async function analyze(useSample = false) {
    setState("loading");
    setError("");
    setRevealed([]);
    try {
      const learning = await postJson<LearningResult>("/api/learning", {
        activeParent,
        family,
        childId,
        subject,
        goal,
        request,
        imageDataUrl: imageDataUrl || undefined,
        useSample,
      });
      setResult(learning);
      setState("done");
      onResult(learning);
      onContextChange(`${learning.detectedTask}. Level: ${learning.levelAssessment}. Method: ${learning.explanationSteps.join(" ")} Practice set: ${learning.practiceTasks.map((task, index) => `${index + 1}. ${task.question}; hint: ${task.hint}; answer key: ${task.answer}`).join(" | ")}. Parent note: ${learning.parentNote}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Learning analysis failed");
      setState("error");
    }
  }

  const child = family.children.find((item) => item.id === childId) ?? family.children[0];

  function printWorksheet() {
    document.body.classList.add("print-atlas");
    const cleanup = () => document.body.classList.remove("print-atlas");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
    window.setTimeout(cleanup, 1200);
  }

  return (
    <div className="corner-workbench learning-workbench">
      <div className="workbench-heading"><div><span className="corner-kicker">Atlas&apos; workbench</span><h2>Show the task. Learn the method. Practice the skill.</h2><p>Atlas can read a worksheet screenshot, help without taking over and generate new tasks at the same level.</p></div><StatusPill mode="live" /></div>

      <div className="atlas-layout">
        <div className="atlas-upload">
          {imageDataUrl ? <div className="atlas-preview"><Image src={imageDataUrl} alt={`Uploaded worksheet ${fileName}`} fill unoptimized sizes="360px" /><button onClick={() => { setImageDataUrl(""); setFileName(""); }} aria-label="Remove screenshot"><X size={16} /></button></div> : <label className="atlas-drop"><ImagePlus size={28} /><strong>Add a worksheet screenshot</strong><span>PNG, JPG or WebP. Resized in the browser before analysis.</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectImage(event)} /></label>}
          <div className="atlas-privacy"><Camera size={14} />Used for this request only. Not added to Family Memory.</div>
        </div>

        <div className="atlas-setup">
          <div className="corner-controls atlas-controls">
            <label><span>Learning for</span><select value={childId} onChange={(event) => setChildId(event.target.value)}>{family.children.map((item) => <option value={item.id} key={item.id}>{item.name}, {item.age}</option>)}</select></label>
            <label><span>Subject</span><select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Math</option><option>Language</option><option>Science</option><option>General knowledge</option></select></label>
          </div>
          <div className="segmented-control" aria-label="Learning goal">
            {(["explain", "practice", "both"] as const).map((item) => <button key={item} className={goal === item ? "active" : ""} onClick={() => setGoal(item)}>{item === "both" ? "Explain + practice" : item}</button>)}
          </div>
          <label className="corner-textarea"><span>What should Atlas do?</span><textarea value={request} onChange={(event) => setRequest(event.target.value)} rows={3} maxLength={600} /></label>
          <button className="corner-button primary atlas-analyze" onClick={() => void analyze(false)} disabled={state === "loading"}>{state === "loading" ? <LoaderCircle className="spin" size={17} /> : <Eye size={17} />}{imageDataUrl ? "Analyze screenshot" : "Create from description"}</button>
        </div>
      </div>

      {state === "idle" ? <div className="corner-empty compact-empty"><GraduationCap size={28} /><strong>Atlas is ready for {child.name}&apos;s current level</strong><p>A screenshot is optional. Without one, describe the task or skill in the field above.</p></div> : null}
      {state === "error" ? <div className="corner-error"><strong>Live learning analysis did not complete</strong><p>{error}</p><div><button onClick={() => void analyze(false)}><RefreshCw size={15} />Retry</button><button onClick={() => void analyze(true)}>Load labeled sample</button></div></div> : null}
      {state === "done" && result ? <div className="corner-result learning-result">
        <div className="learning-summary"><div><StatusPill mode={result.mode} /><span>Task Atlas detected</span><h3>{result.detectedTask}</h3><p>{result.levelAssessment}</p></div><div className="atlas-print-actions"><label><input type="checkbox" checked={includeAnswers} onChange={(event) => setIncludeAnswers(event.target.checked)} />Answer key</label><button className="corner-button secondary" onClick={printWorksheet}><Printer size={16} />Print worksheet</button></div></div>
        {result.notice ? <div className="sample-notice">{result.notice}</div> : null}
        <div className="learning-steps"><span>Method, not just the answer</span>{result.explanationSteps.map((step, index) => <div key={step}><strong>{index + 1}</strong><p>{step}</p></div>)}</div>
        <div className="practice-grid">{result.practiceTasks.map((task, index) => { const isRevealed = revealed.includes(index); return <article key={`${task.question}-${index}`}><span>Practice {index + 1}</span><h4>{task.question}</h4><p><strong>Hint:</strong> {task.hint}</p><button onClick={() => setRevealed((current) => isRevealed ? current.filter((item) => item !== index) : [...current, index])}>{isRevealed ? <Check size={14} /> : <Sparkles size={14} />}{isRevealed ? task.answer : "Reveal parent answer"}</button></article>; })}</div>
        <div className="atlas-parent-note"><strong>For the parent</strong><p>{result.parentNote}</p></div>
        <TraceStrip trace={result.trace} />
        <section className="atlas-print-sheet" aria-hidden="true">
          <header><span>ATLAS LEARNING CORNER</span><h1>{subject} practice for {child.name}</h1><p>{result.levelAssessment}</p><div><strong>Name:</strong><i /><strong>Date:</strong><i /></div></header>
          <main>{result.practiceTasks.map((task, index) => <article key={`${task.question}-print`}><span>Task {index + 1}</span><h2>{task.question}</h2><p>Hint: {task.hint}</p><div className="atlas-answer-lines"><i /><i /></div></article>)}</main>
          <footer><strong>Parent note</strong><p>{result.parentNote}</p><small>Created for {family.name} with Atlas · Family Sidekicks prototype</small></footer>
          {includeAnswers ? <aside className="atlas-answer-key"><h1>Answer key</h1>{result.practiceTasks.map((task, index) => <p key={`${task.answer}-key`}><strong>{index + 1}.</strong> {task.answer}</p>)}</aside> : null}
        </section>
      </div> : null}
    </div>
  );
}
