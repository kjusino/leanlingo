import type { Lesson, Question, QuestionTree, Unit, World, WorldMeta } from '../types';
import questionsRaw from '../data/questions.json';
import worldsMeta from '../data/worlds.json';

const questions = questionsRaw as Question[];
const worldMetaList = worldsMeta as WorldMeta[];

function num(id: string, prefix: string): number {
    const m = id.match(new RegExp(`${prefix}(\\d+)`));
    return m ? Number(m[1]) : 0;
}

export function worldNumber(id: string): number {
    return num(id, '^w');
}
export function unitNumber(id: string): number {
    return num(id, 'u');
}
export function lessonNumber(id: string): number {
    return num(id, 'l');
}

// q.unit and q.lesson in the data already carry their world/unit prefix
// (e.g. q.unit = "w1-u1", q.lesson = "w1-u1-l1"), so we use them verbatim.

let cached: QuestionTree | null = null;

export function getTree(): QuestionTree {
    if (cached) return cached;

    const worldsMap = new Map<string, World>();
    const titleByWorld = new Map<string, string>();
    for (const m of worldMetaList) titleByWorld.set(m.id, m.title);

    for (const q of questions) {
        let w = worldsMap.get(q.world);
        if (!w) {
            w = { id: q.world, title: titleByWorld.get(q.world) ?? q.world, units: [] };
            worldsMap.set(q.world, w);
        }
        let u = w.units.find((x) => x.id === q.unit);
        if (!u) {
            u = { id: q.unit, lessons: [] };
            w.units.push(u);
        }
        let l = u.lessons.find((x) => x.id === q.lesson);
        if (!l) {
            l = { id: q.lesson, title: q.lesson_title || q.lesson, book_ref: q.book_ref || '', questions: [] };
            u.lessons.push(l);
        }
        l.questions.push(q);
    }

    const worlds: World[] = Array.from(worldsMap.values())
        .sort((a, b) => worldNumber(a.id) - worldNumber(b.id))
        .map((w) => ({
            ...w,
            units: w.units
                .sort((a, b) => unitNumber(a.id) - unitNumber(b.id))
                .map((u) => ({
                    ...u,
                    lessons: u.lessons
                        .sort((a, b) => lessonNumber(a.id) - lessonNumber(b.id))
                        .map((l) => ({
                            ...l,
                            questions: l.questions
                                .slice()
                                .sort((a, b) => a.q_index.localeCompare(b.q_index)),
                        })),
                })),
        }));

    cached = { worlds };
    return cached;
}

export function findWorld(worldId: string): World | undefined {
    return getTree().worlds.find((w) => w.id === worldId);
}

export function findLesson(
    worldId: string,
    unitId: string,
    lessonId: string
): { world: World; unit: Unit; lesson: Lesson } | undefined {
    const w = findWorld(worldId);
    if (!w) return;
    const u = w.units.find((x) => x.id === `${worldId}-${unitId}`);
    if (!u) return;
    const l = u.lessons.find((x) => x.id === `${worldId}-${unitId}-${lessonId}`);
    if (!l) return;
    return { world: w, unit: u, lesson: l };
}

export function nextLesson(
    worldId: string,
    unitId: string,
    lessonId: string
): { worldId: string; unitId: string; lessonId: string } | null {
    const tree = getTree();
    const flat: { wId: string; uId: string; lId: string }[] = [];
    for (const w of tree.worlds) {
        for (const u of w.units) {
            for (const l of u.lessons) {
                const [, uShort] = u.id.split('-');
                const [, , lShort] = l.id.split('-');
                flat.push({ wId: w.id, uId: uShort, lId: lShort });
            }
        }
    }
    const idx = flat.findIndex(
        (x) => x.wId === worldId && x.uId === unitId && x.lId === lessonId
    );
    if (idx < 0 || idx + 1 >= flat.length) return null;
    const n = flat[idx + 1];
    return { worldId: n.wId, unitId: n.uId, lessonId: n.lId };
}

export function totalCounts(tree: QuestionTree = getTree()): {
    worlds: number;
    units: number;
    lessons: number;
    questions: number;
} {
    let units = 0, lessons = 0, qs = 0;
    for (const w of tree.worlds) {
        units += w.units.length;
        for (const u of w.units) {
            lessons += u.lessons.length;
            for (const l of u.lessons) qs += l.questions.length;
        }
    }
    return { worlds: tree.worlds.length, units, lessons, questions: qs };
}
