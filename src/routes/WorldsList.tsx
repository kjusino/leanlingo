import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTree, totalCounts, worldNumber } from '../lib/tree';
import { worldColor } from '../lib/worldColor';
import { getCompletedLessons } from '../lib/progress';
import type { World } from '../types';

export default function WorldsList() {
    const tree = getTree();
    const { worlds, lessons, questions } = totalCounts(tree);

    const [completed, setCompleted] = useState<Set<string>>(() => getCompletedLessons());
    useEffect(() => {
        const refresh = () => setCompleted(getCompletedLessons());
        window.addEventListener('focus', refresh);
        window.addEventListener('pageshow', refresh);
        return () => {
            window.removeEventListener('focus', refresh);
            window.removeEventListener('pageshow', refresh);
        };
    }, []);

    return (
        <div className="ll-page">
            <header className="ll-home-header">
                <h1 className="ll-home-wordmark" aria-label="LeanLingo">
                    <span aria-hidden="true">L</span>
                    <span aria-hidden="true" className="ll-glyph-quant">∃</span>
                    <span aria-hidden="true" className="ll-glyph-quant">∀</span>
                    <span aria-hidden="true">nLingo</span>
                </h1>
                <div className="ll-home-type">
                    <span className="ll-mono-dim">:</span>{' '}
                    <span className="ll-mono-accent">Lean 4 trainer</span>
                </div>
                <div className="ll-home-sub">
                    {worlds} chapters · {lessons} lessons · {questions} questions
                </div>
            </header>

            <div className="ll-world-grid">
                {tree.worlds.map((w) => (
                    <WorldCard key={w.id} world={w} completed={completed} />
                ))}
            </div>

            <footer className="ll-home-footer">
                <Link to="/about" className="ll-text-link">About LeanLingo →</Link>
            </footer>
        </div>
    );
}

function WorldCard({ world, completed }: { world: World; completed: Set<string> }) {
    const navigate = useNavigate();
    const c = worldColor(world.id);
    const wn = worldNumber(world.id);

    const allLessons = useMemo(
        () => world.units.flatMap((u) => u.lessons),
        [world]
    );
    const done = allLessons.filter((l) => completed.has(l.id)).length;
    const total = allLessons.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const allDone = done === total && total > 0;

    return (
        <button
            className={`ll-world-card ${allDone ? 'done' : ''}`}
            onClick={() => navigate(`/w/${world.id}`)}
            style={{
                ['--c' as string]: c.base,
                ['--c-soft' as string]: c.soft,
                ['--c-text' as string]: c.text,
            }}
        >
            <div className="ll-world-card-badge">
                <span className="ll-world-card-num">{wn}</span>
            </div>
            <div className="ll-world-card-body">
                <div className="ll-world-card-title">{world.title}</div>
                <div className="ll-world-card-meta">
                    {done} / {total} lessons
                </div>
                <div className="ll-progress">
                    <div className="ll-progress-fill" style={{ width: `${pct}%` }} />
                </div>
            </div>
            <div className="ll-world-card-chev">›</div>
        </button>
    );
}
