"use client";

import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";
import DayCalendar from "@/components/calendar/dayCalendar/DayCalendar";
import WeekStrip from "@/components/calendar/weekStrip/WeekStrip";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import useIsMobile from "@/hooks/useIsMobile";
import useSwipe from "@/hooks/useSwipe";
import { useT } from "@/i18n/useT";
import { TAB_BAR_HEIGHT, SAFE_B } from "@/styles/breakpoints";

const DAY_COLLAPSE_KEY = "cronos-day-collapsed";

const MIN_RATIO = 35;
const MAX_RATIO = 82;

export default function CalendarPage() {
    const { categories } = useCategoryStore();
    const { todos } = useTodoStore();
    const t = useT();
    const isMobile = useIsMobile();

    /** 폰에서는 두 달력을 한 화면에 같이 두지 않는다. 하나씩 갈아 끼운다. */
    // 폰은 두 화면이다: 월간, 그리고 주간 띠 + 그날 일간 (주간·일간을 합쳤다)
    const [mobileView, setMobileView] = useState<"month" | "week">("month");
    const [addOpen, setAddOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [monthRatio, setMonthRatio] = useState(70);
    const [dayCollapsed, setDayCollapsed] = useState(false);

    React.useEffect(() => {
        try {
            setDayCollapsed(localStorage.getItem(DAY_COLLAPSE_KEY) === "1");
        } catch {}
    }, []);

    /**
     * 홈의 "이번 주" 줄이나 안드로이드 홈 위젯에서 넘어올 때 ?date=YYYY-MM-DD 를 달고 온다.
     * ?add=1 이면 할 일 추가 창을 열어 둔다 (위젯의 "빠른 추가").
     * useSearchParams 는 정적 내보내기에서 Suspense 를 요구하므로 여기서는 직접 읽는다.
     * 이미 이 화면에 있을 때 위젯이 또 부르면 mount 가 다시 안 되므로 cronos-link 이벤트도 듣는다.
     */
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const readQuery = (e?: Event) => {
            const detail = (e as CustomEvent<string> | undefined)?.detail;
            const search = typeof detail === "string" ? (detail.split("?")[1] ?? "") : window.location.search;
            const params = new URLSearchParams(search);
            const raw = params.get("date");
            const m = raw?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) {
                const picked = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
                if (!Number.isNaN(picked.getTime())) {
                    setSelectedDate(picked);
                    setMobileView("week");
                }
            }
            if (params.get("add") === "1") setAddOpen(true);
        };
        readQuery();
        window.addEventListener("cronos-link", readQuery);
        return () => window.removeEventListener("cronos-link", readQuery);
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

    const stepDay = React.useCallback((delta: number) =>
        setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + delta)), []);

    const nextDay = React.useCallback(() => stepDay(1), [stepDay]);
    const prevDay = React.useCallback(() => stepDay(-1), [stepDay]);
    const daySwipe = useSwipe(nextDay, prevDay);

    if (isMobile) {
        return (
            <MobileWrapper>
                <ViewSwitch role="tablist">
                    {([
                        ["month", t.calendar.monthView],
                        ["week", t.calendar.weekDayView],
                    ] as const).map(([id, label]) => (
                        <SwitchButton
                            key={id}
                            type="button" role="tab"
                            aria-selected={mobileView === id}
                            $on={mobileView === id}
                            onClick={() => setMobileView(id)}
                        >
                            {label}
                        </SwitchButton>
                    ))}
                </ViewSwitch>

                {/* 주간 띠는 날짜를 고르는 곳, 그 아래 일간이 내용을 보여주는 곳.
                    띠에서는 좌우로 쓸어 주를 넘기고, 일간에서는 쓸어 하루를 넘긴다. */}
                {mobileView === "week" && (
                    <WeekStrip
                        selectedDate={selectedDate}
                        onSelect={setSelectedDate}
                        todos={todos}
                        categories={categories}
                    />
                )}

                <MobilePane key={mobileView} $forward={mobileView !== "month"} {...(mobileView === "week" ? daySwipe : {})}>
                    {mobileView === "month" ? (
                        <MonthCalendar
                            todos={todos}
                            categories={categories}
                            selectedDate={selectedDate}
                            followSelectedDate
                            /* 날짜를 누르면 그 날로 넘어간다. 폰에서는 이게 일간을 여는 길이다. */
                            onDateChange={(date) => { setSelectedDate(date); setMobileView("week"); }}
                        />
                    ) : (
                        <DayCalendar
                            selectedDate={selectedDate}
                            todos={todos}
                            categories={categories}
                        />
                    )}
                </MobilePane>

                {/* 손가락에는 hover 가 없어서 달력 칸의 작은 + 가 뜨지 않는다.
                    폰에서는 이 단추가 일정 추가로 가는 유일한 길이다. */}
                <Fab type="button" onClick={() => setAddOpen(true)} aria-label={t.calendar.newTodo}>
                    <Plus size={22} strokeWidth={2} />
                </Fab>

                <TodoModal
                    isOpen={addOpen}
                    onClose={() => setAddOpen(false)}
                    categories={categories}
                    selectedDate={selectedDate}
                />
            </MobileWrapper>
        );
    }

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
                        title={dayCollapsed ? t.calendar.expandDay : t.calendar.collapseDay}
                    >
                        {dayCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </ToggleButton>

                    <DayClip>
                        <CollapsedRail $visible={dayCollapsed} aria-hidden={!dayCollapsed}>
                            <span className="label">{t.calendar.dayView}</span>
                            <span className="star">✦</span>
                        </CollapsedRail>

                        <DayBody $collapsed={dayCollapsed}>
                            <DayCalendar
                                selectedDate={selectedDate}
                                todos={todos}
                                categories={categories}
                            />
                        </DayBody>
                    </DayClip>
                </DaySection>
            </CalendarContainer>
        </PageWrapper>
    );
}

