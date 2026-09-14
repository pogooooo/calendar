"use client";

import * as React from "react";
import { usePickTheme } from "@/styles/themed";
import { useT } from "@/i18n/useT";
import { expandTodos } from "@/hooks/useExpandedTodos";
import { localDateKey } from "@/lib/dateKey";
import useProjectStore from "@/store/useProjectStore";
import type { TodoType, CategoryType } from "@/types";
import CelestialDayPeek from "./celestial/CelestialDayPeek";

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
    title: string;
    isToday: boolean;
    items: DayPeekItem[];
    onOpenDay: () => void;
    labels: { openDay: string; empty: string; allDay: string };
}

const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export default function DayPeek({ date, todos, categories, onOpenDay }: DayPeekProps) {
    const View = usePickTheme({ celestial: CelestialDayPeek });
    const t = useT();
    const projects = useProjectStore((s) => s.projects);

    const key = localDateKey(date);
    const items = React.useMemo<DayPeekItem[]>(() => {
        const all: TodoType[] = [...todos];
        for (const proj of projects) {
            if (proj.startAt || proj.endAt) {
                all.push({
                    id: `project-${proj.id}`, title: proj.title, categoryId: proj.categoryId,
                    startAt: proj.startAt ?? proj.endAt, endAt: proj.endAt ?? proj.startAt,
                    isAllDay: true, repeat: 0, completions: [],
                });
            }
            for (const task of proj.tasks ?? []) {
                if (!task.startAt && !task.endAt) continue;
                all.push({
                    id: `proj-task-${task.id}`, title: task.title, categoryId: proj.categoryId,
                    startAt: task.startAt ?? task.endAt, endAt: task.endAt ?? task.startAt,
                    isAllDay: !task.startAt || !task.endAt || localDateKey(task.startAt) !== localDateKey(task.endAt),
                    repeat: 0, completions: [],
                });
            }
        }
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
        const colorOf = (id: string) => categories.find(c => c.id === id)?.color ?? "";
        return expandTodos(all, dayStart, dayEnd)
            .filter(td => td.startAt && td.endAt && localDateKey(td.startAt) <= key && key <= localDateKey(td.endAt))
            .map(td => {
                const s = new Date(td.startAt!); const e = new Date(td.endAt!);
                const allDay = !!td.isAllDay || localDateKey(s) !== localDateKey(e);
                return {
                    id: td.id, title: td.title, color: colorOf(td.categoryId), done: !!td.isDone, allDay,
                    time: allDay ? null : `${hhmm(s)}–${hhmm(e)}`,
                };
            })
            // 하루 종일 먼저, 그다음 시각순. 끝낸 건 뒤로
            .sort((a, b) => Number(a.done) - Number(b.done) || Number(!a.allDay) - Number(!b.allDay) || (a.time ?? "").localeCompare(b.time ?? ""));
    }, [todos, projects, categories, date, key]);

    const title = `${date.getMonth() + 1}. ${date.getDate()} · ${t.calendar.days[date.getDay()]}`;

    return (
        <View
            title={title}
            isToday={key === localDateKey(new Date())}
            items={items}
            onOpenDay={onOpenDay}
            labels={{ openDay: t.calendar.openDay, empty: t.calendar.peekEmpty, allDay: t.todo.allDay }}
        />
    );
}
