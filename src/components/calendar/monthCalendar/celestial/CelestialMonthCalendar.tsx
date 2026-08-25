"use client";

import * as React from "react";
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
import AnniversaryCrown from "@/components/calendar/celestial/anniversary/AnniversaryCrown";


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

                const dayAnniversaries = anniversariesOn(anniversaries, date);

                return (
                    <S.DayCell
                        key={idx}
                        $isToday={isToday}
                        $isCurrentMonth={isCurrentMonth}
                        $isSelected={isSelected}
                        onClick={() => onCellClick?.(date)}
                    >
                        {isToday && (
                            <S.TodayDisc viewBox="0 0 60 60" aria-hidden="true">
                                <circle className="ring" cx="30" cy="30" r="26" />
                                <circle className="ring dash" cx="30" cy="30" r="19" />
                                <line className="tick" x1="30" y1="1.5" x2="30" y2="6" />
                                <line className="tick" x1="58.5" y1="30" x2="54" y2="30" />
                                <line className="tick" x1="30" y1="58.5" x2="30" y2="54" />
                                <line className="tick" x1="1.5" y1="30" x2="6" y2="30" />
                                <circle className="core" cx="30" cy="30" r="1.6" />
                            </S.TodayDisc>
                        )}

                        <DayCellDecor tier={tier} connectLeft={connectLeft} connectRight={connectRight} />

                        <div className="day-header">
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
                                className="add-btn"
                                onClick={(e) => { e.stopPropagation(); handleCreateTodo(date); }}
                            >
                                <Plus size={16} strokeWidth={2.5} />
                            </S.AddTodoButton>
                        </div>


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
                                    {`+${hiddenCount} 더보기`}
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