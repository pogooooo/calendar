"use client";
import { useCallback, useId, useState } from 'react';
import Objet from '@/components/objet/Objet';
import * as S from './CelestialArcana.styles';

const TODAY = { phase: 'today' };

/**
 * Decorative star, lunar crescent and engraved astrolabe; never intercepts input.
 * liveMoon: 새긴 초승달 대신 오늘의 실제 위상을 보이는 3D 달(오브제)을 그 자리에 — 홈의 연감 표지에서만.
 * WebGL 이 없으면 예전 초승달로 돌아간다.
 */
export default function CelestialArcana({ liveMoon = false }: { liveMoon?: boolean }) {
    const id = useId().replace(/:/g, '');
    const [flat, setFlat] = useState(false);
    const onFail = useCallback(() => setFlat(true), []);
    const live = liveMoon && !flat;
    const seal = <S.Seal viewBox="0 0 180 200" aria-hidden="true" focusable="false" $fill={liveMoon}>
        <defs><mask id={`moon-${id}`}><circle cx="90" cy="94" r="22" fill="white"/><circle cx="100" cy="87" r="21" fill="black"/></mask></defs>
        <g className="engraving"><path d="M22 150V62Q90-8 158 62V150"/><path d="M28 147V65Q90 2 152 65V147"/><circle cx="90" cy="94" r="60"/><circle cx="90" cy="94" r="49" strokeDasharray="1 5"/><path d="M20 94H160M90 24V164M48 52L132 136M48 136L132 52"/></g>
        <g className="orbit">{Array.from({length:24},(_,i)=><path key={i} d="M90 30V35" transform={`rotate(${i*15} 90 94)`}/>)}</g>
        {!live && <circle className="moon" cx="90" cy="94" r="22" mask={`url(#moon-${id})`}/>}
        <path className="star" d="M90 12L93 23L104 26L93 29L90 40L87 29L76 26L87 23Z"/>
        <g className="constellation"><path d="M42 164L61 175L90 164L119 175L138 164"/>{[42,61,90,119,138].map((x,i)=><circle key={x} cx={x} cy={i%2?175:164} r="2"/>)}</g>
        <text x="90" y="194" textAnchor="middle">XVII · XVIII · XIX</text>
    </S.Seal>;
    if (!liveMoon) return seal;
    return <S.Frame>
        {seal}
        {live && <S.Moon><Objet name="celestial/moon" size="100%" options={TODAY} interaction="none" onFail={onFail} /></S.Moon>}
    </S.Frame>;
}
