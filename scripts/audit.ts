// Answerability audit: every question must be renderable + answerable by its type.
// Run: npm run audit
// Exits nonzero on any flag so CI fails the build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Question = {
    id: string;
    type: 'MC' | 'FIB' | 'PO' | 'SE' | 'ORD';
    prompt: string;
    options: string[];
    answer: string | string[];
    ord_items: string[];
};

function acceptedAnswers(answer: string | string[]): string[] {
    return Array.isArray(answer) ? answer : [answer];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '..', 'src', 'data', 'questions.json');
const PRACTICE_FILE = path.join(__dirname, '..', 'src', 'data', 'practice.json');

const rows = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Question[];

const flags: string[] = [];

for (const q of rows) {
    if (!q.id) {
        flags.push(`row with no id: ${JSON.stringify(q).slice(0, 80)}…`);
        continue;
    }
    if (!q.prompt?.trim()) flags.push(`${q.id}: empty prompt`);

    switch (q.type) {
        case 'MC':
        case 'SE': {
            if (Array.isArray(q.answer)) {
                flags.push(`${q.id} (${q.type}): answer must be a string, not a list`);
                break;
            }
            if (!Array.isArray(q.options) || q.options.length < 2) {
                flags.push(`${q.id} (${q.type}): needs ≥2 options, has ${q.options?.length ?? 0}`);
            } else if (!q.options.includes(q.answer)) {
                flags.push(`${q.id} (${q.type}): answer "${q.answer}" not in options ${JSON.stringify(q.options)}`);
            }
            break;
        }
        case 'ORD': {
            if (Array.isArray(q.answer)) {
                flags.push(`${q.id} (ORD): answer must be a string, not a list`);
                break;
            }
            if (!Array.isArray(q.ord_items) || q.ord_items.length < 2) {
                flags.push(`${q.id} (ORD): needs ≥2 ord_items, has ${q.ord_items?.length ?? 0}`);
            }
            const order = q.answer.split('|').map((s) => s.trim());
            if (order.length !== q.ord_items.length) {
                flags.push(`${q.id} (ORD): answer order has ${order.length} items, ord_items has ${q.ord_items.length}`);
            }
            for (const item of order) {
                if (!q.ord_items.some((x) => x.trim().toLowerCase() === item.toLowerCase())) {
                    flags.push(`${q.id} (ORD): answer order item "${item}" not found in ord_items`);
                }
            }
            break;
        }
        case 'FIB':
        case 'PO': {
            const answers = acceptedAnswers(q.answer);
            if (answers.length === 0 || answers.every((answer) => !answer?.trim())) {
                flags.push(`${q.id} (${q.type}): empty answer`);
            }
            for (const answer of answers) {
                if (!answer?.trim()) {
                    flags.push(`${q.id} (${q.type}): answer list contains an empty value`);
                } else if (answer.length > 60) {
                    flags.push(`${q.id} (${q.type}): answer is ${answer.length} chars — likely prose, won't match text input. "${answer.slice(0, 40)}…"`);
                }
            }
            break;
        }
        default:
            flags.push(`${q.id}: unknown type "${q.type}"`);
    }
}

// ── Practice exercises ───────────────────────────────────────────────
// Each practice card links the user out to the Lean books. The book's
// real URL scheme is /Title-Case-With-Hyphens/ (no .html, trailing slash).
// We've been bitten by guessed URLs once already — guard against it by
// requiring every practice source_url to ALSO appear in questions.json,
// where the URLs have been verified to actually resolve.

type SourceKind = 'book_exercise' | 'adapted';
type Practice = {
    id: string;
    world: string;
    title: string;
    prompt: string;
    starterCode: string;
    book_ref: string;
    source_url: string;
    /**
     * Forces the author to declare provenance explicitly.
     *   "book_exercise" — verbatim or near-verbatim from the book's Exercises section.
     *                     Prompt SHOULD say "From the exercises in …".
     *   "adapted"       — the chapter has no formal Exercises section; the practice is
     *                     written to mirror the chapter's worked examples.
     *                     Prompt SHOULD say "Adapted from …".
     * History: an earlier seed of this file claimed everything was "from the book"
     * but most of it was fabricated. The audit now refuses to ship without this
     * declaration, so the next author has to consciously pick one.
     */
    source_kind: SourceKind;
};

const practice = JSON.parse(fs.readFileSync(PRACTICE_FILE, 'utf8')) as Practice[];
const knownGoodUrls = new Set(
    rows.map((q) => (q as unknown as { source_url?: string }).source_url).filter(Boolean) as string[]
);

const requiredKeys: (keyof Practice)[] = [
    'id', 'world', 'title', 'prompt', 'starterCode', 'book_ref', 'source_url', 'source_kind',
];
const validSourceKinds: SourceKind[] = ['book_exercise', 'adapted'];
const seenIds = new Set<string>();
const seenWorlds = new Set<string>();

for (const p of practice) {
    for (const k of requiredKeys) {
        if (!p[k] || (typeof p[k] === 'string' && !(p[k] as string).trim())) {
            flags.push(`practice ${p.id ?? '<no id>'}: missing or empty "${k}"`);
        }
    }
    if (p.id) {
        if (seenIds.has(p.id)) flags.push(`practice ${p.id}: duplicate id`);
        seenIds.add(p.id);
    }
    if (p.world) {
        if (seenWorlds.has(p.world)) {
            flags.push(`practice ${p.id}: duplicate world "${p.world}" (one practice per world)`);
        }
        seenWorlds.add(p.world);
    }
    if (p.source_url && !knownGoodUrls.has(p.source_url)) {
        flags.push(
            `practice ${p.id}: source_url not found in questions.json — ` +
            `risk of 404. Match an existing question's URL for this section, or ` +
            `add a question referencing this URL first. (${p.source_url})`
        );
    }
    if (p.source_kind && !validSourceKinds.includes(p.source_kind)) {
        flags.push(
            `practice ${p.id}: source_kind="${p.source_kind}" — must be one of ${validSourceKinds.join(', ')}`
        );
    }
    // Consistency between source_kind and the prompt's prose. Soft check —
    // wording can drift — but the canonical phrasings catch sloppy edits.
    if (p.source_kind === 'book_exercise' && p.prompt && !/from the exercises?/i.test(p.prompt)) {
        flags.push(
            `practice ${p.id}: source_kind="book_exercise" but prompt doesn't start with "From the exercises…" ` +
            `— either reword the prompt or change source_kind to "adapted".`
        );
    }
    if (p.source_kind === 'adapted' && p.prompt && !/adapted from/i.test(p.prompt)) {
        flags.push(
            `practice ${p.id}: source_kind="adapted" but prompt doesn't say "Adapted from…" ` +
            `— make the provenance explicit to the user.`
        );
    }
    if (p.starterCode && !p.starterCode.includes('sorry')) {
        flags.push(
            `practice ${p.id}: starterCode has no \`sorry\` — exercise should leave a hole for the user.`
        );
    }
}

console.log(`audit: ${rows.length} questions, ${practice.length} practice exercises`);
if (flags.length === 0) {
    console.log('audit: ✓ all questions + practice entries pass');
    process.exit(0);
}
console.error(`audit: ✗ ${flags.length} issues`);
for (const f of flags) console.error('  - ' + f);
process.exit(1);
