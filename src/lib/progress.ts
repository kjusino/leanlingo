/**
 * All persisted user progress lives in localStorage under three keys:
 *
 *   leanlingo:completed:lessons   string[]  — lesson IDs that have been finished
 *   leanlingo:xp                  number    — total XP earned, all-time
 *   leanlingo:streak              { days, lastISODate } — daily streak
 *
 * Nothing leaves the browser. Clearing site data resets all of it.
 */

const KEY_LESSONS = 'leanlingo:completed:lessons';
const KEY_XP = 'leanlingo:xp';
const KEY_STREAK = 'leanlingo:streak';
const KEY_CELEBRATED_UNITS = 'leanlingo:celebrated:units';

/** Components subscribe to this event to refresh derived UI (XP, level, streak). */
export const PROGRESS_EVENT = 'leanlingo:progress';

function readJSON<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (raw == null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function writeJSON(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // best effort — Safari private mode / quota
    }
}

function notifyChange() {
    try {
        window.dispatchEvent(new Event(PROGRESS_EVENT));
    } catch {
        // SSR / non-browser
    }
}

// ─── Completed lessons ───────────────────────────────────────────────

export function getCompletedLessons(): Set<string> {
    const arr = readJSON<unknown>(KEY_LESSONS, []);
    return Array.isArray(arr) ? new Set(arr.filter((x) => typeof x === 'string') as string[]) : new Set();
}

/** Returns true if this is the first time the lesson is being marked complete. */
export function markLessonComplete(lessonId: string): boolean {
    const s = getCompletedLessons();
    if (s.has(lessonId)) return false;
    s.add(lessonId);
    writeJSON(KEY_LESSONS, [...s]);
    notifyChange();
    return true;
}

export function isLessonComplete(lessonId: string): boolean {
    return getCompletedLessons().has(lessonId);
}

// ─── XP ──────────────────────────────────────────────────────────────

export function getXP(): number {
    const n = readJSON<unknown>(KEY_XP, 0);
    return typeof n === 'number' && isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function addXP(delta: number): number {
    if (!isFinite(delta) || delta <= 0) return getXP();
    const next = getXP() + Math.round(delta);
    writeJSON(KEY_XP, next);
    notifyChange();
    return next;
}

// ─── Level (derived from XP) ─────────────────────────────────────────
// L1 = 0 XP, L2 = 100 XP, L3 = 400, L4 = 900, L5 = 1600 …  curve =  (L-1)^2 * 100

export function levelForXP(xp: number): number {
    return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

export function xpForLevel(level: number): number {
    return Math.max(0, level - 1) ** 2 * 100;
}

export type LevelProgress = {
    level: number;
    inLevel: number;   // XP earned past the current level's threshold
    span: number;      // total XP needed to clear this level
    pct: number;       // 0–100, progress to next level
};

export function levelProgress(xp: number): LevelProgress {
    const level = levelForXP(xp);
    const base = xpForLevel(level);
    const next = xpForLevel(level + 1);
    const span = next - base;
    const inLevel = Math.max(0, xp - base);
    const pct = span > 0 ? Math.min(100, Math.round((inLevel / span) * 100)) : 0;
    return { level, inLevel, span, pct };
}

// ─── Streak ──────────────────────────────────────────────────────────
// Strict: any calendar-day gap resets the streak to 1 on next completion.

export type Streak = { days: number; lastISODate: string };

function localISODate(d: Date = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function previousISODate(iso: string): string {
    // Parse the YYYY-MM-DD in local noon so DST transitions don't tip
    // us over a day boundary.
    const d = new Date(`${iso}T12:00:00`);
    d.setDate(d.getDate() - 1);
    return localISODate(d);
}

export function getStreak(): Streak {
    const s = readJSON<Streak>(KEY_STREAK, { days: 0, lastISODate: '' });
    if (typeof s?.days === 'number' && typeof s?.lastISODate === 'string') return s;
    return { days: 0, lastISODate: '' };
}

/**
 * The streak as it should be displayed to the user *right now*. If the
 * stored streak's last-active date is older than yesterday, the streak
 * is broken and we report 0. We don't rewrite storage on read — the
 * stored value is only mutated when the user actually completes a lesson.
 */
export function getDisplayStreak(): number {
    const s = getStreak();
    if (!s.lastISODate) return 0;
    const today = localISODate();
    if (s.lastISODate === today) return s.days;
    if (s.lastISODate === previousISODate(today)) return s.days;
    return 0;
}

/**
 * Records that the user completed *something* today. Same-day calls are
 * idempotent. Returns the resulting streak.
 */
// ─── Unit-completion celebration (confetti) ──────────────────────────
// We celebrate each unit's 100%-completion exactly once. The flag lives
// in its own key so clearing only this doesn't reset XP / streak / lessons.

export function isUnitCelebrated(unitId: string): boolean {
    const arr = readJSON<unknown>(KEY_CELEBRATED_UNITS, []);
    return Array.isArray(arr) && arr.includes(unitId);
}

/** Returns true if this is the first time the unit is being marked celebrated. */
export function markUnitCelebrated(unitId: string): boolean {
    const arr = readJSON<unknown>(KEY_CELEBRATED_UNITS, []);
    const set = new Set(Array.isArray(arr) ? (arr.filter((x) => typeof x === 'string') as string[]) : []);
    if (set.has(unitId)) return false;
    set.add(unitId);
    writeJSON(KEY_CELEBRATED_UNITS, [...set]);
    return true;
}

export function bumpStreakForToday(): Streak {
    const s = getStreak();
    const today = localISODate();
    let next: Streak;
    if (s.lastISODate === today) {
        next = s;
    } else if (s.lastISODate === previousISODate(today)) {
        next = { days: s.days + 1, lastISODate: today };
    } else {
        next = { days: 1, lastISODate: today };
    }
    writeJSON(KEY_STREAK, next);
    notifyChange();
    return next;
}
