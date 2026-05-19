import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    findUnit,
    getTree,
    lessonNumber,
    unitBookRef,
    unitNumber,
    worldNumber,
} from '../lib/tree';
import { worldColor } from '../lib/worldColor';
import { getCompletedLessons } from '../lib/progress';
import type { Unit, World } from '../types';

type NodeKind = 'done' | 'current' | 'available' | 'trophy';

export default function UnitPath() {
    const { worldId = '', unitId = '' } = useParams();
    const navigate = useNavigate();
    const found = findUnit(worldId, unitId);

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

    if (!found) {
        return (
            <div className="ll-page">
                <PathHeader
                    title="Not found"
                    subtitle=""
                    onBack={() => navigate('/')}
                />
                <div className="ll-empty">That unit doesn't exist.</div>
            </div>
        );
    }

    const { world, unit } = found;
    const c = worldColor(world.id);
    const wn = worldNumber(world.id);
    const un = unitNumber(unit.id);

    const currentLessonId = useMemo(
        () => firstIncompleteLessonId(unit, completed),
        [unit, completed]
    );

    const next = nextUnitFor(world, unit);

    const currentRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el = currentRef.current;
        if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, [currentLessonId]);

    return (
        <div
            className="ll-page ll-unit-path-page"
            style={{
                ['--c' as string]: c.base,
                ['--c-soft' as string]: c.soft,
                ['--c-text' as string]: c.text,
            }}
        >
            <PathHeader
                title={`Chapter ${wn} · Unit ${un}`}
                subtitle={world.title}
                onBack={() => navigate(`/w/${world.id}`)}
                bookRef={unitBookRef(unit)}
                accented
            />

            <div className="ll-path">
                {unit.lessons.map((lesson, i) => {
                    const isDone = completed.has(lesson.id);
                    const isCurrent = lesson.id === currentLessonId;
                    const kind: NodeKind = isDone
                        ? 'done'
                        : isCurrent
                        ? 'current'
                        : 'available';
                    return (
                        <PathNode
                            key={lesson.id}
                            index={i}
                            total={unit.lessons.length + 1}
                            kind={kind}
                            label={lesson.title}
                            metaLabel={`Lesson ${lessonNumber(lesson.id)} · ${lesson.questions.length}q`}
                            badge={
                                isDone ? '✓' : String(lessonNumber(lesson.id))
                            }
                            onClick={() => {
                                const [, uShort] = unit.id.split('-');
                                const [, , lShort] = lesson.id.split('-');
                                navigate(
                                    `/w/${world.id}/u/${uShort}/l/${lShort}`
                                );
                            }}
                            nodeRef={isCurrent ? currentRef : undefined}
                        />
                    );
                })}

                {/* End-of-unit trophy */}
                <PathNode
                    index={unit.lessons.length}
                    total={unit.lessons.length + 1}
                    kind={'trophy'}
                    label=""
                    metaLabel=""
                    badge="🏆"
                    nonInteractive
                />
            </div>

            {next ? (
                <UpNextCard
                    world={world}
                    next={next}
                    onJump={() => {
                        const [, uShort] = next.unit.id.split('-');
                        navigate(`/w/${next.world.id}/u/${uShort}`);
                    }}
                />
            ) : (
                <div className="ll-up-next-end">
                    You've reached the end of LeanLingo. Nice.
                </div>
            )}
        </div>
    );
}

function firstIncompleteLessonId(unit: Unit, completed: Set<string>): string | null {
    for (const l of unit.lessons) {
        if (!completed.has(l.id)) return l.id;
    }
    return null;
}

function nextUnitFor(
    world: World,
    unit: Unit
): { world: World; unit: Unit } | null {
    const tree = getTree();
    let foundCurrent = false;
    for (const w of tree.worlds) {
        for (const u of w.units) {
            if (foundCurrent) return { world: w, unit: u };
            if (u.id === unit.id && w.id === world.id) foundCurrent = true;
        }
    }
    return null;
}

function PathHeader({
    title,
    subtitle,
    bookRef,
    onBack,
    accented,
}: {
    title: string;
    subtitle: string;
    bookRef?: string;
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
            <div className="ll-subheader-bookref">{bookRef ?? ''}</div>
        </header>
    );
}

function PathNode({
    index,
    total,
    kind,
    label,
    metaLabel,
    badge,
    onClick,
    nonInteractive,
    nodeRef,
}: {
    index: number;
    total: number;
    kind: NodeKind;
    label: string;
    metaLabel: string;
    badge: string;
    onClick?: () => void;
    nonInteractive?: boolean;
    nodeRef?: React.RefObject<HTMLDivElement | null>;
}) {
    // Zigzag: sine-wave horizontal position centred on the column.
    // Amplitude scales by how many nodes — small units stay near centre,
    // longer units swing further so the path feels organic.
    // Sine-wave zigzag, % of row width. Capped so an 80px button + label
    // stays inside the 448px content column at the swing peaks.
    const amp = Math.min(26, 14 + total * 1.4);
    const phase = index * 0.85;
    const offsetPct = Math.sin(phase) * amp;

    const isCurrent = kind === 'current';

    return (
        <div
            className="ll-path-node-row"
            ref={nodeRef as React.RefObject<HTMLDivElement>}
            style={{
                transform: `translateX(${offsetPct}%)`,
            }}
        >
            <div className={`ll-path-node kind-${kind}`}>
                {isCurrent && (
                    <div className="ll-path-pop">
                        <span className="ll-path-pop-text">START</span>
                        <span className="ll-path-pop-tail" />
                    </div>
                )}
                <button
                    className={`ll-path-button kind-${kind}`}
                    onClick={onClick}
                    disabled={nonInteractive}
                    aria-label={label || badge}
                >
                    <span className="ll-path-button-face">
                        <span className="ll-path-button-badge">{badge}</span>
                    </span>
                </button>
                {label && (
                    <div className="ll-path-node-label">
                        <div className="ll-path-node-label-title">{label}</div>
                        <div className="ll-path-node-label-meta">{metaLabel}</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function UpNextCard({
    world,
    next,
    onJump,
}: {
    world: World;
    next: { world: World; unit: Unit };
    onJump: () => void;
}) {
    const sameWorld = next.world.id === world.id;
    const un = unitNumber(next.unit.id);
    const wn = worldNumber(next.world.id);
    return (
        <div className="ll-up-next">
            <div className="ll-up-next-pill">UP NEXT</div>
            <div className="ll-up-next-title">
                {sameWorld
                    ? `Unit ${un}`
                    : `Chapter ${wn} · ${next.world.title}`}
            </div>
            <div className="ll-up-next-sub">
                {unitBookRef(next.unit) || `${next.unit.lessons.length} lessons`}
            </div>
            <button className="ll-up-next-btn" onClick={onJump}>
                Jump here
            </button>
        </div>
    );
}
