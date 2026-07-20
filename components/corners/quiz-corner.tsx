"use client";

import { Check, CircleHelp, Drama, LoaderCircle, MessagesSquare, Plus, RefreshCw, RotateCcw, Sparkles, Trophy, UserRound, WandSparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusPill, TraceStrip } from "@/components/ui";
import type { FamilyProfile, ParentId, QuizResult } from "@/lib/types";

type RequestState = "idle" | "loading" | "done" | "error";
type GameMode = "quiz" | "would-you-rather" | "charades" | "story-chain";
interface Player { id: string; name: string }

const topicOptions = ["Space", "Animals", "Funny science", "World", "Food", "Sport", "Stories", "Music"];

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Quiz generation failed");
  return data as T;
}

export function QuizCorner({ family, activeParent, onQuiz, onContextChange }: { family: FamilyProfile; activeParent: ParentId; onQuiz: (quiz: QuizResult) => void; onContextChange: (context: string) => void }) {
  const [gameMode, setGameMode] = useState<GameMode>("quiz");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "family-mix" | "tricky">("family-mix");
  const [topics, setTopics] = useState(["Space", "Animals", "Funny science"]);
  const [players, setPlayers] = useState<Player[]>(() => [...family.children.map((child) => ({ id: `child-${child.id}`, name: child.name })), ...family.parents.map((parent) => ({ id: `parent-${parent.id}`, name: parent.name }))]);
  const [newPlayer, setNewPlayer] = useState("");
  const [state, setState] = useState<RequestState>("idle");
  const [quiz, setQuiz] = useState<QuizResult | null>(null);
  const [error, setError] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
  const [miniRound, setMiniRound] = useState(0);

  const [firstChild, secondChild = firstChild] = family.children;
  const miniGamePrompts = useMemo(() => ({
    "would-you-rather": [
      `Would you rather explore space with ${firstChild.name} or discover a new animal with ${secondChild.name}? Why?`,
      "Would you rather be able to fly for ten minutes or breathe underwater for ten minutes?",
      "Would you rather invent a new ice-cream flavor or a new holiday? Name it.",
    ],
    charades: [
      `Act out ${secondChild.interests[0] || "an animal"} without making a sound.`,
      `Pretend to walk on the moon for ${firstChild.name}.`,
      "Act out getting ready in a huge hurry, then in super slow motion.",
    ],
    "story-chain": [
      `Start with: ${firstChild.name} opened the smallest door in the world and found...`,
      `Add one sentence containing ${secondChild.interests[0] || "an animal"}, a yellow suitcase and a surprising sound.`,
      "The next player must solve the problem without using magic.",
    ],
  }), [firstChild, secondChild]);

  async function createQuiz(useSample = false) {
    setState("loading"); setError(""); setQuestionIndex(0); setSelected(null); setScore(0); setPlayerScores({});
    try {
      const result = await postJson<QuizResult>("/api/quiz", { activeParent, family, questionCount, difficulty, categories: topics, players: players.map((player) => player.name), useSample });
      setQuiz(result); setState("done"); onQuiz(result); onContextChange(`${result.title}. Players in turn order: ${players.map((player) => player.name).join(", ")}. Difficulty: ${difficulty}. Topics: ${topics.join(", ")}. Questions and answer key: ${result.questions.map((question, index) => `${index + 1}. ${question.question} Options: ${question.options.join(" / ")}. Correct: ${question.options[question.correctIndex]}. Explanation: ${question.explanation}`).join(" | ")}`);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Quiz generation failed"); setState("error"); }
  }

  function answer(optionIndex: number) {
    if (!quiz || selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === quiz.questions[questionIndex].correctIndex) {
      setScore((current) => current + 1);
      const player = players[questionIndex % players.length];
      if (player) setPlayerScores((current) => ({ ...current, [player.id]: (current[player.id] ?? 0) + 1 }));
    }
  }

  function nextQuestion() {
    if (!quiz) return;
    if (questionIndex < quiz.questions.length - 1) { setQuestionIndex((current) => current + 1); setSelected(null); }
  }

  function toggleTopic(topic: string) {
    setTopics((current) => current.includes(topic) ? current.length === 1 ? current : current.filter((item) => item !== topic) : [...current, topic].slice(0, 6));
  }

  function addPlayer() {
    const name = newPlayer.trim();
    if (!name || players.length >= 10) return;
    setPlayers((current) => [...current, { id: `player-${Date.now()}`, name }]);
    setNewPlayer("");
  }

  const currentQuestion = quiz?.questions[questionIndex];
  const complete = Boolean(quiz && selected !== null && questionIndex === quiz.questions.length - 1);
  const activeMiniPrompts = gameMode === "quiz" ? [] : miniGamePrompts[gameMode];
  const currentPlayer = players[questionIndex % Math.max(players.length, 1)];
  const miniPlayer = players[miniRound % Math.max(players.length, 1)];

  return <div className="corner-workbench quiz-workbench">
    <div className="workbench-heading"><div><span className="corner-kicker">Quinn&apos;s game table</span><h2>Pick a game. Start playing in seconds.</h2><p>No destination and no occasion required. Quinn adapts quick family play to ages, interests and the time available.</p></div><StatusPill mode="live" /></div>

    <section className="quinn-player-setup"><div className="quinn-player-heading"><UserRound size={19} /><div><span>Who is playing?</span><strong>Quinn takes turns automatically</strong></div></div><div className="quinn-player-chips">{players.map((player) => <span key={player.id}><UserRound size={12} />{player.name}<button disabled={players.length === 1} onClick={() => setPlayers((current) => current.filter((item) => item.id !== player.id))} aria-label={`Remove ${player.name}`}><X size={12} /></button></span>)}</div><div className="quinn-add-player"><input value={newPlayer} placeholder="Add another player" onChange={(event) => setNewPlayer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addPlayer(); }} /><button onClick={addPlayer} disabled={!newPlayer.trim() || players.length >= 10}><Plus size={14} />Add player</button></div></section>

    <div className="fun-game-shelf" aria-label="Choose a family game">
      <button className={gameMode === "quiz" ? "active" : ""} onClick={() => setGameMode("quiz")}><CircleHelp size={20} /><strong>Quiz</strong><span>AI-generated</span></button>
      <button className={gameMode === "would-you-rather" ? "active" : ""} onClick={() => { setGameMode("would-you-rather"); setMiniRound(0); }}><MessagesSquare size={20} /><strong>Would you rather?</strong><span>Talk + laugh</span></button>
      <button className={gameMode === "charades" ? "active" : ""} onClick={() => { setGameMode("charades"); setMiniRound(0); }}><Drama size={20} /><strong>Act it out</strong><span>Move + guess</span></button>
      <button className={gameMode === "story-chain" ? "active" : ""} onClick={() => { setGameMode("story-chain"); setMiniRound(0); }}><WandSparkles size={20} /><strong>Story chain</strong><span>Create together</span></button>
    </div>

    {gameMode === "quiz" ? <>
      <div className="quiz-quick-setup">
        <div><span>Topics</span><div className="quiz-topic-chips">{topicOptions.map((topic) => <button key={topic} className={topics.includes(topic) ? "active" : ""} onClick={() => toggleTopic(topic)}>{topics.includes(topic) ? <Check size={13} /> : null}{topic}</button>)}</div></div>
        <label><span>Questions</span><select value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))}><option value={3}>3 · super quick</option><option value={5}>5 · standard</option><option value={8}>8 · longer round</option><option value={10}>10 · full game</option></select></label>
      </div>
      <div className="quiz-build-row"><div className="segmented-control" aria-label="Quiz difficulty">{(["easy", "family-mix", "tricky"] as const).map((item) => <button className={difficulty === item ? "active" : ""} onClick={() => setDifficulty(item)} key={item}>{item === "easy" ? "Easy" : item === "family-mix" ? "Family mix" : "Tricky"}</button>)}</div><button className="corner-button primary" onClick={() => void createQuiz(false)} disabled={state === "loading"}>{state === "loading" ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}Build quiz</button></div>
      {state === "idle" ? <div className="corner-empty"><CircleHelp size={28} /><strong>One host screen, everyone plays aloud</strong><p>Choose topics, length and difficulty. Quinn handles the age mix.</p></div> : null}
      {state === "error" ? <div className="corner-error"><strong>Live quiz did not complete</strong><p>{error}</p><div><button onClick={() => void createQuiz(false)}><RefreshCw size={15} />Retry</button><button onClick={() => void createQuiz(true)}>Load labeled sample</button></div></div> : null}
      {state === "done" && quiz && currentQuestion ? <div className="corner-result quiz-result">
        <div className="quiz-score"><div><StatusPill mode={quiz.mode} /><span>{quiz.title}</span><strong>{quiz.intro}</strong></div><div><Trophy size={18} /><strong>{score}</strong><span>total points</span></div></div>
        <div className="quinn-scoreboard">{players.map((player) => <span className={currentPlayer?.id === player.id ? "active" : ""} key={player.id}><strong>{player.name}</strong><b>{playerScores[player.id] ?? 0}</b></span>)}</div>
        {quiz.notice ? <div className="sample-notice">{quiz.notice}</div> : null}
        <div className="quiz-stage"><div className="quiz-turn"><UserRound size={15} /><span>Question for</span><strong>{currentPlayer?.name || "Player"}</strong></div><div className="quiz-progress"><span>Question {questionIndex + 1} of {quiz.questions.length}</span><em>{currentQuestion.childFit}</em></div><h3>{currentQuestion.question}</h3><div className="quiz-options">{currentQuestion.options.map((option, index) => { const answered = selected !== null; const correct = index === currentQuestion.correctIndex; const picked = index === selected; return <button key={option} className={answered ? correct ? "correct" : picked ? "wrong" : "dimmed" : ""} onClick={() => answer(index)} disabled={answered}><span>{String.fromCharCode(65 + index)}</span>{option}{answered && correct ? <Check size={16} /> : null}</button>; })}</div>{selected !== null ? <div className="quiz-explanation"><strong>{selected === currentQuestion.correctIndex ? `Point for ${currentPlayer?.name || "this player"}` : `Good try, ${currentPlayer?.name || "player"}`}</strong><p>{currentQuestion.explanation}</p>{complete ? <button onClick={() => { setQuestionIndex(0); setSelected(null); setScore(0); setPlayerScores({}); }}><RotateCcw size={14} />Play again</button> : <button onClick={nextQuestion}>Next player</button>}</div> : null}</div>
        <TraceStrip trace={quiz.trace} />
      </div> : null}
    </> : <div className="mini-game-stage">
      <span>{gameMode === "would-you-rather" ? "Would you rather?" : gameMode === "charades" ? "Act it out" : "Story chain"} · Round {miniRound + 1}</span><div className="mini-game-player"><UserRound size={14} />{miniPlayer?.name || "Player"}&apos;s turn</div>
      <h3>{activeMiniPrompts[miniRound % activeMiniPrompts.length]}</h3>
      <p>{gameMode === "charades" ? "The first correct guess chooses who performs next." : gameMode === "story-chain" ? "Go clockwise. Each person adds exactly one sentence." : "Everyone answers, then one person explains their choice."}</p>
      <button className="corner-button primary" onClick={() => setMiniRound((current) => current + 1)}><Sparkles size={16} />Next prompt</button>
      <small>Instant family-personalized demo rounds. A later version can generate unlimited packs and shared scores.</small>
    </div>}
  </div>;
}
