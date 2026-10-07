"use client";
/**
 * Celestial 의 바탕 장면 — 천천히 도는 하늘(three.js, CelestialSky). 내용 뒤에 깔린다.
 * WebGL 이 없으면 예전 그림(오른쪽 위의 별도 바퀴·별자리·달, 반짝이는 잔별, 가끔 지나는 별똥)으로 물러난다.
 */
import { useCallback, useState } from "react";
import CelestialSky from "./CelestialSky";
import * as S from "./CelestialAtmosphere.styles";

export default function CelestialAtmosphere() {
    const [flat, setFlat] = useState(false);
    const onFail = useCallback(() => setFlat(true), []);
    return <S.Sky aria-hidden="true" data-ambient="celestial">
        {!flat && <CelestialSky onFail={onFail} />}
        {flat && <>
            <svg className="chart" viewBox="0 0 320 320" fill="none">
                <g className="wheel"><circle cx="160" cy="160" r="136" /><circle cx="160" cy="160" r="128" />
                    {Array.from({length:24},(_,i)=><path key={i} d="M160 24v7" transform={`rotate(${i*15} 160 160)`} />)}
                </g>
                <g className="constellation"><path d="M72 174l49-82 46 38 53-57 35 109-74 54-109-62" />
                    {[[72,174],[121,92],[167,130],[220,73],[255,182],[181,236]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2" />)}
                </g>
                <path className="moon" d="M165 139a24 24 0 1 0 17 40 26 26 0 0 1-17-40Z" />
            </svg>
            {Array.from({length:26},(_,i)=><i key={i} className="glint" style={{left:`${(i*37+9)%100}%`,top:`${(i*53+7)%100}%`,animationDelay:`-${i%8}s`,animationDuration:`${5+i%5}s`}} />)}
            {[0,1].map(i=><span key={i} className={`comet comet-${i}`} />)}
        </>}
    </S.Sky>;
}
