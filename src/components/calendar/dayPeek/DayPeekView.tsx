"use client";

import * as GemS from "./gem/GemDayPeek.styles";
import * as React from "react";
import { ChevronRight } from "lucide-react";
import type { DayPeekThemeProps } from "./DayPeek";
import { useListMotion, useSwapMotion } from "@/hooks/useMotion";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialDayPeek.styles";
import * as MapleS from "./maple/MapleDayPeek.styles";
import * as OceanS from './ocean/OceanDayPeek.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };

/** 홈의 "오늘" 칸과 같은 말: 마름모 머리글, 실선, 개수, 줄마다 카테고리 색 마름모 */
export default function DayPeekView({ dayKey, title, isToday, items, onOpenDay, labels }: DayPeekThemeProps) {
    const S = usePickTheme(STYLES);
    // 다른 날을 고르면 날짜 글씨와 그날 목록이 오는 쪽에서 들어온다(뒤 날이면 오른쪽에서). 그날 안에서 든 줄·빠진 줄·끝낸 줄은 한 줄씩
    const titleRef = React.useRef<HTMLSpanElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    useSwapMotion(dayKey, titleRef, { size: "line" });
    useSwapMotion(dayKey, listRef);
    useListMotion(listRef, { reset: dayKey, exit: "collapse" });
    return (
        <S.Wrap data-day-peek>
            <S.Head data-day-peek-head type="button" onClick={onOpenDay} $today={isToday}>
                <i className="hd" />
                <span className="title" ref={titleRef}>{title}</span>
                <span className="hr" />
                <b>{items.length}</b>
                <span className="open">{labels.openDay} <ChevronRight size={13} /></span>
            </S.Head>

            <S.List data-day-peek-list ref={listRef}>
                {items.length === 0 ? (
                    <S.Empty>{labels.empty}</S.Empty>
                ) : (
                    items.map(item => (
                        <S.Row data-day-peek-row key={item.id} type="button" $done={item.done} data-done={item.done ? "" : undefined} onClick={onOpenDay}>
                            <i className="mark" data-motion-mark="" style={{ borderColor: item.color || undefined, background: item.done ? (item.color || undefined) : undefined }} />
                            <span className="name">{item.title}</span>
                            <em>{item.time ?? labels.allDay}</em>
                        </S.Row>
                    ))
                )}
            </S.List>
        </S.Wrap>
    );
}
