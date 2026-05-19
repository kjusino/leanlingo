import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import LessonRunner from '../components/LessonRunner';
import { findLesson, nextLesson } from '../lib/tree';

export default function LessonPage() {
    const { worldId = '', unitId = '', lessonId = '' } = useParams();
    const navigate = useNavigate();
    const found = findLesson(worldId, unitId, lessonId);

    if (!found) {
        return (
            <div className="leanlingo">
                <Header backTo={`/w/${worldId}`} />
                <div className="leanlingo-loading">Lesson not found.</div>
            </div>
        );
    }

    const { lesson, world } = found;
    const next = nextLesson(worldId, unitId, lessonId);

    return (
        <div className="leanlingo">
            <Header
                bookTag={lesson.book_ref}
                backTo={`/w/${world.id}`}
            />
            <LessonRunner
                lesson={lesson}
                onFinished={() => navigate(`/w/${world.id}`)}
                onNextLesson={
                    next
                        ? () => navigate(`/w/${next.worldId}/u/${next.unitId}/l/${next.lessonId}`)
                        : null
                }
            />
        </div>
    );
}
