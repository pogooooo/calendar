"use client";

import React, { useEffect } from "react";
import styled from "styled-components";
import useCategoryStore from "@/store/category/useCategoryStore";
import useTodoStore from "@/store/todo/useTodoStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";

export default function CalendarPage() {
    const { categories, fetchCategories } = useCategoryStore();
    const { todos, fetchTodos } = useTodoStore();
    const authFetch = useAuthFetch();

    // useEffect(() => {
    //     fetchCategories(authFetch);
    //     fetchTodos(authFetch);
    // }, [authFetch, fetchCategories, fetchTodos]);

    return (
        <PageWrapper>
            <CalendarContainer>
                <MonthCalendar
                    todos={todos}
                    categories={categories}
                />
            </CalendarContainer>
        </PageWrapper>
    );
}

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100vh - 80px); /* 상단 헤더가 있다면 높이를 조절해주세요 */
    padding: 30px 40px;
    background-color: ${(props) => props.theme.colors.surface};
`;

const CalendarContainer = styled.div`
    flex: 1;
    min-height: 0;
    width: 100%;
    max-width: 1400px; /* 화면이 너무 넓어질 때를 대비한 최대 너비 */
    margin: 0 auto;
    display: flex;
    flex-direction: column;
`;