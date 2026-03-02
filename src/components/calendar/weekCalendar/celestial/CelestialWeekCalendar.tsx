"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { motion, AnimatePresence } from "framer-motion";

import { WeekProps, TodoType } from "../WeekCalendar";
import Arrow from "@/assets/celestial/Arrow";
import { formatDate, isSameDay, isBetween, getWeekDates } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import * as S from "./CelestialWeekCalendar.styles";

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

const textVariants = {
    enter: (direction: number) => ({
        y: direction > 0 ? 20 : -20,
        opacity: 0,
    }),
    center: {
        y: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        y: direction > 0 ? -20 : 20,
        opacity: 0,
    }),
};

const CelestialWeekCalendar = React.forwardRef<HTMLDivElement, WeekProps>(
    ({ asChild, todos = [], categories = [], ...props }, ref) => {
        const Component = asChild ? Slot : 'div';
        const theme = useTheme();

        const [currentDate, setCurrentDate] = React.useState(new Date());
        const [direction, setDirection] = React.useState(0);
        const weekDates = React.useMemo(() => getWeekDates(currentDate), [currentDate]);
        const todayStr = React.useMemo(() => new Date().toDateString(), []);

        const { todoLevels, maxLevel } = useTodoLevels(todos, weekDates);

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

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>

                <S.DateRangeDisplay>
                    <div style={{ display: 'flex', alignItems: 'center', height: '1.5em', overflow: 'hidden' }}>
                        {dateRangeText.split('').map((char, index) => (
                            <span key={index} style={{position: 'relative', display: 'inline-flex', justifyContent: 'center', width: char === ' ' || char === '.' || char === '-' ? 'auto' : '0.65em'}}>
                                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                    <motion.span key={char} custom={direction} variants={textVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }} style={{ whiteSpace: 'pre' }}>
                                        {char}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                        ))}
                    </div>
                    <hr/>
                </S.DateRangeDisplay>

                <S.SliderWrapper>
                    <div onClick={handlePrevWeek} style={{ cursor: 'pointer', display: 'flex', marginTop: '10px' }}>
                        <Arrow width={80} height={30} isRight={false} stroke={theme.colors.primary}/>
                    </div>

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
                                        const dayTodos = (todos as TodoType[]).filter(todo => isBetween(date, todo.startAt, todo.endAt));

                                        return (
                                            <S.DaySlot key={idx} $isToday={isToday}>
                                                <S.TodoBarList>
                                                    {Array.from({ length: maxLevel }).map((_, levelIndex) => {
                                                        const todoAtThisLevel = dayTodos.find(t => todoLevels[t.id] === levelIndex);

                                                        if (todoAtThisLevel) {
                                                            const isStart = isSameDay(date, new Date(todoAtThisLevel.startAt!));
                                                            const isEnd = isSameDay(date, new Date(todoAtThisLevel.endAt!));
                                                            const color = categories.find(c => c.id === todoAtThisLevel.categoryId)?.color;

                                                            return (
                                                                <S.TodoBarItem key={todoAtThisLevel.id} $isStart={isStart} $isEnd={isEnd} $color={color}>
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

                    <div onClick={handleNextWeek} style={{ cursor: 'pointer', display: 'flex', marginTop: '10px' }}>
                        <Arrow width={80} height={30} isRight={true} stroke={theme.colors.primary}/>
                    </div>
                </S.SliderWrapper>
            </S.CelestialCalendarWrapper>
        );
    }
);

CelestialWeekCalendar.displayName = "CelestialWeekCalendar";

export default CelestialWeekCalendar;
