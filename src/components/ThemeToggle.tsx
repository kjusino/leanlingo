import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'leanlingo:theme';

function readTheme(): Theme {
    const attr = document.documentElement.dataset.theme;
    return attr === 'light' ? 'light' : 'dark';
}

function applyTheme(t: Theme): void {
    document.documentElement.dataset.theme = t;
    try {
        localStorage.setItem(KEY, t);
    } catch {
        // best effort — theme just won't persist
    }
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => readTheme());

    // Keep all mounted toggles in sync (e.g. if multiple instances exist
    // or another tab flips the preference).
    useEffect(() => {
        function onStorage(e: StorageEvent) {
            if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
                applyTheme(e.newValue);
                setTheme(e.newValue);
            }
        }
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    function toggle() {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        setTheme(next);
    }

    const showingMoon = theme === 'light';
    const label = showingMoon ? 'Switch to dark mode' : 'Switch to light mode';

    return (
        <button
            type="button"
            className="ll-theme-toggle"
            onClick={toggle}
            aria-label={label}
            title={label}
        >
            {showingMoon ? <MoonIcon /> : <SunIcon />}
        </button>
    );
}

function SunIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2.5" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="21.5" y2="12" />
            <line x1="5.2" y1="5.2" x2="6.9" y2="6.9" />
            <line x1="17.1" y1="17.1" x2="18.8" y2="18.8" />
            <line x1="5.2" y1="18.8" x2="6.9" y2="17.1" />
            <line x1="17.1" y1="6.9" x2="18.8" y2="5.2" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
        </svg>
    );
}
