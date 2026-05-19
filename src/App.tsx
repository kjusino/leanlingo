import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ChapterIndex from './routes/ChapterIndex';
import WorldPage from './routes/WorldPage';
import LessonPage from './routes/LessonPage';
import About from './routes/About';
import './styles/leanlingo.css';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ChapterIndex />} />
                <Route path="/w/:worldId" element={<WorldPage />} />
                <Route path="/w/:worldId/u/:unitId/l/:lessonId" element={<LessonPage />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
