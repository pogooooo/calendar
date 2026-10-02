import type { MonthArchProps } from '../parts/MonthArch';
import * as S from './OceanMonthArch.styles';
/** Daily loads form a shoreline; the shell marks the selected day. */
export default function OceanMonthArch({daysInMonth,focusIdx,monthLoad,marks}: MonthArchProps) {
    const x = (day: number) => 20+day/Math.max(1,daysInMonth-1)*560;
    return <S.Shoreline viewBox="0 0 600 100" aria-hidden="true" data-ambient="month-tide">
        <path className="wash" d="M0 70q75-20 150 0t150 0t150 0t150 0v30H0Z" /><path className="foam" d="M0 70q75-20 150 0t150 0t150 0t150 0" />
        {monthLoad.map((load,i)=><line key={i} className="day" x1={x(i)} x2={x(i)} y1="77" y2={77-5-Math.min(load,6)*4} opacity={.2+Math.min(load,6)*.1} />)}
        {marks.map(m=><circle key={`${m.kind}-${m.day}`} className="mark" cx={x(m.day-1)} cy="87" r={m.kind==='anv'?2.6:1.7} />)}
        <g className="pointer" transform={`translate(${x(focusIdx)} 31)`}><path d="M0 15-13 3q-4-5 1-8-2-6 5-6 3-6 7-3 4-3 7 3 7 0 5 6 5 3 1 8Z" /><path d="M0 15-12-5m12 20L-7-11m7 26V-14m0 29 7-26m-7 26 12-20" /><circle cy="14" r="2" /></g>
    </S.Shoreline>;
}
