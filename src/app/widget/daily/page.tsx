"use client";

import styled from "styled-components";
import WidgetShell from "@/components/widget/WidgetShell";
import { useWidgetInit } from "@/hooks/useWidgetInit";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";
import DayCalendar from "@/components/calendar/dayCalendar/DayCalendar";

export default function DailyWidget() {
    const { ready, authed } = useWidgetInit(["todos", "categories"]);
    const todos      = useTodoStore((s) => s.todos);
    const categories = useCategoryStore((s) => s.categories);

    if (!ready) return <Loading>로딩 중...</Loading>;
    if (!authed) return <Loading>로그인이 필요합니다</Loading>;

    return (
        <WidgetShell kind="daily" title="CRONOS  ·  일간 캘린더">
            <CalendarWrap>
                <DayCalendar
                    todos={todos}
                    categories={categories}
                    selectedDate={new Date()}
                />
            </CalendarWrap>
        </WidgetShell>
    );
}

const Loading = styled.div`
    display: flex; align-items: center; justify-content: center;
    height: 100vh; font-size: 0.8rem;
    color: ${p => p.theme.colors.textSecondary};
    background: transparent;
`;

/* 캘린더 내부 배경을 투명으로 오버라이드 → WidgetShell 배경이 보임 */
const CalendarWrap = styled.div`
    height: 100%;

    /* 모든 하위 요소 배경 투명 (ThemeProvider가 surface를 transparent로 바꾸지만
       inline style / 기타 배경도 제거) */
    & * { background-color: transparent !important; }

    scrollbar-width: thin;
    scrollbar-color: ${p => p.theme.colors.primary}40 transparent;
`;
