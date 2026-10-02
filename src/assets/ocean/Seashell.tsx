"use client";
import { useId } from 'react';
import * as S from './Seashell.styles';
export default function Seashell({ className }: { className?: string }) {
    const id = useId().replace(/:/g,'');
    return <S.Shell className={className} viewBox="0 0 160 150" aria-hidden="true" data-ambient="seashell">
        <defs><linearGradient id={`nacre-${id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="currentColor" stopOpacity=".17" /><stop offset=".5" stopColor="currentColor" stopOpacity=".03" /><stop offset="1" stopColor="currentColor" stopOpacity=".2" /></linearGradient></defs>
        <path className="body" fill={`url(#nacre-${id})`} d="M80 122 25 81Q7 65 23 53q-5-25 19-28 12-26 38-15 26-11 38 15 24 3 19 28 16 12-2 28Z" />
        <path className="ribs" d="M80 122 23 53m57 69L42 25m38 97V10m0 112 38-97m-38 97 57-69" />
        <path className="body" d="M62 121q18-12 36 0l-5 11H67Z" /><circle className="pearl" cx="80" cy="116" r="5" /><path className="wash" d="M10 140q35-12 70 0t70 0" />
    </S.Shell>;
}
