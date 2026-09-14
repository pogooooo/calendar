"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import type { DayPeekThemeProps } from "../DayPeek";
import * as S from "./CelestialDayPeek.styles";

/** 홈의 "오늘" 칸과 같은 말: 마름모 머리글, 실선, 개수, 줄마다 카테고리 색 마름모 */
export default function CelestialDayPeek({ title, isToday, items, onOpenDay, labels }: DayPeekThemeProps) {
    return (
        <S.Wrap>
            <S.Head type="button" onClick={onOpenDay} $today={isToday}>
                <i className="hd" />
                <span className="title">{title}</span>
                <span className="hr" />
                <b>{items.length}</b>
                <span className="open">{labels.openDay} <ChevronRight size={13} /></span>
            </S.Head>

            <S.List>
                {items.length === 0 ? (
                    <S.Empty>{labels.empty}</S.Empty>
                ) : (
                    items.map(item => (
                        <S.Row key={item.id} type="button" $done={item.done} onClick={onOpenDay}>
                            <i className="mark" style={{ borderColor: item.color || undefined, background: item.done ? (item.color || undefined) : undefined }} />
                            <span className="name">{item.title}</span>
                            <em>{item.time ?? labels.allDay}</em>
                        </S.Row>
                    ))
                )}
            </S.List>
        </S.Wrap>
    );
}
