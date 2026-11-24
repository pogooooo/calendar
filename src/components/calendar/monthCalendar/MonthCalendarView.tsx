"use client";

import * as React from "react";
import { fx, rectOf } from '@/lib/fx';
import { Slot } from "@radix-ui/react-slot";
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

import { MonthThemeProps, CalendarTodoType } from "./MonthCalendar";
import { isSameDay } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import { CategoryType } from "@/store/useCategoryStore";

import CategoryFilter from "@/components/calendar/parts/categoryFilter/CategoryFilter";
import AnimatedDateText from "@/components/calendar/parts/animatedDateText/AnimatedDateText";
import GemSelectionFrame from "@/components/calendar/parts/GemSelectionFrame";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import MoreModal from "@/components/modal/moreModal/MoreModal";
import TodoContextMenu from "@/components/calendar/parts/contextMenu/TodoContextMenu";
import DayCellDecor from "@/assets/DayCellDecor";
import { useT } from "@/i18n/useT";
import useIsMobile from "@/hooks/useIsMobile";
import { isWidgetWindow } from "@/hooks/useAuthFetch";
import useSwipe from "@/hooks/useSwipe";
import useDragTarget from "@/hooks/useDragTarget";
import { localDateKey, endDateKey, labelKey } from "@/lib/dateKey";
import { addDaysToKey } from "@/lib/timezone";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import useSettingStore from "@/store/useSettingStore";
import { anniversariesOn } from "@/lib/anniversary";
import AnniversaryCrown from "@/components/calendar/parts/anniversary/AnniversaryCrown";
import { useSwapMotion } from '@/hooks/useMotion';
import { LunarEvent } from "@/components/calendar/parts/LunarEvent";
import { usePickTheme, useThemeFamily, type ThemeImpls } from "@/styles/themed";
import GemMonthHeader from "./gem/GemMonthHeader";
import * as GemS from "./gem/GemMonthCalendar.styles";
import CelestialMonthHeader from "./celestial/CelestialMonthHeader";
import MapleMonthHeader from "./maple/MapleMonthHeader";
import * as CelestialS from "./celestial/CelestialMonthCalendar.styles";
import * as MapleS from "./maple/MapleMonthCalendar.styles";
import OceanMonthHeader from './ocean/OceanMonthHeader';
import * as OceanS from './ocean/OceanMonthCalendar.styles';
import CelestialCalendarEtching, { PlateIndex } from './celestial/CelestialCalendarEtching';
import MapleNotebookDetails from './maple/MapleNotebookDetails';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const HEADERS = { celestial: CelestialMonthHeader, maple: MapleMonthHeader, ocean: OceanMonthHeader, gem: GemMonthHeader };
const NoEtching = () => null;
const ETCHINGS = { celestial:CelestialCalendarEtching, maple:MapleNotebookDetails, ocean:NoEtching, gem:NoEtching } satisfies ThemeImpls<React.ComponentType<{month:Date}>>;

const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: GemS };



interface WeekRowProps {
    activeTodoId?: string;
    dates: Date[];
    /** 몇째 주 (0부터) — 칸의 차례(--cell)를 셈한다 */
    row: number;
    todos: CalendarTodoType[];
    challengeTodos: CalendarTodoType[];
    categories: CategoryType[];
    todayStr: string;
    currentMonth: number;
    selectedDate?: Date;
    tabStopKey: string;
    handleCreateTodo: (date: Date) => void;
    handleContextMenu: (e: React.MouseEvent, todo: CalendarTodoType) => void;
    handleContextMenuChallenge: (e: React.MouseEvent, challenge: CalendarTodoType) => void;
    handleQuickToggleChallenge: (challenge: CalendarTodoType) => void;
    onCellClick?: (date: Date) => void;
    setMoreModalDate: (date: Date | null) => void;
    handleQuickEdit: MonthThemeProps['handleQuickEdit'];
    handleMoveTodo: MonthThemeProps['handleMoveTodo'];
    handleResizeTodo: MonthThemeProps['handleResizeTodo'];
    onDragStart: (e: React.PointerEvent<HTMLElement>, todo: CalendarTodoType, from: string, edge?: 'start' | 'end') => void;
    consumeDragClick: () => boolean;
    draggingId?: string;
    dropTarget: string | null;
}

