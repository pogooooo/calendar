"use client";

import * as S from "./CelestialHome.styles";
import type { MonthArchProps } from "../parts/MonthArch";
import { MoonDisc, Orbit, Star4, Star8 } from "@/components/ornament/celestial/CelestialOrnaments";
import { moonPhaseOfKey, principalPhases } from "@/lib/moonPhase";
import { labelKey, wallNow } from "@/lib/dateKey";

const W = 780;
const H = 132;
const L = 40;
const R = 740;
const BASE = 92;
const MAX_LOAD = 6;

/**
 * 한 달의 달빛 눈금 — 가로 금선 위에 날마다 세로 눈금(그날 일정이 많을수록 길다), 아래엔 그달의 삭·상현·보름·하현,
 * 보고 있는 날은 그날의 실제 달 모양을 궤도 고리 안에 띄우고 세로 줄로 금선에 잇는다. 비스듬한 바늘 없이 직선과 달만.
 */
export default function CelestialMonthArch({ daysInMonth, focusIdx, monthLoad, marks, focus }: MonthArchProps) {
    const at = focus ?? wallNow();
    const y = at.getFullYear();
    const m = at.getMonth();
    const keys = Array.from({ length: daysInMonth }, (_, i) => labelKey(new Date(y, m, i + 1)));
    const x = (i: number) => L + (i / Math.max(1, daysInMonth - 1)) * (R - L);
    const fx = x(Math.min(Math.max(focusIdx, 0), daysInMonth - 1));
    const phase = moonPhaseOfKey(keys[focusIdx] ?? keys[0]);
    const quarters = principalPhases(keys);

    return (
        <S.Arch viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {/* 금선 — 끝에 점과 점선 고리 */}
            <line className="line basel" x1={L - 22} y1={BASE} x2={R + 22} y2={BASE} />
            <circle className="fill" cx={L - 22} cy={BASE} r={2} />
            <circle className="fill" cx={R + 22} cy={BASE} r={2} />
            <circle className="line dash faint" cx={L - 22} cy={BASE} r={7} />
            <circle className="line dash faint" cx={R + 22} cy={BASE} r={7} />
            <line className="hair faint" x1={L - 22} y1={BASE - 30} x2={L - 22} y2={BASE + 22} />
            <line className="hair faint" x1={R + 22} y1={BASE - 30} x2={R + 22} y2={BASE + 22} />
            <Star4 cx={L - 22} cy={BASE - 36} r={4} className="fill faint" />
            <Star4 cx={R + 22} cy={BASE - 36} r={4} className="fill faint" />

            {/* 날마다 세로 눈금 — 일정 수만큼 길게, 닷새마다 아래에 점 */}
            {monthLoad.map((v, i) => {
                const c = Math.min(v, MAX_LOAD);
                return <line key={`t${i}`} className="tick" x1={x(i)} y1={BASE} x2={x(i)} y2={BASE - 5 - c * 4} strokeOpacity={0.28 + c * 0.11} />;
            })}
            {keys.map((_, i) => (i % 5 === 0 || i === daysInMonth - 1)
                ? <circle key={`d${i}`} className="fill faint" cx={x(i)} cy={BASE + 6} r={1.1} />
                : null)}

            {/* 그달의 삭·상현·보름·하현 */}
            {quarters.map((q) => (
                <g key={`q${q.index}`} className="quarter">
                    <line className="hair faint" x1={x(q.index)} y1={BASE + 6} x2={x(q.index)} y2={BASE + 15} />
                    <MoonDisc cx={x(q.index)} cy={BASE + 22} r={5.5} phase={q.phase} />
                </g>
            ))}

            {/* 마감(고리)·기념일(별) — 그날 눈금 위 */}
            {marks.map((mk) => {
                const i = mk.day - 1;
                const c = Math.min(monthLoad[i] ?? 0, MAX_LOAD);
                const top = BASE - 5 - c * 4 - 8;
                return mk.kind === "anv"
                    ? <Star4 key={`a${mk.day}`} cx={x(i)} cy={top} r={4.2} className="fill" />
                    : <circle key={`u${mk.day}`} className="line due" cx={x(i)} cy={top} r={2.8} />;
            })}

            {/* 보고 있는 날 — 세로 줄로 금선에 잇고, 궤도 고리 안에 그날의 달 */}
            <line className="line needle" x1={fx} y1={BASE} x2={fx} y2={62} />
            <circle className="line dash halo" cx={fx} cy={40} r={25} />
            <Orbit cx={fx} cy={40} r={18.5} at={(focusIdx / Math.max(1, daysInMonth - 1)) * 360} size={2.2} />
            <MoonDisc cx={fx} cy={40} r={11} phase={phase} />
            <Star8 cx={fx} cy={6} r={5} />
            <circle className="fill" cx={fx} cy={BASE} r={2.6} />
        </S.Arch>
    );
}
