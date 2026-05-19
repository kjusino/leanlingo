import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    findWorld,
    unitBookRef,
    unitNumber,
    unitQuestionCount,
    worldNumber,
} from '../lib/tree';
import { worldColor } from '../lib/worldColor';
import { getCompletedLessons } from '../lib/progress';
import { getPracticeForWorld } from '../lib/practice';
import type { Unit } from '../types';

export default function UnitsList() {
    const { worldId = '' } = useParams();
    const world = findWorld(worldId);
    const navigate = useNavigate();

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

    if (!world) {
        return (
            <div className="ll-page">
                <SubHeader title="Not found" subtitle="" onBack={() => navigate('/')} />
                <div className="ll-empty">That chapter doesn't exist.</div>
            </div>
        );
    }

    const c = worldColor(world.id);
    const wn = worldNumber(world.id);
    const allLessons = world.units.flatMap((u) => u.lessons);
    const done = allLessons.filter((l) => completed.has(l.id)).length;
    const total = allLessons.length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    return (
        <div
            className="ll-page"
            style={{ ['--world-hue' as string]: String(c.hue) }}
        >
            <SubHeader
                title={`Chapter ${wn}`}
                subtitle={world.title}
                onBack={() => navigate('/')}
                accented
            />

            <div className="ll-section-progress">
                <div className="ll-progress">
                    <div className="ll-progress-fill accented" style={{ width: `${pct}%` }} />
                </div>
                <div className="ll-section-progress-text">
                    {done} / {total} lessons
                </div>
            </div>

            <div className="ll-unit-list">
                {world.units.map((u) => (
                    <UnitRow
                        key={u.id}
                        worldId={world.id}
                        unit={u}
                        completed={completed}
                    />
                ))}
                <PracticeRow worldId={world.id} completed={completed} />
            </div>

            <div className="ll-page-foot">
                <Link to="/about" className="ll-text-link">About LeanLingo →</Link>
            </div>
        </div>
    );
}

function PracticeRow({
    worldId,
    completed,
}: {
    worldId: string;
    completed: Set<string>;
}) {
    const navigate = useNavigate();
    const practice = getPracticeForWorld(worldId);
    if (!practice) return null;
    const done = completed.has(practice.id);

    return (
        <button
            className={`ll-unit-row ll-practice-row ${done ? 'done' : ''}`}
            onClick={() => navigate(`/w/${worldId}/practice`)}
        >
            <div className="ll-unit-row-body">
                <div className="ll-unit-row-title">
                    <span className="ll-practice-row-icon" aria-hidden="true">{'</>'}</span>
                    Code in Lean 4
                </div>
                <div className="ll-unit-row-meta">
                    {practice.book_ref} · optional · opens Lean Web Editor
                </div>
                <div className="ll-unit-row-preview">{practice.title}</div>
            </div>
            <div className="ll-unit-row-status">
                {done ? (
                    <span className="ll-check-circle">✓</span>
                ) : (
                    <span className="ll-chev">›</span>
                )}
            </div>
        </button>
    );
}

function UnitRow({
    worldId,
    unit,
    completed,
}: {
    worldId: string;
    unit: Unit;
    completed: Set<string>;
}) {
    const navigate = useNavigate();
    const un = unitNumber(unit.id);
    const ref = unitBookRef(unit);
    const qCount = useMemo(() => unitQuestionCount(unit), [unit]);

    const doneLessons = unit.lessons.filter((l) => completed.has(l.id)).length;
    const totalLessons = unit.lessons.length;
    const allDone = doneLessons === totalLessons && totalLessons > 0;

    // unit short id, e.g. "w4-u2" -> "u2"
    const uShort = unit.id.split('-')[1] ?? unit.id;

    return (
        <button
            className={`ll-unit-row ${allDone ? 'done' : ''}`}
            onClick={() => navigate(`/w/${worldId}/u/${uShort}`)}
        >
            <div className="ll-unit-row-body">
                <div className="ll-unit-row-title">
                    Unit {un}
                </div>
                <div className="ll-unit-row-meta">
                    {ref ? `${ref} · ` : ''}
                    {totalLessons} lesson{totalLessons === 1 ? '' : 's'} · {qCount} question
                    {qCount === 1 ? '' : 's'}
                </div>
                <div className="ll-unit-row-preview">
                    {unit.lessons[0]?.title ?? ''}
                </div>
            </div>
            <div className="ll-unit-row-status">
                {allDone ? (
                    <span className="ll-check-circle">✓</span>
                ) : doneLessons > 0 ? (
                    <span className="ll-pill-ratio">
                        {doneLessons}/{totalLessons}
                    </span>
                ) : (
                    <span className="ll-chev">›</span>
                )}
            </div>
        </button>
    );
}

function SubHeader({
    title,
    subtitle,
    onBack,
    accented,
}: {
    title: string;
    subtitle: string;
    onBack: () => void;
    accented?: boolean;
}) {
    return (
        <header className={`ll-subheader ${accented ? 'accented' : ''}`}>
            <button className="ll-back-btn" onClick={onBack} aria-label="back">
                ←
            </button>
            <div className="ll-subheader-text">
                <div className="ll-subheader-eyebrow">{title}</div>
                <div className="ll-subheader-title">{subtitle}</div>
            </div>
            <div className="ll-subheader-spacer" />
        </header>
    );
}
