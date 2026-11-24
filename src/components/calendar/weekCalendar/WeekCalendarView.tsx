"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { useSwapMotion } from '@/hooks/useMotion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { WeekThemeProps } from "./WeekCalendar";
import { isSameDay, isBetween } from "@/utils/DateUtils";
import { labelKey, localDateKey, endDateKey } from "@/lib/dateKey";
import Arrow from "@/assets/Arrow";
import CategoryFilter from "@/components/calendar/parts/categoryFilter/CategoryFilter";
import AnimatedDateText from "@/components/calendar/parts/animatedDateText/AnimatedDateText";
import GemSelectionFrame from "@/components/calendar/parts/GemSelectionFrame";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import MoreModal from "@/components/modal/moreModal/MoreModal";
import { LunarEvent } from "@/components/calendar/parts/LunarEvent";
import TodoContextMenu from "@/components/calendar/parts/contextMenu/TodoContextMenu";
import AnniversaryLocket from "@/components/calendar/parts/anniversary/AnniversaryLocket";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import { anniversariesOn } from "@/lib/anniversary";
import { useT } from "@/i18n/useT";

import DayCellDecor from "@/assets/DayCellDecor";
import CalendarAmbience from "@/assets/celestial/CalendarAmbience";
import { usePickTheme, useThemeFamily, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialWeekCalendar.styles";
import * as GemS from "./gem/GemWeekCalendar.styles";
import * as MapleS from "./maple/MapleWeekCalendar.styles";
import * as OceanS from './ocean/OceanWeekCalendar.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: GemS };


const MAX_VISIBLE_LEVELS = 3;

const tierFor = (done: number, total: number) => {
    if (total === 0 || done === 0) return 0;
    if (done >= total) return 3;
    return done / total >= 0.5 ? 2 : 1;
};

type CelestialWeekProps = WeekThemeProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'>;

const WeekCalendarView = React.forwardRef<HTMLDivElement, CelestialWeekProps>(
    ({
         asChild, direction, selectedCategoryIds,
         // 화면이 안 쓰는 상태값도 여기서 받아 둔다 — 안 그러면 ...props 로 DOM 에 흘러가 React 가 경고한다
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         currentDate, selectedDate,
         isModalOpen, modalTodo, selectedDateForModal, todoContextMenu,
         moreModalDate, weekDates, expandedTodos, challengeTodos, todayStr, dateRangeText,
         todoLevels, maxLevel, categories, onDateChange,
         handlePrevWeek, handleNextWeek, toggleCategory, handleContextMenu,
         handleQuickEdit, handleQuickDelete, handleQuickDeleteOne, handleQuickToggle, handleCreateTodo,
         setIsModalOpen, setMoreModalDate, setTodoContextMenu,
         showProjects, onToggleProjects,
         showChallenges, onToggleChallenges,
         ...props
     }, ref) => {
        const S = usePickTheme(STYLES);
        const Component = asChild ? Slot : 'div';
        const gridRef=React.useRef<HTMLDivElement>(null);
        const weekKey = labelKey(weekDates[0]);
        useSwapMotion(weekKey,gridRef);
        const theme = useTheme();
        const family = useThemeFamily();
        const gem = family === "gem";
        const lunar = family === "celestial";
        const [selectedOccurrence, setSelectedOccurrence] = React.useState<string>();
        const editOccurrence: typeof handleQuickEdit = todo => {
            setSelectedOccurrence(todo.id);
            return handleQuickEdit(todo);
        };
        const [pointedTodoId, setPointedTodoId] = React.useState<string | null>(null);
        const t = useT();
        const anniversaries = useAnniversaryStore(s => s.anniversaries);

        // 단계(tier)는 챌린지 완료율로만 계산 (일반 할 일은 합산하지 않음)
        const dayTiers = React.useMemo(() => {
            return weekDates.map(date => {
                // 챌린지 항목의 startAt 은 칸 Date 그대로다(WeekCalendar) — 칸끼리 견준다
                const dayChallenges = challengeTodos.filter(c => isSameDay(new Date(c.startAt), date));
                const total = dayChallenges.length;
                const done = dayChallenges.filter(c => c.isDone).length;
                return tierFor(done, total);
            });
        }, [weekDates, challengeTodos]);

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>
                <S.SliderWrapper>
                    <S.DateRangeDisplay>
                        <S.ArrowWrapper $side="left" onClick={handlePrevWeek}
                            {...(gem ? { as: "button", type: "button", "aria-label": t.calendar.prevWeek } as const : {})}>
                            {gem ? <ChevronLeft size={17} aria-hidden="true" /> : <Arrow width={80} height={30} isRight={false} stroke={theme.colors.primary}/>}
                        </S.ArrowWrapper>
                        <AnimatedDateText text={dateRangeText} direction={direction} />
                        <S.DateLine $direction={direction} />
                        <CategoryFilter
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            onToggle={toggleCategory}
                            showProjects={showProjects}
                            onToggleProjects={onToggleProjects}
                            showChallenges={showChallenges}
                            onToggleChallenges={onToggleChallenges}
                        />
                        <S.ArrowWrapper $side="right" onClick={handleNextWeek}
                            {...(gem ? { as: "button", type: "button", "aria-label": t.calendar.nextWeek } as const : {})}>
                            {gem ? <ChevronRight size={17} aria-hidden="true" /> : <Arrow width={80} height={30} isRight={true} stroke={theme.colors.primary}/>}
                        </S.ArrowWrapper>
                    </S.DateRangeDisplay>

                    <S.CalendarRow>
                    <S.CalendarWindow>
                        {!gem && <CalendarAmbience />}
                            <div ref={gridRef}
                                style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}
                            >
                                <S.Header>
                                    {t.calendar.days.map((d, i) => {
                                        const isToday = weekDates[i].toDateString() === todayStr;
                                        const picked = gem && !!selectedDate && isSameDay(weekDates[i], selectedDate);
                                        const dayAnniversaries = anniversariesOn(anniversaries, weekDates[i]);
                                        return (
                                            <S.DayNameBox key={d} $isToday={isToday} $tier={dayTiers[i]} aria-current={gem && isToday ? "date" : undefined}
                                                data-gem-frame-anchor={picked ? '' : undefined}>
                                                {gem && isToday && <i className="gem-today-inlay" aria-hidden="true" />}
                                                <div className="day-name">{d}{gem && ` ${weekDates[i].getDate()}`}</div>
                                                {dayTiers[i] >= 2 && (
                                                    <span className={dayTiers[i] === 3 ? "day-mark done" : "day-mark"} />
                                                )}
                                                {dayAnniversaries.length > 0 && (
                                                    <AnniversaryLocket items={dayAnniversaries} today={isToday} />
                                                )}
                                            </S.DayNameBox>
                                        )
                                    })}
                                    {gem && <GemSelectionFrame period={weekKey} selected={selectedDate && labelKey(selectedDate)} />}
                                </S.Header>

                                <S.BarContainer>
                                    {weekDates.map((date, idx) => {
                                        const isToday = date.toDateString() === todayStr;
                                        const regularTodos = expandedTodos.filter(todo => isBetween(date, todo.startAt!, todo.endAt!));
                                        const hiddenCount = regularTodos.filter(t => todoLevels[t.id] >= MAX_VISIBLE_LEVELS).length;

                                        // 같은 단계의 날이 연속되면 프레임을 이어지게
                                        const tier = dayTiers[idx];
                                        const connectLeft = idx > 0 && dayTiers[idx - 1] === tier && tier >= 1;
                                        const connectRight = idx < weekDates.length - 1 && dayTiers[idx + 1] === tier && tier >= 1;

                                        return (
                                            <S.DaySlot key={idx} $isToday={isToday} onClick={() => { setSelectedOccurrence(undefined); onDateChange?.(date); }}>
                                                <S.AddTodoButton type="button" className="add-btn" aria-label={`${t.calendar.addTask}: ${labelKey(date)}`} onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCreateTodo(date);
                                                }}>
                                                    <Plus size={16} strokeWidth={3} />
                                                </S.AddTodoButton>


                                                <S.TodoBarList>
                                                    {Array.from({ length: Math.min(maxLevel, MAX_VISIBLE_LEVELS) }).map((_, levelIndex) => {
                                                        const todoAtThisLevel = regularTodos.find(t => todoLevels[t.id] === levelIndex);

                                                        if (todoAtThisLevel && todoAtThisLevel.startAt && todoAtThisLevel.endAt) {
                                                            // 칸의 날과 일정의 첫날·끝날(고른 시간대)을 날 키로 견준다 (isBetween 과 같은 셈)
                                                            const isStart = labelKey(date) === localDateKey(todoAtThisLevel.startAt);
                                                            const isEnd = labelKey(date) === endDateKey(todoAtThisLevel.startAt, todoAtThisLevel.endAt);
                                                            const color = categories.find(c => c.id === todoAtThisLevel.categoryId)?.color;

                                                            const item = todoAtThisLevel as (typeof todoAtThisLevel & { isDone?: boolean; check?: string; status?: string });
                                                            const isActuallyDone = item.isDone === true || item.check === 'done' || item.status === 'done';

                                                            const first = lunar ? weekDates.findIndex(day => isBetween(day, todoAtThisLevel.startAt!, todoAtThisLevel.endAt!)) : idx;
                                                            const count = lunar ? weekDates.filter(day => isBetween(day, todoAtThisLevel.startAt!, todoAtThisLevel.endAt!)).length : 1;
                                                            return (
                                                                <S.TodoBarItem key={todoAtThisLevel.id}
                                                                               $isStart={isStart}
                                                                               $isEnd={isEnd}
                                                                               $color={color}
                                                                               data-lunar-track={lunar ? "" : undefined}
                                                                               data-track-hover={lunar && pointedTodoId === todoAtThisLevel.id ? "" : undefined}
                                                                               onPointerEnter={lunar ? e => { if (e.pointerType !== "touch") setPointedTodoId(todoAtThisLevel.id); } : undefined}
                                                                               onPointerLeave={lunar ? () => setPointedTodoId(null) : undefined}
                                                                               $isDone={isActuallyDone}
                                                                               role={lunar ? "button" : undefined}
                                                                               aria-label={lunar ? todoAtThisLevel.title : undefined}
                                                                               tabIndex={lunar ? (idx === first ? 0 : -1) : undefined}
                                                                               onKeyDown={lunar ? e => {
                                                                                   if (e.key === 'Enter' || e.key === ' ') {
                                                                                       e.preventDefault(); e.stopPropagation(); void editOccurrence(todoAtThisLevel);
                                                                                   }
                                                                               } : undefined}
                                                                               onClick={e => { e.stopPropagation(); if (lunar) void editOccurrence(todoAtThisLevel); }}
                                                                               onContextMenu={(e) => {
                                                                                   e.stopPropagation();
                                                                                   setSelectedOccurrence(todoAtThisLevel.id);
                                                                                   handleContextMenu(e, todoAtThisLevel);
                                                                               }}>
                                                                    {lunar ? <LunarEvent title={todoAtThisLevel.title} color={color} done={isActuallyDone}
                                                                        count={count} index={idx - first} selected={(todoContextMenu?.todo.id ?? selectedOccurrence) === todoAtThisLevel.id} />
                                                                        : (isStart || idx === 0) && <span className="todo-title">{todoAtThisLevel.title}</span>}
                                                                </S.TodoBarItem>
                                                            );
                                                        }
                                                        return <S.TodoBarSpacer key={`spacer-${levelIndex}`} />;
                                                    })}

                                                    {hiddenCount > 0 && (
                                                        <S.MoreButton onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMoreModalDate(date);
                                                        }}>
                                                            {t.calendar.more(hiddenCount)}
                                                        </S.MoreButton>
                                                    )}
                                                </S.TodoBarList>
                                                <DayCellDecor tier={tier} connectLeft={connectLeft} connectRight={connectRight} />

                                                {isToday && <S.TodayIndicator />}
                                            </S.DaySlot>
                                        );
                                    })}
                                </S.BarContainer>
                            </div>
                    </S.CalendarWindow>
                    </S.CalendarRow>
                </S.SliderWrapper>

                <MoreModal
                    isOpen={moreModalDate !== null}
                    onClose={() => setMoreModalDate(null)}
                    date={moreModalDate}
                    todos={expandedTodos}
                    categories={categories}
                    handleContextMenu={handleContextMenu}
                />

                <TodoContextMenu
                    menuState={todoContextMenu}
                    onClose={() => setTodoContextMenu(null)}
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

WeekCalendarView.displayName = "WeekCalendarView";

export default WeekCalendarView;
