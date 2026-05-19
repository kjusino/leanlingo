import { useMemo, useState } from 'react';
import QuestionCard, { Outcome } from './QuestionCard';
import type { Lesson } from '../types';

type Props = {
    lesson: Lesson;
    onFinished: () => void;
};

export default function LessonRunner({ lesson, onFinished }: Props) {
    const [idx, setIdx] = useState(0);
    const [summary, setSummary] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

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
        if (o.correct) setCorrectCount((n) => n + 1);
        advance();
    }

    function onSkip() {
        advance();
    }

    if (!current) {
        return <div className="ll-empty">This lesson is empty.</div>;
    }

    if (summary) {
        const accuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100);
        return (
            <div className="ll-summary">
                <div className="ll-summary-burst">🏆</div>
                <div className="ll-summary-title">Lesson complete</div>
                <div className="ll-summary-sub">{lesson.title}</div>
                <div className="ll-summary-stats">
                    <div className="ll-stat">
                        <div className="ll-stat-num">{correctCount}/{total}</div>
                        <div className="ll-stat-label">Correct</div>
                    </div>
                    <div className="ll-stat">
                        <div className="ll-stat-num">{accuracy}%</div>
                        <div className="ll-stat-label">Accuracy</div>
                    </div>
                </div>
                <button className="ll-cta-btn" onClick={onFinished} autoFocus>
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
