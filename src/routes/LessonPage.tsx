import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import LessonRunner from '../components/LessonRunner';
import { findLesson, nextLesson } from '../lib/tree';
import { markLessonComplete } from '../lib/progress';
import { worldColor } from '../lib/worldColor';

export default function LessonPage() {
    const { worldId = '', unitId = '', lessonId = '' } = useParams();
    const navigate = useNavigate();
    const found = findLesson(worldId, unitId, lessonId);

    const trailWithThisOpen = `/?w=${worldId}&u=${worldId}-${unitId}`;

    if (!found) {
        return (
            <div className="leanlingo">
                <Header backTo={trailWithThisOpen} />
                <div className="leanlingo-loading">Lesson not found.</div>
            </div>
        );
    }

    const { lesson, world } = found;
    const next = nextLesson(worldId, unitId, lessonId);
    const c = worldColor(world.id);

    return (
        <div
            className="leanlingo lesson-page"
            style={{ ['--c' as string]: c.base, ['--c-soft' as string]: c.soft }}
        >
            <Header
                bookTag={lesson.book_ref}
                backTo={trailWithThisOpen}
            />
            <LessonRunner
                lesson={lesson}
                onFinished={() => {
                    markLessonComplete(lesson.id);
                    navigate(trailWithThisOpen);
                }}
                onNextLesson={
                    next
                        ? () => {
                              markLessonComplete(lesson.id);
                              navigate(`/w/${next.worldId}/u/${next.unitId}/l/${next.lessonId}`);
                          }
                        : () => {
                              markLessonComplete(lesson.id);
                              navigate(trailWithThisOpen);
                          }
                }
            />
        </div>
    );
}
