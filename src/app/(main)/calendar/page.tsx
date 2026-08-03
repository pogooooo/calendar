"use client";

import React, { useState } from "react";
import styled from "styled-components";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";
import DayCalendar from "@/components/calendar/dayCalendar/DayCalendar";

const MIN_RATIO = 35;
const MAX_RATIO = 82;

export default function CalendarPage() {
    const { categories } = useCategoryStore();
    const { todos } = useTodoStore();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [monthRatio, setMonthRatio] = useState(70);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const monthRef = React.useRef<HTMLDivElement>(null);
    const dayRef = React.useRef<HTMLDivElement>(null);
    const ratioRef = React.useRef(70);

    const handleResize = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startRatio = ratioRef.current;

        const onMove = (mv: MouseEvent) => {
            const box = containerRef.current?.getBoundingClientRect();
            if (!box) return;
            const raw = startRatio + ((mv.clientX - startX) / box.width) * 100;
            const next = Math.min(MAX_RATIO, Math.max(MIN_RATIO, raw));
            ratioRef.current = next;
            if (monthRef.current) monthRef.current.style.flex = `${next} 1 0`;
            if (dayRef.current) dayRef.current.style.flex = `${100 - next} 1 0`;
        };

        const onUp = () => {
            setMonthRatio(ratioRef.current);
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
        };

        document.addEventListener("mousemove", onMove, { passive: true });
        document.addEventListener("mouseup", onUp);
    }, []);

    const handleReset = React.useCallback(() => {
        ratioRef.current = 70;
        setMonthRatio(70);
        if (monthRef.current) monthRef.current.style.flex = "";
        if (dayRef.current) dayRef.current.style.flex = "";
    }, []);

    return (
        <PageWrapper>
            <CalendarContainer ref={containerRef}>
                <MonthSection ref={monthRef} $flex={monthRatio}>
                    <MonthCalendar
                        todos={todos}
                        categories={categories}
                        selectedDate={selectedDate}
                        onDateChange={(date) => setSelectedDate(date)}
                    />
                </MonthSection>

                <Resizer onMouseDown={handleResize} onDoubleClick={handleReset}>
                    <span className="line" />
                    <span className="grip" />
                </Resizer>

                <DaySection ref={dayRef} $flex={100 - monthRatio}>
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
    background-color: ${(props) => props.theme.colors.background};

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

const MonthSection = styled.div<{ $flex: number }>`
    flex: ${(props) => props.$flex} 1 0;
    min-width: 0;
    height: 100%;

    @media (max-width: 1250px) {
        flex: none !important;
        height: auto;
    }
`;

const DaySection = styled.div<{ $flex: number }>`
    flex: ${(props) => props.$flex} 1 0;
    min-width: 300px;
    height: 100%;

    @media (max-width: 1250px) {
        flex: none !important;
        min-width: 0;
        height: auto;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        padding-top: 24px;
    }
`;

const Resizer = styled.div`
    position: relative;
    flex: 0 0 auto;
    width: 1px;
    cursor: col-resize;
    user-select: none;
    background-color: ${(props) => props.theme.colors.primary};

    &::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: -10px;
        right: -10px;
    }

    .line {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1px;
        height: 54px;
        margin: -27px 0 0 -0.5px;
        background: ${(props) => props.theme.colors.primary};
        opacity: 0;
        transition: opacity 0.2s;
        box-shadow: 0 0 7px ${(props) => props.theme.colors.primary};
    }

    .grip {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 9px;
        height: 9px;
        margin: -4.5px 0 0 -4.5px;
        background-color: ${(props) => props.theme.colors.background};
        border: 1px solid ${(props) => props.theme.colors.primary};
        transform: rotate(45deg);
        transition: box-shadow 0.2s, background-color 0.2s;
    }

    &:hover .line { opacity: 1; }

    &:hover .grip {
        background-color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 8px ${(props) => props.theme.colors.primary}CC;
    }

    @media (max-width: 1250px) {
        display: none;
    }
`;