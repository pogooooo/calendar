"use client";

import { useEffect, useRef } from "react";
import * as S from "./DayCellDecor.styles";


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
    const corners = level >= 3 ? buildCorners(connectLeft, connectRight) : "";
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
        <S.FrameWrap ref={rootRef} className="cell-decor" aria-hidden="true">
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

        </S.FrameWrap>
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
        </>
    );
};

export default DayCellDecor;