/** Desktop/widget rows are measured. Phones preview one title, with the full list below. */
const DEFAULT_VISIBLE_LEVELS = 2;
const MAX_VISIBLE_LEVELS_MOBILE = 1;
/** 바를 아직 못 쟀을 때의 한 층 높이 (바 20px + 사이 2px) 와 "+N" 줄 높이 */
const FALLBACK_BAR_PITCH = 22;
const FALLBACK_MORE_HEIGHT = 20;

const WeekRow = ({
                     dates, row, todos, challengeTodos, categories, todayStr, currentMonth,
                     handleCreateTodo, handleContextMenu,
                     selectedDate, tabStopKey, onCellClick, setMoreModalDate, handleQuickEdit, handleMoveTodo, handleResizeTodo,
                     onDragStart, consumeDragClick, draggingId, dropTarget, activeTodoId
                 }: WeekRowProps) => {
    const S = usePickTheme(STYLES);
    const t = useT();
    const family = useThemeFamily();
    const gem = family === "gem";
    const lunar = family === "celestial";
    const [pointedTodoId, setPointedTodoId] = React.useState<string | null>(null);
    const locale = useSettingStore(s => s.locale);
    // 위젯 창은 폭이 좁아도 바를 그대로 두므로(styles 의 NOT_WIDGET) 층 수도 데스크톱 것을 쓴다
    const isMobileWidth = useIsMobile();
    const widget = isWidgetWindow();
    const isMobile = isMobileWidth && !widget;

    /* 칸에 바가 몇 층 들어가는지 잰다. 예전에는 데스크톱이 늘 두 층이라, 창이나 위젯을 크게 키워
       칸이 넉넉해도 세 번째부터 "더 보기" 로 접혔다. 바 높이는 갈래마다 달라서(20·21px) 그려진 바로 잰다. */
    const firstCellRef = React.useRef<HTMLDivElement | null>(null);
    // all: "+N" 없이 다 그릴 때 들어가는 층, withMore: 아래에 "+N" 을 둘 때 들어가는 층
    const [fit, setFit] = React.useState({ all: DEFAULT_VISIBLE_LEVELS, withMore: DEFAULT_VISIBLE_LEVELS });
    React.useLayoutEffect(() => {
        const cell = firstCellRef.current;
        if (!cell || isMobile || typeof ResizeObserver === "undefined") return;
        const measure = () => {
            const row = cell.parentElement;
            const list = cell.querySelector<HTMLElement>("[data-month-bars]");
            const bar = row?.querySelector<HTMLElement>("[data-month-bar]");
            const more = row?.querySelector<HTMLElement>("[data-month-more]");
            if (!list) return;
            const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
            const pitch = bar ? bar.offsetHeight + gap : FALLBACK_BAR_PITCH;
            const moreStyle = more ? getComputedStyle(more) : null;
            const moreHeight = more && moreStyle
                ? more.offsetHeight + (parseFloat(moreStyle.marginTop) || 0) + (parseFloat(moreStyle.marginBottom) || 0) + gap
                : FALLBACK_MORE_HEIGHT;
            const free = list.clientHeight; // 목록은 칸에 묶여 있다(flex:1, min-height:0) — 내용에 따라 늘지 않는다
            const all = Math.max(0, Math.floor((free + gap) / pitch));
            const withMore = Math.max(0, Math.floor((free - moreHeight + gap) / pitch));
            setFit(prev => (prev.all === all && prev.withMore === withMore ? prev : { all, withMore }));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(cell);
        const list = cell.querySelector<HTMLElement>("[data-month-bars]");
        if (list) ro.observe(list);
        return () => ro.disconnect();
    }, [isMobile, todos]);

    /* 칸은 칸 Date 의 날(labelKey), 일정은 고른 시간대의 날(localDateKey·endDateKey)로 견준다 — 홈·위젯과 같은 셈.
       예전엔 칸 Date 를 localDateKey 로 읽고 일정은 이 기기 0시로 견줘서, 기기와 고른 시간대가 다르면 칸 이름(data-calendar-date)과
       일정이 서는 칸이 하루씩 어긋났다 */
    const cellKeys = React.useMemo(() => dates.map(labelKey), [dates]);
    const weekSpans = React.useMemo(() => {
        const from = cellKeys[0], to = cellKeys[6];
        const spans = new Map<string, { start: string; end: string }>();
        todos.forEach((todo: CalendarTodoType) => {
            if (!todo.startAt || !todo.endAt) return;
            const start = localDateKey(todo.startAt), end = endDateKey(todo.startAt, todo.endAt);
            if (start <= to && end >= from) spans.set(todo.id, { start, end });
        });
        return spans;
    }, [todos, cellKeys]);
    const weekTodos = React.useMemo(() => todos.filter((todo: CalendarTodoType) => weekSpans.has(todo.id)), [todos, weekSpans]);
    const { todoLevels, maxLevel } = useTodoLevels(weekTodos, dates);
    const columns = cellKeys.map(key => {
        const dayTodos = weekTodos.filter(todo => {
            const span = weekSpans.get(todo.id);
            return !!span && span.start <= key && key <= span.end;
        });
        const period = (gem || lunar) && isMobile ? dayTodos.find(todo => {
            const span = weekSpans.get(todo.id);
            return span && span.start !== span.end;
        }) : undefined;
        const mobileOrder = period ? [period, ...dayTodos.filter(todo => todo !== period)] : dayTodos;

        const needed = dayTodos.reduce((max, todo) => Math.max(max, (todoLevels[todo.id] ?? 0) + 1), 0);
        const maxLevels = isMobile ? MAX_VISIBLE_LEVELS_MOBILE : needed <= fit.all ? fit.all : fit.withMore;
        const hiddenCount = isMobile ? Math.max(0, dayTodos.length - maxLevels)
            : dayTodos.filter(todo => todoLevels[todo.id] >= maxLevels).length;
        const visible = Array.from({ length: Math.min(maxLevel, maxLevels) }, (_, level) =>
            isMobile ? mobileOrder[level] : dayTodos.find(todo => todoLevels[todo.id] === level));
        return { dayTodos, hiddenCount, visible };
    });

    const anniversaries = useAnniversaryStore(s => s.anniversaries);

    const dayTiers = React.useMemo(() => dates.map((date) => {
        // 챌린지 항목의 startAt 은 칸 Date 그대로다(MonthCalendar) — 칸끼리 견준다
        const list = challengeTodos.filter(c => isSameDay(date, new Date(c.startAt as string | number | Date)));
        const total = list.length;
        const done = list.filter(c => c.isDone).length;
        if (total === 0 || done === 0) return 0;
        if (done >= total) return 3;
        return done / total >= 0.5 ? 2 : 1;
    }), [dates, challengeTodos]);

    return (
        <S.WeekRowContainer>
            {dates.map((date: Date, idx: number) => {
                const isToday = date.toDateString() === todayStr;
                const isCurrentMonth = date.getMonth() === currentMonth;
                const showMonthLabel = gem && !isCurrentMonth && ((row === 0 && idx === 0) || date.getDate() === 1);
                const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
                const cellKey = cellKeys[idx];

                const { dayTodos, hiddenCount, visible } = columns[idx];

                const tier = dayTiers[idx];
                const connectLeft = tier > 0 && idx > 0 && dayTiers[idx - 1] === tier;
                const connectRight = tier > 0 && idx < dates.length - 1 && dayTiers[idx + 1] === tier;

                const dayAnniversaries = anniversariesOn(anniversaries, date);
                const dateLabel = [cellKey, ...(isToday ? [t.home.today] : []),
                    ...dayAnniversaries.map(a => a.title)].join(" · ");
                const selectDate = (event: React.MouseEvent<HTMLElement>) => {
                    if (!onCellClick) return;
                    fx.emit('calendar-pick', { rect: rectOf(event.currentTarget) });
                    onCellClick(date);
                };
                const moveFocus = (event: React.KeyboardEvent<HTMLElement>) => {
                    if (event.target !== event.currentTarget || !onCellClick) return;
                    if (!gem && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onCellClick(date); }
                    const delta: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -date.getDay(), End: 6 - date.getDay() };
                    if (event.key in delta && !event.altKey && !event.ctrlKey && !event.metaKey) {
                        event.preventDefault();
                        event.stopPropagation();
                        const key = addDaysToKey(cellKey, delta[event.key]);
                        const selector = `[data-calendar-date="${key}"]${gem ? " [data-date-select]" : ""}`;
                        event.currentTarget.closest('[data-month-grid]')?.querySelector<HTMLElement>(selector)?.focus();
                    }
                };

                return (
                    <S.DayCell
                        key={idx}
                        ref={idx === 0 ? firstCellRef : undefined}
                        data-calendar-date={cellKey}
                        data-month-cell
                        data-selected={isSelected ? '' : undefined}
                        data-gem-frame-anchor={gem && isSelected ? '' : undefined}
                        role={!gem && onCellClick ? 'button' : undefined}
                        tabIndex={!gem && onCellClick ? (cellKey===tabStopKey?0:-1) : undefined}
                        aria-label={!gem && onCellClick ? dateLabel : undefined}
                        aria-pressed={!gem && onCellClick ? isSelected : undefined}
                        onKeyDown={!gem && onCellClick ? moveFocus : undefined}
                        aria-current={isToday ? 'date' : undefined}
                        $dropTarget={dropTarget === cellKey}
                        $isToday={isToday}
                        $isCurrentMonth={isCurrentMonth}
                        $isSelected={isSelected}
                        style={{ "--cell": row * 7 + idx, "--col": idx } as React.CSSProperties}
                        onClick={onCellClick ? selectDate : undefined}
                    >
                        {gem && isToday && <i className="gem-today-inlay" aria-hidden="true" />}
                        <DayCellDecor tier={tier} connectLeft={connectLeft} connectRight={connectRight} />

                        <div className="day-header">
                            {isToday && !gem && <span className="today-label">{t.home.today}</span>}
                            <S.DayHeaderLeft {...(gem && onCellClick ? {
                                as: "button" as const, type: "button" as const, "data-date-select": "",
                                tabIndex: cellKey === tabStopKey ? 0 : -1, "aria-label": dateLabel,
                                "aria-pressed": isSelected, "aria-current": isToday ? "date" as const : undefined,
                                onKeyDown: moveFocus,
                                onClick: (event: React.MouseEvent<HTMLElement>) => { event.stopPropagation(); selectDate(event); },
                            } : {})}>
                                {dayAnniversaries.length > 0 ? (
                                    <AnniversaryCrown items={dayAnniversaries} today={isToday} flip={family === "maple"}>
                                        {gem ? <span className="day-number">{date.getDate()}</span> : date.getDate()}
                                    </AnniversaryCrown>
                                ) : (
                                    lunar || family === "maple"
                                        ? <span className="month-numeral"><span className="day-number">{date.getDate()}</span></span>
                                        : <span className="day-number">{date.getDate()}</span>
                                )}
                            </S.DayHeaderLeft>
                            {showMonthLabel && <span data-gem-month aria-hidden="true">
                                {date.toLocaleDateString(locale, { month: "short" })}
                            </span>}

                            <S.AddTodoButton
                                tabIndex={cellKey===tabStopKey?0:-1}
                                aria-label={`${t.calendar.addTask}: ${cellKey}`}
                                className="add-btn"
                                onClick={(e) => { e.stopPropagation(); handleCreateTodo(date); }}
                            >
                                <Plus size={16} strokeWidth={2.5} />
                            </S.AddTodoButton>
                        </div>
                        {dayTodos.length > 0 && <S.CompactTaskCount type="button"
                            aria-label={gem && onCellClick
                                ? `${cellKey} · ${locale === "ko" ? `일정 ${dayTodos.length}건` : `${dayTodos.length} events`}`
                                : `${cellKey} · ${t.calendar.more(dayTodos.length)}`}
                            onClick={e => { e.stopPropagation(); if (gem && onCellClick) selectDate(e); else setMoreModalDate(date); }}>
                            {dayTodos.length}
                        </S.CompactTaskCount>}
                        <S.TodoBarList data-month-bars="">
                            {visible.map((todoAtThisLevel, levelIndex) => {
                                if (todoAtThisLevel && todoAtThisLevel.startAt && todoAtThisLevel.endAt) {
                                    const span = weekSpans.get(todoAtThisLevel.id);
                                    const isStart = span?.start === cellKey;
                                    const isEnd = span?.end === cellKey;
                                    const color = categories.find((c: CategoryType) => c.id === todoAtThisLevel.categoryId)?.color;

                                    const isDone = !!todoAtThisLevel.isDone;
                                    const movable = !todoAtThisLevel.isChallenge; // 프로젝트·할 일도 끌어서 옮긴다
                                    const showTitle = gem && !widget
                                        ? columns[idx - 1]?.visible[levelIndex]?.id !== todoAtThisLevel.id
                                        : isStart || idx === 0 || isMobile;
                                    // Use only adjacent segments that actually fit the same visible lane.
                                    let titleSpan = 1;
                                    if (gem && !widget && showTitle) {
                                        while (columns[idx + titleSpan]?.visible[levelIndex]?.id === todoAtThisLevel.id) titleSpan++;
                                    }

                                    let first = idx, last = idx;
                                    if (lunar) {
                                        while (columns[first - 1]?.visible[levelIndex]?.id === todoAtThisLevel.id) first--;
                                        while (columns[last + 1]?.visible[levelIndex]?.id === todoAtThisLevel.id) last++;
                                    }
                                    return (
                                        <S.TodoBarItem key={todoAtThisLevel.id}
                                                       data-month-bar=""
                                                       data-lunar-track={lunar ? "" : undefined}
                                                       data-done={isDone ? '' : undefined}
                                                       data-dragging={draggingId === todoAtThisLevel.id ? '' : undefined}
                                                       data-track-hover={pointedTodoId === todoAtThisLevel.id ? '' : undefined}
                                                       data-gem-title-span={titleSpan > 1 ? titleSpan : undefined}
                                                       style={{ '--event-color': color ?? 'currentColor', '--gem-title-span': titleSpan > 1 ? titleSpan : undefined } as React.CSSProperties}
                                                       role="button"
                                                       tabIndex={(lunar ? idx === first : gem && !widget ? showTitle : isStart || idx === 0) ? 0 : -1}
                                                       aria-label={todoAtThisLevel.title}
                                                       title={movable && !isMobile ? `${todoAtThisLevel.title} · ${t.interaction.calendarDragHint}` : todoAtThisLevel.title}
                                                       $dragging={draggingId === todoAtThisLevel.id}
                                                       $movable={movable}
                                                       onPointerDown={e => { if (movable && !isMobile) onDragStart(e, todoAtThisLevel, cellKey); }}
                                                       onPointerEnter={gem || lunar ? e => {
                                                           if (e.pointerType !== "touch") setPointedTodoId(todoAtThisLevel.id);
                                                       } : undefined}
                                                       onPointerLeave={gem || lunar ? () => setPointedTodoId(null) : undefined}
                                                       $isStart={isStart}
                                                       $isEnd={isEnd}
                                                       $color={color}
                                                       $isDone={isDone}
                                                       onClick={(e) => { e.stopPropagation(); if (!consumeDragClick()) void handleQuickEdit(todoAtThisLevel); }}
                                                       onKeyDown={e => {
                                                           if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); void handleQuickEdit(todoAtThisLevel); }
                                                           if (movable && e.altKey && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                               e.preventDefault();
                                                               const from = cellKey;
                                                               void handleMoveTodo(todoAtThisLevel, from, addDaysToKey(from, e.key === 'ArrowLeft' ? -1 : 1));
                                                           }
                                                       }}
                                                       onContextMenu={(e) => {
                                                           e.stopPropagation();
                                                           handleContextMenu(e, todoAtThisLevel);
                                                       }}>
                                            {lunar ? <LunarEvent title={todoAtThisLevel.title} color={color} done={isDone}
                                                count={last - first + 1} index={idx - first} selected={activeTodoId === todoAtThisLevel.id} />
                                                : showTitle && <span className="todo-title">{todoAtThisLevel.title}</span>}
                                            {movable && !isMobile && (['start', 'end'] as const).map(edge => ((edge === 'start' && isStart) || (edge === 'end' && isEnd)) && <S.RangeHandle
                                                key={edge} type="button" $edge={edge}
                                                aria-label={`${todoAtThisLevel.title} · ${edge === 'start' ? t.form.startDate : t.form.endDate}`}
                                                title={edge === 'start' ? t.form.startDate : t.form.endDate}
                                                onPointerDown={e => { e.stopPropagation(); onDragStart(e, todoAtThisLevel, cellKey, edge); }}
                                                onClick={e => { e.stopPropagation(); consumeDragClick(); }}
                                                onKeyDown={e => {
                                                    e.stopPropagation();
                                                    if (e.altKey && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                                                        e.preventDefault(); const from = cellKey;
                                                        void handleResizeTodo(todoAtThisLevel, edge, from, addDaysToKey(from, e.key === 'ArrowLeft' ? -1 : 1));
                                                    }
                                                }}
                                            />)}
                                        </S.TodoBarItem>
                                    );
                                }
                                return <S.TodoBarSpacer key={`spacer-${levelIndex}`} />;
                            })}

                            {hiddenCount > 0 && (
                                <S.MoreButton data-month-more="" aria-label={`${cellKey} · ${t.calendar.more(hiddenCount)}`} onClick={(e) => { e.stopPropagation(); setMoreModalDate(date); }}>
                                    <span className="full">{t.calendar.more(hiddenCount)}</span>
                                    <span className="short">{`+${hiddenCount}`}</span>
                                </S.MoreButton>
                            )}
                        </S.TodoBarList>
                    </S.DayCell>
                )
            })}
        </S.WeekRowContainer>
    );
};

