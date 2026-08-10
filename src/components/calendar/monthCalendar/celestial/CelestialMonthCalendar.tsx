"use client";

import * as React from "react";
import styled, { keyframes } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

import { MonthThemeProps, CalendarTodoType } from "../MonthCalendar";
import { isSameDay, isBetween } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import { CategoryType } from "@/store/useCategoryStore";

import * as S from "./CelestialMonthCalendar.styles";
import CategoryFilter from "@/components/calendar/celestial/categoryFilter/CategoryFilter";
import AnimatedDateText from "@/components/calendar/celestial/animatedDateText/AnimatedDateText";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import MoreModal from "@/components/modal/moreModal/MoreModal";
import TodoContextMenu from "@/components/calendar/celestial/contextMenu/TodoContextMenu";
import DayCellDecor from "@/assets/celestial/DayCellDecor";
import { useT } from "@/i18n/useT";
import useAnniversaryStore from "@/store/useAnniversaryStore";
import { anniversariesOn } from "@/lib/anniversary";
import AnniversaryBadge from "@/components/calendar/celestial/anniversary/AnniversaryBadge";

const auraBreathe = keyframes`
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 1; }
`;

/* 기념일이 있는 날은 셀 안쪽이 은은하게 밝아지고 모서리에 금선이 걸린다 */
const AnniversaryAura = styled.span`
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    box-shadow: inset 0 0 20px ${(props) => props.theme.colors.primary}14;

    &::before,
    &::after {
        content: "";
        position: absolute;
        width: 9px;
        height: 9px;
        border-color: ${(props) => props.theme.colors.primary}AA;
        border-style: solid;
    }

    &::before {
        top: 0;
        left: 0;
        border-width: 1px 0 0 1px;
    }

    &::after {
        bottom: 0;
        right: 0;
        border-width: 0 1px 1px 0;
    }

    @media (prefers-reduced-motion: no-preference) {
        animation: ${auraBreathe} 5s ease-in-out infinite;
    }
`;

interface WeekRowProps {
    dates: Date[];
    todos: CalendarTodoType[];
    challengeTodos: CalendarTodoType[];
    categories: CategoryType[];
    todayStr: string;
    currentMonth: number;
    selectedDate?: Date;
    handleCreateTodo: (date: Date) => void;
    handleContextMenu: (e: React.MouseEvent, todo: CalendarTodoType) => void;
    handleContextMenuChallenge: (e: React.MouseEvent, challenge: CalendarTodoType) => void;
    handleQuickToggleChallenge: (challenge: CalendarTodoType) => void;
    onCellClick?: (date: Date) => void;
    setMoreModalDate: (date: Date | null) => void;
}

const MAX_VISIBLE_LEVELS = 2;

const WeekRow = ({
                     dates, todos, challengeTodos, categories, todayStr, currentMonth,
                     handleCreateTodo, handleContextMenu, handleContextMenuChallenge, handleQuickToggleChallenge,
                     selectedDate, onCellClick, setMoreModalDate
                 }: WeekRowProps) => {

    const weekTodos = React.useMemo(() => {
        return todos.filter((todo: CalendarTodoType) => {
            if (!todo.startAt || !todo.endAt) return false;
            const start = new Date(todo.startAt as string | number | Date);
            const end = new Date(todo.endAt as string | number | Date);
            const weekStart = dates[0];
            const weekEnd = dates[6];
            return start <= weekEnd && end >= weekStart;
        });
    }, [todos, dates]);

    const { todoLevels, maxLevel } = useTodoLevels(weekTodos, dates);

    const anniversaries = useAnniversaryStore(s => s.anniversaries);

    const dayTiers = React.useMemo(() => dates.map((date) => {
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

                const dayTodos = weekTodos.filter((todo: CalendarTodoType) => {
                    if (!todo.startAt || !todo.endAt) return false;
                    return isBetween(date, todo.startAt, todo.endAt);
                });

                const hiddenCount = dayTodos.filter((t: CalendarTodoType) => todoLevels[t.id] >= MAX_VISIBLE_LEVELS).length;

                const tier = dayTiers[idx];
                const connectLeft = tier > 0 && idx > 0 && dayTiers[idx - 1] === tier;
                const connectRight = tier > 0 && idx < dates.length - 1 && dayTiers[idx + 1] === tier;

                const dayChallenges = challengeTodos.filter(c =>
                    isSameDay(date, new Date(c.startAt as string | number | Date))
                );

                const dayAnniversaries = anniversariesOn(anniversaries, date);

                return (
                    <S.DayCell
                        key={idx}
                        $isToday={isToday}
                        $isCurrentMonth={isCurrentMonth}
                        $isSelected={isSelected}
                        onClick={() => onCellClick?.(date)}
                    >
                        <DayCellDecor tier={tier} connectLeft={connectLeft} connectRight={connectRight} />

                        <div className="day-header">
                            <S.DayHeaderLeft>
                                <span className="day-number">{date.getDate()}</span>
                                <S.AddTodoButton className="add-btn" onClick={(e) => { e.stopPropagation(); handleCreateTodo(date); }}>
                                    <Plus size={16} strokeWidth={2.5} />
                                </S.AddTodoButton>
                            </S.DayHeaderLeft>

                            {dayChallenges.length > 0 && (() => {
                                const doneCount = dayChallenges.filter(c => c.isDone).length;
                                const ratio = doneCount / dayChallenges.length;
                                return (
                                    <S.ChallengeGauge
                                        $complete={ratio >= 1}
                                        title={`${doneCount} / ${dayChallenges.length}`}
                                        onClick={(e) => { e.stopPropagation(); setMoreModalDate(date); }}
                                    >
                                        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="track" cx="10" cy="10" r="7" />
                                            <circle
                                                className="arc"
                                                cx="10"
                                                cy="10"
                                                r="7"
                                                strokeDasharray={`${ratio * 44} 44`}
                                            />
                                            {[0, 90, 180, 270].map(deg => (
                                                <line
                                                    key={deg}
                                                    className="tick"
                                                    x1="10"
                                                    y1="0.6"
                                                    x2="10"
                                                    y2="2.2"
                                                    transform={`rotate(${deg} 10 10)`}
                                                />
                                            ))}
                                            <path className="pip" d="M10 6.9 L13.1 10 L10 13.1 L6.9 10 Z" />
                                        </svg>
                                    </S.ChallengeGauge>
                                );
                            })()}
                        </div>

                        {dayAnniversaries.length > 0 && (
                            <>
                                <AnniversaryAura aria-hidden="true" />
                                <AnniversaryBadge items={dayAnniversaries} />
                            </>
                        )}

                        <S.TodoBarList>
                            {Array.from({ length: Math.min(maxLevel, MAX_VISIBLE_LEVELS) }).map((_, levelIndex) => {
                                const todoAtThisLevel = dayTodos.find((t: CalendarTodoType) => todoLevels[t.id] === levelIndex);

                                if (todoAtThisLevel && todoAtThisLevel.startAt && todoAtThisLevel.endAt) {
                                    const isStart = isSameDay(date, new Date(todoAtThisLevel.startAt as string | number | Date));
                                    const isEnd = isSameDay(date, new Date(todoAtThisLevel.endAt as string | number | Date));
                                    const color = categories.find((c: CategoryType) => c.id === todoAtThisLevel.categoryId)?.color;

                                    const isDone = !!todoAtThisLevel.isDone;

                                    return (
                                        <S.TodoBarItem key={todoAtThisLevel.id}
                                                       $isStart={isStart}
                                                       $isEnd={isEnd}
                                                       $color={color}
                                                       $isDone={isDone}
                                                       onClick={(e) => e.stopPropagation()}
                                                       onContextMenu={(e) => {
                                                           e.stopPropagation();
                                                           handleContextMenu(e, todoAtThisLevel);
                                                       }}>
                                            {(isStart || idx === 0) && <span className="todo-title">{todoAtThisLevel.title}</span>}
                                        </S.TodoBarItem>
                                    );
                                }
                                return <S.TodoBarSpacer key={`spacer-${levelIndex}`} />;
                            })}

                            {hiddenCount > 0 && (
                                <S.MoreButton onClick={(e) => { e.stopPropagation(); setMoreModalDate(date); }}>
                                    +{hiddenCount} 더보기
                                </S.MoreButton>
                            )}
                        </S.TodoBarList>
                    </S.DayCell>
                )
            })}
        </S.WeekRowContainer>
    );
};

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 }),
};

