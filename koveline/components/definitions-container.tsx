"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye, Check, X, Shuffle, ListOrdered, AlertCircle, RotateCcw,
  ChevronLeft, ChevronRight, Save, ArrowRight, Search, LayoutList,
} from "lucide-react";
import { definitions, units, type Definition } from "@/lib/definitions";

type Mode = "random" | "sequential" | "wrongOnly";
type Status = Record<string, "correct" | "wrong">;
const KEY = "koveline-defs-progress";

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function DefinitionsContainer() {
  const [loaded, setLoaded] = useState(false);
  const [grade, setGrade] = useState<number | "all">("all");
  const [unitNo, setUnitNo] = useState<number | "all">("all");
  const [mode, setMode] = useState<Mode>("sequential");
  const [status, setStatus] = useState<Status>({});
  const [idx, setIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [complete, setComplete] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState("");

  // load saved progress + filters once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.status && typeof s.status === "object") setStatus(s.status);
        if (s.grade === "all" || s.grade === 9 || s.grade === 10) setGrade(s.grade);
        if (s.unitNo === "all" || typeof s.unitNo === "number") setUnitNo(s.unitNo);
        if (["random", "sequential", "wrongOnly"].includes(s.mode)) setMode(s.mode);
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  // base filtered set (by grade + unit), in source order
  const filtered = useMemo(
    () =>
      definitions.filter(
        (d) => (grade === "all" || d.grade === grade) && (unitNo === "all" || d.unitNo === unitNo),
      ),
    [grade, unitNo],
  );

  // deck = filtered, restricted by mode (wrongOnly), then ordered
  const deck = useMemo(() => {
    let list = filtered;
    if (mode === "wrongOnly") list = list.filter((d) => status[d.id] === "wrong");
    return mode === "random" ? shuffle(list) : list;
    // re-shuffle only when these change:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, mode]);

  // persist
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ status, grade, unitNo, mode }));
    } catch {
      /* ignore */
    }
  }, [status, grade, unitNo, mode, loaded]);

  // keep idx in range when deck changes
  useEffect(() => {
    setIdx((i) => Math.min(i, Math.max(deck.length - 1, 0)));
  }, [deck.length]);

  const cur = deck[idx];
  const counts = useMemo(() => {
    let c = 0, w = 0;
    deck.forEach((d) => {
      const s = status[d.id];
      if (s === "correct") c++;
      else if (s === "wrong") w++;
    });
    return { c, w, answered: c + w };
  }, [deck, status]);
  const wrongTotal = useMemo(
    () => filtered.filter((d) => status[d.id] === "wrong").length,
    [filtered, status],
  );

  const resetView = () => { setIdx(0); setShowAnswer(false); setComplete(false); };
  const changeGrade = (g: number | "all") => { setGrade(g); resetView(); };
  const changeUnit = (u: number | "all") => { setUnitNo(u); resetView(); };
  const changeMode = (m: Mode) => { setMode(m); resetView(); };

  const mark = (correct: boolean) => {
    if (!cur) return;
    setStatus((s) => ({ ...s, [cur.id]: correct ? "correct" : "wrong" }));
  };
  const goNext = useCallback(() => {
    if (idx < deck.length - 1) { setIdx(idx + 1); setShowAnswer(false); setComplete(false); }
    else setComplete(true);
  }, [idx, deck.length]);
  const goPrev = () => { if (idx > 0) { setIdx(idx - 1); setShowAnswer(false); setComplete(false); } };
  const goToId = (id: string) => {
    const i = deck.findIndex((d) => d.id === id);
    if (i >= 0) { setIdx(i); setShowAnswer(false); setComplete(false); setNavOpen(false); }
  };
  const resetProgress = () => {
    setStatus({}); setMode("sequential"); resetView();
  };

  // keyboard
  useEffect(() => {
    if (!loaded || complete || navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); showAnswer ? goNext() : setShowAnswer(true); }
      else if (e.code === "ArrowRight" && idx < deck.length - 1) goNext();
      else if (e.code === "ArrowLeft") goPrev();
      else if (showAnswer && (e.key === "r" || e.key === "R")) mark(true);
      else if (showAnswer && (e.key === "w" || e.key === "W")) mark(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, complete, navOpen, showAnswer, idx, deck.length]);

  if (!loaded) {
    return (
      <div className="grid min-h-[200px] place-items-center rounded-3xl border border-line bg-surface">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  // grouped terms for the navigator (by unit, within current deck), filtered by search
  const groups = (() => {
    const q = search.trim();
    const map = new Map<number, { title: string; items: Definition[] }>();
    deck.forEach((d) => {
      if (q && !d.term.includes(q) && !d.answer.includes(q)) return;
      if (!map.has(d.unitNo)) map.set(d.unitNo, { title: d.unit, items: [] });
      map.get(d.unitNo)!.items.push(d);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]).map(([no, g]) => ({ no, ...g }));
  })();

  const navigator = (
    <>
      <div
        onClick={() => setNavOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/50 transition-opacity duration-300 ${navOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-[26px] bg-surface shadow-[0_-20px_50px_-20px_rgba(0,0,0,.35)] transition-transform duration-300 ${navOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ transitionTimingFunction: "cubic-bezier(.22,1,.36,1)" }}
      >
        <div className="border-b border-line px-5 pb-3 pt-4">
          <div className="mx-auto mb-3 h-[5px] w-[46px] rounded-full bg-line" />
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[1.2rem] font-bold">Jump to a term</h3>
            <button onClick={() => setNavOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-coffee">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-2.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms…"
              className="thaana w-full rounded-xl border border-line bg-cream py-2.5 pl-9 pr-3 text-right text-[1.05rem] outline-none focus:border-caramel"
              dir="rtl"
            />
          </div>
        </div>
        <div className="overflow-y-auto px-5 pb-6 pt-3">
          {groups.length === 0 && <p className="py-8 text-center text-muted">No terms match.</p>}
          {groups.map((g) => (
            <div key={g.no} className="mb-4">
              <div className="thaana mb-2 text-right text-[0.95rem] font-bold text-coffee">{g.title}</div>
              <div className="flex flex-wrap justify-end gap-2">
                {g.items.map((d) => {
                  const s = status[d.id];
                  const isCur = cur && d.id === cur.id;
                  const cls = isCur
                    ? "bg-coffee text-white border-coffee"
                    : s === "correct"
                    ? "bg-green-bg border-green-line text-green"
                    : s === "wrong"
                    ? "bg-red-bg border-red-line text-red"
                    : "bg-cream border-line text-ink";
                  return (
                    <button
                      key={d.id}
                      onClick={() => goToId(d.id)}
                      className={`thaana rounded-full border px-3 py-1.5 text-[1.02rem] transition hover:-translate-y-0.5 ${cls}`}
                    >
                      {d.term}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-2 flex flex-wrap gap-4 border-t border-line pt-4 text-[0.8rem] font-semibold text-muted">
            <Legend swatch="bg-coffee border-coffee" label="Current" />
            <Legend swatch="bg-green-bg border-green-line" label="Got it" />
            <Legend swatch="bg-red-bg border-red-line" label="Review" />
            <Legend swatch="bg-cream border-line" label="Not seen" />
          </div>
        </div>
      </div>
    </>
  );

  const filterBar = (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5">
      <select
        value={grade}
        onChange={(e) => changeGrade(e.target.value === "all" ? "all" : Number(e.target.value))}
        className="cursor-pointer rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-bold text-coffee-deep hover:border-caramel"
      >
        <option value="all">All grades</option>
        <option value="9">Grade 9</option>
        <option value="10">Grade 10</option>
      </select>
      <select
        value={unitNo}
        onChange={(e) => changeUnit(e.target.value === "all" ? "all" : Number(e.target.value))}
        className="thaana max-w-[230px] cursor-pointer rounded-full border border-line bg-surface px-3.5 py-2 text-right text-[0.95rem] font-semibold text-coffee-deep hover:border-caramel"
      >
        <option value="all">All units</option>
        {units.map((u) => (
          <option key={u.no} value={u.no}>{u.title}</option>
        ))}
      </select>
    </div>
  );

  if (deck.length === 0) {
    return (
      <div>
        {filterBar}
        <ModeBar mode={mode} wrongTotal={wrongTotal} onMode={changeMode} onReset={resetProgress} />
        <div className="rounded-3xl border border-line bg-surface p-10 text-center shadow-warm">
          <div className="text-5xl">{mode === "wrongOnly" ? "🎉" : "📖"}</div>
          <h3 className="mb-2 mt-3 font-display text-2xl font-extrabold">
            {mode === "wrongOnly" ? "Nothing to review here" : "No terms in this selection"}
          </h3>
          <p className="mb-6 text-muted">
            {mode === "wrongOnly" ? "You haven't marked any of these wrong yet." : "Try a different grade or unit."}
          </p>
          {mode === "wrongOnly" && (
            <button onClick={() => changeMode("sequential")} className="rounded-2xl bg-gradient-to-br from-coffee to-coffee-deep px-6 py-3.5 font-extrabold text-white shadow-warm-sm">
              Back to all
            </button>
          )}
        </div>
        {navigator}
      </div>
    );
  }

  if (complete) {
    const score = deck.length ? Math.round((counts.c / deck.length) * 100) : 0;
    const em = counts.c > counts.w ? "🎉" : counts.c === counts.w ? "👍" : "💪";
    return (
      <div>
        <div className="animate-rise rounded-3xl border border-line bg-surface p-10 text-center shadow-warm">
          <div className="text-[3.2rem]">{em}</div>
          <h3 className="my-2 mb-[18px] font-display text-[1.9rem] font-extrabold">Deck complete!</h3>
          <div className="mb-7 flex flex-wrap justify-center gap-[34px]">
            <DoneStat value={counts.c} label="Got it" color="text-green" />
            <DoneStat value={counts.w} label="Review" color="text-red" />
            <DoneStat value={`${score}%`} label="Score" color="text-coffee" />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={resetView} className="inline-flex items-center gap-2 rounded-[14px] bg-coffee px-6 py-3.5 font-extrabold text-white transition hover:brightness-110">
              <RotateCcw className="h-4 w-4" /> Go again
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

  const st = cur ? status[cur.id] : undefined;
  const tone = st === "correct" ? "correct" : st === "wrong" ? "wrong" : "";
  const pct = deck.length ? Math.round((counts.answered / deck.length) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-1.5 text-[0.78rem] text-muted">
        <Save className="h-3 w-3 opacity-70" /> Progress auto-saved
      </div>

      {filterBar}

      {/* stat bar */}
      <div className="mb-4 flex flex-wrap justify-center gap-[11px]">
        <button onClick={() => setNavOpen(true)} className="inline-flex items-center gap-2.5 rounded-[13px] border border-line bg-surface px-4 py-2.5 font-semibold transition hover:border-caramel">
          <LayoutList className="h-4 w-4 text-muted" />
          <span className="text-[0.9rem] text-muted">Term:</span>
          <span className="font-display font-extrabold text-coffee">{idx + 1}</span>
          <span className="text-muted">/</span>
          <span className="font-bold">{deck.length}</span>
        </button>
        <span className="inline-flex items-center gap-2 rounded-[13px] border border-green-line bg-green-bg px-4 py-2.5 font-display font-extrabold text-green">
          <Check className="h-4 w-4" /> {counts.c}
        </span>
        <span className="inline-flex items-center gap-2 rounded-[13px] border border-red-line bg-red-bg px-4 py-2.5 font-display font-extrabold text-red">
          <X className="h-4 w-4" /> {counts.w}
        </span>
      </div>

      <div className="mb-[18px] h-[9px] overflow-hidden rounded-full bg-latte">
        <i className="block h-full rounded-full bg-gradient-to-r from-coffee to-caramel transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>

      <ModeBar mode={mode} wrongTotal={wrongTotal} onMode={changeMode} onReset={resetProgress} />

      {/* card */}
      <div
        className={`animate-fade overflow-hidden rounded-[24px] border-2 shadow-warm transition-colors duration-300 ${
          tone === "correct" ? "border-green-line bg-[#f4f8ee]" : tone === "wrong" ? "border-red-line bg-[#fbf0eb]" : "border-line bg-surface"
        }`}
      >
        <div className={`flex items-center justify-between border-b border-line px-[18px] py-3 transition-colors duration-300 ${tone === "correct" ? "bg-green-bg" : tone === "wrong" ? "bg-red-bg" : "bg-[#faf3e9]"}`}>
          <div className="flex items-center gap-1.5">
            <button onClick={goPrev} disabled={idx === 0} className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-muted hover:bg-black/5 hover:text-coffee disabled:opacity-30 disabled:hover:bg-transparent">
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <span className={`font-display text-[0.9rem] font-bold ${tone === "correct" ? "text-green" : tone === "wrong" ? "text-red" : "text-coffee"}`}>
              Grade {cur.grade}
            </span>
            <button onClick={() => idx < deck.length - 1 && goNext()} disabled={idx >= deck.length - 1} className="grid h-[34px] w-[34px] place-items-center rounded-[9px] text-muted hover:bg-black/5 hover:text-coffee disabled:opacity-30 disabled:hover:bg-transparent">
              <ChevronRight className="h-[18px] w-[18px]" />
            </button>
          </div>
          <span className="thaana rounded-full border border-line bg-surface px-3 py-1.5 text-[0.8rem] font-semibold text-coffee">{cur.unit}</span>
        </div>

        <div className="px-[22px] py-7 text-center">
          <div className="mb-2 font-display text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-muted">Define this term</div>
          <div className="thaana text-[2rem] font-bold leading-snug">{cur.term}</div>
          {cur.aspect && (
            <div className="thaana mt-3 inline-block rounded-full border border-lagoon-soft bg-lagoon-soft px-3.5 py-1 text-[0.92rem] font-semibold text-lagoon-deep" dir="rtl">
              {cur.aspect}
            </div>
          )}

          {showAnswer && (
            <div dir="rtl" className="mt-6 animate-rise rounded-[14px] border-r-4 border-green bg-green-bg p-[18px] text-right">
              <div className="mb-2.5 font-display text-[0.72rem] font-extrabold uppercase tracking-[0.08em] text-green">Definition</div>
              <div className="thaana text-[1.18rem] leading-loose">{cur.answer}</div>
            </div>
          )}

          {!showAnswer ? (
            <div className="mt-7 flex justify-center">
              <button onClick={() => setShowAnswer(true)} className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-coffee to-coffee-deep px-7 py-3.5 font-extrabold text-white shadow-warm-sm transition hover:brightness-110 active:translate-y-px">
                <Eye className="h-5 w-5" /> Show definition
              </button>
            </div>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap justify-center gap-[11px]">
                <button onClick={() => mark(false)} className={`inline-flex items-center gap-2 rounded-[13px] px-[22px] py-3 font-extrabold transition ${st === "wrong" ? "bg-red text-white" : "border-[1.5px] border-red-line bg-red-bg text-red"}`}>
                  <X className="h-4 w-4" /> Review
                </button>
                <button onClick={() => mark(true)} className={`inline-flex items-center gap-2 rounded-[13px] px-[22px] py-3 font-extrabold transition ${st === "correct" ? "bg-green text-white" : "border-[1.5px] border-green-line bg-green-bg text-green"}`}>
                  <Check className="h-4 w-4" /> Got it
                </button>
              </div>
              {st && (
                <div className="mt-5 flex justify-center">
                  <button onClick={goNext} className="inline-flex items-center gap-2 rounded-[14px] bg-coffee px-7 py-3.5 font-extrabold text-white transition hover:brightness-110">
                    {idx < deck.length - 1 ? (<>Next term <ArrowRight className="h-5 w-5" /></>) : "See results"}
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
      <button onClick={() => onMode("random")} className={`${base} ${mode === "random" ? on : off}`}><Shuffle className="h-4 w-4" /> Random</button>
      <button onClick={() => onMode("sequential")} className={`${base} ${mode === "sequential" ? on : off}`}><ListOrdered className="h-4 w-4" /> In order</button>
      <button onClick={() => onMode("wrongOnly")} className={`${base} ${mode === "wrongOnly" ? on : off}`}><AlertCircle className="h-4 w-4" /> Review wrong ({wrongTotal})</button>
      <button onClick={onReset} className={`${base} border-line bg-surface text-muted hover:border-caramel`}><RotateCcw className="h-4 w-4" /> Reset</button>
    </div>
  );
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
