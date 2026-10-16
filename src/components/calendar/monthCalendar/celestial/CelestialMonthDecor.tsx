"use client";
/**
 * Celestial 월간의 칸 표시와 장면 — 별의 지도. 문양은 글 위에 두지 않는다(여백·괘선·모서리만, 직선·달·별·혼천의만):
 *   - 괘선이 만나는 자리마다 작은 네 갈래 별(칸의 왼쪽 위 모서리) — 달을 넘기면 자오선이 지나는 차례로 반짝인다
 *   - 칸 오른쪽 위 구석에 그날의 달 — 삭·상현·보름·하현 무렵은 또렷하게(폰·위젯에는 그날만). + 단추가 뜨면 비켜 준다
 *   - 오늘은 숫자 둘레를 도는 궤도와 행성 — 고리의 위아래는 숫자 뒤로 지난다(토성의 고리처럼)
 *   - 고른 날은 네 모서리의 조준선이 다가와 잡힌다
 *   - 장면: 달을 넘기면 눈금 새긴 세로 금선(자오선) 하나가 오는 쪽에서 판을 건너가고, 금선이 지난 자리부터 새 달이다
 *     (판의 갈림은 starMotion 의 clip-path — 같은 결·같은 길이). 지나가는 동안만 글 위를 스친다.
 * 판(Board)은 따로 없다. 달 머리의 혼천의(CelestialMonthInstrument)는 달을 넘길 때 한 달만큼 돈다.
 */
import * as React from "react";
import { MoonDisc, ringPath, star4Path } from "@/components/ornament/celestial/CelestialOrnaments";
import { moonPhaseOfKey } from "@/lib/moonPhase";
import { SWEEP_PASS } from "@/styles/celestial/motion";
import type { CellMarksProps, MonthStageProps } from "../MonthDecor.types";
import * as S from "./CelestialMonthDecor.styles";

/** 삭·상현·보름·하현에 하루 안쪽으로 가까운가 */
const near = (p: number, q: number) => Math.min(Math.abs(p - q), 1 - Math.abs(p - q)) < 0.034;
const principal = (p: number) => near(p, 0) || near(p, 0.25) || near(p, 0.5) || near(p, 0.75);

/** 오늘 숫자를 도는 고리 — 숫자 알약의 가운데를 원점으로 */
const RING = ringPath(0, 0, 19, 7, 0);
/** 자오선 끝의 별 */
const TIP = star4Path(0, 0, 6);

export const Board = () => null;

export function Stage({ month, direction }: MonthStageProps) {
    const key = month.getFullYear() * 12 + month.getMonth();
    const [first] = React.useState(key);
    // 처음 연 달에는 없다 — 넘길 때마다 새로 그려져(key) 한 번 건넌다
    if (key === first) return null;
    return (
        <S.Meridian key={key} data-dir={direction < 0 ? "prev" : "next"} aria-hidden="true">
            <i className="glow" />
            <i className="rule" />
            <i className="ticks" />
            <svg className="tip" viewBox="-7 -7 14 14" focusable="false"><path className="fill" d={TIP} /></svg>
            <svg className="tip foot" viewBox="-7 -7 14 14" focusable="false"><path className="fill" d={TIP} /></svg>
        </S.Meridian>
    );
}

export function Marks({ cellKey, isToday, isSelected, col, row }: CellMarksProps) {
    const phase = moonPhaseOfKey(cellKey);
    // 별은 칸의 왼쪽 위 모서리(판의 col/7 자리) — 자오선이 그 자리를 지나는 때에 반짝인다(다음 달: 오른쪽에서 왼쪽으로)
    const pass = { "--pass-next": `${SWEEP_PASS[7 - col]}ms`, "--pass-prev": `${SWEEP_PASS[col]}ms` } as React.CSSProperties;
    return <>
        {row > 0 && col > 0 && (
            <S.Node viewBox="-6 -6 12 12" aria-hidden="true" focusable="false" style={pass}>
                <path className="fill" d={star4Path(0, 0, 5.4)} />
            </S.Node>
        )}
        <S.Moon viewBox="-6 -6 12 12" aria-hidden="true" focusable="false" data-principal={principal(phase) ? "" : undefined}>
            <MoonDisc cx={0} cy={0} r={4.4} phase={phase} />
        </S.Moon>
        {isToday && (
            <S.Ring viewBox="-26 -12 52 24" aria-hidden="true" focusable="false">
                <path className="line" d={RING} />
                <circle className="fill orbiter" r={2.1} style={{ offsetPath: `path("${RING}")` }} />
            </S.Ring>
        )}
        {isSelected && <S.Reticle aria-hidden="true"><i /><i /><i /><i /></S.Reticle>}
    </>;
}
