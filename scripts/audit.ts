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

console.log(`audit: ${rows.length} questions`);
if (flags.length === 0) {
    console.log('audit: ✓ all questions renderable + answerable');
    process.exit(0);
}
console.error(`audit: ✗ ${flags.length} issues`);
for (const f of flags) console.error('  - ' + f);
process.exit(1);
