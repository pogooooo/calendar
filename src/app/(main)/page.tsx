"use client";

import styled from "styled-components";
import dynamic from "next/dynamic";
import useTodoStore from "@/store/useTodoStore";
import useCategoryStore from "@/store/useCategoryStore";

const WeekCalendar = dynamic(() => import("@/components/calendar/weekCalendar/WeekCalendar"), {
    ssr: false,
    loading: () => <CalendarSkeleton>캘린더를 불러오는 중입니다...</CalendarSkeleton>
});

export default function Home() {

    const { todos } = useTodoStore();
    const { categories } = useCategoryStore();

    return (
        <ContentWrapper>

            <Section>
                <WeekCalendar todos={todos} categories={categories} />
            </Section>

        </ContentWrapper>
    );
}

const ContentWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: ${(props) => props.theme.colors.text};
`;

const Section = styled.section`
    margin-bottom: 3rem;
`;

const CalendarSkeleton = styled.div`
    height: 300px;
    width: 100%;
    background-color: ${(props) => props.theme.colors.surface};
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${(props) => props.theme.colors.textSecondary};
    border: 1px dashed ${(props) => props.theme.colors.border};
`;