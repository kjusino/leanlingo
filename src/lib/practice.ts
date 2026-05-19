import practiceRaw from '../data/practice.json';
import type { Practice } from '../types';

const ALL = practiceRaw as Practice[];

const byWorld = new Map<string, Practice>();
for (const p of ALL) byWorld.set(p.world, p);

export function getPracticeForWorld(worldId: string): Practice | undefined {
    return byWorld.get(worldId);
}

export function allPractice(): Practice[] {
    return ALL;
}

/**
 * URL for the Lean Web Editor. Opens the official playground in a new
 * tab; the user pastes their copied starter code there. Plain link with
 * no URL params keeps this future-proof against changes to the editor's
 * fragment scheme.
 */
export const LEAN_WEB_EDITOR_URL = 'https://live.lean-lang.org/';

/** XP awarded the first time a user marks a practice exercise complete. */
export const PRACTICE_COMPLETION_XP = 25;
