"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import * as S from "./StarField.styles";


interface Star {
    x: number;
    y: number;
    r: number;
    a: number;
    gold: boolean;
}

export default function StarField() {
    const ref = React.useRef<HTMLCanvasElement>(null);
    const theme = useTheme();

    // 어두운 바탕에서는 흰 별이, 밝은 바탕에서는 금빛 별이 자연스럽다.
    const dark = theme.name.includes("dark");
    const ink = dark ? theme.colors.text : theme.colors.primary;
    const strength = dark ? 0.55 : 0.3;
    const gold = theme.colors.primary;

    React.useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let stars: Star[] = [];
        let retry = 0;

        const draw = () => {
            const { width, height } = canvas.getBoundingClientRect();
            // 첫 프레임에는 아직 배치 전이라 0 이 나올 수 있다. 다음 프레임에 다시 잰다.
            if (width === 0 || height === 0) {
                if (retry++ < 10) requestAnimationFrame(draw);
                return;
            }

            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;

            // 면적에 비례해 뿌려야 창을 넓혀도 밀도가 유지된다.
            const count = Math.round((width * height) / 5200);
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 1.05 + 0.25,
                a: Math.random() * 0.55 + 0.18,
                gold: Math.random() < 0.12,
            }));

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, width, height);
            stars.forEach((s) => {
                ctx.globalAlpha = s.a * strength;
                ctx.fillStyle = s.gold ? gold : ink;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        draw();

        const observer = new ResizeObserver(draw);
        observer.observe(canvas);
        window.addEventListener("resize", draw);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", draw);
        };
    }, [ink, gold, strength]);

    return <S.Canvas ref={ref} aria-hidden="true" />;
}
