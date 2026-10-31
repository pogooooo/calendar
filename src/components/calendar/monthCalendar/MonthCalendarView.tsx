"use client";

import GemMonthHeader from './gem/GemMonthHeader';
import GemCalendarEtching from './gem/GemCalendarEtching';
import * as GemS from "./gem/GemMonthCalendar.styles";
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
import { anniversariesOn } from "@/lib/anniversary";
import AnniversaryCrown from "@/components/calendar/parts/anniversary/AnniversaryCrown";
import { useSwapMotion } from '@/hooks/useMotion';
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import CelestialMonthHeader from "./celestial/CelestialMonthHeader";
import MapleMonthHeader from "./maple/MapleMonthHeader";
import * as CelestialS from "./celestial/CelestialMonthCalendar.styles";
import * as MapleS from "./maple/MapleMonthCalendar.styles";
import OceanMonthHeader from './ocean/OceanMonthHeader';
import * as OceanS from './ocean/OceanMonthCalendar.styles';
import CelestialCalendarEtching from './celestial/CelestialCalendarEtching';
import MapleNotebookDetails from './maple/MapleNotebookDetails';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const HEADERS = { celestial: CelestialMonthHeader, maple: MapleMonthHeader, ocean: OceanMonthHeader , gem: GemMonthHeader };
const NoEtching = () => null;
const ETCHINGS:ThemeImpls<React.ComponentType<{month:Date}>> = { celestial:CelestialCalendarEtching, maple:MapleNotebookDetails, ocean:NoEtching , gem: GemCalendarEtching };

const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS , gem: GemS };



interface WeekRowProps {
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

/** Desktop/widget rows are measured. Phones preview two titles, with the full list below. */
const DEFAULT_VISIBLE_LEVELS = 2;
const MAX_VISIBLE_LEVELS_MOBILE = 1;
/** 바를 아직 못 쟀을 때의 한 층 높이 (바 20px + 사이 2px) 와 "+N" 줄 높이 */
const FALLBACK_BAR_PITCH = 22;
const FALLBACK_MORE_HEIGHT = 20;

const WeekRow = ({
                     dates, row, todos, challengeTodos, categories, todayStr, currentMonth,
                     handleCreateTodo, handleContextMenu,
                     selectedDate, tabStopKey, onCellClick, setMoreModalDate, handleQuickEdit, handleMoveTodo, handleResizeTodo,
                     onDragStart, consumeDragClick, draggingId, dropTarget
                 }: WeekRowProps) => {
    const S = usePickTheme(STYLES);
    const t = useT();
    // 위젯 창은 폭이 좁아도 바를 그대로 두므로(styles 의 NOT_WIDGET) 층 수도 데스크톱 것을 쓴다
    const isMobile = useIsMobile() && !isWidgetWindow();

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
                const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
                const cellKey = cellKeys[idx];

                const dayTodos = weekTodos.filter((todo: CalendarTodoType) => {
                    const span = weekSpans.get(todo.id);
                    return !!span && span.start <= cellKey && cellKey <= span.end;
                });

                // 이 칸이 쓰는 층 수가 들어가면 다 보이고, 넘치면 한 층을 "+N" 자리로 비운다
                const needed = dayTodos.reduce((m: number, t: CalendarTodoType) => Math.max(m, (todoLevels[t.id] ?? 0) + 1), 0);
                const maxLevels = isMobile ? (dayTodos.length > MAX_VISIBLE_LEVELS_MOBILE ? 1 : MAX_VISIBLE_LEVELS_MOBILE)
                    : needed <= fit.all ? fit.all : fit.withMore;
                const hiddenCount = isMobile ? Math.max(0, dayTodos.length - maxLevels)
                    : dayTodos.filter((t: CalendarTodoType) => todoLevels[t.id] >= maxLevels).length;

                const tier = dayTiers[idx];
                const connectLeft = tier > 0 && idx > 0 && dayTiers[idx - 1] === tier;
                const connectRight = tier > 0 && idx < dates.length - 1 && dayTiers[idx + 1] === tier;

                const dayAnniversaries = anniversariesOn(anniversaries, date);

                return (
                    <S.DayCell
                        key={idx}
                        ref={idx === 0 ? firstCellRef : undefined}
                        data-calendar-date={cellKey}
                        data-month-cell
                        data-selected={isSelected ? '' : undefined}
                        role={onCellClick ? 'button' : undefined}
                        tabIndex={onCellClick ? (cellKey===tabStopKey?0:-1) : undefined}
                        aria-label={onCellClick ? `${cellKey}${isToday ? ` · ${t.home.today}` : ''}` : undefined}
                        aria-pressed={onCellClick ? isSelected : undefined}
                        onKeyDown={onCellClick ? (event) => {
                            if (event.target !== event.currentTarget) return;
                            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onCellClick(date); }
                            const delta:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-date.getDay(),End:6-date.getDay()};
                            if(event.key in delta && !event.altKey && !event.ctrlKey && !event.metaKey) {
                                event.preventDefault();event.stopPropagation();
                                const key=addDaysToKey(cellKey,delta[event.key]);
                                event.currentTarget.closest('[data-month-grid]')?.querySelector<HTMLElement>(`[data-calendar-date="${key}"]`)?.focus();
                            }
                        } : undefined}
                        aria-current={isToday ? 'date' : undefined}
                        $dropTarget={dropTarget === cellKey}
                        $isToday={isToday}
                        $isCurrentMonth={isCurrentMonth}
                        $isSelected={isSelected}
                        style={{ "--cell": row * 7 + idx, "--col": idx } as React.CSSProperties}
                        onClick={(event) => { if (!onCellClick) return; fx.emit('calendar-pick', {rect:rectOf(event.currentTarget)}); onCellClick(date); }}
                    >
                        <DayCellDecor tier={tier} connectLeft={connectLeft} connectRight={connectRight} />

