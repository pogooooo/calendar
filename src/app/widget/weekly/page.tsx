"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import WeekCalendar from "@/components/calendar/weekCalendar/WeekCalendar";

export default function WeeklyWidget() {
    const title = useWidgetTitle("weekly");
    const { ready, authed } = useWidgetInit();
    const todos      = useTodoStore((s) => s.todos);
    const categories = useCategoryStore((s) => s.categories);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="weekly" title={title} authed={authed} />;
    }

    return (
        <WidgetShell kind="weekly" title={title}>
            <CalendarWrap>
                <WeekCalendar
                    todos={todos}
                    categories={categories}
                    selectedDate={new Date()}
                />
            </CalendarWrap>
        </WidgetShell>
    );
}


const CalendarWrap = styled.div`
    /* 창 높이를 그대로 넘겨준다. 달력이 그 안에서 칸 높이를 맞춘다. */
    height: 100%;
    min-height: 0;
    & * { background-color: transparent !important; }
    scrollbar-width: thin;
    scrollbar-color: ${p => p.theme.colors.primary}40 transparent;
`;
