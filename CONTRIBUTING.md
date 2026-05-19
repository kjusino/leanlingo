# Contributing to LeanLingo

Two kinds of contribution welcome:

1. **Fixing a question** — a typo, wrong answer, ambiguous prompt, broken `source_url`.
2. **Adding new questions** — filling out chapters, especially ones not yet covered.

## Quick start

```bash
git clone https://github.com/<your-fork>/leanlingo
cd leanlingo
npm install
npm run dev
```

Open http://localhost:5173, navigate to the world/lesson you want to edit. Find the relevant rows in `src/data/questions.json`. Save, the page hot-reloads, verify your change works.

Before pushing:

```bash
npm run audit       # every question must be renderable + answerable
npm run typecheck
npm run build       # ensure CI will pass
```

## Question schema

Each row in `src/data/questions.json` looks like:

```json
{
  "id": "w3-u2-l1-a",
  "world": "w3",
  "unit": "u2",
  "lesson": "l1",
  "q_index": "a",
  "type": "MC",
  "prompt": "Which keyword defines a structure?",
  "code": "structure Point where\n  x : Float\n  y : Float",
  "options": ["structure", "class", "inductive", "def"],
  "answer": "structure",
  "explanation": "`structure` defines a record type with named fields.",
  "ord_items": [],
  "book_ref": "TPIL §9.1",
  "lesson_title": "Defining structures",
  "quote": "Structures are a way of bundling…",
  "source_url": "https://lean-lang.org/theorem_proving_in_lean4/structures_and_records.html"
}
```

### IDs

`id` is `<world>-<unit>-<lesson>-<q_index>`. Lowercase. `world` / `unit` / `lesson` use one or two digits with the matching `w`/`u`/`l` prefix.

### Types

| Type | What it is | Required fields beyond the base |
|---|---|---|
| `MC` | Multiple choice | `options` (≥2), `answer` ∈ `options` |
| `SE` | Spot the error — renders as MC | same as MC |
| `FIB` | Fill in the blank — text input | `answer` is a concrete token (≤60 chars), case-insensitive |
| `PO` | Predict the output — text input | same as FIB |
| `ORD` | Ordering — tap up/down arrows | `ord_items` (≥2), `answer` is pipe-separated correct order |

### Rules the audit will catch

- MC/SE: `answer` must be an exact string from `options`.
- ORD: `answer` (pipe-split) and `ord_items` must be the same set.
- FIB/PO: `answer` must be ≤60 chars and not a sentence — these render in a text box where the user types the answer character-for-character.

### Book references

`book_ref` is human-readable (e.g. `"TPIL §9.1"`, `"FPIL Ch 5"`). `source_url` is the direct deep link to the section:

- TPIL4: `https://lean-lang.org/theorem_proving_in_lean4/<slug>.html`
- FPIL:  `https://lean-lang.org/functional_programming_in_lean/<slug>/`

(FPIL's slugs use triple underscores for separators, e.g. `Hello___-World___`.)

## World metadata

To rename a world or change its blurb, edit `src/data/worlds.json`. To add a new world, append a new row and add questions with the matching `world` field. The tree is built automatically from the flat question list.

## CI

Every PR runs:
- `npm run audit` (blocks if any question is broken)
- `npm run typecheck`
- `npm run build`

Push to `master` triggers an additional deploy step that publishes to GitHub Pages.

## Reporting issues

Open an [issue](https://github.com/kjusino/leanlingo/issues). If it's a wrong question, include the `id` (visible in the URL when you're on that lesson — the lesson URL is `/w/<world>/u/<unit>/l/<lesson>` and the question's `id` is shown in DevTools / can be found in `questions.json`).

## Code of conduct

Be kind. We're all here to learn Lean.
