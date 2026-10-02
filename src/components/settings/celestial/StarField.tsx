"use client";
import * as S from './StarField.styles';
/** Bounded SVG twinkles avoid continuous canvas drawing and resize allocations. */
export default function StarField() {
    return <S.Canvas viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true" data-ambient="celestial-stars">
        {Array.from({length:42},(_,i)=><circle key={i} cx={(i*137+29)%1000} cy={(i*83+11)%700} r={i%4===0?1.3:.7} style={{animationDelay:'-'+i%9+'s',animationDuration:5+i%5+'s'}} />)}
    </S.Canvas>;
}
