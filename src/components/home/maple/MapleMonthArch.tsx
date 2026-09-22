"use client";

import * as S from "./MapleMonthArch.styles";
import type { MonthArchProps } from "../parts/MonthArch";

/* 놋쇠판(gauge-dial.webp, 1024×475)에서 잰 반원의 중심과 반지름 — scripts/maple-assets.mjs 가 잘라낸 그대로 */
const CX = 512;
const CY = 452;
const RX = 497;
const RY = 437;
const MAX_LOAD = 6;

/** 반원 위의 점. 그림이 완전한 원이 아니라 가로·세로 반지름을 따로 둔다 */
const polar = (k: number, deg: number): [number, number] => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [CX + RX * k * Math.cos(a), CY + RY * k * Math.sin(a)];
};

/** 작은 단풍잎 실루엣 (C6 을 12×12 로 단순화한 것) */
const LEAF = [[6, 0], [7.4, 3.2], [10.6, 1.8], [9.2, 5], [12, 6.4], [9, 7.6], [9.8, 10.6], [7, 9.2], [6, 12], [5, 9.2], [2.2, 10.6], [3, 7.6], [0, 6.4], [2.8, 5], [1.4, 1.8], [4.6, 3.2]];
const leafPath = (x: number, y: number, s: number) =>
    "M " + LEAF.map(([px, py]) => `${x + (px - 6) * s} ${y + (py - 6) * s}`).join(" L ") + " Z";

/** 놋쇠 해시계 위의 달. 날마다의 일정 수가 테두리 안쪽 눈금 길이, 오늘이 바늘 */
export default function MapleMonthArch({ daysInMonth, focusIdx, monthLoad, marks }: MonthArchProps) {
    const dayDeg = (i: number) => -90 + (i / Math.max(1, daysInMonth - 1)) * 180;
    const [tipX, tipY] = polar(0.9, dayDeg(focusIdx));

    return (
        <S.Dial aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brass" src="/themes/maple/gauge-dial.webp" alt="" draggable={false} />
            <svg className="ink" viewBox={`0 ${-S.OVERHANG} 1024 ${475 + S.OVERHANG}`}>
                {monthLoad.map((v, i) => {
                    const capped = Math.min(v, MAX_LOAD);
                    if (capped === 0) return null;
                    const deg = dayDeg(i);
                    const [x1, y1] = polar(0.96, deg);
                    const [x2, y2] = polar(0.96 - capped * 0.028, deg);
                    return <line key={`t${i}`} className="tick" x1={x1} y1={y1} x2={x2} y2={y2} strokeOpacity={0.35 + capped * 0.1} />;
                })}

                {Array.from({ length: daysInMonth }, (_, i) => {
                    if (i % 5 !== 0) return null;
                    const deg = dayDeg(i);
                    const [x1, y1] = polar(0.985, deg);
                    const [x2, y2] = polar(1.02, deg);
                    return <line key={`m${i}`} className="major" x1={x1} y1={y1} x2={x2} y2={y2} />;
                })}

                {marks.map(mk => {
                    const deg = dayDeg(mk.day - 1);
                    const [ix, iy] = polar(1.02, deg);
                    const [ox, oy] = polar(1.075, deg);
                    return (
                        <g key={`${mk.kind}${mk.day}`}>
                            <line className="mkline" x1={ix} y1={iy} x2={ox} y2={oy} />
                            {mk.kind === "anv"
                                ? <path className="mkanv" d={leafPath(ox, oy, 2.2)} />
                                : <circle className="mkdue" cx={ox} cy={oy} r="9" />}
                        </g>
                    );
                })}

                <line className="nshadow" x1={CX + 3} y1={CY + 4} x2={tipX + 3} y2={tipY + 4} />
                <line className="nray" x1={CX} y1={CY} x2={tipX} y2={tipY} />
                <path className="ncap" d={leafPath(tipX, tipY, 2.6)} />
                <circle className="pivot" cx={CX} cy={CY} r="13" />
            </svg>
        </S.Dial>
    );
}
