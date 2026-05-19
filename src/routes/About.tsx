import { Link, useNavigate } from 'react-router-dom';

export default function About() {
    const navigate = useNavigate();
    return (
        <div className="ll-page">
            <header className="ll-subheader">
                <button
                    className="ll-back-btn"
                    onClick={() => navigate('/')}
                    aria-label="back"
                >
                    ←
                </button>
                <div className="ll-subheader-text">
                    <div className="ll-subheader-eyebrow">About</div>
                    <div className="ll-subheader-title">LeanLingo</div>
                </div>
                <div className="ll-subheader-spacer" />
            </header>

            <div className="ll-prose">
                <p>
                    LeanLingo is a free, open-source flashcard trainer for the{' '}
                    <a
                        href="https://lean-lang.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Lean 4
                    </a>{' '}
                    theorem prover and programming language. Built to fit in the
                    cracks of your day — subway, gym, line at the store.
                </p>
                <p>Questions are drawn from two free, official books:</p>
                <ul>
                    <li>
                        <a
                            href="https://lean-lang.org/theorem_proving_in_lean4/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Theorem Proving in Lean 4
                        </a>{' '}
                        by Jeremy Avigad, Leonardo de Moura, Soonho Kong, Sebastian
                        Ullrich
                    </li>
                    <li>
                        <a
                            href="https://lean-lang.org/functional_programming_in_lean/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Functional Programming in Lean
                        </a>{' '}
                        by David Thrane Christiansen
                    </li>
                </ul>
                <h2>How it works</h2>
                <p>
                    Every chapter, unit, and lesson is open — jump anywhere, in any
                    order. No accounts, no servers, no tracking. Your streak, XP, level,
                    and completed lessons live only in your browser's <code>localStorage</code>;
                    nothing leaves your device. Clearing site data resets everything.
                </p>
                <h2>Code in Lean 4</h2>
                <p>
                    Each chapter ends with an optional coding exercise. One tap copies
                    the starter code; the next opens the official{' '}
                    <a
                        href="https://live.lean-lang.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Lean Web Editor
                    </a>{' '}
                    — which runs the real Lean kernel as WebAssembly entirely client-side
                    — where you paste and write your attempt against Lean's actual goal and
                    error panels.
                </p>
                <h2>Open source</h2>
                <p>
                    LeanLingo is MIT-licensed and lives on GitHub at{' '}
                    <a
                        href="https://github.com/kjusino/leanlingo"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        kjusino/leanlingo
                    </a>
                    . Fork it, edit the questions, host your own version for any
                    topic.
                </p>
            </div>
            <div className="ll-page-foot">
                <Link to="/" className="ll-text-link">
                    ← Back to chapters
                </Link>
            </div>
        </div>
    );
}
