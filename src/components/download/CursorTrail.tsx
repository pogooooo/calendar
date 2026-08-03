"use client";

import * as React from "react";
import styled from "styled-components";

const COUNT = 7;

export default function CursorTrail() {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const container = ref.current;
        if (!container) return;

        const dots = Array.from(container.children) as HTMLElement[];
        const pos = dots.map(() => ({ x: -100, y: -100 }));
        let mx = -100;
        let my = -100;
        let raf = 0;

        const onMove = (e: PointerEvent) => {
            mx = e.clientX;
            my = e.clientY;
        };

        const loop = () => {
            for (let i = 0; i < pos.length; i++) {
                const target = i === 0 ? { x: mx, y: my } : pos[i - 1];
                pos[i].x += (target.x - pos[i].x) * (i === 0 ? 0.35 : 0.3);
                pos[i].y += (target.y - pos[i].y) * (i === 0 ? 0.35 : 0.3);
                dots[i].style.transform = `translate3d(${pos[i].x}px, ${pos[i].y}px, 0)`;
            }
            raf = requestAnimationFrame(loop);
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        raf = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener("pointermove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <Trail ref={ref} aria-hidden="true">
            {Array.from({ length: COUNT }, (_, i) => (
                <i key={i} style={{ opacity: 0.55 - i * 0.07, width: 5 - i * 0.5, height: 5 - i * 0.5 }} />
            ))}
        </Trail>
    );
}

const Trail = styled.div`
    position: fixed;
    inset: 0;
    z-index: 60;
    pointer-events: none;

    i {
        position: absolute;
        top: -2px;
        left: -2px;
        background: ${p => p.theme.colors.primary};
        border-radius: 50%;
        box-shadow: 0 0 6px ${p => p.theme.colors.primary}88;
        will-change: transform;
    }

    @media (pointer: coarse) {
        display: none;
    }
`;
