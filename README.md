# Koveline

Warm, friendly flashcard quizzes for Maldivian students. Read a question,
flip the card for the answer, mark what you've got, and review what you
missed — built in coffee-and-beige.

This is a [Next.js](https://nextjs.org) (App Router) project.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build for production

```bash
npm run build
npm start
```

## Deploy

This deploys to [Vercel](https://vercel.com) with zero config: push the repo
to GitHub and import it, or run `npx vercel`. It also runs on any host that
supports Next.js 14.

## Project structure

```
app/
  layout.tsx                         Root layout, fonts, navbar
  page.tsx                           Home — hero + unit grid
  not-found.tsx                      Friendly 404
  globals.css                        Theme variables + base styles
  quizzes/grade9-islam/[unit]/page.tsx   One dynamic route for all 6 units
components/
  navbar.tsx                         Top bar / wordmark
  quiz-container.tsx                 The flashcard engine (client component)
lib/
  quizzes.ts                         Loads + types the unit data
data/grade9-islam/
  unit1.json … unit6.json            Your quiz content (questions + answers)
```

## Adding a new unit or subject

1. Drop a new `unitN.json` into `data/grade9-islam/` (same shape as the
   others: `id`, `title`, `titleEnglish`, `description`, `lessons`,
   `questions`).
2. Import it in `lib/quizzes.ts` and add it to the `raw` array.
   Everything else — the card, the route, the counts — updates automatically.

## Theme

All colors live in `tailwind.config.ts` under `theme.extend.colors`
(`coffee`, `caramel`, `cream`, `latte`, `espresso`, …). Change them there
once and the whole site follows.

## Content attribution

All Grade 9 Islam quiz content is sourced from school preparation materials.
Full credit to the **Iskandhar School Islam Department**.
