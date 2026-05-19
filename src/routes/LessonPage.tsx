import { useNavigate, useParams } from 'react-router-dom';
import LessonRunner from '../components/LessonRunner';
import { findLesson, lessonNumber, unitNumber } from '../lib/tree';
import { markLessonComplete } from '../lib/progress';
import { worldColor } from '../lib/worldColor';

export default function LessonPage() {
    const { worldId = '', unitId = '', lessonId = '' } = useParams();
    const navigate = useNavigate();
    const found = findLesson(worldId, unitId, lessonId);

    const backToUnitPath = `/w/${worldId}/u/${unitId}`;

    if (!found) {
        return (
            <div className="ll-page">
                <header className="ll-subheader">
                    <button
                        className="ll-back-btn"
                        onClick={() => navigate(backToUnitPath)}
                        aria-label="back"
                    >
                        ←
                    </button>
                    <div className="ll-subheader-text">
                        <div className="ll-subheader-eyebrow">Lesson</div>
                        <div className="ll-subheader-title">Not found</div>
                    </div>
                    <div className="ll-subheader-spacer" />
                </header>
                <div className="ll-empty">That lesson doesn't exist.</div>
            </div>
        );
    }

    const { lesson, world, unit } = found;
    const c = worldColor(world.id);

    return (
        <div
            className="ll-page ll-lesson-page"
            style={{
                ['--c' as string]: c.base,
                ['--c-soft' as string]: c.soft,
                ['--c-text' as string]: c.text,
            }}
        >
            <header className="ll-subheader accented">
                <button
                    className="ll-back-btn"
                    onClick={() => navigate(backToUnitPath)}
                    aria-label="back"
                >
                    ✕
                </button>
                <div className="ll-subheader-text">
                    <div className="ll-subheader-eyebrow">
                        Unit {unitNumber(unit.id)} · Lesson {lessonNumber(lesson.id)}
                    </div>
                    <div className="ll-subheader-title">{lesson.title}</div>
                </div>
                <div className="ll-subheader-bookref">{lesson.book_ref}</div>
            </header>

            <LessonRunner
                key={lesson.id}
                lesson={lesson}
                onFinished={() => {
                    markLessonComplete(lesson.id);
                    navigate(backToUnitPath);
                }}
            />
        </div>
    );
}
