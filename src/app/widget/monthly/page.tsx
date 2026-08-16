"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import WidgetAuthNotice from "@/components/widget/WidgetAuthNotice";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";

export default function MonthlyWidget() {
    const { authed, authChecked } = useWidgetInit();
    const todos      = useTodoStore((s) => s.todos);
    const categories = useCategoryStore((s) => s.categories);

    // 인증만 확인되면 즉시 그리드를 그리고 데이터는 도착하는 대로 채운다
    if (!authChecked || !authed) {
        return <WidgetAuthNotice kind="monthly" title="CRONOS  ·  월간 캘린더" authed={authChecked && authed} />;
    }

    return (
        <WidgetShell kind="monthly" title="CRONOS  ·  월간 캘린더">
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
    & * { background-color: transparent !important; }
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    overflow: hidden;
`;
