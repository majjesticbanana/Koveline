import unit1 from "@/data/grade9-islam/unit1.json";
import unit2 from "@/data/grade9-islam/unit2.json";
import unit3 from "@/data/grade9-islam/unit3.json";
import unit4 from "@/data/grade9-islam/unit4.json";
import unit5 from "@/data/grade9-islam/unit5.json";
import unit6 from "@/data/grade9-islam/unit6.json";

export interface Question {
  id: number;
  lesson: string;
  question: string;
  answer: string | string[];
}

export interface Unit {
  id: string;
  number: number;
  icon: string;
  title: string; // Dhivehi
  titleEnglish: string;
  subject: string;
  description: string;
  lessons: string[];
  questions: Question[];
}

const ICONS: Record<string, string> = {
  unit1: "🕌",
  unit2: "📖",
  unit3: "⚖️",
  unit4: "🏛️",
  unit5: "🌙",
  unit6: "🤝",
};

const raw = [unit1, unit2, unit3, unit4, unit5, unit6] as Omit<
  Unit,
  "number" | "icon"
>[];

export const units: Unit[] = raw.map((u, i) => ({
  ...u,
  number: i + 1,
  icon: ICONS[u.id] ?? "📚",
}));

export const subject = {
  id: "grade9-islam",
  title: "Grade 9 Islam",
  titleDhivehi: "ގްރޭޑް 9 އިސްލާމް",
  credit: {
    dhivehi: "އިސްކަންދަރު ސްކޫލް - އިސްލާމް ޑިޕާޓްމަންޓް",
    english: "Iskandhar School — Islam Department",
  },
};

export function getUnit(id: string): Unit | undefined {
  return units.find((u) => u.id === id);
}

export const totalQuestions = units.reduce(
  (sum, u) => sum + u.questions.length,
  0,
);

export const totalLessons = units.reduce(
  (sum, u) => sum + u.lessons.length,
  0,
);
