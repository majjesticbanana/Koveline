import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { totalDefinitions } from "@/lib/definitions";
import { DefinitionsContainer } from "@/components/definitions-container";

export const metadata = {
  title: "Definitions — Koveline",
  description: "Flashcard the key Islam definitions for Grade 9 & 10.",
};

export default function DefinitionsPage() {
  return (
    <main className="mx-auto max-w-[720px] px-[22px] pb-16">
      <div className="flex items-center gap-3.5 pb-1 pt-6">
        <Link href="/" className="inline-flex items-center gap-1.5 font-bold text-muted transition-colors hover:text-coffee">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </div>
      <div className="mb-4 mt-2 text-center">
        <div className="font-display text-[1.9rem] font-extrabold">Definitions</div>
        <div className="mt-0.5 text-[0.86rem] font-bold text-muted">
          Grade 9 &amp; 10 Islam · {totalDefinitions} terms
        </div>
      </div>
      <DefinitionsContainer />
      <footer className="pb-4 pt-9 text-center text-[0.84rem] text-muted">
        Made by Yoonus.
      </footer>
    </main>
  );
}
