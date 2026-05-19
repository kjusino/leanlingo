import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { findWorld, lessonNumber, unitNumber, worldNumber } from '../lib/tree';

export default function WorldPage() {
    const { worldId = '' } = useParams();
    const world = findWorld(worldId);

    if (!world) {
        return (
            <div className="leanlingo">
                <Header backTo="/" />
                <div className="leanlingo-loading">World not found.</div>
            </div>
        );
    }

    return (
        <div className="leanlingo">
            <Header backTo="/" />
            <h1 className="leanlingo-h1">World {worldNumber(world.id)}</h1>
            <p className="leanlingo-sub">{world.title}</p>
            <div className="leanlingo-units">
                {world.units.map((u) => (
                    <div key={u.id} className="leanlingo-unit">
                        <div className="leanlingo-unit-header">Unit {unitNumber(u.id)}</div>
                        <div className="leanlingo-lessons">
                            {u.lessons.map((l) => {
                                const uShort = u.id.split('-')[1];
                                const lShort = l.id.split('-')[2];
                                return (
                                    <Link
                                        key={l.id}
                                        to={`/w/${world.id}/u/${uShort}/l/${lShort}`}
                                        className="leanlingo-lesson"
                                    >
                                        <div className="leanlingo-lesson-info">
                                            <span className="leanlingo-lesson-title">
                                                {lessonNumber(l.id)}. {l.title}
                                            </span>
                                            <span className="leanlingo-lesson-ref">
                                                {l.book_ref} · {l.questions.length} question{l.questions.length === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                        <span className="leanlingo-lesson-status">›</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
