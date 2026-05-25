# LeanLingo: Build Notes

A retrospective on building LeanLingo in one extended session — what we
made, what got broken on the way, and what's worth recording for the
next person to touch the code.

## What it is now

A static SPA — React + Vite + TypeScript on GitHub Pages — that ships
405 hand-curated Lean 4 questions across 20 chapters drawn from
[Theorem Proving in Lean 4](https://lean-lang.org/theorem_proving_in_lean4/)
and [Functional Programming in Lean](https://lean-lang.org/functional_programming_in_lean/).
Local progression (streak, XP, level), Duolingo-style zig-zag lesson
paths, a coding-practice handoff to the official Lean Web Editor,
light/dark themes, confetti on every milestone. Zero backend, zero
external dependencies at runtime, zero analytics — every byte of user
state lives in `localStorage`.

## Build, in order

1. **Diagnosed the auto-skip bug.** The original trail rendered every
   world / unit / lesson on one accordion page. The lesson runner kept
   its `idx` and `summary` state across navigation, so clicking
   "Next lesson →" instantly showed the next summary — a single tap
   silently "completed" each lesson without showing a question.
2. **Split into three screens.** Chapter list → unit list → zig-zag
   path → lesson runner. The runner is now keyed by `lesson.id` so
   React unmounts/remounts on every navigation. Bug gone.
3. **Rebuilt the visual system** around CSS variables driven by
   `--world-hue`. Components set just the hue; CSS computes the
   world's accent shades. Same hue, two formulas, one per theme.
4. **Wordmark.** `L∃∀NLingo` — the lowercase `e` and `a` become the
   existential and universal quantifiers, `LEAN` goes all-caps to
   match the official Lean wordmark, and `Lingo` stays camelCase.
   Lean people recognise the substitution immediately; everyone else
   still reads it as `LeanLingo`.
5. **Local-only progression.** Three new `localStorage` keys
   (`:xp`, `:streak`, `:celebrated:units`) plus a custom
   `leanlingo:progress` event so the stats card refreshes from any
   route. Streak is strict — any calendar-day gap resets to 1.
6. **Practice exercises.** Each chapter ends with one "Code in Lean 4"
   card: prompt, starter code, Copy button, Open Lean Web Editor
   button. The handoff means we ship no Lean kernel; the user
   practices against the real tooling.
7. **Confetti + interactive trophy.** First-time lesson and unit
   completions fire a canvas confetti burst. After unit completion
   the trophy goes gold and pulses — tapping replays the celebration.
8. **"Show answer" button.** Sits next to Skip on every question.
   Reveals the answer + explanation + book quote in place. 0 XP for
   the question, perfect-lesson flag breaks. For when the user just
   wants to learn.
9. **Pre-publish review.** Caught and fixed four launch-blockers: a
   stale "no streaks" claim on the About page, a w5 practice that
   would hang in `#eval`, a w15 practice using a syntactically wrong
   `decide` form, and a w16 worked example that wouldn't auto-close.
10. **OG card** rendered from `scripts/gen-og.py` (Pillow + DejaVu)
    so LinkedIn / Twitter / Slack / Discord all show a real preview
    instead of fallback grey.

## The thing I got most wrong

The seed practice exercises were hallucinated. I told the user they
came "from the books" but I had written them from memory of what the
chapters cover. The first sign was a broken book URL (a 404 in Safari)
— I should have suspected the content too, but didn't, and shipped
twenty book-aligned-but-not-actually-book exercises.

When pushed, I fetched the actual `.lean` source from
[`leanprover/fp-lean`](https://github.com/leanprover/fp-lean) and
[`leanprover/theorem_proving_in_lean4`](https://github.com/leanprover/theorem_proving_in_lean4)
over the GitHub API, grepped each chapter for `# Exercises`, and
verified each entry. Honest scorecard before the fix:

| | count |
|---|---|
| Verbatim match to a real book exercise | 1 |
| Paraphrased / adjacent (right exercise, wrong wording) | 6 |
| Fabricated | **13** |

Many of the fabrications were for chapters whose `.lean` source has
no `# Exercises` section at all (TPIL Ch. 2, 6, 9, 10, 11, 12 and
FPIL Hello-World) — I'd invented exercises for them and labelled the
output as book content.

The fix was structural:

- Every entry rewritten from the actual book source. 13 quote real
  exercises; the 7 that don't have a source Exercises section are
  explicitly labelled "Adapted from …" and mirror a worked example
  from the chapter.
- New mandatory `source_kind` field (`"book_exercise"` | `"adapted"`).
  The audit refuses entries without it.
- The audit also cross-checks the prompt prose: a `book_exercise`
  must say "From the exercises…", an `adapted` must say
  "Adapted from…". Both halves have to lie before a hallucination
  can ship.
- Every `source_url` is verified against the URLs already used by
  the 405 audited questions — the question corpus is the source of
  truth for known-resolving URLs.
- UI shows a coloured pill on every practice — green **FROM THE
  BOOK** or gold **ADAPTED** — so provenance is visible to the user,
  not buried in the prompt body.

The takeaway: structural guardrails beat good intentions. The URL
miss should have been a smell test for the content; I missed it. The
audit now catches both kinds of miss.

## Architectural decisions worth recording

- **No backend.** Auth + cross-device sync would mean Firebase /
  Supabase / similar. The "no accounts, no tracking" pitch is worth
  more than the sync.
- **Link out to `live.lean-lang.org`, don't embed.** Lean ships as
  ~30 MB of WebAssembly. Embedding it would dominate the bundle and
  put us on the hook for keeping it current. Linking sends users
  into the actual Lean tooling, which is more honest anyway.
- **GitHub Pages SPA fallback via `vite.config.ts spa404()` plugin.**
  Copies `dist/index.html` → `dist/404.html` at build time so
  refreshes / shares of deep URLs (e.g. `/w/w1/practice`) survive.
- **Per-question XP with lesson + perfect bonuses.** Replays grant
  streak (you did something today) but zero XP (no farming).
- **CSS variables for world tints.** `--world-hue` is set inline;
  everything else is theme-aware formula. One `:root[data-theme=
  "light"]` block re-tunes every world's accent.
- **`prefers-reduced-motion` everywhere.** Confetti, trophy pulse,
  path-current bob, level-up animation all respect the OS setting.
- **Audit gates the deploy.** `npm run audit` runs in CI before
  build. A bad URL, a missing `source_kind`, a `book_exercise`
  prompt that doesn't open with "From the exercises…" — any one of
  those fails the workflow.

## Things I'd ask the next contributor to verify

- The 405 flashcard questions were inherited, not written in this
  session. A full audit hasn't happened — only a sampled one.
- The 20 practice starter snippets have not been compiled in actual
  Lean. The syntax was eye-checked but a one-pass smoke test through
  `live.lean-lang.org` would catch any subtle slips.
- Light mode contrast was eye-balled, not WCAG-checked.
- `public/robots.txt` references a `sitemap.xml` that doesn't exist
  — a small SEO ding.

## Stack

- Vite + React 18 + TypeScript + react-router-dom v6
- No UI library, no CSS framework
- No backend
- Lean Web Editor (`live.lean-lang.org`) for live code practice
  (external, official, WebAssembly-based)
- Pillow + DejaVu Sans for the OG card generation
- Deployed to GitHub Pages via `.github/workflows/deploy.yml`

## Repo layout (the important parts)

```
src/
  data/
    questions.json    — 405 questions, the curriculum
    practice.json     — 20 coding exercises, source_kind enforced
    worlds.json       — chapter titles + blurbs
  lib/
    progress.ts       — localStorage XP / streak / level / completion
    practice.ts       — practice lookup + LEAN_WEB_EDITOR_URL
    tree.ts           — World → Unit → Lesson assembly
    worldColor.ts     — one HSL hue per world (the rest is CSS)
  components/
    Confetti.tsx      — canvas-based, no dependency
    StatsCard.tsx     — home-page streak / XP / level pill row
    ThemeToggle.tsx   — fixed top-right sun/moon
    QuestionCard.tsx  — MC / FIB / PO / SE / ORD + "Show answer"
    LessonRunner.tsx  — walks a lesson; awards XP; fires confetti
  routes/
    WorldsList.tsx UnitsList.tsx UnitPath.tsx LessonPage.tsx
    PracticePage.tsx About.tsx
scripts/
  audit.ts            — runs in CI; gates the deploy
  gen-og.py           — re-renders the LinkedIn / Twitter card
```
