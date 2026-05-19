import { useMemo, useState } from 'react';
import QuestionCard, { Outcome } from './QuestionCard';
import type { Lesson } from '../types';

type Props = {
    lesson: Lesson;
    onFinished: () => void;
    onNextLesson: (() => void) | null;
};

export default function LessonRunner({ lesson, onFinished, onNextLesson }: Props) {
    const [idx, setIdx] = useState(0);
    const [summary, setSummary] = useState(false);

    const total = lesson.questions.length;
    const current = lesson.questions[idx];
    const progressPct = useMemo(() => Math.round((idx / total) * 100), [idx, total]);

    function advance() {
        if (idx + 1 >= total) setSummary(true);
        else setIdx(idx + 1);
    }

    function onAnswered(_o: Outcome) {
        advance();
    }

    function onSkip() {
        advance();
    }

    if (!current) {
        return (
            <div className="leanlingo-loading">
                This lesson is empty.
            </div>
        );
    }

    if (summary) {
        return (
            <div className="leanlingo-summary">
                <div className="leanlingo-h2">{lesson.title}</div>
                <div className="leanlingo-sub">complete · {lesson.book_ref}</div>
                <div className="leanlingo-summary-check">✓</div>
                <div className="leanlingo-actions" style={{ marginTop: 24, flexDirection: 'column' }}>
                    {onNextLesson && (
                        <button className="leanlingo-btn" onClick={onNextLesson} autoFocus>
                            Next lesson →
                        </button>
                    )}
                    <button className="leanlingo-btn secondary" onClick={onFinished}>
                        Back to trail
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="leanlingo-h2">{lesson.title}</div>
            <div className="leanlingo-sub">{lesson.book_ref} · question {idx + 1} of {total}</div>
            <QuestionCard
                key={current.id}
                question={current}
                onAnswered={onAnswered}
                onSkip={onSkip}
                progressPct={progressPct}
            />
        </div>
    );
}
