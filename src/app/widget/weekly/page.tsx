"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import WeekCalendar from "@/components/calendar/weekCalendar/WeekCalendar";

export default function WeeklyWidget() {
    const { ready, authed } = useWidgetInit();
    const todos      = useTodoStore((s) => s.todos);
    const categories = useCategoryStore((s) => s.categories);
    if (!ready || !authed) {
        return <WidgetAuthNotice kind="weekly" title="CRONOS  ·  주간 캘린더" authed={authed} />;
    }

    return (
        <WidgetShell kind="weekly" title="CRONOS  ·  주간 캘린더">
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
    /* 주간 캘린더는 내용 높이가 정해져 있어 창을 억지로 채우지 않는다 */
    height: auto;
    & * { background-color: transparent !important; }
    scrollbar-width: thin;
    scrollbar-color: ${p => p.theme.colors.primary}40 transparent;
`;
