"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { units, subject, type Unit } from "@/lib/quizzes";
import { totalDefinitions } from "@/lib/definitions";

function unitProgress(u: Unit): number {
  try {
    const raw = localStorage.getItem(`koveline-progress-${u.id}`);
    if (!raw) return 0;
    const s = JSON.parse(raw).status || {};
    return Object.keys(s).length / u.questions.length;
  } catch {
    return 0;
  }
}

const SPARKS = [
  { left: "14%", top: "32%", size: 6, delay: ".2s", c: "#be824b" },
  { left: "83%", top: "28%", size: 5, delay: "1.1s", c: "#15706a" },
  { left: "23%", top: "66%", size: 4, delay: ".7s", c: "#15706a" },
  { left: "78%", top: "68%", size: 6, delay: "1.7s", c: "#be824b" },
];

export function Landing() {
  const router = useRouter();
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const p: Record<string, number> = {};
    units.forEach((u) => (p[u.id] = unitProgress(u)));
    setProgress(p);
  }, []);

  return (
    <main className="mx-auto max-w-[920px] px-[22px] pb-16">
      {/* Hero */}
      <section className="hero">
        <div className="glow" />
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="spark"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, background: s.c, animationDelay: s.delay }}
          />
        ))}
        <div className="relative z-[1] w-full">
          <div className="welcome">Welcome to</div>
          <h1 className="koveline">Koveline</h1>
          <span className="uline" />
          <p className="tag">
            Study for Islam Grade 9. <i>More in the future?</i>
          </p>
        </div>
      </section>

      {/* Definitions — second quiz */}
      <Link
        href="/definitions"
        className="group relative flex items-center gap-4 overflow-hidden rounded-[22px] border border-lagoon-soft bg-gradient-to-br from-lagoon-soft to-[#eef1ea] p-[22px] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-warm"
      >
        <span className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-[16px] bg-lagoon text-2xl text-white shadow-warm-sm">📖</span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[0.74rem] font-bold tracking-wide text-lagoon-deep">NEW · A SECOND QUIZ</div>
          <h3 className="font-display text-[1.3rem] font-bold leading-tight">Definitions</h3>
          <p className="text-[0.92rem] text-muted">Flashcard every key term — Grade 9 &amp; 10 · {totalDefinitions} terms</p>
        </div>
        <span className="text-[1.3rem] text-lagoon transition-transform group-hover:translate-x-1">→</span>
      </Link>

      {/* Units */}
      <div id="units" className="mb-5 mt-[34px] flex items-baseline gap-3.5">
        <h2 className="font-display text-2xl font-bold tracking-tight">Units</h2>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(252px,1fr))]">
        {units.map((u) => {
          const pct = Math.round((progress[u.id] ?? 0) * 100);
          return (
            <button
              key={u.id}
              onClick={() => router.push(`/quizzes/grade9-islam/${u.id}`)}
              className="group relative overflow-hidden rounded-[22px] border border-line bg-surface p-[22px] text-left transition-all duration-200 hover:-translate-y-[5px] hover:border-caramel hover:shadow-warm"
            >
              <span className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-caramel transition-transform duration-300 group-hover:scale-y-100" />
              <div className="mb-[15px] flex items-center gap-3">
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-[14px] bg-latte text-2xl">
                  {u.icon}
                </span>
                <div className="font-display text-[0.74rem] font-bold tracking-wide text-lagoon-deep">UNIT {u.number}</div>
              </div>
              <h3 className="thaana mb-2 text-right text-[1.5rem] font-bold leading-[1.55]">{u.title}</h3>
              <p className="thaana mb-4 min-h-[3.4em] text-right text-[0.96rem] text-muted">{u.description}</p>
              <div className="flex items-center gap-2 text-[0.88rem] font-bold text-coffee">
                <span>{u.questions.length} questions</span>
                <span className="ml-auto text-[0.78rem] font-medium text-muted">{pct > 0 ? `${pct}% done` : ""}</span>
                <span className="text-[1.1rem] text-caramel transition-transform group-hover:translate-x-1">→</span>
              </div>
              <div className="mt-[13px] h-[5px] overflow-hidden rounded-full bg-latte">
                <i className="block h-full rounded-full bg-gradient-to-r from-coffee to-caramel" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Attribution */}
      <div className="mt-[40px] rounded-[22px] border border-line bg-gradient-to-br from-surface to-[#f6ece0] p-7 text-center">
        <div className="mb-[9px] font-display text-[0.76rem] font-bold uppercase tracking-[0.09em] text-lagoon-deep">
          Where the questions come from
        </div>
        <div className="thaana mb-0.5 text-[1.12rem] font-bold">{subject.credit.dhivehi}</div>
        <div className="text-[0.93rem] text-muted">{subject.credit.english}</div>
        <p className="mx-auto mt-[11px] max-w-[48ch] text-[0.82rem] text-muted">
          All the questions come from the school&apos;s Islam Q&amp;A papers. Credit to the Iskandhar School Islam Department. (Not made by me!)
        </p>
      </div>

      <footer className="pb-12 pt-[34px] text-center text-[0.84rem] text-muted">Made by Yoonus.</footer>
    </main>
  );
}