type CelestialMonthProps = MonthThemeProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'>;

const CelestialMonthCalendar = React.forwardRef<HTMLDivElement, CelestialMonthProps>(
    ({
         asChild, currentDate, direction, selectedCategoryIds,
         isModalOpen, modalTodo, selectedDateForModal, contextMenu,
         moreModalDate, weeks, expandedTodos, challengeTodos, todayStr, dateRangeText,
         categories, selectedDate, onDateChange,
         handlePrevMonth, handleNextMonth, toggleCategory, handleContextMenu,
         handleQuickEdit, handleQuickDelete, handleQuickDeleteOne, handleQuickToggle, handleCreateTodo,
         handleContextMenuChallenge, handleQuickToggleChallenge,
         setIsModalOpen, setMoreModalDate, setContextMenu, showProjects, onToggleProjects,
         showChallenges, onToggleChallenges,
         ...props
     }, ref) => {
        const Component = asChild ? Slot : 'div';
        const t = useT();

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>
                <S.DateRangeDisplay>
                    <button className="nav-btn" onClick={handlePrevMonth}><ChevronLeft size={24} /></button>
                    <AnimatedDateText text={dateRangeText} direction={direction} />
                    <button className="nav-btn" onClick={handleNextMonth}><ChevronRight size={24} /></button>
                    <hr/>
                    <CategoryFilter
                        categories={categories}
                        selectedCategoryIds={selectedCategoryIds}
                        showProjects={showProjects}
                        onToggleProjects={onToggleProjects}
                        showChallenges={showChallenges}
                        onToggleChallenges={onToggleChallenges}
                        onToggle={toggleCategory}
                    />
                </S.DateRangeDisplay>

                <S.SliderWrapper>
                    <S.CalendarWindow>
                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            <motion.div
                                key={currentDate.toISOString()}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                <S.Header>
                                    {t.calendar.days.map((d) => (
                                        <S.DayNameBox key={d}>
                                            <div className="day-name">{d}</div>
                                        </S.DayNameBox>
                                    ))}
                                </S.Header>

                                <S.GridContainer>
                                    {weeks.map((weekDates, idx) => (
                                        <WeekRow
                                            key={idx}
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
                                            onCellClick={onDateChange}
                                            setMoreModalDate={setMoreModalDate}
                                        />
                                    ))}
                                </S.GridContainer>
                            </motion.div>
                        </AnimatePresence>
                    </S.CalendarWindow>
                </S.SliderWrapper>

                <MoreModal
                    isOpen={moreModalDate !== null}
                    onClose={() => setMoreModalDate(null)}
                    date={moreModalDate}
                    todos={expandedTodos}
                    categories={categories}
                    handleContextMenu={handleContextMenu}
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

CelestialMonthCalendar.displayName = "CelestialMonthCalendar";

export default CelestialMonthCalendar;