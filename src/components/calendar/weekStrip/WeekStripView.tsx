"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WeekStripThemeProps } from "./WeekStrip";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialWeekStrip.styles";
import * as MapleS from "./maple/MapleWeekStrip.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

export default function WeekStripView({
    days, dayNames, title, isTodayShown,
    onPrevWeek, onNextWeek, onToday, onSelect, swipe, labels,
}: WeekStripThemeProps) {
    const S = usePickTheme(STYLES);
    return (
        <S.Strip {...swipe}>
            <S.Head>
                <button type="button" onClick={onPrevWeek} aria-label={labels.prevWeek}>
                    <ChevronLeft size={16} />
                </button>
                {/* key 를 붙여야 주가 바뀔 때 들어오는 몸짓이 다시 재생된다 */}
                <span className="title" key={title}>{title}</span>
                {!isTodayShown && (
                    <button type="button" className="today" onClick={onToday}>{labels.today}</button>
                )}
                <button type="button" onClick={onNextWeek} aria-label={labels.nextWeek}>
                    <ChevronRight size={16} />
                </button>
            </S.Head>

            <S.Days role="tablist">
                {days.map((d, i) => (
                    <S.Day
                        key={d.key}
                        type="button"
                        role="tab"
                        aria-selected={d.isSelected}
                        aria-label={`${d.date.getMonth() + 1}/${d.date.getDate()} ${dayNames[i]}`}
                        $selected={d.isSelected}
                        $today={d.isToday}
                        $weekend={d.isWeekend}
                        onClick={() => onSelect(d.date)}
                    >
                        <span className="name">{dayNames[i]}</span>
                        <span className="num">{d.date.getDate()}</span>
                        <span className="dots" aria-hidden>
                            {d.dots.map((c, j) => <i key={j} style={{ background: c }} />)}
                            {d.count > d.dots.length && <em>+{d.count - d.dots.length}</em>}
                        </span>
                    </S.Day>
                ))}
            </S.Days>
        </S.Strip>
    );
}
