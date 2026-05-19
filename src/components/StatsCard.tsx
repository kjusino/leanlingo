import { useEffect, useState } from 'react';
import {
    PROGRESS_EVENT,
    getDisplayStreak,
    getXP,
    levelProgress,
} from '../lib/progress';

type Snapshot = {
    xp: number;
    streak: number;
    level: number;
    inLevel: number;
    span: number;
    pct: number;
};

function snapshot(): Snapshot {
    const xp = getXP();
    const lp = levelProgress(xp);
    return {
        xp,
        streak: getDisplayStreak(),
        level: lp.level,
        inLevel: lp.inLevel,
        span: lp.span,
        pct: lp.pct,
    };
}

export default function StatsCard() {
    const [s, setS] = useState<Snapshot>(() => snapshot());

    useEffect(() => {
        const refresh = () => setS(snapshot());
        window.addEventListener(PROGRESS_EVENT, refresh);
        window.addEventListener('focus', refresh);
        window.addEventListener('pageshow', refresh);
        return () => {
            window.removeEventListener(PROGRESS_EVENT, refresh);
            window.removeEventListener('focus', refresh);
            window.removeEventListener('pageshow', refresh);
        };
    }, []);

    return (
        <div className="ll-stats">
            <div className="ll-stats-row">
                <Cell
                    icon="🔥"
                    iconClass="streak"
                    value={s.streak}
                    label={s.streak === 1 ? 'day' : 'days'}
                />
                <Cell
                    icon="⚡"
                    iconClass="xp"
                    value={s.xp}
                    label="XP"
                />
                <Cell
                    icon="★"
                    iconClass="level"
                    value={s.level}
                    label="level"
                />
            </div>
            <div className="ll-stats-progress" title={`${s.inLevel} / ${s.span} XP to level ${s.level + 1}`}>
                <div className="ll-stats-progress-bar">
                    <div
                        className="ll-stats-progress-fill"
                        style={{ width: `${s.pct}%` }}
                    />
                </div>
                <div className="ll-stats-progress-label">
                    {s.inLevel} / {s.span} XP to L{s.level + 1}
                </div>
            </div>
        </div>
    );
}

function Cell({
    icon,
    iconClass,
    value,
    label,
}: {
    icon: string;
    iconClass: string;
    value: number;
    label: string;
}) {
    return (
        <div className="ll-stat-cell">
            <div className={`ll-stat-cell-icon ${iconClass}`}>{icon}</div>
            <div className="ll-stat-cell-value">{value}</div>
            <div className="ll-stat-cell-label">{label}</div>
        </div>
    );
}
