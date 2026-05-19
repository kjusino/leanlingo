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
    answer: string;
    ord_items: string[];
};

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
            if (!Array.isArray(q.options) || q.options.length < 2) {
                flags.push(`${q.id} (${q.type}): needs ≥2 options, has ${q.options?.length ?? 0}`);
            } else if (!q.options.includes(q.answer)) {
                flags.push(`${q.id} (${q.type}): answer "${q.answer}" not in options ${JSON.stringify(q.options)}`);
            }
            break;
        }
        case 'ORD': {
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
            if (!q.answer?.trim()) {
                flags.push(`${q.id} (${q.type}): empty answer`);
            } else if (q.answer.length > 60) {
                flags.push(`${q.id} (${q.type}): answer is ${q.answer.length} chars — likely prose, won't match text input. "${q.answer.slice(0, 40)}…"`);
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

type Practice = {
    id: string;
    world: string;
    title: string;
    prompt: string;
    starterCode: string;
    book_ref: string;
    source_url: string;
};

const practice = JSON.parse(fs.readFileSync(PRACTICE_FILE, 'utf8')) as Practice[];
const knownGoodUrls = new Set(
    rows.map((q) => (q as unknown as { source_url?: string }).source_url).filter(Boolean) as string[]
);

const requiredKeys: (keyof Practice)[] = [
    'id', 'world', 'title', 'prompt', 'starterCode', 'book_ref', 'source_url',
];
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
    if (p.starterCode && !p.starterCode.includes('sorry')) {
        // Not a hard fail — but warn so authors get a `sorry` placeholder.
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
