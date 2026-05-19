import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getTree, lessonNumber, totalCounts, unitNumber, worldNumber } from '../lib/tree';
import { worldColor } from '../lib/worldColor';
import { getCompletedLessons } from '../lib/progress';
import type { Lesson, Unit, World } from '../types';

type Side = 'left' | 'right';
function side(i: number): Side {
    return i % 2 === 0 ? 'left' : 'right';
}

function shortFromUnitId(id: string): string {
    // "w4-u2" -> "u2"
    return id.split('-')[1] ?? id;
}
function shortFromLessonId(id: string): string {
    // "w4-u2-l3" -> "l3"
    return id.split('-')[2] ?? id;
}

export default function Trail() {
    const tree = getTree();
    const { worlds, lessons, questions } = totalCounts(tree);

    const [params, setParams] = useSearchParams();
    const openWorld = params.get('w') ?? null;
    const openUnit = params.get('u') ?? null;

    // Re-read on focus so completion updates after a lesson finishes.
    const [completed, setCompleted] = useState<Set<string>>(() => getCompletedLessons());
    useEffect(() => {
        function refresh() {
            setCompleted(getCompletedLessons());
        }
        refresh();
        window.addEventListener('focus', refresh);
        window.addEventListener('pageshow', refresh);
        return () => {
            window.removeEventListener('focus', refresh);
            window.removeEventListener('pageshow', refresh);
        };
    }, []);

    function toggleWorld(wid: string) {
        if (openWorld === wid) {
            setParams({}, { replace: true });
        } else {
            setParams({ w: wid }, { replace: true });
        }
    }
    function toggleUnit(wid: string, uid: string) {
        if (openUnit === uid) {
            setParams({ w: wid }, { replace: true });
        } else {
            setParams({ w: wid, u: uid }, { replace: true });
        }
    }

    // Scroll the open world into view when the URL says so.
    useEffect(() => {
        if (!openWorld) return;
        const el = document.getElementById(`node-${openWorld}`);
        if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, [openWorld]);

    return (
        <div className="leanlingo trail-page">
            <div className="trail-top">
                <Link to="/" className="leanlingo-wordmark">LeanLingo</Link>
                <div className="trail-sub">
                    Lean 4 in micro-doses · {worlds} worlds · {lessons} lessons · {questions} questions
                </div>
            </div>

            <div className="trail">
                {tree.worlds.map((w, i) => (
                    <WorldRow
                        key={w.id}
                        world={w}
                        side={side(i)}
                        open={openWorld === w.id}
                        openUnit={openUnit}
                        completed={completed}
                        onToggleWorld={toggleWorld}
                        onToggleUnit={toggleUnit}
                    />
                ))}
            </div>

            <div className="leanlingo-footer">
                <Link to="/about" className="leanlingo-source-link">About LeanLingo →</Link>
            </div>
        </div>
    );
}

function WorldRow({
    world,
    side: s,
    open,
    openUnit,
    completed,
    onToggleWorld,
    onToggleUnit,
}: {
    world: World;
    side: Side;
    open: boolean;
    openUnit: string | null;
    completed: Set<string>;
    onToggleWorld: (wid: string) => void;
    onToggleUnit: (wid: string, uid: string) => void;
}) {
    const c = worldColor(world.id);
    const wn = worldNumber(world.id);

    const lessonsInWorld = useMemo(
        () => world.units.flatMap((u) => u.lessons),
        [world]
    );
    const doneCount = lessonsInWorld.filter((l) => completed.has(l.id)).length;
    const allDone = doneCount === lessonsInWorld.length && lessonsInWorld.length > 0;

    return (
        <div className="trail-section">
            <div className={`trail-row ${s} world-row ${open ? 'open' : ''}`}>
                <button
                    id={`node-${world.id}`}
                    className="trail-node world-node"
                    aria-expanded={open}
                    aria-label={`World ${wn}: ${world.title}`}
                    onClick={() => onToggleWorld(world.id)}
                    style={{
                        ['--c' as string]: c.base,
                        ['--c-soft' as string]: c.soft,
                        ['--c-text' as string]: c.text,
                    }}
                >
                    <span className={`trail-circle size-world ${allDone ? 'complete' : ''}`}>
                        <span className="trail-circle-num">{allDone ? '✓' : wn}</span>
                    </span>
                    <span className="trail-label">
                        <span className="trail-label-title">{world.title}</span>
                        <span className="trail-label-meta">
                            {doneCount} / {lessonsInWorld.length}
                        </span>
                    </span>
                </button>
            </div>

            {open && (
                <div className="trail-sub-spine" style={{ ['--c' as string]: c.base, ['--c-soft' as string]: c.soft }}>
                    {world.units.map((u, j) => (
                        <UnitRow
                            key={u.id}
                            world={world}
                            unit={u}
                            side={side(j)}
                            open={openUnit === u.id}
                            completed={completed}
                            onToggleUnit={onToggleUnit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function UnitRow({
    world,
    unit,
    side: s,
    open,
    completed,
    onToggleUnit,
}: {
    world: World;
    unit: Unit;
    side: Side;
    open: boolean;
    completed: Set<string>;
    onToggleUnit: (wid: string, uid: string) => void;
}) {
    const un = unitNumber(unit.id);
    const doneCount = unit.lessons.filter((l) => completed.has(l.id)).length;
    const allDone = doneCount === unit.lessons.length && unit.lessons.length > 0;

    return (
        <div className="trail-section">
            <div className={`trail-row ${s} unit-row ${open ? 'open' : ''}`}>
                <button
                    className="trail-node unit-node"
                    aria-expanded={open}
                    aria-label={`Unit ${un}`}
                    onClick={() => onToggleUnit(world.id, unit.id)}
                >
                    <span className={`trail-circle size-unit ${allDone ? 'complete' : ''}`}>
                        <span className="trail-circle-num">{allDone ? '✓' : un}</span>
                    </span>
                    <span className="trail-label">
                        <span className="trail-label-title">Unit {un}</span>
                        <span className="trail-label-meta">
                            {doneCount} / {unit.lessons.length}
                        </span>
                    </span>
                </button>
            </div>

            {open && (
                <div className="trail-sub-spine inner">
                    {unit.lessons.map((l, k) => (
                        <LessonRow
                            key={l.id}
                            world={world}
                            unit={unit}
                            lesson={l}
                            side={side(k)}
                            done={completed.has(l.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function LessonRow({
    world,
    unit,
    lesson,
    side: s,
    done,
}: {
    world: World;
    unit: Unit;
    lesson: Lesson;
    side: Side;
    done: boolean;
}) {
    const navigate = useNavigate();
    const ln = lessonNumber(lesson.id);
    const href = `/w/${world.id}/u/${shortFromUnitId(unit.id)}/l/${shortFromLessonId(lesson.id)}`;

    return (
        <div className={`trail-row ${s} lesson-row`}>
            <button
                className="trail-node lesson-node"
                aria-label={`Lesson ${ln}: ${lesson.title}`}
                onClick={() => navigate(href, { state: { from: { w: world.id, u: unit.id } } })}
            >
                <span className={`trail-circle size-lesson ${done ? 'complete' : ''}`}>
                    <span className="trail-circle-num">{done ? '✓' : ln}</span>
                </span>
                <span className="trail-label">
                    <span className="trail-label-title">{lesson.title}</span>
                    <span className="trail-label-meta">{lesson.questions.length}q</span>
                </span>
            </button>
        </div>
    );
}
