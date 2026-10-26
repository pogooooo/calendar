"use client";
import type { MonthArchProps } from '../parts/MonthArch';
import { FacetedGem } from '@/components/ornament/gem/GemOrnaments';
import * as S from './GemHomeLayout.styles';

export default function GemMonthArch({daysInMonth,focusIdx,monthLoad,marks}:MonthArchProps) {
    const x=(i:number)=>24+i*712/Math.max(1,daysInMonth-1);
    return <S.Arch viewBox="0 0 760 110" aria-hidden="true">
        <path className="gold" d="M12 72H748M12 75H748" stroke="currentColor" strokeWidth=".55" opacity=".5"/>
        {Array.from({length:daysInMonth},(_,i)=><g key={i}>
            <path d={`M${x(i)} 72v-${5+Math.min(monthLoad[i]??0,6)*4}`} stroke="currentColor" strokeWidth="1" opacity=".4"/>
            {(i%5===0 || i===daysInMonth-1)&&<text x={x(i)} y="98" textAnchor="middle">{i+1}</text>}
        </g>)}
        {marks.map((m,i)=><path key={i} className="gold" d={`M${x(m.day-1)} 79l2 3-2 3-2-3Z`} fill="currentColor"/>)}
        <FacetedGem cx={x(Math.min(daysInMonth-1,Math.max(0,focusIdx)))} cy={40} r={16}/>
    </S.Arch>;
}
