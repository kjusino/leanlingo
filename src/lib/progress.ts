const KEY = 'leanlingo:completed:lessons';

function read(): Set<string> {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? new Set<string>(arr) : new Set();
    } catch {
        return new Set();
    }
}

function write(s: Set<string>): void {
    try {
        localStorage.setItem(KEY, JSON.stringify([...s]));
    } catch {
        // best effort
    }
}

export function getCompletedLessons(): Set<string> {
    return read();
}

export function markLessonComplete(lessonId: string): void {
    const s = read();
    if (s.has(lessonId)) return;
    s.add(lessonId);
    write(s);
}

export function isLessonComplete(lessonId: string): boolean {
    return read().has(lessonId);
}
