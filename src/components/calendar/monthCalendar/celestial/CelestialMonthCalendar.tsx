"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

import { MonthProps } from "../MonthCalendar";
import { TodoType } from "@/store/todo/useTodoStore";
import { isSameDay, isBetween } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import * as S from "./CelestialMonthCalendar.styles";
import CategoryFilter from "../../categoryFilter/CategoryFilter";
import AnimatedDateText from "@/components/calendar/animatedDateText/AnimatedDateText";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import TodoContextMenu from "../../contextMenu/TodoContextMenu";
import useTodoStore from "@/store/todo/useTodoStore";
import useAuthStore from "@/store/auth/useAuthStore";

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

const WeekRow = ({ dates, todos, categories, todayStr, currentMonth, handleCreateTodo, handleContextMenu }: any) => {
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
                const dayTodos = weekTodos.filter((todo: TodoType) => {
                    if (!todo.startAt || !todo.endAt) return false;
                    return isBetween(date, todo.startAt, todo.endAt);
                });

                return (
                    <S.DayCell key={idx} $isToday={isToday} $isCurrentMonth={isCurrentMonth}>
                        <div className="day-header">
                            <span className="day-number">{date.getDate()}</span>
                            <S.AddTodoButton className="add-btn" onClick={() => handleCreateTodo(date)}>
                                <Plus size={16} strokeWidth={2.5} />
                            </S.AddTodoButton>
                        </div>
                        <S.TodoBarList>
                            {Array.from({ length: maxLevel }).map((_, levelIndex) => {
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
                                                       onContextMenu={(e) => handleContextMenu(e, todoAtThisLevel)}>
                                            {(isStart || idx === 0) && <span className="todo-title">{todoAtThisLevel.title}</span>}
                                        </S.TodoBarItem>
                                    );
                                }
                                return <S.TodoBarSpacer key={`spacer-${levelIndex}`} />;
                            })}
                        </S.TodoBarList>
                    </S.DayCell>
                )
            })}
        </S.WeekRowContainer>
    );
};

const CelestialMonthCalendar = React.forwardRef<HTMLDivElement, MonthProps>(
    ({ asChild, todos = [], categories = [], ...props }, ref) => {
        const Component = asChild ? Slot : 'div';
        const theme = useTheme();

        const [currentDate, setCurrentDate] = React.useState(new Date());
        const [direction, setDirection] = React.useState(0);
        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [selectedDateForModal, setSelectedDateForModal] = React.useState<Date | undefined>(undefined);

        const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, todo: TodoType } | null>(null);
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
            setContextMenu({ x: e.clientX, y: e.clientY, todo });
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
                                            todos={filteredTodos}
                                            categories={categories}
                                            todayStr={todayStr}
                                            currentMonth={currentDate.getMonth()}
                                            handleCreateTodo={handleCreateTodo}
                                            handleContextMenu={handleContextMenu}
                                        />
                                    ))}
                                </S.GridContainer>
                            </motion.div>
                        </AnimatePresence>
                    </S.CalendarWindow>
                </S.SliderWrapper>

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