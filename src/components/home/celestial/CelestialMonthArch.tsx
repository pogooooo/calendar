"use client";

import * as S from "./CelestialHome.styles";
import type { MonthArchProps } from "../parts/MonthArch";

const CX = 120;
const CY = 122;
const R = 104;
const MAX_LOAD = 6;

const polar = (r: number, deg: number): [number, number] => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};

const diamond = (x: number, y: number, s: number) => ({
    x: x - s / 2,
    y: y - s / 2,
    width: s,
    height: s,
    transform: `rotate(45 ${x} ${y})`,
});

const starPath = (x: number, y: number, s: number) =>
    `M ${x} ${y - s} L ${x + s * 0.24} ${y - s * 0.24} L ${x + s} ${y}` +
    ` L ${x + s * 0.24} ${y + s * 0.24} L ${x} ${y + s} L ${x - s * 0.24} ${y + s * 0.24}` +
    ` L ${x - s} ${y} L ${x - s * 0.24} ${y - s * 0.24} Z`;

const SPOKES = Array.from({ length: 45 }, (_, i) => -88 + i * 4);

/** 금빛 실선의 반원 눈금판. 날마다의 일정 수가 안쪽 눈금 길이, 오늘이 바늘 */
export default function CelestialMonthArch({ daysInMonth, focusIdx, monthLoad, marks }: MonthArchProps) {
    const dayDeg = (i: number) => -90 + (i / Math.max(1, daysInMonth - 1)) * 180;

    const [rayTipX, rayTipY] = polar(R - 1, dayDeg(focusIdx));
    const [crossAX, crossAY] = polar((R - 1) * 0.62, dayDeg(focusIdx) - 3.4);
    const [crossBX, crossBY] = polar((R - 1) * 0.62, dayDeg(focusIdx) + 3.4);

    return (
        <S.Arch viewBox="0 0 240 132" aria-hidden="true">
            <line className="basel" x1={CX - R - 4} y1={CY} x2={CX + R + 4} y2={CY} />

            {SPOKES.map(deg => {
                const [x1, y1] = polar(34, deg);
                const [x2, y2] = polar(R - 4, deg);
                return <line key={`s${deg}`} className="spoke" x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}

            <path className="base" d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} />
            <path className="base2" d={`M ${CX - R - 5} ${CY} A ${R + 5} ${R + 5} 0 0 1 ${CX + R + 5} ${CY}`} />

            {monthLoad.map((v, i) => {
                const deg = dayDeg(i);
                const capped = Math.min(v, MAX_LOAD);
                const [x1, y1] = polar(R - 1, deg);
                const [x2, y2] = polar(R - 4 - capped * 3.4, deg);
                return (
                    <line
                        key={`t${i}`}
                        className="tick"
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        strokeOpacity={0.18 + capped * 0.13}
                    />
                );
            })}

            {Array.from({ length: daysInMonth }, (_, i) => {
                if (i % 5 !== 0) return null;
                const deg = dayDeg(i);
                const [x1, y1] = polar(R, deg);
                const [x2, y2] = polar(R + 3, deg);
                return <line key={`m${i}`} className="major" x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}

            {marks.map(mk => {
                const deg = dayDeg(mk.day - 1);
                const [ix, iy] = polar(R + 3, deg);
                const [ox, oy] = polar(R + 10, deg);
                return (
                    <g key={`${mk.kind}${mk.day}`}>
                        <line className="mkline" x1={ix} y1={iy} x2={ox} y2={oy} />
                        {mk.kind === "anv" ? (
                            <path className="mkanv" d={starPath(ox, oy, 3.6)} />
                        ) : (
                            <rect className="mkdue" {...diamond(ox, oy, 6)} />
                        )}
                    </g>
                );
            })}

            <line className="nray" x1={CX} y1={CY} x2={rayTipX} y2={rayTipY} />
            <line className="ncross" x1={crossAX} y1={crossAY} x2={crossBX} y2={crossBY} />
            <rect className="ncap" {...diamond(rayTipX, rayTipY, 7.4)} />
            <rect className="fin" {...diamond(CX, CY, 7)} />
        </S.Arch>
    );
}
