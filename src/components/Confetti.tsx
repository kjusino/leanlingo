import { useEffect, useRef } from 'react';

type Props = {
    /**
     * Trigger value. Any truthy value (and any *change* to a truthy value)
     * fires a fresh burst. Pass `null`/`false`/`0` to mount the canvas
     * without firing — useful when the parent re-renders without wanting
     * to re-celebrate.
     */
    fire: unknown;
    /** Particle count. Default 140 — generous but not gaudy. */
    count?: number;
    /** Total animation duration in ms. Default 2400. */
    duration?: number;
};

const COLORS = ['#58cc02', '#22d3ee', '#c084fc', '#fbbf24', '#ef4444', '#67e8f9'];

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vrot: number;
    size: number;
    color: string;
    shape: 0 | 1 | 2; // square / circle / streak
};

/**
 * Tiny canvas confetti. Two side-cannons fire upward and inward; gravity
 * pulls everything down. Respects prefers-reduced-motion (renders nothing).
 *
 * No dependency on a confetti library — keeps the SPA truly "no UI lib".
 */
export default function Confetti({ fire, count = 140, duration = 2400 }: Props) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!fire) return;

        // Accessibility: skip the show entirely if the user prefers less motion.
        if (
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);

        const particles: Particle[] = [];
        const launchY = h * 0.78;
        for (let i = 0; i < count; i++) {
            const fromLeft = i % 2 === 0;
            const baseAngle = fromLeft ? -Math.PI / 3.2 : -Math.PI + Math.PI / 3.2;
            const spread = Math.PI / 5;
            const angle = baseAngle + (Math.random() - 0.5) * spread;
            const speed = 9 + Math.random() * 7;
            particles.push({
                x: fromLeft ? 8 : w - 8,
                y: launchY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 0.35,
                size: 5 + Math.random() * 7,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                shape: Math.floor(Math.random() * 3) as 0 | 1 | 2,
            });
        }

        const start = performance.now();
        let raf = 0;

        function tick(now: number) {
            if (!ctx) return;
            const elapsed = now - start;
            const t = elapsed / duration; // 0..1+
            // Linear fade-out in the back half so confetti doesn't snap off.
            const alpha = t < 0.55 ? 1 : Math.max(0, 1 - (t - 0.55) / 0.45);

            ctx.clearRect(0, 0, w, h);
            ctx.globalAlpha = alpha;

            for (const p of particles) {
                // Gravity + light air drag.
                p.vy += 0.28;
                p.vx *= 0.992;
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vrot;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                if (p.shape === 0) {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else if (p.shape === 1) {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // streak / rectangle
                    ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 2);
                }
                ctx.restore();
            }

            ctx.globalAlpha = 1;

            if (t < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                ctx.clearRect(0, 0, w, h);
            }
        }

        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            ctx.clearRect(0, 0, w, h);
        };
    }, [fire, count, duration]);

    return (
        <canvas
            ref={ref}
            aria-hidden="true"
            className="ll-confetti"
        />
    );
}
