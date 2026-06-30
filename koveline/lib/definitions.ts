import data from "@/data/definitions.json";

export interface Definition {
  id: string;
  grade: number;
  unitNo: number;
  unit: string;
  lesson: string;
  term: string;
  aspect: string;
  answer: string;
}

export const definitions: Definition[] = data.entries as Definition[];

// distinct unit titles keyed by unitNo (titles are shared across grades)
export const units: { no: number; title: string }[] = (() => {
  const seen = new Map<number, string>();
  definitions.forEach((d) => {
    if (!seen.has(d.unitNo)) seen.set(d.unitNo, d.unit);
  });
  return Array.from(seen.entries()).sort((a, b) => a[0] - b[0]).map(([no, title]) => ({ no, title }));
})();

export const grades = [9, 10] as const;
export const totalDefinitions = definitions.length;

export function countFor(grade: number | "all", unitNo: number | "all"): number {
  return definitions.filter(
    (d) => (grade === "all" || d.grade === grade) && (unitNo === "all" || d.unitNo === unitNo),
  ).length;
}
