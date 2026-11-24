"use client";

import React, { useState } from "react";
import { ControlSeal } from "@/components/ornament/celestial/ControlOrnaments";
import { Plus } from "lucide-react";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import MonthCalendar from "@/components/calendar/monthCalendar/MonthCalendar";
import DayCalendar from "@/components/calendar/dayCalendar/DayCalendar";
import WeekStrip from "@/components/calendar/weekStrip/WeekStrip";
import DayPeek from "@/components/calendar/dayPeek/DayPeek";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import useIsMobile from "@/hooks/useIsMobile";
import useSwipe from "@/hooks/useSwipe";
import { useSwapMotion } from "@/hooks/useMotion";
import { useT } from "@/i18n/useT";
import { wallNow } from "@/lib/dateKey";
import { usePickTheme, useThemeFamily, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialCalendarPage.styles";
import CelestialCalendarLayout from "./celestial/CelestialCalendarLayout";
import MapleCalendarLayout from "./maple/MapleCalendarLayout";
import * as MapleS from "./maple/MapleCalendarPage.styles";
import * as OceanS from './ocean/OceanCalendarPage.styles';
import OceanCalendarLayout from './ocean/OceanCalendarLayout';
import * as GemS from './gem/GemCalendarPage.styles';
import GemCalendarLayout from './gem/GemCalendarLayout';
import * as Mobile from './CalendarMobile.styles';
import CalendarWorkspace from '@/components/calendar/CalendarWorkspace';
import useMobilePresentation from '@/hooks/useMobilePresentation';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: GemS };

const LAYOUTS = { celestial: CelestialCalendarLayout, maple: MapleCalendarLayout, ocean: OceanCalendarLayout, gem: GemCalendarLayout };


/** 폰의 두 화면 차례 — 뒤 화면(주간·일간)으로 가면 오른쪽에서 들어온다 */
const MOBILE_VIEWS = ["month", "week"] as const;

