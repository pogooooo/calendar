"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";
import DayCalendar from "@/components/calendar/dayCalendar/DayCalendar";

export default function CalendarPage() {
    const { categories, fetchCategories } = useCategoryStore();
    const { todos, fetchTodos } = useTodoStore();
    const authFetch = useAuthFetch();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // useEffect(() => {
    //     fetchCategories(authFetch);
    //     fetchTodos(authFetch);
    // }, [authFetch, fetchCategories, fetchTodos]);

    return (
        <PageWrapper>
            <CalendarContainer>
                <MonthSection>
                    <MonthCalendar
                        todos={todos}
                        categories={categories}
                        selectedDate={selectedDate}
                        onDateChange={(date) => setSelectedDate(date)}
                    />
                </MonthSection>

                <DaySection>
                    <DayCalendar
                        selectedDate={selectedDate}
                        todos={todos}
                        categories={categories}
                        onDateChange={(date) => setSelectedDate(date)}
                    />
                </DaySection>
            </CalendarContainer>
        </PageWrapper>
    );
}

const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100vh - 80px);
    padding: 30px 40px;
    background-color: ${(props) => props.theme.colors.surface};
`;

const CalendarContainer = styled.div`
    flex: 1;
    min-height: 0;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    
    display: flex;
    flex-direction: row;
    gap: 40px;
`;

const MonthSection = styled.div`
    flex: 7;
    min-width: 600px;
    height: 100%;
`;

const DaySection = styled.div`
    flex: 3;
    min-width: 400px;
    height: 100%;

    border-left: 1px solid ${(props) => props.theme.colors.accent};
    padding-left: 40px;
`;