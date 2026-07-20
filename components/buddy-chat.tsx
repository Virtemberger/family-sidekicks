"use client";

import Image from "next/image";
import { ArrowUp, Brain, Link2, LoaderCircle, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import type { BuddyChatResult, BuddyMessage, BuddyWorkbenchContext, FamilyProfile, ParentId, SidekickConfig } from "@/lib/types";

function quickPromptsFor(sidekick: SidekickConfig, family: FamilyProfile) {
  const [firstChild, secondChild = firstChild] = family.children;
  if (sidekick.id === "nori") {
    return [
      "What can I cook from our pantry?",
      `How can I serve dinner for ${firstChild.name}?`,
      "Give me three easy dinners for this week",
    ];
  }
  if (sidekick.id === "lumi") {
    return [
      `Tell a seven-minute story about ${firstChild.interests[0] || "an adventure"}`,
      `Make ${secondChild.name} the ${secondChild.interests[0] || "animal"} expert`,
      "Continue our story world from yesterday",
    ];
  }
  if (sidekick.id === "skippy") {
    return [
      `Find something ${firstChild.name} and ${secondChild.name} will enjoy`,
      "What works this Saturday if it rains?",
      `Keep the outing within ${family.radiusKm} km`,
    ];
  }
  return sidekick.quickPrompts;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "The Sidekick could not answer");
  return data as T;
}

export function BuddyChat({
  sidekick,
  family,
  activeParent,
  messages,
  context,
  onMessagesChange,
}: {
  sidekick: SidekickConfig;
  family: FamilyProfile;
  activeParent: ParentId;
  messages: BuddyMessage[];
  context?: BuddyWorkbenchContext;
  onMessagesChange: (messages: BuddyMessage[]) => void;
}) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState(() => quickPromptsFor(sidekick, family));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const isCustomBuddy = sidekick.id.startsWith("custom-");
  const memoryDescription = isCustomBuddy
    ? `Reads only: ${(sidekick.memoryScopes ?? []).join(", ")}`
    : `Reads the shared ${family.name} memory`;

  async function sendMessage(prompt: string, useSample = false) {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || loading) return;
    setLoading(true);
    setError("");
    setLastPrompt(cleanPrompt);
    setInput("");

    const userMessage: BuddyMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: cleanPrompt,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];
    onMessagesChange(nextMessages);

    try {
      const result = await postJson<BuddyChatResult>("/api/buddies/chat", {
        buddyId: sidekick.id,
        customBuddy: sidekick.id.startsWith("custom-")
          ? {
              id: sidekick.id,
              name: sidekick.name,
              role: sidekick.role,
              promise: sidekick.promise,
              instructions: sidekick.instructions,
              quickPrompts: sidekick.quickPrompts,
              memoryScopes: sidekick.memoryScopes,
              guardrails: sidekick.guardrails,
            }
          : undefined,
        activeParent,
        family,
        messages: nextMessages.slice(-10).map(({ role, content }) => ({ role, content })),
        context,
        useSample,
      });
      const assistantMessage: BuddyMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: result.reply,
        mode: result.mode,
        memoryUsed: result.memoryUsed,
        createdAt: new Date().toISOString(),
      };
      onMessagesChange([...nextMessages, assistantMessage]);
      setSuggestions(result.suggestedPrompts);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The Sidekick could not answer");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <aside className={`buddy-chat buddy-chat-${sidekick.accent}`} aria-label={`Chat with ${sidekick.name}`}>
      <header className="buddy-chat-header">
        <div className="buddy-chat-avatar"><Image src={sidekick.image} alt="" fill sizes="56px" /></div>
        <div><span>{sidekick.corner}</span><strong>Talk to {sidekick.name}</strong></div>
        <span className="buddy-ready"><span />Live-ready</span>
      </header>

      <div className="buddy-chat-memory"><Brain size={15} /><span>{memoryDescription}</span></div>
      {context ? <div className="buddy-chat-context"><Link2 size={15} /><div><span>Workbench in this conversation</span><strong>{context.title}</strong></div></div> : null}

      <div className="buddy-messages" aria-live="polite">
        {messages.length === 0 ? (
          <div className="buddy-empty">
            <MessageCircle size={24} />
            <strong>{sidekick.promise}</strong>
            <p>{isCustomBuddy ? `${sidekick.name} receives only the memory areas approved when it was created.` : `Ask naturally. ${sidekick.name} already receives the relevant ages, interests, allergies and parent preferences.`}</p>
          </div>
        ) : null}
        {messages.map((message) => (
          <div className={`buddy-message buddy-message-${message.role}`} key={message.id}>
            {message.role === "assistant" ? <span className="message-author">{sidekick.name}{message.mode ? ` - ${message.mode === "live" ? "Live AI" : "Sample"}` : ""}</span> : null}
            <p>{message.content}</p>
            {message.memoryUsed?.length ? (
              <div className="memory-used"><span>Memory used</span>{message.memoryUsed.map((item) => <em key={item}>{item}</em>)}</div>
            ) : null}
          </div>
        ))}
        {loading ? <div className="buddy-typing"><LoaderCircle className="spin" size={16} />{sidekick.name} is thinking with the family context...</div> : null}
        {error ? (
          <div className="buddy-chat-error"><strong>Live answer did not complete</strong><p>{error}</p><div><button onClick={() => void sendMessage(lastPrompt)}><RefreshCw size={14} />Retry</button><button onClick={() => void sendMessage(lastPrompt, true)}>Use labeled sample</button></div></div>
        ) : null}
      </div>

      <div className="buddy-suggestions">
        {suggestions.map((suggestion) => <button key={suggestion} onClick={() => void sendMessage(suggestion)} disabled={loading}>{suggestion}</button>)}
      </div>

      <form className="buddy-composer" onSubmit={submit}>
        <label htmlFor={`message-${sidekick.id}`}>Message {sidekick.name}</label>
        <div><textarea id={`message-${sidekick.id}`} value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Ask ${sidekick.name}...`} rows={2} maxLength={1200} /><button type="submit" disabled={!input.trim() || loading} aria-label={`Send message to ${sidekick.name}`}><ArrowUp size={18} /></button></div>
        <small><Sparkles size={12} />{context ? `Includes ${context.title.toLowerCase()}.` : isCustomBuddy ? "Answers are limited to the approved memory scopes." : "Answers may use shared family facts shown above."}</small>
      </form>
    </aside>
  );
}
