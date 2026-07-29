"use client";

import { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";

const appear = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

/* 실 흔들림 */
const sway = keyframes`
    0%, 100% { transform: rotate(-1deg); }
    50% { transform: rotate(1deg); }
`;

/* 실 끝 별 반짝임 */
const twinkleStar = keyframes`
    0%, 100% { transform: scale(1); opacity: 0.85; filter: drop-shadow(0 0 0 rgba(212, 175, 55, 0)); }
    50% { transform: scale(1.25); opacity: 1; filter: drop-shadow(0 0 3px rgba(212, 175, 55, 0.95)); }
`;

/* 단계별 프레임 (할 일 바와 같은 골드 라인아트) */
const FrameWrap = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    color: ${(props) => props.theme.colors.primary};
    --mx: 50%;
    --my: 50%;
    --glow: 0;

    .fr-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .fr-line {
        stroke: currentColor;
        fill: none;
        vector-effect: non-scaling-stroke;
    }
    .f-out { stroke-width: 1; }
    .f-in { stroke-width: 0.8; opacity: 0.4; }
    .corner { stroke-width: 1; stroke-linecap: round; }

    .fr-base { animation: ${appear} 0.55s ease-out both; }

    /* 호버 시 커서 주변 프레임만 빛나는 레이어 */
    .fr-glow {
        opacity: var(--glow, 0);
        transition: opacity 0.18s ease;
        filter:
            drop-shadow(0 0 3px rgba(212, 175, 55, 0.95))
            drop-shadow(0 0 7px rgba(212, 175, 55, 0.55));
        -webkit-mask: radial-gradient(
            circle 46px at var(--mx) var(--my),
            #000 0%, #000 20%, transparent 72%
        );
        mask: radial-gradient(
            circle 46px at var(--mx) var(--my),
            #000 0%, #000 20%, transparent 72%
        );
    }
    .fr-glow .fr-line { stroke-width: 1.6; opacity: 1; }
`;

/* 연결 여부에 따라 변을 열어 그린다 (연속된 같은 단계는 프레임이 이어짐) */
const buildFrame = (inset: number, connectLeft: boolean, connectRight: boolean) => {
    const top = inset;
    const bot = 130 - inset;
    const left = inset;
    const right = 110 - inset;
    const x0 = connectLeft ? 0 : left;
    const x1 = connectRight ? 110 : right;
    let d = `M${x0} ${top} H${x1} M${x0} ${bot} H${x1}`;
    if (!connectLeft) d += ` M${left} ${top} V${bot}`;
    if (!connectRight) d += ` M${right} ${top} V${bot}`;
    return d;
};

const buildCorners = (connectLeft: boolean, connectRight: boolean) => {
    const parts: string[] = [];
    if (!connectLeft) parts.push("M6 22 L22 6", "M6 108 L22 124");
    if (!connectRight) parts.push("M104 22 L88 6", "M104 108 L88 124");
    return parts.join(" ");
};

/* level 1: 단일 프레임 / 2: + 코너 사선 / 3: 겹 프레임 + 코너 사선 */
const FrameShapes = ({
    level,
    connectLeft,
    connectRight,
    base,
}: {
    level: number;
    connectLeft: boolean;
    connectRight: boolean;
    base?: boolean;
}) => {
    const corners = level >= 2 ? buildCorners(connectLeft, connectRight) : "";
    return (
        <g className={base ? "fr-base" : undefined}>
            <path className="fr-line f-out" d={buildFrame(6, connectLeft, connectRight)} />
            {corners && <path className="fr-line corner" d={corners} />}
            {level >= 3 && (
                <path className="fr-line f-in" d={buildFrame(11, connectLeft, connectRight)} />
            )}
        </g>
    );
};

/* 천장(위 프레임)에서 늘어지는 가는 실 + 끝에 별.
   할 일 바(z-index:1)보다 위(z-index:2)에 렌더 → 항상 보임 */
const ThreadWrap = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    color: ${(props) => props.theme.colors.primary};
    filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.6));

    .th-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .fr-curtain {
        transform-box: fill-box;
        transform-origin: 50% 0%;
        animation: ${sway} 4.5s ease-in-out infinite;
    }
    .th-line {
        stroke: currentColor;
        fill: none;
        stroke-width: 0.9;
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
    }
    .th-star {
        stroke: currentColor;
        fill: none;
        stroke-width: 1;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
        transform-box: fill-box;
        transform-origin: center;
        animation: ${twinkleStar} 3s ease-in-out infinite;
    }
`;

const ThreadDecor = () => (
    <ThreadWrap aria-hidden="true">
        <svg
            className="th-svg"
            viewBox="0 0 110 130"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g className="fr-curtain">
                <path className="th-line" d="M9 6 V46" />
                <path
                    className="th-star"
                    d="M9 45.5C9 49 9 49 10.5 49C9 49 9 49 9 52.5C9 49 9 49 7.5 49C9 49 9 49 9 45.5Z"
                />
            </g>
        </svg>
    </ThreadWrap>
);

const FrameDecor = ({
    level,
    connectLeft,
    connectRight,
}: {
    level: number;
    connectLeft: boolean;
    connectRight: boolean;
}) => {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const host = root.parentElement; // DaySlot
        if (!host) return;

        const onMove = (e: MouseEvent) => {
            const r = root.getBoundingClientRect();
            root.style.setProperty("--mx", `${e.clientX - r.left}px`);
            root.style.setProperty("--my", `${e.clientY - r.top}px`);
        };
        const onEnter = () => root.style.setProperty("--glow", "1");
        const onLeave = () => root.style.setProperty("--glow", "0");

        host.addEventListener("mousemove", onMove);
        host.addEventListener("mouseenter", onEnter);
        host.addEventListener("mouseleave", onLeave);

        return () => {
            host.removeEventListener("mousemove", onMove);
            host.removeEventListener("mouseenter", onEnter);
            host.removeEventListener("mouseleave", onLeave);
        };
    }, []);

    return (
        <FrameWrap ref={rootRef} className="cell-decor" aria-hidden="true">
            <svg
                className="fr-svg"
                viewBox="0 0 110 130"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <FrameShapes level={level} connectLeft={connectLeft} connectRight={connectRight} base />
            </svg>

            <svg
                className="fr-svg fr-glow"
                viewBox="0 0 110 130"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <FrameShapes level={level} connectLeft={connectLeft} connectRight={connectRight} />
            </svg>
        </FrameWrap>
    );
};

const DayCellDecor = ({
    tier,
    connectLeft = false,
    connectRight = false,
}: {
    tier: number;
    connectLeft?: boolean;
    connectRight?: boolean;
}) => {
    if (tier < 1) return null;
    return (
        <>
            <FrameDecor level={tier} connectLeft={connectLeft} connectRight={connectRight} />
            {tier >= 3 && !connectLeft && <ThreadDecor />}
        </>
    );
};

export default DayCellDecor;
