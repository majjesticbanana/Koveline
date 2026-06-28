"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye, Check, X, Shuffle, ListOrdered, AlertCircle, RotateCcw,
  Grid3X3, ChevronLeft, ChevronRight, Save, ArrowRight,
} from "lucide-react";
import type { Unit, Question } from "@/lib/quizzes";

type Mode = "random" | "sequential" | "wrongOnly";
type Status = Record<number, "correct" | "wrong">;

const RTL = /[\u0600-\u06FF\u0750-\u077F\u0780-\u07BF\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/;
const isRtl = (t: string) => RTL.test(String(t));

function shuffle(a: number[]) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function QuizContainer({ unit }: { unit: Unit }) {
  const KEY = `koveline-progress-${unit.id}`;

  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<Mode>("sequential");
  const [status, setStatus] = useState<Status>({});
  const [wrongSnap, setWrongSnap] = useState<Question[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [complete, setComplete] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const list = useCallback(
    (m: Mode, snap: Question[]) => (m === "wrongOnly" ? snap : unit.questions),
    [unit],
  );

  const buildOrder = useCallback(
    (m: Mode, snap: Question[]) => {
      const L = list(m, snap);
      const idxs = L.map((_, i) => i);
      return m === "random" ? shuffle(idxs) : idxs;
    },
    [list],
  );

  // load saved progress once
  useEffect(() => {
    let savedStatus: Status = {};
    let savedMode: Mode = "sequential";
    let savedIdx = 0;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.status && typeof s.status === "object") savedStatus = s.status;
        if (["random", "sequential", "wrongOnly"].includes(s.mode)) savedMode = s.mode;
        if (typeof s.idx === "number") savedIdx = s.idx;
      }
    } catch {
      /* ignore */
    }
    const snap =
      savedMode === "wrongOnly"
        ? unit.questions.filter((q) => savedStatus[q.id] === "wrong")
        : [];
    const ord = buildOrder(savedMode, snap);
    setStatus(savedStatus);
    setMode(savedMode);
    setWrongSnap(snap);
    setOrder(ord);
    setIdx(Math.min(Math.max(savedIdx, 0), Math.max(ord.length - 1, 0)));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ status, mode, idx }));
    } catch {
      /* ignore */
    }
  }, [status, mode, idx, loaded, KEY]);

  const activeList = list(mode, wrongSnap);
  const current = activeList[order[idx]];

  const counts = useMemo(() => {
    let c = 0, w = 0;
    order.forEach((oi) => {
      const s = status[activeList[oi]?.id];
      if (s === "correct") c++;
      else if (s === "wrong") w++;
    });
    return { c, w, answered: c + w, total: order.length };
  }, [order, status, activeList]);

  const wrongTotal = useMemo(
    () => unit.questions.filter((q) => status[q.id] === "wrong").length,
    [unit, status],
  );

  const changeMode = (m: Mode) => {
    if (m === mode && m !== "wrongOnly") return;
    const snap = m === "wrongOnly" ? unit.questions.filter((q) => status[q.id] === "wrong") : [];
    setWrongSnap(snap);
    setMode(m);
    setOrder(buildOrder(m, snap));
    setIdx(0);
    setShowAnswer(false);
    setComplete(false);
  };

  const mark = (correct: boolean) => {
    if (!current) return;
    setStatus((s) => ({ ...s, [current.id]: correct ? "correct" : "wrong" }));
  };

  const goNext = () => {
    if (idx < order.length - 1) {
      setIdx(idx + 1);
      setShowAnswer(false);
      setComplete(false);
    } else {
      setComplete(true);
    }
  };
  const goPrev = () => {
    if (idx > 0) {
      setIdx(idx - 1);
      setShowAnswer(false);
      setComplete(false);
    }
  };
  const goTo = (i: number) => {
    setIdx(i);
    setShowAnswer(false);
    setComplete(false);
    setNavOpen(false);
  };

  const reset = () => {
    setStatus({});
    setMode("sequential");
    setWrongSnap([]);
    setOrder(buildOrder("sequential", []));
    setIdx(0);
    setShowAnswer(false);
    setComplete(false);
  };

  // keyboard
  useEffect(() => {
    if (!loaded || complete || navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        showAnswer ? goNext() : setShowAnswer(true);
      } else if (e.code === "ArrowRight" && idx < order.length - 1) goNext();
      else if (e.code === "ArrowLeft") goPrev();
      else if (showAnswer && (e.key === "r" || e.key === "R")) mark(true);
      else if (showAnswer && (e.key === "w" || e.key === "W")) mark(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, complete, navOpen, showAnswer, idx, order.length]);

  if (!loaded) {
    return (
      <div className="grid min-h-[200px] place-items-center rounded-3xl border border-line bg-surface">
        <p className="text-muted">Loading your progress…</p>
      </div>
    );
  }

  const navigator = (
    <>
      <div
        onClick={() => setNavOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/50 transition-opacity duration-300 ${navOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[74vh] flex-col rounded-t-[26px] bg-surface shadow-[0_-20px_50px_-20px_rgba(0,0,0,.35)] transition-transform duration-300 ${navOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ transitionTimingFunction: "cubic-bezier(.22,1,.36,1)" }}
      >
        <div className="border-b border-line px-5 pb-3 pt-4">
          <div className="mx-auto mb-3 h-[5px] w-[46px] rounded-full bg-line" />
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[1.2rem] font-bold">Jump to question</h3>
            <button onClick={() => setNavOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-coffee">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-1 text-[0.84rem] text-muted">
            {order.length} questions · {counts.answered} answered
          </div>
        </div>
        <div className="overflow-y-auto px-5 pb-6 pt-[18px]">
          <div className="grid gap-[9px] [grid-template-columns:repeat(auto-fill,minmax(54px,1fr))]">
            {order.map((oi, i) => {
              const s = status[activeList[oi]?.id];
              const isCur = i === idx;
              const cls = isCur
                ? "bg-coffee border-coffee text-white ring-2 ring-coffee ring-offset-2 ring-offset-surface"
                : s === "correct"
                ? "bg-green-bg border-green-line text-green"
                : s === "wrong"
                ? "bg-red-bg border-red-line text-red"
                : "bg-cream border-line text-muted";
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`grid aspect-square place-items-center rounded-[11px] border font-display text-base font-bold transition-transform hover:-translate-y-0.5 ${cls}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-[18px] flex flex-wrap gap-4 border-t border-line pt-4 text-[0.8rem] font-semibold text-muted">
            <Legend swatch="bg-coffee border-coffee" label="Current" />
            <Legend swatch="bg-green-bg border-green-line" label="Correct" />
            <Legend swatch="bg-red-bg border-red-line" label="Wrong" />
            <Legend swatch="bg-cream border-line" label="Not answered" />
          </div>
        </div>
      </div>
    </>
  );

  // empty review state
  if (mode === "wrongOnly" && order.length === 0) {
    return (
      <div>
        <ModeBar mode={mode} wrongTotal={wrongTotal} onMode={changeMode} onReset={reset} />
        <div className="rounded-3xl border border-line bg-surface p-10 text-center shadow-warm">
          <div className="text-5xl">🎉</div>
          <h3 className="mb-2 mt-3 font-display text-2xl font-extrabold">Nothing to review!</h3>
          <p className="mb-6 text-muted">You haven&apos;t marked any questions wrong yet. Take the quiz first.</p>
          <button onClick={() => changeMode("sequential")} className="rounded-2xl bg-gradient-to-br from-coffee to-coffee-deep px-6 py-3.5 font-extrabold text-white shadow-warm-sm">
            Start the quiz
          </button>
        </div>
      </div>
    );
  }

  if (complete) {
    const score = order.length ? Math.round((counts.c / order.length) * 100) : 0;
    const em = counts.c > counts.w ? "🎉" : counts.c === counts.w ? "👍" : "💪";
    return (
      <div>
        <div className="animate-rise rounded-3xl border border-line bg-surface p-10 text-center shadow-warm">
          <div className="text-[3.2rem]">{em}</div>
          <h3 className="my-2 mb-[18px] font-display text-[1.9rem] font-extrabold">Quiz complete!</h3>
          <div className="mb-7 flex flex-wrap justify-center gap-[34px]">
            <DoneStat value={counts.c} label="Correct" color="text-green" />
            <DoneStat value={counts.w} label="Wrong" color="text-red" />
            <DoneStat value={`${score}%`} label="Score" color="text-coffee" />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-[14px] bg-coffee px-6 py-3.5 font-extrabold text-white transition hover:brightness-110">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
            {wrongTotal > 0 && (
              <button onClick={() => changeMode("wrongOnly")} className="rounded-[14px] bg-red px-6 py-3.5 font-extrabold text-white transition hover:brightness-110">
                Review wrong ({wrongTotal})
              </button>
            )}
          </div>
        </div>
        {navigator}
      </div>
    );
  }

  const st = current ? status[current.id] : undefined;
  const cardTone = st === "correct" ? "correct" : st === "wrong" ? "wrong" : "";
  const qdir = current && isRtl(current.question) ? "rtl" : "ltr";
  const aStr = current ? (typeof current.answer === "string" ? current.answer : JSON.stringify(current.answer)) : "";
  const adir = isRtl(aStr) ? "rtl" : "ltr";
  const pct = order.length ? Math.round((counts.answered / order.length) * 100) : 0;

  return (
    <div>
      {/* auto-save */}
      <div className="mb-4 flex items-center justify-center gap-1.5 text-[0.78rem] text-muted">
        <Save className="h-3 w-3 opacity-70" /> Progress auto-saved
      </div>

      {/* stat bar */}
      <div className="mb-4 flex flex-wrap justify-center gap-[11px]">
        <button onClick={() => setNavOpen(true)} className="inline-flex items-center gap-2.5 rounded-[13px] border border-line bg-surface px-4 py-2.5 font-semibold transition hover:border-caramel">
          <Grid3X3 className="h-4 w-4 text-muted" />
          <span className="text-[0.9rem] text-muted">Question:</span>
          <span className="font-display font-extrabold text-coffee">{idx + 1}</span>
          <span className="text-muted">/</span>
          <span className="font-bold">{order.length}</span>
        </button>
        <span className="inline-flex items-center gap-2 rounded-[13px] border border-green-line bg-green-bg px-4 py-2.5 font-display font-extrabold text-green">
          <Check className="h-4 w-4" /> {counts.c}
        </span>
        <span className="inline-flex items-center gap-2 rounded-[13px] border border-red-line bg-red-bg px-4 py-2.5 font-display font-extrabold text-red">
          <X className="h-4 w-4" /> {counts.w}
        </span>
      </div>

      {/* progress */}
      <div className="mb-[18px] h-[9px] overflow-hidden rounded-full bg-latte">
        <i className="block h-full rounded-full bg-gradient-to-r from-coffee to-caramel transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      <ModeBar mode={mode} wrongTotal={wrongTotal} onMode={changeMode} onReset={reset} />

      {/* card */}
      <div
        className={`animate-fade overflow-hidden rounded-[24px] border-2 shadow-warm transition-colors duration-300 ${
          cardTone === "correct" ? "border-green-line bg-[#f4f8ee]" : cardTone === "wrong" ? "border-red-line bg-[#fbf0eb]" : "border-line bg-surface"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b border-line px-[18px] py-3.5 transition-colors duration-300 ${
            cardTone === "correct" ? "bg-green-bg" : cardTone === "wrong" ? "bg-red-bg" : "bg-[#faf3e9]"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <button onClick={goPrev} disabled={idx === 0} className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-muted hover:bg-black/5 hover:text-coffee disabled:opacity-30 disabled:hover:bg-transparent">
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <span className={`font-display text-[0.96rem] font-bold ${cardTone === "correct" ? "text-green" : cardTone === "wrong" ? "text-red" : "text-coffee"}`}>
              Question {idx + 1}
            </span>
            <button onClick={() => idx < order.length - 1 && goNext()} disabled={idx >= order.length - 1} className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-muted hover:bg-black/5 hover:text-coffee disabled:opacity-30 disabled:hover:bg-transparent">
              <ChevronRight className="h-[18px] w-[18px]" />
            </button>
          </div>
          <span className="thaana rounded-full border border-line bg-surface px-3 py-1.5 text-[0.8rem] font-semibold text-coffee">
            {current?.lesson}
          </span>
        </div>

        <div className="px-[22px] py-6">
          <div
            dir={qdir}
            className={`rounded-[14px] p-[18px] text-[1.3rem] font-semibold leading-relaxed transition-colors duration-300 ${qdir === "rtl" ? "thaana border-r-4" : "border-l-4"} ${
              cardTone === "correct" ? "border-green bg-[#eef5e6]" : cardTone === "wrong" ? "border-red bg-[#f8e9e3]" : "border-coffee bg-[#f7efe3]"
            }`}
          >
            {current?.question}
          </div>

          {showAnswer && current && (
            <div dir={adir} className={`mt-[18px] animate-rise rounded-[14px] bg-green-bg p-[18px] ${adir === "rtl" ? "border-r-4" : "border-l-4"} border-green`}>
              <div className="mb-2.5 font-display text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-green">Answer · ޖަވާބު</div>
              <AnswerView answer={current.answer} />
            </div>
          )}

          {!showAnswer ? (
            <div className="mt-[22px] flex justify-center">
              <button onClick={() => setShowAnswer(true)} className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-coffee to-coffee-deep px-7 py-3.5 font-extrabold text-white shadow-warm-sm transition hover:brightness-110 active:translate-y-px">
                <Eye className="h-5 w-5" /> Reveal answer
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap justify-center gap-[11px]">
                <button onClick={() => mark(false)} className={`inline-flex items-center gap-2 rounded-[13px] px-[22px] py-3 font-extrabold transition ${st === "wrong" ? "bg-red text-white" : "border-[1.5px] border-red-line bg-red-bg text-red"}`}>
                  <X className="h-4 w-4" /> Got it wrong
                </button>
                <button onClick={() => mark(true)} className={`inline-flex items-center gap-2 rounded-[13px] px-[22px] py-3 font-extrabold transition ${st === "correct" ? "bg-green text-white" : "border-[1.5px] border-green-line bg-green-bg text-green"}`}>
                  <Check className="h-4 w-4" /> Got it right
                </button>
              </div>
              {st && (
                <div className="mt-5 flex justify-center">
                  <button onClick={goNext} className="inline-flex items-center gap-2 rounded-[14px] bg-coffee px-7 py-3.5 font-extrabold text-white transition hover:brightness-110">
                    {idx < order.length - 1 ? (
                      <>Next question <ArrowRight className="h-5 w-5" /></>
                    ) : (
                      "See results"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[0.78rem] text-muted">
        <Kbd>Space</Kbd> reveal · <Kbd>←</Kbd> <Kbd>→</Kbd> move · <Kbd>R</Kbd>/<Kbd>W</Kbd> mark
      </p>

      {navigator}
    </div>
  );
}

function ModeBar({ mode, wrongTotal, onMode, onReset }: { mode: Mode; wrongTotal: number; onMode: (m: Mode) => void; onReset: () => void; }) {
  const base = "inline-flex items-center gap-2 rounded-[11px] border-[1.5px] px-[15px] py-2.5 text-[0.9rem] font-bold transition";
  const off = "border-line bg-surface text-coffee-deep hover:border-caramel";
  const on = "border-coffee bg-coffee text-white";
  return (
    <div className="mb-[18px] flex flex-wrap justify-center gap-[9px]">
      <button onClick={() => onMode("random")} className={`${base} ${mode === "random" ? on : off}`}>
        <Shuffle className="h-4 w-4" /> Random
      </button>
      <button onClick={() => onMode("sequential")} className={`${base} ${mode === "sequential" ? on : off}`}>
        <ListOrdered className="h-4 w-4" /> Sequential
      </button>
      <button onClick={() => onMode("wrongOnly")} className={`${base} ${mode === "wrongOnly" ? on : off}`}>
        <AlertCircle className="h-4 w-4" /> Review wrong ({wrongTotal})
      </button>
      <button onClick={onReset} className={`${base} border-line bg-surface text-muted hover:border-caramel`}>
        <RotateCcw className="h-4 w-4" /> Reset
      </button>
    </div>
  );
}

function AnswerView({ answer }: { answer: Question["answer"] }) {
  if (Array.isArray(answer)) {
    return (
      <ul className="thaana flex flex-col gap-2.5">
        {answer.map((a, i) => (
          <li key={i} className="relative pe-0 ps-6 text-[1.1rem] leading-relaxed before:absolute before:top-[0.65em] before:h-2 before:w-2 before:rounded-full before:bg-caramel before:[inset-inline-start:4px]">
            {typeof a === "string" ? a : JSON.stringify(a)}
          </li>
        ))}
      </ul>
    );
  }
  if (answer && typeof answer === "object") {
    return (
      <div className="space-y-3.5">
        {Object.entries(answer as Record<string, unknown>).map(([k, v], i) => (
          <div key={i}>
            <div className="thaana mb-1.5 font-display font-bold text-green">{k}</div>
            {Array.isArray(v) ? (
              <ul className="thaana flex flex-col gap-2">
                {v.map((x, j) => (
                  <li key={j} className="relative pe-0 ps-6 text-[1.06rem] leading-relaxed before:absolute before:top-[0.65em] before:h-2 before:w-2 before:rounded-full before:bg-caramel before:[inset-inline-start:4px]">
                    {typeof x === "string" ? x : JSON.stringify(x)}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="thaana text-[1.1rem] leading-relaxed">{typeof v === "string" ? v : JSON.stringify(v)}</div>
            )}
          </div>
        ))}
      </div>
    );
  }
  return <div className="thaana text-[1.14rem] leading-relaxed">{String(answer)}</div>;
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded-[5px] border ${swatch}`} />
      {label}
    </span>
  );
}

function DoneStat({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div>
      <b className={`block font-display text-[2.1rem] font-extrabold leading-none ${color}`}>{value}</b>
      <span className="text-[0.78rem] font-bold uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md bg-latte px-1.5 py-0.5 font-display text-[0.76rem] font-bold">{children}</kbd>;
}
