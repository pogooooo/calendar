"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetTitle } from "@/hooks/useWidgetMeta";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";

export default function MonthlyWidget() {
    const title = useWidgetTitle("monthly");
    const { authed, authChecked } = useWidgetInit();
    const todos      = useTodoStore((s) => s.todos);
    const categories = useCategoryStore((s) => s.categories);

    // 인증만 확인되면 즉시 그리드를 그리고 데이터는 도착하는 대로 채운다
    if (!authChecked || !authed) {
        return <WidgetAuthNotice kind="monthly" title={title} authed={authChecked && authed} />;
    }

    return (
        <WidgetShell kind="monthly" title={title}>
            <CalendarWrap>
                <MonthCalendar
                    todos={todos}
                    categories={categories}
                    selectedDate={new Date()}
                />
            </CalendarWrap>
        </WidgetShell>
    );
}


const CalendarWrap = styled.div`
    height: 100%;
    /* 속을 비우는 규칙은 두지 않는다 — 달력 자체가 바탕을 칠하지 않고, 위젯 껍데기의 종이가 그대로 비친다.
       예전의 & * { background-color: transparent !important } 는 Maple 이 마스크에 색을 부어 그리는 것들
       (잎 자국·테이프 막대·먹 아이콘)까지 함께 지워 버렸다. */
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    overflow: hidden;
`;
