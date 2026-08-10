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
            // 드래그로 넣어둔 인라인 flex 가 남아 있으면 전환이 먹지 않는다.
            if (monthRef.current) monthRef.current.style.flex = "";
            if (dayRef.current) dayRef.current.style.flex = "";
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

                <Resizer
                    $hidden={dayCollapsed}
                    onMouseDown={dayCollapsed ? undefined : handleResize}
                    onDoubleClick={dayCollapsed ? undefined : handleReset}
                >
                    <span className="line" />
                    <span className="grip" />
                </Resizer>

                <DaySection ref={dayRef} $flex={100 - monthRatio} $collapsed={dayCollapsed}>
                    <ToggleButton
                        type="button"
                        onClick={toggleDay}
                        $collapsed={dayCollapsed}
                        title={dayCollapsed ? "일간 캘린더 펼치기" : "일간 캘린더 접기"}
                    >
                        {dayCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </ToggleButton>

                    <CollapsedRail $visible={dayCollapsed} aria-hidden={!dayCollapsed}>
                        <span className="label">일간</span>
                        <span className="star">✦</span>
                    </CollapsedRail>

                    <DayBody $collapsed={dayCollapsed}>
                        <DayCalendar
                            selectedDate={selectedDate}
                            todos={todos}
                            categories={categories}
                            onDateChange={(date) => setSelectedDate(date)}
                        />
                    </DayBody>
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

const PANEL_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

const MonthSection = styled.div<{ $flex: number; $collapsed: boolean }>`
    flex: ${(props) => (props.$collapsed ? 100 : props.$flex)} 1 0;
    min-width: 0;
    height: 100%;
    transition: flex-grow 0.38s ${PANEL_EASE};

    @media (max-width: 1250px) {
        flex: none !important;
        height: auto;
    }
`;

/* 접힌 상태에서 세로로 서는 라벨 */
const CollapsedRail = styled.div<{ $visible: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    pointer-events: none;
    color: ${(props) => props.theme.colors.textSecondary};
    opacity: ${(props) => (props.$visible ? 1 : 0)};
    transition: opacity 0.25s ${(props) => (props.$visible ? "0.15s" : "0s")} ease;

    .label {
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 0.78rem;
        letter-spacing: 3px;
        white-space: nowrap;
        writing-mode: vertical-rl;
    }

    .star {
        font-size: 10px;
        color: ${(props) => props.theme.colors.primary};
        opacity: 0.7;
    }

    @media (max-width: 1250px) {
        display: none;
    }
`;

/* 패널 사이 여백에 놓아 일간 캘린더와 겹치지 않게 한다 */
const ToggleButton = styled.button<{ $collapsed: boolean }>`
    position: absolute;
    top: 0;
    left: ${(props) => (props.$collapsed ? "-24px" : "-34px")};
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: ${(props) => props.theme.colors.background};
    border: 1px solid ${(props) => props.theme.colors.primary}44;
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, box-shadow 0.2s, left 0.38s ${PANEL_EASE};

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 7px ${(props) => props.theme.colors.primary}44;
    }

    @media (max-width: 1250px) {
        top: -32px;
        left: auto;
        right: 0;
    }
`;

const DayBody = styled.div<{ $collapsed: boolean }>`
    height: 100%;
    min-width: 300px;
    opacity: ${(props) => (props.$collapsed ? 0 : 1)};
    transform: translateX(${(props) => (props.$collapsed ? "12px" : "0")});
    pointer-events: ${(props) => (props.$collapsed ? "none" : "auto")};
    transition: opacity 0.28s ${(props) => (props.$collapsed ? "0s" : "0.12s")} ease,
                transform 0.38s ${PANEL_EASE};

    @media (max-width: 1250px) {
        min-width: 0;
    }
`;

const DaySection = styled.div<{ $flex: number; $collapsed: boolean }>`
    position: relative;
    flex: ${(props) => (props.$collapsed ? 0 : props.$flex)} 1 ${(props) => (props.$collapsed ? "34px" : "0")};
    min-width: ${(props) => (props.$collapsed ? "34px" : "300px")};
    height: 100%;
    overflow: hidden;
    border-left: 1px solid ${(props) => (props.$collapsed ? `${props.theme.colors.primary}55` : "transparent")};
    transition: flex-grow 0.38s ${PANEL_EASE},
                flex-basis 0.38s ${PANEL_EASE},
                min-width 0.38s ${PANEL_EASE},
                border-color 0.3s ease;

    @media (max-width: 1250px) {
        flex: none !important;
        min-width: 0;
        height: auto;
        overflow: visible;
        border-left: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        padding-top: 24px;
        margin-top: 12px;
    }
`;

const Resizer = styled.div<{ $hidden: boolean }>`
    position: relative;
    flex: 0 0 auto;
    width: 1px;
    cursor: ${(props) => (props.$hidden ? "default" : "col-resize")};
    user-select: none;
    background-color: ${(props) => props.theme.colors.primary};
    opacity: ${(props) => (props.$hidden ? 0 : 1)};
    pointer-events: ${(props) => (props.$hidden ? "none" : "auto")};
    transition: opacity 0.25s ease;

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