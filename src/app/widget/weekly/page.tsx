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
    /* 속을 비우는 규칙은 두지 않는다 — 달력 자체가 바탕을 칠하지 않고, 위젯 껍데기의 종이가 그대로 비친다.
       예전의 & * { background-color: transparent !important } 는 Maple 이 마스크에 색을 부어 그리는 것들
       (잎 자국·테이프 막대·먹 아이콘)까지 함께 지워 버렸다. */
    scrollbar-width: thin;
    scrollbar-color: ${p => p.theme.colors.primary}40 transparent;
`;
