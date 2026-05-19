import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LeanCode from '../components/LeanCode';
import {
    LEAN_WEB_EDITOR_URL,
    PRACTICE_COMPLETION_XP,
    getPracticeForWorld,
} from '../lib/practice';
import {
    addXP,
    bumpStreakForToday,
    isLessonComplete,
    markLessonComplete,
} from '../lib/progress';
import { findWorld, worldNumber } from '../lib/tree';
import { worldColor } from '../lib/worldColor';

type CopyState = 'idle' | 'copied' | 'failed';

export default function PracticePage() {
    const { worldId = '' } = useParams();
    const navigate = useNavigate();
    const world = findWorld(worldId);
    const practice = getPracticeForWorld(worldId);
    const back = `/w/${worldId}`;

    const [copyState, setCopyState] = useState<CopyState>('idle');
    const [marked, setMarked] = useState<boolean>(() =>
        practice ? isLessonComplete(practice.id) : false
    );

    // Auto-reset the copy chip after a moment so it doesn't get stuck.
    useEffect(() => {
        if (copyState === 'idle') return;
        const t = window.setTimeout(() => setCopyState('idle'), 1800);
        return () => window.clearTimeout(t);
    }, [copyState]);

    if (!world || !practice) {
        return (
            <div className="ll-page">
                <header className="ll-subheader">
                    <button
                        className="ll-back-btn"
                        onClick={() => navigate(back)}
                        aria-label="back"
                    >
                        ←
                    </button>
                    <div className="ll-subheader-text">
                        <div className="ll-subheader-eyebrow">Practice</div>
                        <div className="ll-subheader-title">Not found</div>
                    </div>
                    <div className="ll-subheader-spacer" />
                </header>
                <div className="ll-empty">
                    There's no practice exercise registered for this chapter yet.
                </div>
            </div>
        );
    }

    const c = worldColor(world.id);

    async function onCopy() {
        if (!practice) return;
        try {
            await navigator.clipboard.writeText(practice.starterCode);
            setCopyState('copied');
        } catch {
            // Clipboard API can fail on insecure contexts or when blocked.
            // Fall back to selecting the text so the user can ⌘C / Ctrl+C.
            const pre = document.getElementById('ll-practice-code');
            if (pre) {
                const range = document.createRange();
                range.selectNodeContents(pre);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
            setCopyState('failed');
        }
    }

    function onMarkPracticed() {
        if (!practice) return;
        const isFirstTime = markLessonComplete(practice.id);
        if (isFirstTime) addXP(PRACTICE_COMPLETION_XP);
        bumpStreakForToday();
        setMarked(true);
        navigate(back);
    }

    return (
        <div
            className="ll-page ll-practice-page"
            style={{ ['--world-hue' as string]: String(c.hue) }}
        >
            <header className="ll-subheader accented">
                <button
                    className="ll-back-btn"
                    onClick={() => navigate(back)}
                    aria-label="back"
                >
                    ←
                </button>
                <div className="ll-subheader-text">
                    <div className="ll-subheader-eyebrow">
                        Chapter {worldNumber(world.id)} · Practice
                    </div>
                    <div className="ll-subheader-title">{practice.title}</div>
                </div>
                <div className="ll-subheader-bookref">{practice.book_ref}</div>
            </header>

            <div className="ll-practice-intro">
                <span className="ll-practice-pill">CODE IN LEAN 4</span>
                <p className="ll-practice-prompt">{practice.prompt}</p>
            </div>

            <div className="ll-practice-code-wrap" id="ll-practice-code">
                <LeanCode code={practice.starterCode} />
            </div>

            <div className="ll-practice-steps">
                <div className="ll-practice-step">
                    <span className="ll-practice-step-num">1</span>
                    <button
                        className="ll-practice-action"
                        onClick={onCopy}
                        aria-label="Copy starter code"
                    >
                        <span className="ll-practice-action-icon" aria-hidden="true">
                            ⧉
                        </span>
                        <span className="ll-practice-action-label">
                            {copyState === 'copied'
                                ? 'Copied!'
                                : copyState === 'failed'
                                ? 'Press ⌘/Ctrl+C'
                                : 'Copy code'}
                        </span>
                    </button>
                </div>
                <div className="ll-practice-step">
                    <span className="ll-practice-step-num">2</span>
                    <a
                        className="ll-practice-action primary"
                        href={LEAN_WEB_EDITOR_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="ll-practice-action-icon" aria-hidden="true">
                            ↗
                        </span>
                        <span className="ll-practice-action-label">
                            Open Lean Web Editor
                        </span>
                    </a>
                </div>
                <div className="ll-practice-step">
                    <span className="ll-practice-step-num">3</span>
                    <span className="ll-practice-step-instruction">
                        Paste with ⌘V (Ctrl+V) and fill in the <code>sorry</code>s.
                        Lean's goal panel will tell you when you're done.
                    </span>
                </div>
            </div>

            <div className="ll-practice-footer">
                <a
                    className="ll-text-link"
                    href={practice.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Read this section in the book ↗
                </a>
                {marked ? (
                    <div className="ll-practice-marked">✓ Marked as practiced</div>
                ) : (
                    <button
                        className="ll-cta-btn ll-practice-mark"
                        onClick={onMarkPracticed}
                    >
                        Mark as practiced{' '}
                        <span className="ll-practice-mark-xp">+25 XP first time</span>
                    </button>
                )}
            </div>
        </div>
    );
}
