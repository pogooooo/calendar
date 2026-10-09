"use client";

import * as React from "react";
import { useT } from "@/i18n/useT";
import { expandTodos } from "@/hooks/useExpandedTodos";
import { localDateKey, endDateKey, labelKey, wallTime, zonedTime } from "@/lib/dateKey";
import useProjectStore from "@/store/useProjectStore";
import { projectCalendarItems } from "@/lib/projectCalendar";
import type { TodoType, CategoryType } from "@/types";
import View from "./DayPeekView";

/**
 * 폰 월간 달력 아래의 "고른 날" 목록.
 *
 * 월간 칸은 폭의 1.3배까지만 키우므로 그 아래가 비었다. 거기에 고른 날의 일정을 보여 준다 —
 * 날짜를 누르면 여기가 바뀌고, 같은 날을 한 번 더 누르거나 "일간" 을 누르면 일간 화면으로 간다.
 * 일간 화면과 같은 눈으로 센다 (프로젝트와 그 태스크도 그날의 일정).
 */
export interface DayPeekProps {
    date: Date;
    todos: TodoType[];
    categories: CategoryType[];
    onOpenDay: () => void;
}

export interface DayPeekItem {
    id: string;
    title: string;
    color: string;
    done: boolean;
    allDay: boolean;
    /** "10:00–11:00" 또는 null(하루 종일) */
    time: string | null;
}

export interface DayPeekThemeProps {
    /** 고른 날의 날짜 키 — 날이 바뀌면 목록이 오는 쪽에서 들어온다 */
    dayKey: string;
    title: string;
    isToday: boolean;
    items: DayPeekItem[];
    onOpenDay: () => void;
    labels: { openDay: string; empty: string; allDay: string };
}

const pad = (n: number) => String(n).padStart(2, "0");
/** 고른 시간대의 시각 — 예전엔 이 기기 시각이라 시간대가 다르면 일간·홈과 다른 시각이 섰다 */
const hhmm = (d: Date) => { const w = wallTime(d); return w ? `${pad(w.hour)}:${pad(w.minute)}` : ""; };

export default function DayPeek({ date, todos, categories, onOpenDay }: DayPeekProps) {
    const t = useT();
    const projects = useProjectStore((s) => s.projects);

    // date 는 칸 Date — 날 키는 labelKey 로 (localDateKey 로 읽으면 고른 시간대가 기기보다 서쪽일 때 하루 앞 날이 된다)
    const key = labelKey(date);
    const items = React.useMemo<DayPeekItem[]>(() => {
        // 끝낸 프로젝트 할 일은 끝낸 것으로, 시각을 준 할 일은 그 시각으로 (src/lib/projectCalendar.ts)
        const all: TodoType[] = [...todos, ...projectCalendarItems(projects)];
        // 창은 그 날(고른 시간대)의 0시 — expandTodos 가 그 날 끝까지 펼친다
        const dayStart = zonedTime(key);
        const colorOf = (id: string) => categories.find(c => c.id === id)?.color ?? "";
        return expandTodos(all, dayStart, dayStart)
            .filter(td => td.startAt && td.endAt && localDateKey(td.startAt) <= key && key <= endDateKey(td.startAt, td.endAt))
            .map(td => {
                const s = new Date(td.startAt!); const e = new Date(td.endAt!);
                const allDay = !!td.isAllDay || localDateKey(s) !== endDateKey(s, e);
                return {
                    id: td.id, title: td.title, color: colorOf(td.categoryId), done: !!td.isDone, allDay,
                    time: allDay ? null : `${hhmm(s)}–${hhmm(e)}`,
                };
            })
            // 하루 종일 먼저, 그다음 시각순. 끝낸 건 뒤로
            .sort((a, b) => Number(a.done) - Number(b.done) || Number(!a.allDay) - Number(!b.allDay) || (a.time ?? "").localeCompare(b.time ?? ""));
    }, [todos, projects, categories, key]);

    const title = `${date.getMonth() + 1}. ${date.getDate()} · ${t.calendar.days[date.getDay()]}`;

    return (
        <View
            dayKey={key}
            title={title}
            isToday={key === localDateKey(new Date())}
            items={items}
            onOpenDay={onOpenDay}
            labels={{ openDay: t.calendar.openDay, empty: t.calendar.peekEmpty, allDay: t.todo.allDay }}
        />
    );
}
