"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { MonthProps } from "../MonthCalendar";
import { TodoType } from "@/store/useTodoStore";
import { isSameDay, isBetween } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import * as S from "./CelestialMonthCalendar.styles";
import CategoryFilter from "../../categoryFilter/CategoryFilter";
import AnimatedDateText from "@/components/calendar/animatedDateText/AnimatedDateText";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import MoreModal from "@/components/modal/moreModal/MoreModal";
import TodoContextMenu from "../../contextMenu/TodoContextMenu";
import useTodoStore from "@/store/useTodoStore";
import useAuthStore from "@/store/useAuthStore";

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 100 : -100,
        opacity: 0,
    }),
};

const MAX_VISIBLE_LEVELS = 2;

const WeekRow = ({ dates, todos, categories, todayStr, currentMonth, handleCreateTodo, handleContextMenu, selectedDate, onCellClick, setMoreModalDate }: any) => {
    const weekTodos = React.useMemo(() => {
        return todos.filter((todo: TodoType) => {
            if (!todo.startAt || !todo.endAt) return false;

            const start = new Date(todo.startAt as string | number | Date);
            const end = new Date(todo.endAt as string | number | Date);
            const weekStart = dates[0];
            const weekEnd = dates[6];
            return start <= weekEnd && end >= weekStart;
        });
    }, [todos, dates]);

    const { todoLevels, maxLevel } = useTodoLevels(weekTodos, dates);

    return (
        <S.WeekRowContainer>
            {dates.map((date: Date, idx: number) => {
                const isToday = date.toDateString() === todayStr;
                const isCurrentMonth = date.getMonth() === currentMonth;
                const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;

                const dayTodos = weekTodos.filter((todo: TodoType) => {
                    if (!todo.startAt || !todo.endAt) return false;
                    return isBetween(date, todo.startAt, todo.endAt);
                });

                const hiddenCount = dayTodos.filter((t: { id: string | number; }) => todoLevels[t.id] >= MAX_VISIBLE_LEVELS).length;

                return (
                    <S.DayCell
                        key={idx}
                        $isToday={isToday}
                        $isCurrentMonth={isCurrentMonth}
                        $isSelected={isSelected}
                        onClick={() => onCellClick?.(date)}
                    >
                        <div className="day-header">
                            <span className="day-number">{date.getDate()}</span>
                            <S.AddTodoButton
                                className="add-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateTodo(date);
                                }}
                            >
                                <Plus size={16} strokeWidth={2.5} />
                            </S.AddTodoButton>
                        </div>
                        <S.TodoBarList>
                            {Array.from({ length: Math.min(maxLevel, MAX_VISIBLE_LEVELS) }).map((_, levelIndex) => {
                                const todoAtThisLevel = dayTodos.find((t: TodoType) => todoLevels[t.id] === levelIndex);

                                if (todoAtThisLevel && todoAtThisLevel.startAt && todoAtThisLevel.endAt) {
                                    const isStart = isSameDay(date, new Date(todoAtThisLevel.startAt as string | number | Date));
                                    const isEnd = isSameDay(date, new Date(todoAtThisLevel.endAt as string | number | Date));
                                    const color = categories.find((c: any) => c.id === todoAtThisLevel.categoryId)?.color;
                                    const isDone = todoAtThisLevel.check === "done";

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
                                <S.MoreButton onClick={(e) => {
                                    e.stopPropagation();
                                    setMoreModalDate(date);
                                }}>
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

const CelestialMonthCalendar = React.forwardRef<HTMLDivElement, MonthProps>(
    ({ asChild, todos = [], categories = [], selectedDate, onDateChange, ...props }, ref) => {
        const Component = asChild ? Slot : 'div';
        const theme = useTheme();

        const [currentDate, setCurrentDate] = React.useState(new Date());
        const [direction, setDirection] = React.useState(0);
        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [selectedDateForModal, setSelectedDateForModal] = React.useState<Date | undefined>(undefined);

        const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, todo: TodoType } | null>(null);
        const [moreModalDate, setMoreModalDate] = React.useState<Date | null>(null);
        const { deleteTodo, toggleTodo } = useTodoStore();
        const accessToken = useAuthStore((state) => state.accessToken);

        const authFetch = React.useCallback(async (url: string, init?: RequestInit) => {
            return fetch(url, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` } });
        }, [accessToken]);

        React.useEffect(() => {
            if (categories.length > 0 && selectedCategoryIds.length === 0) {
                setSelectedCategoryIds(categories.map(c => c.id));
            }
        }, [categories]);

        const filteredTodos = React.useMemo(() => {
            return (todos as TodoType[]).filter(todo => selectedCategoryIds.includes(todo.categoryId));
        }, [todos, selectedCategoryIds]);

        const weeks = React.useMemo(() => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const startDay = firstDay.getDay();
            const startDate = new Date(year, month, 1 - startDay);

            const allDates = [];
            for (let i = 0; i < 42; i++) {
                allDates.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));
            }

            const chunked = [];
            for (let i = 0; i < 42; i += 7) {
                chunked.push(allDates.slice(i, i + 7));
            }
            return chunked;
        }, [currentDate]);

        const expandedTodos = React.useMemo(() => {
            if (!weeks || weeks.length === 0) return filteredTodos;

            const expanded: TodoType[] = [];

            const monthStart = new Date(weeks[0][0]);
            monthStart.setHours(0, 0, 0, 0);
            const monthEnd = new Date(weeks[5][6]);
            monthEnd.setHours(23, 59, 59, 999);

            filteredTodos.forEach(todo => {
                if (!todo.startAt || !todo.endAt) return;

                if (!todo.repeat || todo.repeat <= 0) {
                    expanded.push(todo);
                    return;
                }

                const R = todo.repeat;
                let currentStart = new Date(todo.startAt);
                let currentEnd = new Date(todo.endAt);

                const startDayOnly = new Date(currentStart);
                startDayOnly.setHours(0, 0, 0, 0);
                const endDayOnly = new Date(currentEnd);
                endDayOnly.setHours(0, 0, 0, 0);

                const daysBetween = Math.round((endDayOnly.getTime() - startDayOnly.getTime()) / (1000 * 60 * 60 * 24));
                const intervalDays = daysBetween + R;
                const repeatIntervalMs = intervalDays * 24 * 60 * 60 * 1000;

                if (currentEnd.getTime() < monthStart.getTime()) {
                    const msBefore = monthStart.getTime() - currentEnd.getTime();
                    const intervalsToSkip = Math.floor(msBefore / repeatIntervalMs);
                    if (intervalsToSkip > 0) {
                        currentStart.setDate(currentStart.getDate() + (intervalsToSkip * intervalDays));
                        currentEnd.setDate(currentEnd.getDate() + (intervalsToSkip * intervalDays));
                    }
                }

                let instanceCount = 0;
                while (currentStart.getTime() <= monthEnd.getTime()) {
                    if (currentEnd.getTime() >= monthStart.getTime()) {
                        expanded.push({
                            ...todo,
                            id: `${todo.id}-rep-${currentStart.getTime()}`,
                            startAt: currentStart.toISOString(),
                            endAt: currentEnd.toISOString(),
                            // @ts-ignore
                            originalTodo: todo
                        });
                    }

                    currentStart.setDate(currentStart.getDate() + intervalDays);
                    currentEnd.setDate(currentEnd.getDate() + intervalDays);

                    instanceCount++;
                    if (instanceCount > 1000) break;
                }
            });

            return expanded;
        }, [filteredTodos, weeks]);

        const todayStr = React.useMemo(() => new Date().toDateString(), []);

        const dateRangeText = React.useMemo(() => {
            return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
        }, [currentDate]);

        const handlePrevMonth = () => {
            setDirection(-1);
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        };

        const handleNextMonth = () => {
            setDirection(1);
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        };

        const toggleCategory = (categoryId: string) => {
            setSelectedCategoryIds(prev =>
                prev.includes(categoryId)
                    ? prev.filter(id => id !== categoryId)
                    : [...prev, categoryId]
            );
        };

        const handleContextMenu = (e: React.MouseEvent, todo: TodoType) => {
            e.preventDefault();
            // @ts-ignore
            const actualTodo = todo.originalTodo || todo;
            setContextMenu({ x: e.clientX, y: e.clientY, todo: actualTodo });
        };

        const handleQuickEdit = (todo: TodoType) => {
            setModalTodo(todo);
            setIsModalOpen(true);
            setContextMenu(null);
        };

        const handleQuickDelete = async (todo: TodoType) => {
            if (window.confirm("정말 삭제하시겠습니까?")) {
                await deleteTodo(authFetch, todo.id);
            }
            setContextMenu(null);
        };

        const handleQuickToggle = async (todo: TodoType) => {
            await toggleTodo(authFetch, todo.id);
            setContextMenu(null);
        };

        const handleCreateTodo = (date: Date) => {
            setModalTodo(null);
            setSelectedDateForModal(date);
            setIsModalOpen(true);
        };

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
                                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
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
                                            categories={categories}
                                            todayStr={todayStr}
                                            currentMonth={currentDate.getMonth()}
                                            handleCreateTodo={handleCreateTodo}
                                            handleContextMenu={handleContextMenu}
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
                />

                <TodoContextMenu
                    menuState={contextMenu}
                    onClose={() => setContextMenu(null)}
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

CelestialMonthCalendar.displayName = "CelestialMonthCalendar";

export default CelestialMonthCalendar;