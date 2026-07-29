"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from 'lucide-react';

import { WeekThemeProps } from "../WeekCalendar";
import { isSameDay, isBetween } from "@/utils/DateUtils";
import Arrow from "@/assets/celestial/Arrow";
import * as S from "./CelestialWeekCalendar.styles";
import CategoryFilter from "@/components/calendar/celestial/categoryFilter/CategoryFilter";
import AnimatedDateText from "@/components/calendar/celestial/animatedDateText/AnimatedDateText";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import MoreModal from "@/components/modal/moreModal/MoreModal";
import TodoContextMenu from "@/components/calendar/celestial/contextMenu/TodoContextMenu";
import { TodoType } from "@/store/useTodoStore";
import { useT } from "@/i18n/useT";

import DayCellDecor from "@/assets/celestial/DayCellDecor";
import CalendarAmbience from "@/assets/celestial/CalendarAmbience";

const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 }),
};

const MAX_VISIBLE_LEVELS = 3;

const isItemDone = (todo: TodoType & { isDone?: boolean; check?: string; status?: string }) => {
    if (todo.isDone) return true;
    return todo.check === 'done' || todo.status === 'done';
};

const tierFor = (done: number, total: number) => {
    if (total === 0 || done === 0) return 0;
    if (done >= total) return 3;
    return done / total >= 0.5 ? 2 : 1;
};

type CelestialWeekProps = WeekThemeProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'>;

const CelestialWeekCalendar = React.forwardRef<HTMLDivElement, CelestialWeekProps>(
    ({
         asChild, currentDate, direction, selectedCategoryIds,
         isModalOpen, modalTodo, selectedDateForModal, todoContextMenu,
         moreModalDate, weekDates, expandedTodos, challengeTodos, todayStr, dateRangeText,
         todoLevels, maxLevel, categories, selectedDate, onDateChange,
         handlePrevWeek, handleNextWeek, toggleCategory, handleContextMenu,
         handleQuickEdit, handleQuickDelete, handleQuickToggle, handleCreateTodo,
         setIsModalOpen, setMoreModalDate, setTodoContextMenu,
         showProjects, onToggleProjects,
         showChallenges, onToggleChallenges,
         ...props
     }, ref) => {
        const Component = asChild ? Slot : 'div';
        const theme = useTheme();
        const t = useT();

        const dayTiers = React.useMemo(() => {
            return weekDates.map(date => {
                const dayTodos = expandedTodos.filter(todo =>
                    !todo.isProject && isBetween(date, todo.startAt!, todo.endAt!)
                );
                const dayChallenges = challengeTodos.filter(c => isSameDay(new Date(c.startAt), date));

                const total = dayTodos.length + dayChallenges.length;
                const done = dayTodos.filter(isItemDone).length + dayChallenges.filter(c => c.isDone).length;

                return tierFor(done, total);
            });
        }, [weekDates, expandedTodos, challengeTodos]);

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>
                <S.SliderWrapper>
                    <S.DateRangeDisplay>
                        <S.ArrowWrapper $side="left" onClick={handlePrevWeek}>
                            <Arrow width={80} height={30} isRight={false} stroke={theme.colors.primary}/>
                        </S.ArrowWrapper>
                        <AnimatedDateText text={dateRangeText} direction={direction} />
                        <hr/>
                        <CategoryFilter
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            onToggle={toggleCategory}
                            showProjects={showProjects}
                            onToggleProjects={onToggleProjects}
                            showChallenges={showChallenges}
                            onToggleChallenges={onToggleChallenges}
                        />
                        <S.ArrowWrapper $side="right" onClick={handleNextWeek}>
                            <Arrow width={80} height={30} isRight={true} stroke={theme.colors.primary}/>
                        </S.ArrowWrapper>
                    </S.DateRangeDisplay>

                    <S.CalendarRow>
                    <S.CalendarWindow>
                        <CalendarAmbience />
                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            <motion.div
                                key={weekDates[0].toISOString()}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}
                            >
                                <S.Header>
                                    {t.calendar.days.map((d, i) => {
                                        const isToday = weekDates[i].toDateString() === todayStr;
                                        return (
                                            <S.DayNameBox key={d} $isToday={isToday}>
                                                <div className="day-name">{d}</div>
                                                {dayTiers[i] >= 2 && (
                                                    <span className={dayTiers[i] === 3 ? "day-mark done" : "day-mark"} />
                                                )}
                                            </S.DayNameBox>
                                        )
                                    })}
                                </S.Header>

                                <S.BarContainer>
                                    {weekDates.map((date, idx) => {
                                        const isToday = date.toDateString() === todayStr;
                                        const regularTodos = expandedTodos.filter(todo => isBetween(date, todo.startAt!, todo.endAt!));
                                        const hiddenCount = regularTodos.filter(t => todoLevels[t.id] >= MAX_VISIBLE_LEVELS).length;

                                        return (
                                            <S.DaySlot key={idx} $isToday={isToday} onClick={() => onDateChange && onDateChange(date)}>
                                                <S.AddTodoButton className="add-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCreateTodo(date);
                                                }}>
                                                    <Plus size={16} strokeWidth={3} />
                                                </S.AddTodoButton>

                                                <S.TodoBarList>
                                                    {Array.from({ length: Math.min(maxLevel, MAX_VISIBLE_LEVELS) }).map((_, levelIndex) => {
                                                        const todoAtThisLevel = regularTodos.find(t => todoLevels[t.id] === levelIndex);

                                                        if (todoAtThisLevel && todoAtThisLevel.startAt && todoAtThisLevel.endAt) {
                                                            const isStart = isSameDay(date, new Date(todoAtThisLevel.startAt as string | number | Date));
                                                            const isEnd = isSameDay(date, new Date(todoAtThisLevel.endAt as string | number | Date));
                                                            const color = categories.find(c => c.id === todoAtThisLevel.categoryId)?.color;

                                                            const original = todoAtThisLevel.originalTodo as (TodoType & { check?: string, status?: string });
                                                            const isActuallyDone = original?.check === 'done' || original?.status === 'done';

                                                            return (
                                                                <S.TodoBarItem key={todoAtThisLevel.id}
                                                                               $isStart={isStart}
                                                                               $isEnd={isEnd}
                                                                               $color={color}
                                                                               $isDone={isActuallyDone}
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
                                                        <S.MoreButton onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMoreModalDate(date);
                                                        }}>
                                                            +{hiddenCount} 더보기
                                                        </S.MoreButton>
                                                    )}
                                                </S.TodoBarList>
                                                <DayCellDecor tier={dayTiers[idx]} />

                                                {isToday && <S.TodayIndicator />}
                                            </S.DaySlot>
                                        );
                                    })}
                                </S.BarContainer>
                            </motion.div>
                        </AnimatePresence>
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
                    onEdit={handleQuickEdit}
                    onDelete={handleQuickDelete}
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

CelestialWeekCalendar.displayName = "CelestialWeekCalendar";

export default CelestialWeekCalendar;