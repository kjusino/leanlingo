# LeanLingo

Open Lean 4 flashcard trainer. Practice from the official Lean books anywhere — subway, gym, line at the store.

**Live at:** [leanlingo.org](https://leanlingo.org)

- No accounts, no streaks, no tracking — every world is open, jump anywhere
- 13 worlds, 112 lessons, 304+ questions
- Drawn from [Theorem Proving in Lean 4](https://lean-lang.org/theorem_proving_in_lean4/) and [Functional Programming in Lean](https://lean-lang.org/functional_programming_in_lean/)
- Pure static SPA — questions ship in the build, no backend, works offline after first load

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

## Project layout

```
src/
  main.tsx              entry
  App.tsx               router
  routes/               top-level pages
    ChapterIndex.tsx    open chapter index (homepage)
    WorldPage.tsx       unit + lesson list
    LessonPage.tsx      lesson runner
    About.tsx           about + attribution
  components/
    Header.tsx
    QuestionCard.tsx    renders one question (MC / FIB / PO / SE / ORD)
    LessonRunner.tsx    walks through questions in a lesson
    LeanCode.tsx        small in-house Lean syntax highlighter
  data/
    questions.json      ← the curriculum
    worlds.json         ← world titles + blurbs
  lib/
    tree.ts             builds World→Unit→Lesson tree from flat questions
  styles/
    leanlingo.css
scripts/
  audit.ts              answerability audit (run in CI)
.github/workflows/
  deploy.yml            CI: lint, audit, build, deploy to GitHub Pages
```

## Tech

- Vite + React 18 + TypeScript
- react-router-dom v6
- No CSS framework, no UI library
- No backend, no database, no analytics, no cookies

## License

MIT. See [LICENSE](LICENSE).

Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
