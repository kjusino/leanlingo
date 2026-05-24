import { useState } from 'react';
import LeanCode from './LeanCode';
import type { Question, QuestionAnswer } from '../types';

export type Outcome = {
    correct: boolean;
    attemptNumber: number;
    /** XP this question earned in isolation: 10 first-try, 5 retry, 0 otherwise. */
    xp: number;
};

/** XP rules — kept in one place so they're easy to tune. */
function xpForAttempt(correct: boolean, attemptNumber: number): number {
    if (!correct) return 0;
    return attemptNumber === 1 ? 10 : 5;
}

type Props = {
    question: Question;
    onAnswered: (o: Outcome) => void;
    onSkip: () => void;
    progressPct: number;
    questionLabel: string;
};

function normalize(s: string): string {
    return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

function acceptedAnswers(answer: QuestionAnswer): string[] {
    return Array.isArray(answer) ? answer : [answer];
}

function primaryAnswer(answer: QuestionAnswer): string {
    return acceptedAnswers(answer)[0] ?? '';
}

function answersMatch(input: string, answers: string[]): boolean {
    const normalizedInput = normalize(input);
    return answers.some((answer) => normalizedInput === normalize(answer));
}

export default function QuestionCard({
    question,
    onAnswered,
    onSkip,
    progressPct,
    questionLabel,
}: Props) {
    const [attempts, setAttempts] = useState(0);
    const [done, setDone] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'revealed' | null>(null);
    const [pendingOutcome, setPendingOutcome] = useState<Outcome | null>(null);

    function judge(correct: boolean) {
        const next = attempts + 1;
        setAttempts(next);
        setFeedback(correct ? 'correct' : 'wrong');
        if (correct || next >= 3) {
            setDone(true);
            setPendingOutcome({
                correct,
                attemptNumber: next,
                xp: xpForAttempt(correct, next),
            });
        }
    }

    function reveal() {
        if (done) return;
        setFeedback('revealed');
        setDone(true);
        // Same accounting as a skip: not correct, 0 XP, breaks "perfect lesson"
        // — the user explicitly chose to peek instead of attempting.
        setPendingOutcome({ correct: false, attemptNumber: 0, xp: 0 });
    }

    return (
        <div className="ll-question">
            <div className="ll-progress">
                <div
                    className="ll-progress-fill accented"
                    style={{ width: `${progressPct}%` }}
                />
            </div>
            <div className="ll-question-label">{questionLabel}</div>
            <p className="ll-prompt">{question.prompt}</p>
            <LeanCode code={question.code} />
            <Body question={question} judge={judge} done={done} feedback={feedback} />

            {feedback && (
                <div className={`ll-feedback ${feedback}`}>
                    <div className="ll-feedback-head">
                        <span>
                            {feedback === 'correct'
                                ? '✓ Correct!'
                                : feedback === 'revealed'
                                ? '👀 Answer revealed'
                                : '✗ Not quite.'}
                        </span>
                        {done && pendingOutcome && pendingOutcome.xp > 0 && (
                            <span className="ll-xp-flash">+{pendingOutcome.xp} XP</span>
                        )}
                    </div>
                    <div className="ll-feedback-body">{question.explanation}</div>
                </div>
            )}

            {(feedback === 'wrong' || done) && (question.quote || question.source_url) && (
                <div className="ll-source">
                    {question.quote && (
                        <blockquote className="ll-source-quote">
                            {question.quote}
                            <cite className="ll-source-cite">— {question.book_ref}</cite>
                        </blockquote>
                    )}
                    {question.source_url && (
                        <a
                            className="ll-text-link"
                            href={question.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Read more in the book ↗
                        </a>
                    )}
                </div>
            )}

            <div className="ll-question-actions">
                {done && pendingOutcome ? (
                    <button
                        className="ll-cta-btn"
                        onClick={() => onAnswered(pendingOutcome)}
                        autoFocus
                    >
                        Continue
                    </button>
                ) : (
                    <>
                        <button className="ll-skip-btn" onClick={onSkip}>
                            Skip
                        </button>
                        <button
                            className="ll-skip-btn ll-reveal-btn"
                            onClick={reveal}
                            title="Reveal the answer · no XP this question"
                        >
                            Show answer
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function Body({
    question,
    judge,
    done,
    feedback,
}: {
    question: Question;
    judge: (correct: boolean) => void;
    done: boolean;
    feedback: 'correct' | 'wrong' | 'revealed' | null;
}) {
    switch (question.type) {
        case 'MC':
        case 'SE':
            return <MC question={question} judge={judge} done={done} feedback={feedback} />;
        case 'FIB':
        case 'PO':
            return <TextInput question={question} judge={judge} done={done} />;
        case 'ORD':
            return <Ordering question={question} judge={judge} done={done} />;
        default:
            return null;
    }
}

function MC({
    question,
    judge,
    done,
    feedback,
}: {
    question: Question;
    judge: (correct: boolean) => void;
    done: boolean;
    feedback: 'correct' | 'wrong' | 'revealed' | null;
}) {
    const [picked, setPicked] = useState<string | null>(null);
    const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());

    function pick(opt: string) {
        if (done) return;
        setPicked(opt);
        const correct = opt === primaryAnswer(question.answer);
        if (!correct) {
            setWrongPicks((s) => new Set(s).add(opt));
            setTimeout(() => setPicked(null), 600);
        }
        judge(correct);
    }

    return (
        <div className="ll-options">
            {question.options.map((opt) => {
                let cls = 'll-option';
                if (done && opt === primaryAnswer(question.answer)) cls += ' correct';
                else if (wrongPicks.has(opt)) cls += ' wrong';
                else if (picked === opt && feedback === 'wrong') cls += ' wrong';
                return (
                    <button
                        key={opt}
                        className={cls}
                        disabled={done || wrongPicks.has(opt)}
                        onClick={() => pick(opt)}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    );
}

function TextInput({
    question,
    judge,
    done,
}: {
    question: Question;
    judge: (correct: boolean) => void;
    done: boolean;
}) {
    const [value, setValue] = useState('');

    function submit() {
        if (done || !value.trim()) return;
        const correct = answersMatch(value, acceptedAnswers(question.answer));
        if (!correct) setTimeout(() => setValue(''), 700);
        judge(correct);
    }

    return (
        <div>
            <input
                className="ll-input"
                value={done ? primaryAnswer(question.answer) : value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                }}
                disabled={done}
                placeholder="type your answer…"
                autoFocus
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
            />
            <div className="ll-question-actions">
                <button className="ll-cta-btn" onClick={submit} disabled={done || !value.trim()}>
                    Check
                </button>
            </div>
        </div>
    );
}

function Ordering({
    question,
    judge,
    done,
}: {
    question: Question;
    judge: (correct: boolean) => void;
    done: boolean;
}) {
    const correctOrder = primaryAnswer(question.answer)
        .split('|')
        .map((s) => s.trim());
    const [items, setItems] = useState<string[]>(() => question.ord_items.slice());

    function move(i: number, dir: -1 | 1) {
        if (done) return;
        const j = i + dir;
        if (j < 0 || j >= items.length) return;
        const next = items.slice();
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
        setItems(next);
    }

    function submit() {
        if (done) return;
        const correct =
            items.length === correctOrder.length &&
            items.every((v, idx) => normalize(v) === normalize(correctOrder[idx]));
        if (!correct) setItems(question.ord_items.slice());
        judge(correct);
    }

    const display = done ? correctOrder : items;

    return (
        <div>
            <div className="ll-ord-list">
                {display.map((text, i) => (
                    <div key={`${text}-${i}`} className="ll-ord-item">
                        <span className="ll-ord-text">{text}</span>
                        <div className="ll-ord-controls">
                            <button
                                className="ll-ord-arrow"
                                disabled={done || i === 0}
                                onClick={() => move(i, -1)}
                                aria-label="move up"
                            >
                                ↑
                            </button>
                            <button
                                className="ll-ord-arrow"
                                disabled={done || i === display.length - 1}
                                onClick={() => move(i, 1)}
                                aria-label="move down"
                            >
                                ↓
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="ll-question-actions">
                <button className="ll-cta-btn" onClick={submit} disabled={done}>
                    Check order
                </button>
            </div>
        </div>
    );
}