                        <div className="day-header">
                            {isToday && <span className="today-label">{t.home.today}</span>}
                            <S.DayHeaderLeft>
                                {dayAnniversaries.length > 0 ? (
                                    <AnniversaryCrown items={dayAnniversaries} today={isToday}>
                                        <span className="day-number">{date.getDate()}</span>
                                    </AnniversaryCrown>
                                ) : (
                                    <span className="day-number">{date.getDate()}</span>
                                )}
                            </S.DayHeaderLeft>

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
                            aria-label={`${cellKey} · ${t.calendar.more(dayTodos.length)}`}
                            onClick={e => { e.stopPropagation(); setMoreModalDate(date); }}>
                            {dayTodos.length}
                        </S.CompactTaskCount>}
                        <S.TodoBarList data-month-bars="">
                            {Array.from({ length: Math.min(maxLevel, maxLevels) }).map((_, levelIndex) => {
                                const todoAtThisLevel = isMobile ? dayTodos[levelIndex]
                                    : dayTodos.find((t: CalendarTodoType) => todoLevels[t.id] === levelIndex);

                                if (todoAtThisLevel && todoAtThisLevel.startAt && todoAtThisLevel.endAt) {
                                    const span = weekSpans.get(todoAtThisLevel.id);
                                    const isStart = span?.start === cellKey;
                                    const isEnd = span?.end === cellKey;
                                    const color = categories.find((c: CategoryType) => c.id === todoAtThisLevel.categoryId)?.color;

                                    const isDone = !!todoAtThisLevel.isDone;
                                    const movable = !todoAtThisLevel.isChallenge; // 프로젝트·할 일도 끌어서 옮긴다

                                    return (
                                        <S.TodoBarItem key={todoAtThisLevel.id}
                                                       data-month-bar=""
                                                       data-done={isDone ? '' : undefined}
                                                       style={{ '--event-color': color ?? 'currentColor' } as React.CSSProperties}
                                                       role="button"
                                                       tabIndex={isStart || idx === 0 ? 0 : -1}
                                                       aria-label={todoAtThisLevel.title}
                                                       title={movable && !isMobile ? `${todoAtThisLevel.title} · ${t.interaction.calendarDragHint}` : todoAtThisLevel.title}
                                                       $dragging={draggingId === todoAtThisLevel.id}
                                                       $movable={movable}
                                                       onPointerDown={e => { if (movable && !isMobile) onDragStart(e, todoAtThisLevel, cellKey); }}
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
                                            {(isMobile || isStart || idx === 0) && <span className="todo-title">{todoAtThisLevel.title}</span>}
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
        const MonthHeader = usePickTheme(HEADERS);
        const Etching = usePickTheme(ETCHINGS);
        const calendarDrag = useDragTarget<{ todo: CalendarTodoType; from: string; edge?: 'start' | 'end' }>('data-calendar-date', (source, target) => {
            if (source.edge) void handleResizeTodo(source.todo, source.edge, source.from, target);
            else void handleMoveTodo(source.todo, source.from, target);
        });
        // 손가락으로는 작은 화살표보다 쓸어 넘기는 쪽이 빠르다.
        const swipe = useSwipe(handleNextMonth, handlePrevMonth);
        const gridRef = React.useRef<HTMLDivElement>(null);
        useSwapMotion(currentDate.getFullYear() * 12 + currentDate.getMonth(), gridRef);

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>
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
                                <S.Header>
                                    {t.calendar.days.map((d) => (
                                        <S.DayNameBox key={d}>
                                            <div className="day-name">{d}</div>
                                        </S.DayNameBox>
                                    ))}
                                </S.Header>

                                <S.GridContainer data-month-grid>
                                    {weeks.map((weekDates, idx) => (
                                        <WeekRow
                                            key={idx}
                                            row={idx}
                                            dates={weekDates}
                                            todos={expandedTodos}
                                            challengeTodos={challengeTodos}
                                            categories={categories}
                                            todayStr={todayStr}
                                            currentMonth={currentDate.getMonth()}
                                            handleCreateTodo={handleCreateTodo}
                                            handleContextMenu={handleContextMenu}
                                            handleContextMenuChallenge={handleContextMenuChallenge}
                                            handleQuickToggleChallenge={handleQuickToggleChallenge}
                                            selectedDate={selectedDate}
                                            tabStopKey={selectedDate && weeks.flat().some(d=>labelKey(d)===labelKey(selectedDate)) ? labelKey(selectedDate) : labelKey(new Date(currentDate.getFullYear(),currentDate.getMonth(),1))}
                                            onCellClick={onDateChange}
                                            setMoreModalDate={setMoreModalDate}
                                            handleQuickEdit={handleQuickEdit}
                                            handleMoveTodo={handleMoveTodo}
                                            handleResizeTodo={handleResizeTodo}
                                            onDragStart={(e, todo, from, edge) => calendarDrag.begin(e, { todo, from, edge })}
                                            consumeDragClick={calendarDrag.consumeClick}
                                            draggingId={calendarDrag.drag?.source.todo.id}
                                            dropTarget={calendarDrag.drag?.target ?? null}
                                        />
                                    ))}
                                </S.GridContainer>
                            </div>
                    </S.CalendarWindow>
                </S.SliderWrapper>

                <MoreModal
                    isOpen={moreModalDate !== null}
                    onClose={() => setMoreModalDate(null)}
                    date={moreModalDate}
                    todos={expandedTodos}
                    categories={categories}
                    handleContextMenu={handleContextMenu}
                    onEditTodo={todo => { setMoreModalDate(null); void handleQuickEdit(todo); }}
                    challenges={challengeTodos}
                    onToggleChallenge={(challenge) => handleQuickToggleChallenge(challenge as CalendarTodoType)}
                />

                <TodoContextMenu
                    menuState={contextMenu}
                    onClose={() => setContextMenu(null)}
                    onToggle={handleQuickToggle}
                    onEdit={handleQuickEdit}
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
