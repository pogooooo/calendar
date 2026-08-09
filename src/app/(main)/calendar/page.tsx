"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";
import DayCalendar from "@/components/calendar/dayCalendar/DayCalendar";

const DAY_COLLAPSE_KEY = "cronos-day-collapsed";

const MIN_RATIO = 35;
const MAX_RATIO = 82;

export default function CalendarPage() {
    const { categories } = useCategoryStore();
    const { todos } = useTodoStore();

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [monthRatio, setMonthRatio] = useState(70);
    const [dayCollapsed, setDayCollapsed] = useState(false);

    React.useEffect(() => {
        try {
            setDayCollapsed(localStorage.getItem(DAY_COLLAPSE_KEY) === "1");
        } catch {}
    }, []);

    const toggleDay = React.useCallback(() => {
        setDayCollapsed(prev => {
            const next = !prev;
            try { localStorage.setItem(DAY_COLLAPSE_KEY, next ? "1" : "0"); } catch {}
            return next;
        });
    }, []);

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
            <CalendarContainer ref={containerRef} $collapsed={dayCollapsed}>
                <MonthSection ref={monthRef} $flex={monthRatio} $collapsed={dayCollapsed}>
                    <MonthCalendar
                        todos={todos}
                        categories={categories}
                        selectedDate={selectedDate}
                        onDateChange={(date) => setSelectedDate(date)}
                    />
                </MonthSection>

                {dayCollapsed ? (
                    <CollapsedRail type="button" onClick={toggleDay} title="일간 캘린더 펼치기">
                        <ChevronLeft size={14} />
                        <span className="label">일간</span>
                        <span className="star">✦</span>
                    </CollapsedRail>
                ) : (
                    <>
                        <Resizer onMouseDown={handleResize} onDoubleClick={handleReset}>
                            <span className="line" />
                            <span className="grip" />
                        </Resizer>

                        <DaySection ref={dayRef} $flex={100 - monthRatio}>
                            <CollapseButton type="button" onClick={toggleDay} title="일간 캘린더 접기">
                                <ChevronRight size={14} />
                            </CollapseButton>
                            <DayCalendar
                                selectedDate={selectedDate}
                                todos={todos}
                                categories={categories}
                                onDateChange={(date) => setSelectedDate(date)}
                            />
                        </DaySection>
                    </>
                )}
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

const CalendarContainer = styled.div<{ $collapsed: boolean }>`
    flex: 1;
    min-height: 0;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;

    display: flex;
    flex-direction: row;
    gap: ${(props) => (props.$collapsed ? "18px" : "40px")};

    @media (max-width: 1250px) {
        flex-direction: column;
        gap: 30px;
    }
`;

const MonthSection = styled.div<{ $flex: number; $collapsed: boolean }>`
    flex: ${(props) => (props.$collapsed ? 1 : props.$flex)} 1 0;
    min-width: 0;
    height: 100%;

    @media (max-width: 1250px) {
        flex: none !important;
        height: auto;
    }
`;

const CollapsedRail = styled.button`
    position: relative;
    flex: 0 0 34px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 0;
    background: none;
    border: none;
    border-left: 1px solid ${(props) => props.theme.colors.primary}55;
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    .label {
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 0.78rem;
        letter-spacing: 3px;
        writing-mode: vertical-rl;
    }

    .star {
        font-size: 10px;
        color: ${(props) => props.theme.colors.primary};
        opacity: 0.6;
        transition: opacity 0.2s, text-shadow 0.2s;
    }

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.primary};

        .star {
            opacity: 1;
            text-shadow: 0 0 6px ${(props) => props.theme.colors.primary};
        }
    }

    @media (max-width: 1250px) {
        flex: none;
        flex-direction: row;
        gap: 8px;
        padding: 10px 0;
        border-left: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary}55;

        .label { writing-mode: horizontal-tb; }
    }
`;

const CollapseButton = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: none;
    border: 1px solid ${(props) => props.theme.colors.primary}44;
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 7px ${(props) => props.theme.colors.primary}44;
    }
`;

const DaySection = styled.div<{ $flex: number }>`
    position: relative;
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