type CelestialMonthProps = MonthThemeProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'>;

const MonthCalendarView = React.forwardRef<HTMLDivElement, CelestialMonthProps>(
    ({
         asChild, currentDate, direction, selectedCategoryIds,
         isModalOpen, modalTodo, selectedDateForModal, contextMenu,
         moreModalDate, weeks, expandedTodos, challengeTodos, todayStr, dateRangeText,
         categories, selectedDate, onDateChange,
         handlePrevMonth, handleNextMonth, handleToday, isOnToday, toggleCategory, handleContextMenu,
         handleQuickEdit, handleQuickDelete, handleQuickDeleteOne, handleQuickToggle, handleCreateTodo,
         handleContextMenuChallenge, handleQuickToggleChallenge,
         setIsModalOpen, setMoreModalDate, setContextMenu, showProjects, onToggleProjects,
         showChallenges, onToggleChallenges,
         handleMoveTodo, handleResizeTodo, moveNotice, undoMove, dismissMove,
         ...props
     }, ref) => {
        const S = usePickTheme(STYLES);
        const Component = asChild ? Slot : 'div';
        const t = useT();
        const family = useThemeFamily();
        const gem = family === "gem";
        const MonthHeader = HEADERS[family];
        const Etching = ETCHINGS[family];
        const [selectedOccurrence, setSelectedOccurrence] = React.useState<string>();
        const pickDate = (date: Date) => { setSelectedOccurrence(undefined); onDateChange?.(date); };
        const editOccurrence: MonthThemeProps['handleQuickEdit'] = todo => {
            setSelectedOccurrence(todo.id);
            return handleQuickEdit(todo);
        };
        const calendarDrag = useDragTarget<{ todo: CalendarTodoType; from: string; edge?: 'start' | 'end' }>('data-calendar-date', (source, target) => {
            if (source.edge) void handleResizeTodo(source.todo, source.edge, source.from, target);
            else void handleMoveTodo(source.todo, source.from, target);
        });
        // 손가락으로는 작은 화살표보다 쓸어 넘기는 쪽이 빠르다.
        const swipe = useSwipe(handleNextMonth, handlePrevMonth);
        const gridRef = React.useRef<HTMLDivElement>(null);
        const monthKey = currentDate.getFullYear() * 12 + currentDate.getMonth();
        const monthBodyRef = React.useRef<HTMLDivElement>(null);
        const gridContent = gem ? JSON.stringify([monthKey, selectedDate && labelKey(selectedDate), selectedCategoryIds, expandedTodos.map(todo => [todo.id, todo.title, todo.startAt, todo.endAt, todo.isDone]),
            challengeTodos.map(todo => [todo.id, todo.title, todo.isDone])]) : "";
        useSwapMotion(monthKey, gem ? monthBodyRef : gridRef, { size: gem ? "page" : "pane", contentKeys: gem ? [gridContent] : undefined });

        return (
            <S.CelestialCalendarWrapper data-month-calendar={family} as={Component} ref={ref} {...props}>
                <MonthHeader month={currentDate} navigation={<>
                    <button type="button" className="nav-btn" aria-label={t.calendar.prevMonth} onClick={handlePrevMonth}><ChevronLeft size={24} /></button>
                    <AnimatedDateText text={dateRangeText} direction={direction} />
                    <button type="button" className="nav-btn" aria-label={t.calendar.nextMonth} onClick={handleNextMonth}><ChevronRight size={24} /></button>
                    <S.TodayButton type="button" onClick={handleToday} disabled={isOnToday}>
                        {t.home.today}
                    </S.TodayButton>
                    </>} filters={
                    <CategoryFilter
                        categories={categories}
                        selectedCategoryIds={selectedCategoryIds}
                        showProjects={showProjects}
                        onToggleProjects={onToggleProjects}
                        showChallenges={showChallenges}
                        onToggleChallenges={onToggleChallenges}
                        onToggle={toggleCategory}
                    />
                } />
                {moveNotice && <S.MoveNotice role="status">
                    <span>{moveNotice}</span>
                    {undoMove && <button type="button" onClick={() => void undoMove()}>{t.interaction.undo}</button>}
                    <button type="button" aria-label={t.interaction.dismiss} onClick={dismissMove}>×</button>
                </S.MoveNotice>}

                <S.SliderWrapper {...swipe}>
                    <S.CalendarWindow data-fx-zone="month">
                        <div data-calendar-decoration><Etching month={currentDate} /></div>
                        {/* One live grid: rapid navigation never retains stale dates. */}
                            <div
                                ref={gridRef}
                                // isolation — 판 안의 층(날짜 줄 z 2, + 단추 z 10 따위)이 판 밖과 다투지 않게 판마다 가둔다.
                                // 안 그러면 넘어가는 옛 장(z 2) 위로 밑에 깔린 새 장의 날짜 숫자가 비쳐 올라왔다(Maple 책장 넘김)
                                style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', isolation: 'isolate' }}
                            >
                                <S.Header data-month-weekdays>
                                    {t.calendar.days.map((d) => (
                                        <S.DayNameBox key={d}>
                                            <div className="day-name">{d}</div>
                                        </S.DayNameBox>
                                    ))}
                                </S.Header>

                                <S.GridContainer data-month-grid ref={monthBodyRef}>
                                    {weeks.map((weekDates, idx) => (
                                        <WeekRow
                                            key={idx}
                                            row={idx}
                                            dates={weekDates}
                                            todos={expandedTodos}
                                            challengeTodos={challengeTodos}
                                            categories={categories}
                                            activeTodoId={contextMenu?.todo.id ?? selectedOccurrence}
                                            todayStr={todayStr}
                                            currentMonth={currentDate.getMonth()}
                                            handleCreateTodo={handleCreateTodo}
                                            handleContextMenu={(event, todo) => { setSelectedOccurrence(todo.id); handleContextMenu(event, todo); }}
                                            handleContextMenuChallenge={handleContextMenuChallenge}
                                            handleQuickToggleChallenge={handleQuickToggleChallenge}
                                            selectedDate={selectedDate}
                                            tabStopKey={selectedDate && weeks.flat().some(d=>labelKey(d)===labelKey(selectedDate)) ? labelKey(selectedDate) : labelKey(new Date(currentDate.getFullYear(),currentDate.getMonth(),1))}
                                            onCellClick={onDateChange ? pickDate : undefined}
                                            setMoreModalDate={setMoreModalDate}
                                            handleQuickEdit={editOccurrence}
                                            handleMoveTodo={handleMoveTodo}
                                            handleResizeTodo={handleResizeTodo}
                                            onDragStart={(e, todo, from, edge) => calendarDrag.begin(e, { todo, from, edge })}
                                            consumeDragClick={calendarDrag.consumeClick}
                                            draggingId={calendarDrag.drag?.source.todo.id}
                                            dropTarget={calendarDrag.drag?.target ?? null}
                                        />
                                    ))}
                                    {gem && <GemSelectionFrame period={monthKey} selected={selectedDate && labelKey(selectedDate)} />}
                                </S.GridContainer>
                            </div>
                        {family === "celestial" && <PlateIndex month={currentDate} />}
                    </S.CalendarWindow>
                </S.SliderWrapper>

                <MoreModal
                    isOpen={moreModalDate !== null}
                    onClose={() => setMoreModalDate(null)}
                    date={moreModalDate}
                    todos={expandedTodos}
                    categories={categories}
                    handleContextMenu={handleContextMenu}
                    onEditTodo={todo => { setMoreModalDate(null); void editOccurrence(todo); }}
                    challenges={challengeTodos}
                    onToggleChallenge={(challenge) => handleQuickToggleChallenge(challenge as CalendarTodoType)}
                />

                <TodoContextMenu
                    menuState={contextMenu}
                    onClose={() => setContextMenu(null)}
                    onToggle={handleQuickToggle}
                    onEdit={editOccurrence}
                    onDelete={handleQuickDelete}
                    onDeleteOne={handleQuickDeleteOne}
                />

                <TodoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    todo={modalTodo}
                    categories={categories}
                    selectedDate={selectedDateForModal}
                />
            </S.CelestialCalendarWrapper>
        );
    }
);

MonthCalendarView.displayName = "MonthCalendarView";

export default MonthCalendarView;
