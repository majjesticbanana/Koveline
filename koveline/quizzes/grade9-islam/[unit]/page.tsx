import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { units, getUnit } from "@/lib/quizzes";
import { QuizContainer } from "@/components/quiz-container";

export function generateStaticParams() {
  return units.map((u) => ({ unit: u.id }));
}

export function generateMetadata({ params }: { params: { unit: string } }) {
  const unit = getUnit(params.unit);
  if (!unit) return { title: "Quiz — Koveline" };
  return {
    title: `${unit.titleEnglish} · Unit ${unit.number} — Koveline`,
    description: `Quiz: ${unit.titleEnglish}, Grade 9 Islam.`,
  };
}

export default function UnitQuizPage({ params }: { params: { unit: string } }) {
  const unit = getUnit(params.unit);
  if (!unit) notFound();

  return (
    <main className="mx-auto max-w-[720px] px-[22px] pb-16">
      <div className="flex items-center gap-3.5 pb-1 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-bold text-muted transition-colors hover:text-coffee"
        >
          <ArrowLeft className="h-4 w-4" />
          All units
        </Link>
      </div>

      <div className="mb-4 mt-2 text-center">
        <div className="thaana text-[1.9rem] font-bold leading-snug">{unit.title}</div>
        <div className="mt-1 font-display font-semibold text-coffee">{unit.titleEnglish}</div>
        <div className="mt-0.5 text-[0.86rem] font-bold text-muted">
          Grade 9 Islam · Unit {unit.number} · {unit.questions.length} questions
        </div>
      </div>

      <QuizContainer unit={unit} />

      <footer className="pb-4 pt-9 text-center text-[0.84rem] text-muted">
        Made for Maldivian students · <b className="font-display text-coffee">Koveline</b>
      </footer>
    </main>
  );
}
