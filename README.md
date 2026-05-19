# LeanLingo

Open Lean 4 flashcard trainer. Practice from the official Lean books anywhere — subway, gym, line at the store.

**Live at:** [leanlingo.org](https://leanlingo.org)

- No accounts, no servers, no tracking — every chapter is open, jump anywhere
- Local-only streak, XP, and level progression (stored in your browser; nothing leaves your device)
- 20 chapters, 67 units, 149 lessons, 405 questions
- An optional "Code in Lean 4" practice exercise at the end of every chapter — copy the starter code, jump to the official [Lean Web Editor](https://live.lean-lang.org), write your attempt against the real Lean kernel
- Drawn from [Theorem Proving in Lean 4](https://lean-lang.org/theorem_proving_in_lean4/) and [Functional Programming in Lean](https://lean-lang.org/functional_programming_in_lean/)
- Pure static SPA — questions ship in the build, no backend, works offline after first load
- Mobile-first three-screen navigation: chapter list → unit list → zig-zag lesson path → lesson runner
- Light + dark themes, toggle in the top-right of any page

## Run locally

```bash
git clone https://github.com/kjusino/leanlingo
cd leanlingo
npm install
npm run dev          # http://localhost:5173
```

## Build

```bash
npm run audit        # check every question is renderable
npm run typecheck    # tsc -b
npm run build        # writes ./dist
npm run preview      # serve ./dist locally
```

## Fork your own

LeanLingo is MIT-licensed. To make your own version (different topic, different book):

1. **Fork** this repo.
2. Edit `src/data/questions.json` — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for the schema. Each row is one question with a type (`MC`, `FIB`, `PO`, `SE`, `ORD`), a prompt, code snippet, options, answer, explanation, and book reference.
3. Edit `src/data/worlds.json` to rename chapters.
4. Replace `public/CNAME` with your own domain (or delete it to use `<you>.github.io/leanlingo/`).
5. In your repo's **Settings → Pages**, set **Source** to **GitHub Actions**.
6. Push to `master`. The workflow builds + deploys. Done.

If you use a custom domain, point its DNS at GitHub:

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `<you>.github.io` |

GitHub auto-issues a free Let's Encrypt cert once DNS resolves.

## Navigation model

Each curriculum row in `questions.json` belongs to a `world` → `unit` → `lesson`. That same hierarchy drives the four URL patterns:

| URL | Screen |
|---|---|
| `/` | Chapter list (one card per world, with progress) |
| `/w/:worldId` | Unit list inside a chapter (regular units + an optional "Code in Lean 4" row) |
| `/w/:worldId/u/:unitId` | Zig-zag path of lesson buttons in a unit |
| `/w/:worldId/u/:unitId/l/:lessonId` | Lesson runner (one question at a time) |
| `/w/:worldId/practice` | Optional coding exercise — copy starter code, open Lean Web Editor |
| `/about` | About + attribution |

Per-user progress is persisted to `localStorage` under three keys — `leanlingo:completed:lessons`, `leanlingo:xp`, and `leanlingo:streak`. There is no server, no account, nothing to sign up for. Clearing site data resets everything.

**XP rules** (all numbers tunable in `src/components/LessonRunner.tsx`):

| Event | XP |
|---|---|
| Correct answer, first try | +10 |
| Correct answer, retry | +5 |
| Wrong on every attempt or skipped | 0 |
| Lesson completion (first time) | +25 |
| Perfect lesson — every question correct first try, no skips | +50 |
| Replay of an already-completed lesson | 0 |

**Level curve**: `level = floor(sqrt(xp / 100)) + 1` — L2 at 100 XP, L3 at 400, L4 at 900, L10 at 8100.

**Streak**: strict — any calendar-day gap resets to 1 on the next lesson completion. Same-day replays are idempotent.

## Practice exercises

Each chapter ends with an optional **Code in Lean 4** card. Each card pairs a short book-aligned exercise with starter code; one click copies the code to the clipboard, the next opens the official [Lean Web Editor](https://live.lean-lang.org) — which runs Lean as WebAssembly entirely client-side — where the user pastes and writes the solution against Lean's real goal and error panels.

Practice exercises live in [`src/data/practice.json`](src/data/practice.json) — one entry per world, schema:

```json
{
  "id": "w1-practice",
  "world": "w1",
  "title": "joinStringsWith and volume",
  "prompt": "...",
  "starterCode": "def ... := sorry",
  "book_ref": "FPIL §1.3",
  "source_url": "https://lean-lang.org/..."
}
```

Marking a practice exercise as done awards +25 XP the first time and bumps the streak (same as any other lesson completion). Practice doesn't count toward a chapter's completion percentage — it's optional.

## Project layout

```
src/
  main.tsx              entry
  App.tsx               router (5 routes)
  routes/               top-level pages
    WorldsList.tsx      / — chapter grid (homepage)
    UnitsList.tsx       /w/:worldId — units inside a chapter (incl. practice row)
    UnitPath.tsx        /w/:worldId/u/:unitId — Duolingo-style zig-zag path
    LessonPage.tsx      /w/:worldId/u/:unitId/l/:lessonId — lesson runner
    PracticePage.tsx    /w/:worldId/practice — coding exercise + Lean editor handoff
    About.tsx           /about — about + attribution
  components/
    QuestionCard.tsx    renders one question (MC / FIB / PO / SE / ORD)
    LessonRunner.tsx    walks through questions in a lesson, shows summary
    StatsCard.tsx       streak / XP / level card on the home page
    ThemeToggle.tsx     light/dark switch, fixed top-right
    LeanCode.tsx        small in-house Lean syntax highlighter
  data/
    questions.json      ← the curriculum (one row per question)
    worlds.json         ← chapter titles + blurbs
    practice.json       ← one coding exercise per chapter
  lib/
    tree.ts             builds World→Unit→Lesson tree from flat questions
    progress.ts         localStorage progress (completion, XP, streak, level)
    practice.ts         practice-exercise lookup + Lean editor URL constant
    worldColor.ts       one HSL accent hue per chapter
  styles/
    leanlingo.css       all styling (no framework, no UI library)
scripts/
  audit.ts              answerability audit (run in CI)
.github/workflows/
  deploy.yml            CI: audit, typecheck, build, deploy to GitHub Pages
```

## Tech

- Vite + React 18 + TypeScript
- react-router-dom v6
- No CSS framework, no UI library
- No backend, no database, no analytics, no cookies

## License

MIT. See [LICENSE](LICENSE).

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
