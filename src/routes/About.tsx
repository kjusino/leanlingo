import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function About() {
    return (
        <div className="leanlingo">
            <Header backTo="/" />
            <h1 className="leanlingo-h1">About LeanLingo</h1>
            <p className="leanlingo-prose">
                LeanLingo is a free, open-source flashcard trainer for the{' '}
                <a href="https://lean-lang.org" target="_blank" rel="noopener noreferrer">Lean 4</a>{' '}
                theorem prover and programming language. It's built to fit in the
                cracks of your day — subway, gym, line at the store.
            </p>
            <p className="leanlingo-prose">
                Questions are drawn from two free, official books:
            </p>
            <ul className="leanlingo-prose">
                <li>
                    <a
                        href="https://lean-lang.org/theorem_proving_in_lean4/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Theorem Proving in Lean 4
                    </a>
                    {' '}by Jeremy Avigad, Leonardo de Moura, Soonho Kong, Sebastian Ullrich
                </li>
                <li>
                    <a
                        href="https://lean-lang.org/functional_programming_in_lean/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Functional Programming in Lean
                    </a>
                    {' '}by David Thrane Christiansen
                </li>
            </ul>
            <h2 className="leanlingo-h2" style={{ marginTop: 24 }}>How it works</h2>
            <p className="leanlingo-prose">
                Every world, unit, and lesson is open. Jump to anything, in any
                order. No accounts, no streaks, no tracking. This site stores
                nothing about you.
            </p>
            <h2 className="leanlingo-h2" style={{ marginTop: 24 }}>Open source</h2>
            <p className="leanlingo-prose">
                LeanLingo is MIT-licensed and lives on GitHub at{' '}
                <a
                    href="https://github.com/kjusino/leanlingo"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    kjusino/leanlingo
                </a>. Fork it, edit the questions, host your own version for any
                topic. See <code>CONTRIBUTING.md</code> in the repo to add questions
                or report mistakes.
            </p>
            <div className="leanlingo-footer">
                <Link to="/" className="leanlingo-source-link">← Back to lessons</Link>
            </div>
        </div>
    );
}
