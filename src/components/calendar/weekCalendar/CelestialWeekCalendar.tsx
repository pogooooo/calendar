"use client";

import * as React from "react";
import styled, { useTheme } from "styled-components";
import { Slot } from "@radix-ui/react-slot";
import { WeekProps, TodoType } from "./WeekCalendar";
import Arrow from "@/assets/celestial/Arrow";
import Twinkle from "@/assets/celestial/Twinkle";

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const isBetween = (target: Date, startStr?: string | number | Date | null, endStr?: string | number | Date | null) => {
    if (!startStr || !endStr) return false;
    const t = new Date(target).setHours(0, 0, 0, 0);
    const s = new Date(startStr).setHours(0, 0, 0, 0);
    const e = new Date(endStr).setHours(0, 0, 0, 0);
    return t >= s && t <= e;
};

const getWeekDates = (baseDate: Date = new Date()) => {
    const day = baseDate.getDay();
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        return date;
    });
};

const CelestialWeekCalendar = React.forwardRef<HTMLDivElement, WeekProps>(
    ({ asChild, todos = [], categories = [], ...props }, ref) => {
        const Component = asChild ? Slot : 'div';
        const theme = useTheme();

        const weekDates = React.useMemo(() => getWeekDates(), []);
        const todayStr = new Date().toDateString();

        const { todoLevels, maxLevel } = React.useMemo(() => {
            const weekStart = weekDates[0].getTime();
            const weekEnd = weekDates[6].getTime() + 86399999;

            const currentWeekTodos = (todos as TodoType[]).filter(todo => {
                if (!todo.startAt || !todo.endAt) return false;
                const s = new Date(todo.startAt).getTime();
                const e = new Date(todo.endAt).getTime();
                return (s <= weekEnd && e >= weekStart);
            });

            const sortedTodos = [...currentWeekTodos].sort((a, b) =>
                new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime()
            );

            const levels: string[][] = [];
            const todoToLevelMap: Record<string, number> = {};

            sortedTodos.forEach(todo => {
                let assignedLevel = -1;
                const todoStart = new Date(todo.startAt!).setHours(0,0,0,0);

                for (let i = 0; i < levels.length; i++) {
                    const lastTodoIdInLevel = levels[i][levels[i].length - 1];
                    const lastTodo = currentWeekTodos.find(t => t.id === lastTodoIdInLevel);
                    const lastTodoEnd = new Date(lastTodo!.endAt!).setHours(0,0,0,0);

                    if (lastTodoEnd < todoStart) {
                        assignedLevel = i;
                        break;
                    }
                }

                if (assignedLevel === -1) {
                    assignedLevel = levels.length;
                    levels.push([todo.id]);
                } else {
                    levels[assignedLevel].push(todo.id);
                }
                todoToLevelMap[todo.id] = assignedLevel;
            });

            return { todoLevels: todoToLevelMap, maxLevel: levels.length };
        }, [todos, weekDates]);

        return (
            <CelestialCalendarWrapper as={Component} ref={ref} {...props}>

                <div>asd</div>

                <HeaderWrapper>
                    <Arrow width={80} height={30} isRight={false} stroke={theme.colors.primary}/>
                    <Header>
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                            <DayNameBox key={d}>
                                <div className="day-name">{d}</div>
                                {i < 6 && (
                                    <TwinklePositioner>
                                        <Twinkle width={15} height={50} stroke={theme.colors.primary}/>
                                    </TwinklePositioner>
                                )}
                            </DayNameBox>
                        ))}
                    </Header>
                    <Arrow width={80} height={30} isRight={true} stroke={theme.colors.primary}/>
                </HeaderWrapper>

                <BarContainer>
                    {weekDates.map((date, idx) => {
                        const isToday = date.toDateString() === todayStr;

                        const dayTodos = (todos as TodoType[]).filter(todo => {
                            return isBetween(date, todo.startAt, todo.endAt);
                        });

                        return (
                            <DaySlot key={idx} $isToday={isToday}>
                                <TodoBarList>
                                    {Array.from({ length: maxLevel }).map((_, levelIndex) => {
                                        const todoAtThisLevel = dayTodos.find(t => todoLevels[t.id] === levelIndex);

                                        if (todoAtThisLevel) {
                                            const start = new Date(todoAtThisLevel.startAt!);
                                            const end = new Date(todoAtThisLevel.endAt!);
                                            const isStart = isSameDay(date, start);
                                            const isEnd = isSameDay(date, end);
                                            const color = categories.find(c => c.id === todoAtThisLevel.categoryId)?.color;

                                            return (
                                                <TodoBarItem
                                                    key={todoAtThisLevel.id}
                                                    $isStart={isStart}
                                                    $isEnd={isEnd}
                                                    $color={color}
                                                >
                                                    {(isStart || idx === 0) && (
                                                        <span className="todo-title">{todoAtThisLevel.title}</span>
                                                    )}
                                                </TodoBarItem>
                                            );
                                        }

                                        return <TodoBarSpacer key={`spacer-${levelIndex}`} />;
                                    })}
                                </TodoBarList>
                                {isToday && <TodayIndicator />}
                            </DaySlot>
                        );
                    })}
                </BarContainer>
            </CelestialCalendarWrapper>
        );
    }
);

