"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { motion, AnimatePresence } from "framer-motion";

import { WeekProps } from "../WeekCalendar";
import { TodoType } from "@/types/calendar";
import Arrow from "@/assets/celestial/Arrow";
import { formatDate, isSameDay, isBetween, getWeekDates } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import * as S from "./CelestialWeekCalendar.styles";
import CategoryFilter from "../../categoryFilter/CategoryFilter";
import AnimatedDateText from "@/components/calendar/animatedDateText/AnimatedDateText";

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

const CelestialWeekCalendar = React.forwardRef<HTMLDivElement, WeekProps>(
    ({ asChild, todos = [], categories = [], ...props }, ref) => {
        const Component = asChild ? Slot : 'div';
        const theme = useTheme();

        const [currentDate, setCurrentDate] = React.useState(new Date());
        const [direction, setDirection] = React.useState(0);
        const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

        const weekDates = React.useMemo(() => getWeekDates(currentDate), [currentDate]);
        const todayStr = React.useMemo(() => new Date().toDateString(), []);

        React.useEffect(() => {
            if (categories.length > 0 && selectedCategoryIds.length === 0) {
                setSelectedCategoryIds(categories.map(c => c.id));
            }
        }, [categories]);

        const filteredTodos = React.useMemo(() => {
            return (todos as TodoType[]).filter(todo => selectedCategoryIds.includes(todo.categoryId));
        }, [todos, selectedCategoryIds]);

        const { todoLevels, maxLevel } = useTodoLevels(filteredTodos, weekDates);

        const dateRangeText = React.useMemo(() => {
            return `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`;
        }, [weekDates]);

        const handlePrevWeek = () => {
            setDirection(-1);
            setCurrentDate(prev => {
                const newDate = new Date(prev);
                newDate.setDate(prev.getDate() - 7);
                return newDate;
            });
        };

        const handleNextWeek = () => {
            setDirection(1);
            setCurrentDate(prev => {
                const newDate = new Date(prev);
                newDate.setDate(prev.getDate() + 7);
                return newDate;
            });
        };

        const toggleCategory = (categoryId: string) => {
            setSelectedCategoryIds(prev =>
                prev.includes(categoryId)
                    ? prev.filter(id => id !== categoryId)
                    : [...prev, categoryId]
            );
        };

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>

                <S.DateRangeDisplay>
                    <AnimatedDateText text={dateRangeText} direction={direction} />

                    <hr/>

                    <CategoryFilter
                        categories={categories}
                        selectedCategoryIds={selectedCategoryIds}
                        onToggle={toggleCategory}
                    />
                </S.DateRangeDisplay>

                <S.SliderWrapper>
                    <S.ArrowWrapper onClick={handlePrevWeek}>
                        <Arrow width={80} height={30} isRight={false} stroke={theme.colors.primary}/>
                    </S.ArrowWrapper>

                    <S.CalendarWindow>
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
                            >
                                <S.Header>
                                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => {
                                        const isToday = weekDates[i].toDateString() === todayStr;
                                        return (
                                            <S.DayNameBox key={d} $isToday={isToday}>
                                                <div className="day-name">{d}</div>
                                            </S.DayNameBox>
                                        )
                                    })}
                                </S.Header>

                                <S.BarContainer>
                                    {weekDates.map((date, idx) => {
                                        const isToday = date.toDateString() === todayStr;
                                        const dayTodos = filteredTodos.filter(todo => isBetween(date, todo.startAt, todo.endAt));

                                        return (
                                            <S.DaySlot key={idx} $isToday={isToday}>
                                                <S.TodoBarList>
                                                    {Array.from({ length: maxLevel }).map((_, levelIndex) => {
                                                            const todoAtThisLevel = dayTodos.find(t => todoLevels[t.id] === levelIndex);

                                                            if (todoAtThisLevel) {
                                                                const isStart = isSameDay(date, new Date(todoAtThisLevel.startAt!));
                                                                const isEnd = isSameDay(date, new Date(todoAtThisLevel.endAt!));
                                                                const color = categories.find(c => c.id === todoAtThisLevel.categoryId)?.color;
                                                                const isDone = todoAtThisLevel.check === "done";

                                                                return (
                                                                    <S.TodoBarItem key={todoAtThisLevel.id}
                                                                                   $isStart={isStart}
                                                                                   $isEnd={isEnd}
                                                                                   $color={color}
                                                                                   $isDone={isDone}>
                                                                        {(isStart || idx === 0) && <span className="todo-title">{todoAtThisLevel.title}</span>}
                                                                    </S.TodoBarItem>
                                                                );
                                                            }
                                                            return <S.TodoBarSpacer key={`spacer-${levelIndex}`} />;
                                                        })}
                                                </S.TodoBarList>
                                                {isToday && <S.TodayIndicator />}
                                            </S.DaySlot>
                                        );
                                    })}
                                </S.BarContainer>
                            </motion.div>
                        </AnimatePresence>
                    </S.CalendarWindow>

                    <S.ArrowWrapper onClick={handleNextWeek}>
                        <Arrow width={80} height={30} isRight={true} stroke={theme.colors.primary}/>
                    </S.ArrowWrapper>
                </S.SliderWrapper>
            </S.CelestialCalendarWrapper>
        );
    }
);

CelestialWeekCalendar.displayName = "CelestialWeekCalendar";

export default CelestialWeekCalendar;