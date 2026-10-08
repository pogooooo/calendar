"use client";
import { useId } from 'react';
import * as S from './CelestialArcana.styles';

/** Decorative star, lunar crescent and engraved astrolabe; never intercepts input. */
export default function CelestialArcana() {
    const id = useId().replace(/:/g, '');
    return <S.Seal viewBox="0 0 180 200" aria-hidden="true" focusable="false">
        <defs><mask id={`moon-${id}`}><circle cx="90" cy="94" r="22" fill="white"/><circle cx="100" cy="87" r="21" fill="black"/></mask></defs>
        <g className="engraving"><path d="M22 150V62Q90-8 158 62V150"/><path d="M28 147V65Q90 2 152 65V147"/><circle cx="90" cy="94" r="60"/><circle cx="90" cy="94" r="49" strokeDasharray="1 5"/><path d="M20 94H160M90 24V164M48 52L132 136M48 136L132 52"/></g>
        <g className="orbit">{Array.from({length:24},(_,i)=><path key={i} d="M90 30V35" transform={`rotate(${i*15} 90 94)`}/>)}</g>
        <circle className="moon" cx="90" cy="94" r="22" mask={`url(#moon-${id})`}/>
        <path className="star" d="M90 12L93 23L104 26L93 29L90 40L87 29L76 26L87 23Z"/>
        <g className="constellation"><path d="M42 164L61 175L90 164L119 175L138 164"/>{[42,61,90,119,138].map((x,i)=><circle key={x} cx={x} cy={i%2?175:164} r="2"/>)}</g>
        <text x="90" y="194" textAnchor="middle">XVII · XVIII · XIX</text>
    </S.Seal>;
}
