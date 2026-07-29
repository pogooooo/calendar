"use client";

import React, { useState } from "react";
import styled from "styled-components";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";
import DayCalendar from "@/components/calendar/dayCalendar/DayCalendar";

export default function CalendarPage() {
    const { categories } = useCategoryStore();
    const { todos } = useTodoStore();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

    @media (max-width: 1250px) {
        height: auto;
        min-height: calc(100vh - 80px);
        padding: 20px;
    }
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

    @media (max-width: 1250px) {
        flex-direction: column;
        gap: 30px;
    }
`;

const MonthSection = styled.div`
    flex: 7;
    min-width: 0;
    height: 100%;

    @media (max-width: 1250px) {
        flex: none;
        height: auto;
    }
`;

const DaySection = styled.div`
    flex: 3;
    min-width: 360px;
    height: 100%;

    border-left: 1px solid ${(props) => props.theme.colors.primary};
    padding-left: 40px;

    @media (max-width: 1250px) {
        flex: none;
        min-width: 0;
        height: auto;
        border-left: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        padding-left: 0;
        padding-top: 24px;
    }
`;