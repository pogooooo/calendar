"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Slot } from "@radix-ui/react-slot";

import { WeekProps, TodoType } from "../WeekCalendar";
import Arrow from "@/assets/celestial/Arrow";
import Twinkle from "@/assets/celestial/Twinkle";
import { formatDate, isSameDay, isBetween, getWeekDates } from "@/utils/DateUtils";
import { useTodoLevels } from "@/hooks/useTodoLevels";
import * as S from "./CelestialWeekCalendar.styles";

const CelestialWeekCalendar = React.forwardRef<HTMLDivElement, WeekProps>(
    ({ asChild, todos = [], categories = [], ...props }, ref) => {
        const Component = asChild ? Slot : 'div';
        const theme = useTheme();

        const weekDates = React.useMemo(() => getWeekDates(), []);
        const todayStr = new Date().toDateString();

        const { todoLevels, maxLevel } = useTodoLevels(todos, weekDates);

        const dateRangeText = React.useMemo(() => {
            return `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`;
        }, [weekDates]);

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>

                <S.DateRangeDisplay>
                    {dateRangeText} <hr/>
                </S.DateRangeDisplay>

                <S.HeaderWrapper>
                    <Arrow width={80} height={30} isRight={false} stroke={theme.colors.primary}/>
                    <S.Header>
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                            <S.DayNameBox key={d}>
                                <div className="day-name">{d}</div>
                                {i < 6 && (
                                    <S.TwinklePositioner>
                                        <Twinkle width={15} height={50} stroke={theme.colors.primary}/>
                                    </S.TwinklePositioner>
                                )}
                            </S.DayNameBox>
                        ))}
                    </S.Header>
                    <Arrow width={80} height={30} isRight={true} stroke={theme.colors.primary}/>
                </S.HeaderWrapper>

                <S.BarContainer>
                    {weekDates.map((date, idx) => {
                        const isToday = date.toDateString() === todayStr;

                        const dayTodos = (todos as TodoType[]).filter(todo => {
                            return isBetween(date, todo.startAt, todo.endAt);
                        });

                        return (
                            <S.DaySlot key={idx} $isToday={isToday}>
                                <S.TodoBarList>
                                    {Array.from({ length: maxLevel }).map((_, levelIndex) => {
                                        const todoAtThisLevel = dayTodos.find(t => todoLevels[t.id] === levelIndex);

                                        if (todoAtThisLevel) {
                                            const start = new Date(todoAtThisLevel.startAt!);
                                            const end = new Date(todoAtThisLevel.endAt!);
                                            const isStart = isSameDay(date, start);
                                            const isEnd = isSameDay(date, end);
                                            const color = categories.find(c => c.id === todoAtThisLevel.categoryId)?.color;

                                            return (
                                                <S.TodoBarItem
                                                    key={todoAtThisLevel.id}
                                                    $isStart={isStart}
                                                    $isEnd={isEnd}
                                                    $color={color}
                                                >
                                                    {(isStart || idx === 0) && (
                                                        <span className="todo-title">{todoAtThisLevel.title}</span>
                                                    )}
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
            </S.CelestialCalendarWrapper>
        );
    }
);

CelestialWeekCalendar.displayName = "CelestialWeekCalendar";

export default CelestialWeekCalendar;