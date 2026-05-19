import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { getTree, totalCounts, worldNumber } from '../lib/tree';

export default function ChapterIndex() {
    const tree = getTree();
    const { worlds, lessons, questions } = totalCounts(tree);

    return (
        <div className="leanlingo">
            <Header backTo={null} />
            <h1 className="leanlingo-h1">LeanLingo</h1>
            <p className="leanlingo-sub">
                Lean 4 in micro-doses · {worlds} worlds · {lessons} lessons · {questions} questions
            </p>
            <div className="leanlingo-worlds">
                {tree.worlds.map((w) => {
                    const lessonCount = w.units.reduce((s, u) => s + u.lessons.length, 0);
                    return (
                        <Link key={w.id} to={`/w/${w.id}`} className="leanlingo-world">
                            <span className="leanlingo-world-number">World {worldNumber(w.id)}</span>
                            <span className="leanlingo-world-title">{w.title}</span>
                            <span className="leanlingo-world-progress">{lessonCount} lessons</span>
                        </Link>
                    );
                })}
            </div>
            <div className="leanlingo-footer">
                <Link to="/about" className="leanlingo-source-link">About LeanLingo →</Link>
            </div>
        </div>
    );
}
