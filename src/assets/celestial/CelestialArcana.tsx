"use client";
import * as S from './CelestialArcana.styles';
import { Armillary, MoonDisc, Orbit, Star4, Star8, f } from '@/components/ornament/celestial/CelestialOrnaments';

/**
 * 혼천의 인장 — 가운데 혼천의, 둘레엔 점선 궤도와 행성, 위엔 팔각별, 아래엔 달의 위상 줄과 아르카나 번호.
 * 비스듬한 선(엑스자·별자리 지그재그) 없이 동그라미·세로·가로선·달·별만. 입력은 받지 않는다.
 */
export default function CelestialArcana() {
    return <S.Seal viewBox="0 0 180 204" aria-hidden="true" focusable="false">
        <g className="engraving">
            <circle className="line dash" cx="90" cy="92" r="64" />
            <circle className="hair" cx="90" cy="92" r="58" />
            {Array.from({ length: 36 }, (_, i) => {
                const a = (i / 36) * Math.PI * 2;
                const r1 = 58, r2 = i % 3 === 0 ? 53 : 55.5;
                return <line key={i} className="hair" x1={f(90 + r1 * Math.cos(a))} y1={f(92 + r1 * Math.sin(a))} x2={f(90 + r2 * Math.cos(a))} y2={f(92 + r2 * Math.sin(a))} />;
            })}
        </g>
        <g className="orbits">
            <Orbit cx={90} cy={92} r={64} at={50} size={3} spin />
            <Orbit cx={90} cy={92} r={58} at={230} size={2.2} hollow spin />
        </g>
        <Armillary cx={90} cy={92} r={34} axis={1.25} />
        <Star8 cx={90} cy={14} r={9} />
        <Star4 cx={24} cy={30} r={4.5} className="fill twinkle" />
        <Star4 cx={156} cy={30} r={4.5} className="fill twinkle" />
        <g className="phases">
            <line className="hair" x1="26" y1="170" x2="154" y2="170" />
            <circle className="fill" cx="26" cy="170" r="1.6" />
            <circle className="fill" cx="154" cy="170" r="1.6" />
            {[0.125, 0.25, 0.5, 0.75, 0.875].map((ph, i) => <MoonDisc key={ph} cx={50 + i * 20} cy={170} r={4.6} phase={ph} />)}
        </g>
        <text x="90" y="198" textAnchor="middle">XVII · XVIII · XIX</text>
    </S.Seal>;
}
