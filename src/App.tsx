import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import WorldsList from './routes/WorldsList';
import UnitsList from './routes/UnitsList';
import UnitPath from './routes/UnitPath';
import LessonPage from './routes/LessonPage';
import About from './routes/About';
import ThemeToggle from './components/ThemeToggle';
import './styles/leanlingo.css';

export default function App() {
    return (
        <BrowserRouter>
            <ThemeToggle />
            <Routes>
                <Route path="/" element={<WorldsList />} />
                <Route path="/w/:worldId" element={<UnitsList />} />
                <Route path="/w/:worldId/u/:unitId" element={<UnitPath />} />
                <Route path="/w/:worldId/u/:unitId/l/:lessonId" element={<LessonPage />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
