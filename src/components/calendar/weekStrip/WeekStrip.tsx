"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import useSwipe from "@/hooks/useSwipe";
import { fx } from "@/lib/fx";
import { expandTodos } from "@/hooks/useExpandedTodos";
import { getWeekDates } from "@/utils/DateUtils";
import { localDateKey, endDateKey, labelKey, wallNow, zonedTime } from "@/lib/dateKey";
import useProjectStore from "@/store/useProjectStore";
import { projectCalendarItems } from "@/lib/projectCalendar";
import type { TodoType, CategoryType } from "@/types";
import View from "./WeekStripView";

/**
 * 폰의 주간 띠 — 일주일을 한 줄로 놓고 하루를 고른다.
 *
 * 폰에서 주간 달력(7칸 격자)은 칸이 50px 이라 일정이 마름모로만 찍혀 읽을 게 없었다.
 * 그래서 주간과 일간을 하나로 합쳤다: 위에 이 띠, 아래에 그날의 일간 화면.
 * 띠는 날짜와 "그날 일정이 있다"는 점 몇 개만 보여준다. 내용은 아래 일간이 맡는다.
 */
export interface WeekStripProps {
    selectedDate: Date;
    onSelect: (date: Date) => void;
    todos: TodoType[];
    categories: CategoryType[];
}

export interface WeekStripDay {
    date: Date;
    key: string;
    isToday: boolean;
    isSelected: boolean;
    isWeekend: boolean;
    /** 그날 일정의 카테고리 색 (최대 3개) */
    dots: string[];
    /** 그날 일정 개수 */
    count: number;
}

export interface WeekStripThemeProps {
    days: WeekStripDay[];
    dayNames: string[];
    /** 띠 머리글: "2026년 9월" 꼴 */
    title: string;
    isTodayShown: boolean;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    onSelect: (date: Date) => void;
    swipe: ReturnType<typeof useSwipe>;
    labels: { prevWeek: string; nextWeek: string; today: string };
}

export default function WeekStrip({ selectedDate, onSelect, todos, categories }: WeekStripProps) {
    const t = useT();

    const weekDates = React.useMemo(() => getWeekDates(selectedDate), [selectedDate]);
    const projects = useProjectStore((s) => s.projects);

    // 아래 일간 화면은 프로젝트와 그 태스크도 그날의 일정으로 보여준다. 띠의 점도 같은 눈으로 센다.
    const allItems = React.useMemo<TodoType[]>(() => [...todos, ...projectCalendarItems(projects)], [todos, projects]);
    const todayKey = localDateKey(new Date());
    // 칸 Date(고른 날·주의 날들)의 날 키는 labelKey — localDateKey 로 읽으면 고른 시간대가 기기보다 서쪽일 때 하루 앞 날이 된다
    const selectedKey = labelKey(selectedDate);

    const days = React.useMemo<WeekStripDay[]>(() => {
        // 창은 실제 순간으로 — 첫날·끝날(고른 시간대)의 0시
        const first = zonedTime(labelKey(weekDates[0]));
        const last = zonedTime(labelKey(weekDates[6]));
        const expanded = expandTodos(allItems, first, last);
        const colorOf = (id: string) => categories.find(c => c.id === id)?.color ?? "";

        return weekDates.map((date) => {
            const key = labelKey(date);
            const onDay = expanded.filter(td =>
                td.startAt && td.endAt && localDateKey(td.startAt) <= key && key <= endDateKey(td.startAt, td.endAt));
            // 점 하나가 일정 하나. 셋을 넘으면 +N 으로 줄인다.
            const dots = onDay.slice(0, 3).map(td => colorOf(td.categoryId) || "currentColor");
            return {
                date, key,
                isToday: key === todayKey,
                isSelected: key === selectedKey,
                isWeekend: date.getDay() === 0 || date.getDay() === 6,
                dots,
                count: onDay.length,
            };
        });
    }, [weekDates, allItems, categories, todayKey, selectedKey]);

    const shift = React.useCallback((days: number) => {
        fx.emit("month-flip", { direction: days > 0 ? 1 : -1 });
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        onSelect(d);
    }, [selectedDate, onSelect]);

    const onPrevWeek = React.useCallback(() => shift(-7), [shift]);
    const onNextWeek = React.useCallback(() => shift(7), [shift]);
    // 고른 시간대의 지금 (기기와 같은 시간대면 new Date() 와 같다)
    const onToday = React.useCallback(() => onSelect(wallNow()), [onSelect]);
    const swipe = useSwipe(onNextWeek, onPrevWeek);

    const title = t.calendar.monthTitle(selectedDate.getFullYear(), selectedDate.getMonth() + 1);

    return (
        <View
            days={days}
            dayNames={t.calendar.days}
            title={title}
            isTodayShown={days.some(d => d.isToday)}
            onPrevWeek={onPrevWeek}
            onNextWeek={onNextWeek}
            onToday={onToday}
            onSelect={onSelect}
            swipe={swipe}
            labels={{ prevWeek: t.calendar.prevWeek, nextWeek: t.calendar.nextWeek, today: t.home.today }}
        />
    );
}