CelestialWeekCalendar.displayName = "CelestialWeekCalendar";

export default CelestialWeekCalendar;

const CelestialCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const HeaderWrapper = styled.div`
    display: flex;
    align-items: center;

    & > svg {
        &:hover {
            stroke: ${(props) => props.theme.colors.accent};
            filter: drop-shadow(0 0 5px ${(props) => props.theme.colors.primary});
            cursor: pointer;
        }
        
        margin: 0 5px;
        transition: all 0.2s ease;
    }
`;

const Header = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid ${(props) => props.theme.colors.primary};
    position: relative;
    width: 50vw;
    min-width: 600px;

    &::after{
        content: "";
        width: 25px;
        height: 25px;
        background: linear-gradient(315deg, transparent 49%, ${(props) => props.theme.colors.primary} 50%, transparent 51%);
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }
`;

const DayNameBox = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    position: relative;
    box-sizing: border-box;
    border-right: 1px solid ${(props) => props.theme.colors.surface};

    &:last-child {
        border-right: none;
    }

    .day-name {
        font-size: ${(props) => props.theme.fontSizes.h4};
    }
`;

const TwinklePositioner = styled.div`
    position: absolute;
    right: -8px;
    top: 0;
    display: flex;
    align-items: center;
    z-index: 2;
    pointer-events: none;
`;

const BarContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    width: 50vw;
    min-width: 600px;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-top: none;
`;

const DaySlot = styled.div<{ $isToday: boolean }>`
    display: flex;
    flex-direction: column;
    min-height: 120px;
    position: relative;
    box-sizing: border-box;
    border-right: 1px solid ${(props) => props.theme.colors.primary};

    &:last-child {
        border-right: none;
    }

`;

const TodoBarList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
    margin-top: 10px;
`;

const TodoBarItem = styled.div<{ $isStart: boolean, $isEnd: boolean, $color?: string }>`
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-left: ${(props) => props.$isStart ? '1px solid props.theme.colors.primary' : 'none'};
    border-right: ${(props) => props.$isEnd ? '1px solid props.theme.colors.primary' : 'none'};
    height: 25px;
    display: flex;
    align-items: center;
    font-size: 11px;
    
    margin-left: ${props => props.$isStart ? '4px' : '0'};
    margin-right: ${props => props.$isEnd ? '4px' : '0'};
    border-top-left-radius: ${props => props.$isStart ? '4px' : '0'};
    border-bottom-left-radius: ${props => props.$isStart ? '4px' : '0'};
    border-top-right-radius: ${props => props.$isEnd ? '4px' : '0'};
    border-bottom-right-radius: ${props => props.$isEnd ? '4px' : '0'};

    .todo-title {
        padding: 0 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const TodoBarSpacer = styled.div`
    height: 25px;
    width: 100%;
`;

const TodayIndicator = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${(props) => props.theme.colors.accent};
`;