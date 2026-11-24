"use client";

import * as React from "react";
import { ChevronRight, Plus } from "lucide-react";
import type { DayPeekThemeProps } from "./DayPeek";
import { useListMotion, useSwapMotion } from "@/hooks/useMotion";
import { usePickTheme, useThemeFamily, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialDayPeek.styles";
import * as GemS from "./gem/GemDayPeek.styles";
import * as MapleS from "./maple/MapleDayPeek.styles";
import * as OceanS from './ocean/OceanDayPeek.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: GemS };

/** 홈의 "오늘" 칸과 같은 말: 마름모 머리글, 실선, 개수, 줄마다 카테고리 색 마름모 */
export default function DayPeekView({ dayKey, title, isToday, items, onOpenDay, onAdd, labels }: DayPeekThemeProps) {
    const S = usePickTheme(STYLES);
    const family = useThemeFamily();
    const gem = family === "gem";
    const visible = gem ? items.slice(0, 4) : items;
    const remaining = items.length - visible.length;
    // 다른 날을 고르면 날짜 글씨와 그날 목록이 오는 쪽에서 들어온다(뒤 날이면 오른쪽에서). 그날 안에서 든 줄·빠진 줄·끝낸 줄은 한 줄씩
    const titleRef = React.useRef<HTMLSpanElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    useSwapMotion(dayKey, titleRef, { size: "line" });
    useSwapMotion(dayKey, listRef, { contentKeys: [JSON.stringify(visible.map(item => [item.id, item.title, item.time, item.done]))] });
    useListMotion(listRef, { reset: dayKey, exit: "collapse" });
    return (
        <S.Wrap data-day-peek>
            <div className={gem ? "gem-peek-actions" : undefined} style={gem ? undefined : { display: "contents" }}>
            <S.Head data-day-peek-head type="button" onClick={onOpenDay} $today={isToday}>
                <i className="hd" />
                <span className="title" ref={titleRef}>{title}</span>
                <span className="hr" />
                <b>{items.length}</b>
                <span className="open">{labels.openDay} <ChevronRight size={13} /></span>
            </S.Head>
            {gem && onAdd && <GemS.Add type="button" onClick={onAdd} aria-label={`${title} · ${labels.add}`} title={labels.add}><Plus size={17} aria-hidden="true" /></GemS.Add>}
            </div>

            <S.List data-day-peek-list ref={listRef}>
                {items.length === 0 ? (
                    <S.Empty>{labels.empty}</S.Empty>
                ) : (
                    visible.map(item => (
                        <S.Row data-day-peek-row key={item.id} type="button" $done={item.done} data-done={item.done ? "" : undefined} onClick={onOpenDay}>
                            <i className="mark" data-motion-mark="" style={{ borderColor: item.color || undefined, background: item.done ? (item.color || undefined) : undefined }} />
                            <span className="name">{item.title}</span>
                            <em>{item.time ?? labels.allDay}</em>
                        </S.Row>
                    ))
                )}
            </S.List>
            {gem && remaining > 0 && <GemS.More type="button" onClick={onOpenDay}>
                {labels.more(remaining)} <ChevronRight size={16} aria-hidden="true" />
            </GemS.More>}
        </S.Wrap>
    );
}