/* ── 폰 전용 ─────────────────────────────────────────────────────────── */

const MobileWrapper = styled.div`
    display: flex;
    flex-direction: column;
    /* 높이를 못 박아야 아래 달력이 남은 칸을 정확히 채운다.
       min-height 로 두면 달력이 제 내용만큼 자라 화면 밖으로 조금씩 새어 나간다. */
    height: 100%;
    gap: 10px;
`;

const ViewSwitch = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    border: 1px solid ${(props) => props.theme.colors.primary}66;
    flex: none;
`;

const SwitchButton = styled.button<{ $on: boolean }>`
    padding: 12px 0;
    background: ${(props) => (props.$on ? `${props.theme.colors.primary}1F` : "transparent")};
    border: none;
    border-right: 1px solid ${(props) => props.theme.colors.primary}33;
    color: ${(props) => (props.$on ? props.theme.colors.primary : props.theme.colors.textSecondary)};
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.82rem;
    letter-spacing: 3px;
    cursor: pointer;

    &:last-child { border-right: none; }
    &:active { background-color: ${(props) => props.theme.colors.primary}2E; }
`;

/* 갈아 끼울 때 어느 쪽에서 왔는지 보여 준다. 월간→일간은 오른쪽에서,
   일간→월간은 왼쪽에서 들어온다. */
const paneIn = (from: string) => keyframes`
    from { opacity: 0; transform: translateX(${from}); }
    to   { opacity: 1; transform: translateX(0); }
`;

/* 달력 한 짝이 남은 높이를 다 쓴다. 스크롤은 각 달력이 알아서 한다. */
const MobilePane = styled.div<{ $forward: boolean }>`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    & > * { flex: 1; min-height: 0; }

    @media (prefers-reduced-motion: no-preference) {
        animation: ${(props) => paneIn(props.$forward ? "26px" : "-26px")}
                   0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
`;

const fabIn = keyframes`
    from { opacity: 0; transform: scale(0.6) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
`;

const Fab = styled.button`
    position: fixed;
    right: 16px;
    bottom: calc(${TAB_BAR_HEIGHT}px + ${SAFE_B} + 16px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background-color: ${(props) => props.theme.colors.background};
    border: 1px solid ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 12px ${(props) => props.theme.colors.primary}55;
    cursor: pointer;
    transition: transform 0.12s ease;

    &:active { transform: scale(0.9); }

    @media (prefers-reduced-motion: no-preference) {
        animation: ${fabIn} 0.34s cubic-bezier(0.2, 1.3, 0.4, 1) 0.1s both;
    }
`;

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

    @media (max-width: 768px) {
        min-height: 0;
        padding: 0;
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

    @media (max-width: 768px) {
        gap: 18px;
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
        font-family: ${(props) => props.theme.fonts.display};
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
    /* 폭 하한은 DaySection이 책임진다. 여기서 300px을 강제하면
       border-left(1px)만큼 좁아진 콘텐츠 폭을 넘겨 오른쪽 끝이 잘린다 */
    min-width: 0;
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
    /* 접기 애니메이션 클리핑은 DayClip이 담당한다.
       여기서 hidden으로 두면 밖으로 나온 ToggleButton까지 잘려 안 보인다 */
    overflow: visible;
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

/* 접기 애니메이션 동안 내용이 옆 패널로 새지 않도록 잘라내는 래퍼 */
const DayClip = styled.div`
    position: relative;
    height: 100%;
    overflow: hidden;

    @media (max-width: 1250px) {
        height: auto;
        overflow: visible;
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