"use client";
import * as React from "react";
import { Armillary, Orbit, f, star4Path } from "@/components/ornament/celestial/CelestialOrnaments";
import * as S from "./CelestialMonthDecor.styles";

/**
 * 달 머리의 혼천의 — 가운데 혼천의, 둘레엔 열두 달의 별을 꿴 고리. 지금 펼친 달의 별이 맨 위에서 빛나고,
 * 달을 넘기면 고리가 한 달(30°)만큼 돈다(해를 넘겨도 돌아온 만큼만 — 쌓인 각을 든다). 행성은 천천히 궤도를 돈다.
 */
export default function CelestialMonthInstrument({ month }: { month?: Date }) {
    const index = month ? month.getFullYear() * 12 + month.getMonth() : 0;
    const [base] = React.useState(index);
    const turn = -(index - base) * 30 - (base % 12) * 30;
    const current = ((index % 12) + 12) % 12;
    return (
        <S.Instrument viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <g className="dial" style={{ transform: `rotate(${turn}deg)` }}>
                <circle className="hair" cx={32} cy={32} r={29} />
                {Array.from({ length: 12 }, (_, i) => {
                    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                    const on = i === current;
                    return <path key={i} className={on ? "fill now" : "fill"} d={star4Path(f(32 + 29 * Math.cos(a)), f(32 + 29 * Math.sin(a)), on ? 4.2 : 2)} />;
                })}
            </g>
            <Orbit cx={32} cy={32} r={22} at={140} size={1.6} dashed spin />
            <Armillary cx={32} cy={32} r={13} axis={1.25} />
        </S.Instrument>
    );
}
