"use client";

import { memo, type ReactNode } from 'react';
import { FacetedGem, GemSeal, JewelSprig } from '@/components/ornament/gem/GemOrnaments';
import type { NavIconName } from '../NavIcon';
import type { WidgetKind } from '@/store/useWidgetStore';
import type { DialogKind, Arcanum } from '@/components/dialog/arcana';
import * as S from './GemAssets.styles';

export function GemTitleMark() { return <S.Seal><GemSeal size={22}/></S.Seal>; }
export function GemNavIcon({ fallback }: {name: NavIconName; size: number; fallback: ReactNode}) { return <>{fallback}</>; }
export function GemArrow({width,height,stroke='currentColor',isRight}:{width:number;height:number;stroke?:string;isRight:boolean}) {
    return <svg width={width} height={height} viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <g transform={isRight ? undefined : 'rotate(180 14 14)'} stroke={stroke} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 14H23M17 8 23 14 17 20M4 11 7 14 4 17"/>
        </g>
    </svg>;
}
export const GemSticker = memo(function GemSticker({isFilled}:{isFilled:boolean;idx:number}) { return <S.Sticker $filled={isFilled}><GemSeal size={36}/></S.Sticker>; });
export function GemDayCellDecor() { return null; }
export function GemWidgetCharm() { return null; }
export function GemSidebarDesign({isHovered}:{isHovered:boolean}) {
    return <S.Sidebar viewBox="0 0 28 220" aria-hidden="true" data-hover={isHovered} fill="none" stroke="currentColor">
        <path d="M14 0V66M14 154V220" strokeWidth=".7" opacity=".65"/>
        <path d="M14 65C14 83 26 88 23 100S7 108 10 97C12 90 20 97 14 104M14 155C14 137 2 132 5 120S21 112 18 123C16 130 8 123 14 116" strokeWidth=".85"/>
        <path d="M14 96 20 107 19 117 14 124 9 117 8 107Z" strokeWidth=".7"/>
        <path d="M14 100 17 108 16 116 14 120 12 116 11 108Z" fill="currentColor" fillOpacity=".2" strokeWidth=".5"/>
    </S.Sidebar>;
}
export function GemEmptyArt() {
    return <S.Empty aria-hidden="true"><svg viewBox="0 0 160 120">
        <g className="gold" transform="translate(-5 45) scale(.8)"><JewelSprig/></g>
        <g className="gold" transform="translate(85 45) scale(.8)"><JewelSprig flip/></g>
        <FacetedGem cx={80} cy={50} r={23}/>
    </svg></S.Empty>;
}
export function GemWidgetDecor({busy}:{kind:WidgetKind;locked:boolean;busy:boolean}) {
    return <S.Widget aria-hidden="true" data-ambient="widget-decor"><GemSeal size={busy ? 40 : 90}/></S.Widget>;
}
export function GemEmblem({size}:{kind:DialogKind;size:number}) { return <S.Seal><GemSeal size={size}/></S.Seal>; }
export const GEM_DIALOGS: Record<DialogKind,Arcanum> = {
    info:{num:'I',name:'Clarity'}, confirm:{num:'II',name:'Intention'},
    danger:{num:'III',name:'Attention'}, ok:{num:'IV',name:'Brilliance'},
};
export const GemHeroScene = memo(function GemHeroScene({busy=false}:{busy?:boolean}) {
    return <S.Hero aria-hidden="true" data-busy={busy}><svg viewBox="0 0 400 400">
        <g className="gold" transform="translate(18 200) scale(1.8)"><JewelSprig/></g>
        <g className="gold" transform="translate(202 200) scale(1.8)"><JewelSprig flip/></g>
        <FacetedGem cx={200} cy={175} r={94}/>
    </svg></S.Hero>;
});
