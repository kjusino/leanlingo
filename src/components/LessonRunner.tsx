import { useMemo, useState } from 'react';
import QuestionCard, { Outcome } from './QuestionCard';
import {
    getXP,
    isLessonComplete,
    levelForXP,
} from '../lib/progress';
import type { Lesson } from '../types';

const LESSON_COMPLETION_XP = 25;
const PERFECT_LESSON_BONUS = 50;

export type LessonStats = {
    /** XP that should actually be banked (0 on a replay). */
    xpEarned: number;
    /** Whether every question was answered correctly on the first try, no skips. */
    perfect: boolean;
    correctCount: number;
    total: number;
    /** True if the lesson was already in the completed set before this run. */
    replay: boolean;
};

type Props = {
    lesson: Lesson;
    onFinished: (stats: LessonStats) => void;
};

export default function LessonRunner({ lesson, onFinished }: Props) {
    const [idx, setIdx] = useState(0);
    const [summary, setSummary] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [xpFromQuestions, setXpFromQuestions] = useState(0);
    const [perfectSoFar, setPerfectSoFar] = useState(true);

    // Snapshot at lesson start — if it was already complete, no XP this run.
    const wasReplay = useMemo(() => isLessonComplete(lesson.id), [lesson.id]);

    const total = lesson.questions.length;
    const current = lesson.questions[idx];
    const progressPct = useMemo(
        () => Math.round(((idx + (summary ? 1 : 0)) / total) * 100),
        [idx, total, summary]
    );

    function advance() {
        if (idx + 1 >= total) setSummary(true);
        else setIdx(idx + 1);
    }

    function onAnswered(o: Outcome) {
        if (o.correct) setCorrectCount((c) => c + 1);
        if (o.xp > 0) setXpFromQuestions((x) => x + o.xp);
        // First-try correct keeps perfect alive; everything else breaks it.
        if (!o.correct || o.attemptNumber > 1) setPerfectSoFar(false);
        advance();
    }

    function onSkip() {
        setPerfectSoFar(false);
        advance();
    }

    if (!current) {
        return <div className="ll-empty">This lesson is empty.</div>;
    }

    if (summary) {
        const accuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100);
        const perfect = perfectSoFar && total > 0;
        const perfectBonus = !wasReplay && perfect ? PERFECT_LESSON_BONUS : 0;
        const completionBonus = wasReplay ? 0 : LESSON_COMPLETION_XP;
        const xpEarned = wasReplay
            ? 0
            : xpFromQuestions + completionBonus + perfectBonus;

        const xpBefore = getXP();
        const xpAfter = xpBefore + xpEarned;
        const levelBefore = levelForXP(xpBefore);
        const levelAfter = levelForXP(xpAfter);
        const leveledUp = levelAfter > levelBefore;

        return (
            <div className="ll-summary">
                <div className="ll-summary-burst">{perfect ? '🌟' : '🏆'}</div>
                <div className="ll-summary-title">Lesson complete</div>
                <div className="ll-summary-sub">{lesson.title}</div>

                {xpEarned > 0 ? (
                    <div className="ll-summary-xp">
                        <span className="ll-summary-xp-amount">+{xpEarned} XP</span>
                        <span className="ll-summary-xp-breakdown">
                            {xpFromQuestions} from answers
                            {' · '}+{completionBonus} completion
                            {perfectBonus > 0 ? ` · +${perfectBonus} perfect` : ''}
                        </span>
                    </div>
                ) : (
                    <div className="ll-summary-xp replay">
                        Already mastered · 0 XP this run
                    </div>
                )}

                <div className="ll-summary-stats">
                    <div className="ll-stat">
                        <div className="ll-stat-num">
                            {correctCount}/{total}
                        </div>
                        <div className="ll-stat-label">Correct</div>
                    </div>
                    <div className="ll-stat">
                        <div className="ll-stat-num">{accuracy}%</div>
                        <div className="ll-stat-label">Accuracy</div>
                    </div>
                </div>

                {leveledUp && (
                    <div className="ll-level-up">
                        ⭐ Level up — you're now level {levelAfter}!
                    </div>
                )}

                <button
                    className="ll-cta-btn"
                    onClick={() =>
                        onFinished({
                            xpEarned,
                            perfect,
                            correctCount,
                            total,
                            replay: wasReplay,
                        })
                    }
                    autoFocus
                >
                    Continue
                </button>
            </div>
        );
    }

    return (
        <div className="ll-runner">
            <QuestionCard
                key={current.id}
                question={current}
                onAnswered={onAnswered}
                onSkip={onSkip}
                progressPct={progressPct}
                questionLabel={`Question ${idx + 1} of ${total}`}
            />
        </div>
    );
}
