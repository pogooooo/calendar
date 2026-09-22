"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";
import DayCalendar from "@/components/calendar/dayCalendar/DayCalendar";
import WeekStrip from "@/components/calendar/weekStrip/WeekStrip";
import DayPeek from "@/components/calendar/dayPeek/DayPeek";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import useIsMobile from "@/hooks/useIsMobile";
import useSwipe from "@/hooks/useSwipe";
import { useT } from "@/i18n/useT";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialCalendarPage.styles";
import * as MapleS from "./maple/MapleCalendarPage.styles";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS };

const DAY_COLLAPSE_KEY = "cronos-day-collapsed";

const MIN_RATIO = 35;
const MAX_RATIO = 82;

export default function CalendarPage() {
    const S = usePickTheme(STYLES);
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
            <S.MobileWrapper>
                <S.ViewSwitch role="tablist">
                    {([
                        ["month", t.calendar.monthView],
                        ["week", t.calendar.weekDayView],
                    ] as const).map(([id, label]) => (
                        <S.SwitchButton
                            key={id}
                            type="button" role="tab"
                            aria-selected={mobileView === id}
                            $on={mobileView === id}
                            onClick={() => setMobileView(id)}
                        >
                            {label}
                        </S.SwitchButton>
                    ))}
                </S.ViewSwitch>

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

                <S.MobilePane key={mobileView} $forward={mobileView !== "month"} {...(mobileView === "week" ? daySwipe : {})}>
                    {mobileView === "month" ? (
                        <>
                            <S.MonthArea>
                                <MonthCalendar
                                    todos={todos}
                                    categories={categories}
                                    selectedDate={selectedDate}
                                    followSelectedDate
                                    /* 날짜를 누르면 아래 목록이 그 날로 바뀐다. 이미 고른 날을 또 누르면 일간으로. */
                                    onDateChange={(date) => {
                                        if (date.toDateString() === selectedDate.toDateString()) setMobileView("week");
                                        else setSelectedDate(date);
                                    }}
                                />
                            </S.MonthArea>
                            <DayPeek
                                date={selectedDate}
                                todos={todos}
                                categories={categories}
                                onOpenDay={() => setMobileView("week")}
                            />
                        </>
                    ) : (
                        <DayCalendar
                            selectedDate={selectedDate}
                            todos={todos}
                            categories={categories}
                        />
                    )}
                </S.MobilePane>

                {/* 손가락에는 hover 가 없어서 달력 칸의 작은 + 가 뜨지 않는다.
                    폰에서는 이 단추가 일정 추가로 가는 유일한 길이다. */}
                <S.Fab type="button" onClick={() => setAddOpen(true)} aria-label={t.calendar.newTodo}>
                    <Plus size={22} strokeWidth={2} />
                </S.Fab>

                <TodoModal
                    isOpen={addOpen}
                    onClose={() => setAddOpen(false)}
                    categories={categories}
                    selectedDate={selectedDate}
                />
            </S.MobileWrapper>
        );
    }

    return (
        <S.PageWrapper>
            <S.CalendarContainer ref={containerRef} $collapsed={dayCollapsed}>
                <S.MonthSection ref={monthRef} $flex={monthRatio} $collapsed={dayCollapsed}>
                    <MonthCalendar
                        todos={todos}
                        categories={categories}
                        selectedDate={selectedDate}
                        onDateChange={(date) => setSelectedDate(date)}
                    />
                </S.MonthSection>

                <S.Resizer
                    $hidden={dayCollapsed}
                    onMouseDown={dayCollapsed ? undefined : handleResize}
                    onDoubleClick={dayCollapsed ? undefined : handleReset}
                >
                    <span className="line" />
                    <span className="grip" />
                </S.Resizer>

                <S.DaySection ref={dayRef} $flex={100 - monthRatio} $collapsed={dayCollapsed}>
                    <S.ToggleButton
                        type="button"
                        onClick={toggleDay}
                        $collapsed={dayCollapsed}
                        title={dayCollapsed ? t.calendar.expandDay : t.calendar.collapseDay}
                    >
                        {dayCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </S.ToggleButton>

                    <S.DayClip>
                        <S.CollapsedRail $visible={dayCollapsed} aria-hidden={!dayCollapsed}>
                            <span className="label">{t.calendar.dayView}</span>
                            <span className="star">✦</span>
                        </S.CollapsedRail>

                        <S.DayBody $collapsed={dayCollapsed}>
                            <DayCalendar
                                selectedDate={selectedDate}
                                todos={todos}
                                categories={categories}
                            />
                        </S.DayBody>
                    </S.DayClip>
                </S.DaySection>
            </S.CalendarContainer>
        </S.PageWrapper>
    );
}