export default function CalendarPage() {
    const S = usePickTheme(STYLES);
    const family = useThemeFamily();
    const gem = family === "gem";
    const celestial = family === "celestial";
    const DesktopLayout = LAYOUTS[family];
    const { categories } = useCategoryStore();
    const { todos } = useTodoStore();
    const t = useT();
    const narrow = useIsMobile();
    const mobileApp = useMobilePresentation();
    const isMobile = narrow || mobileApp;

    /** 폰에서는 두 달력을 한 화면에 같이 두지 않는다. 하나씩 갈아 끼운다. */
    // 폰은 두 화면이다: 월간, 그리고 주간 띠 + 그날 일간 (주간·일간을 합쳤다)
    const [mobileView, setMobileView] = useState<"month" | "week">("month");
    const [addOpen, setAddOpen] = useState(false);

    // 고른 날은 칸 Date(이 기기 시각에 고른 시간대의 날을 담은 것)다 — 처음엔 고른 시간대의 지금 (src/lib/dateKey.ts).
    // 예전엔 이 기기의 지금이라, 시간대가 다르면 일간·목록이 홈의 오늘과 다른 날로 열렸다
    const [selectedDate, setSelectedDate] = useState<Date>(wallNow);
    const [visibleMonth, setVisibleMonth] = useState<Date>(wallNow);
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
                    setVisibleMonth(new Date(picked.getFullYear(), picked.getMonth(), 1));
                    setMobileView("week");
                }
            }
            if (params.get("add") === "1") setAddOpen(true);
        };
        readQuery();
        window.addEventListener("cronos-link", readQuery);
        return () => window.removeEventListener("cronos-link", readQuery);
    }, []);

    const selectMobileDate = React.useCallback((date: Date) => {
        setSelectedDate(date);
        setVisibleMonth(new Date(date.getFullYear(),date.getMonth(),1));
    },[]);
    const changeVisibleMonth = React.useCallback((date: Date) => {
        setVisibleMonth(date);
        if (!gem) return;
        setSelectedDate(previous => {
            const year = date.getFullYear();
            const month = date.getMonth();
            if (previous.getFullYear() === year && previous.getMonth() === month) return previous;
            const day = Math.min(previous.getDate(), new Date(year, month + 1, 0).getDate());
            const next = new Date(previous);
            next.setFullYear(year, month, day);
            return next;
        });
    }, [gem]);
    const stepDay = React.useCallback((delta: number) =>
        selectMobileDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + delta)), [selectedDate,selectMobileDate]);

    const nextDay = React.useCallback(() => stepDay(1), [stepDay]);
    const prevDay = React.useCallback(() => stepDay(-1), [stepDay]);
    const daySwipe = useSwipe(nextDay, prevDay);

    // 폰의 월간 ↔ 주간·일간: 갈래의 몸짓으로 갈아 끼운다 — 일간으로 가면 오른쪽에서, 월간으로 오면 왼쪽에서.
    // 판 하나하나를 움직인다: 감싼 상자에 투명도·흐림을 걸면 안의 유리 판(바다)이 그동안 뒤를 못 본다
    const paneRef = React.useRef<HTMLDivElement>(null);
    useSwapMotion(mobileView, () => Array.from(paneRef.current?.children ?? []), { order: MOBILE_VIEWS });

    if (isMobile) {
        return (<>
            <Mobile.Wrapper data-mobile-calendar>
                <Mobile.Toolbar>
                <S.ViewSwitch role="tablist" $active={mobileView === 'month' ? 0 : 1} onKeyDown={(event)=>{
                    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
                    event.preventDefault();
                    const next=event.key==='Home'?'month':event.key==='End'?'week':mobileView==='month'?'week':'month';
                    setMobileView(next);
                    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next==='month'?0:1]?.focus();
                }}>
                    {([
                        ["month", t.calendar.monthView],
                        ["week", t.calendar.weekDayView],
                    ] as const).map(([id, label]) => (
                        <S.SwitchButton
                            key={id}
                            type="button" role="tab"
                            aria-selected={mobileView === id}
                            tabIndex={mobileView===id?0:-1}
                            $on={mobileView === id}
                            onClick={() => setMobileView(id)}
                        >
                            {celestial && <ControlSeal kind={id === 'month' ? 'sun' : 'moon'} size={16} />}
                            {label}
                        </S.SwitchButton>
                    ))}
                </S.ViewSwitch>
                    <S.Fab data-calendar-add type="button" onClick={() => setAddOpen(true)} aria-label={t.calendar.newTodo}>
                        {celestial ? <ControlSeal kind="add" size={20} /> : <Plus size={18} strokeWidth={2} />}<span>{t.calendar.newTodo}</span>
                    </S.Fab>
                </Mobile.Toolbar>

                {/* 주간 띠는 날짜를 고르는 곳, 그 아래 일간이 내용을 보여주는 곳.
                    띠에서는 좌우로 쓸어 주를 넘기고, 일간에서는 쓸어 하루를 넘긴다. */}
                {mobileView === "week" && (
                    <WeekStrip
                        selectedDate={selectedDate}
                        onSelect={selectMobileDate}
                        todos={todos}
                        categories={categories}
                    />
                )}

                <Mobile.Pane ref={paneRef} key={mobileView} $day={mobileView === "week"} {...(mobileView === "week" ? daySwipe : {})}>
                    {mobileView === "month" ? (
                        <>
                            <Mobile.MonthArea>
                                <MonthCalendar
                                    todos={todos}
                                    categories={categories}
                                    selectedDate={selectedDate}
                                    /* 날짜를 누르면 아래 목록이 그 날로 바뀐다. 이미 고른 날을 또 누르면 일간으로. */
                                    onDateChange={(date) => {
                                        if (!gem && date.toDateString() === selectedDate.toDateString()) setMobileView("week");
                                        else selectMobileDate(date);
                                    }}
                                    visibleMonth={visibleMonth}
                                    onVisibleMonthChange={changeVisibleMonth}
                                />
                            </Mobile.MonthArea>
                            <DayPeek
                                date={selectedDate}
                                todos={todos}
                                categories={categories}
                                onOpenDay={() => setMobileView("week")}
                                onAdd={gem ? () => setAddOpen(true) : undefined}
                            />
                        </>
                    ) : (
                        <DayCalendar
                            selectedDate={selectedDate}
                            todos={todos}
                            categories={categories}
                        />
                    )}
                </Mobile.Pane>

            </Mobile.Wrapper>
            <TodoModal isOpen={addOpen} onClose={()=>setAddOpen(false)} categories={categories} selectedDate={selectedDate}/>
        </>);
    }

    return <>
        <CalendarWorkspace onAdd={() => setAddOpen(true)}>
            <DesktopLayout
                month={<MonthCalendar
                    visibleMonth={visibleMonth}
                    onVisibleMonthChange={changeVisibleMonth}
                    todos={todos}
                    categories={categories}
                    selectedDate={selectedDate}
                    onDateChange={gem ? selectMobileDate : setSelectedDate}
                />}
                day={<DayCalendar selectedDate={selectedDate} todos={todos} categories={categories} />}
            />
        </CalendarWorkspace>
        <TodoModal isOpen={addOpen} onClose={() => setAddOpen(false)} categories={categories} selectedDate={selectedDate} />
    </>;
}
