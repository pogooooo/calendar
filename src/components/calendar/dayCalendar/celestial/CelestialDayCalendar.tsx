"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Plus, Trash2, Check } from "lucide-react";

import { DayProps } from "../DayCalendar";
import * as S from "./CelestialDayCalendar.styles";
import useDailyStore from "@/store/useDailyStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";

interface LocalTask {
    id: string;
    text: string;
    isDone: boolean;
}

const CelestialDayCalendar = React.forwardRef<HTMLDivElement, DayProps>(
    ({ asChild, selectedDate = new Date(), todos = [], categories = [], onDateChange, ...props }, ref) => {
        const Component = asChild ? Slot : 'div';

        const { tasks, memo, fetchDailyData, addDailyTask, toggleDailyTask, deleteDailyTask, updateDailyMemo } = useDailyStore();
        const authFetch = useAuthFetch();

        const [newTaskText, setNewTaskText] = React.useState("");
        const [localMemo, setLocalMemo] = React.useState("");

        const expandedTodos = React.useMemo(() => {
            const expanded: any[] = [];

            const dayStart = new Date(selectedDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(selectedDate);
            dayEnd.setHours(23, 59, 59, 999);

            todos.forEach(todo => {
                if (!todo.startAt || !todo.endAt) return;

                if (!todo.repeat || todo.repeat <= 0) {
                    expanded.push(todo);
                    return;
                }

                const R = todo.repeat;
                let currentStart = new Date(todo.startAt as string | number | Date);
                let currentEnd = new Date(todo.endAt as string | number | Date);

                const startDayOnly = new Date(currentStart);
                startDayOnly.setHours(0, 0, 0, 0);
                const endDayOnly = new Date(currentEnd);
                endDayOnly.setHours(0, 0, 0, 0);

                const daysBetween = Math.round((endDayOnly.getTime() - startDayOnly.getTime()) / (1000 * 60 * 60 * 24));
                const intervalDays = daysBetween + R;
                const repeatIntervalMs = intervalDays * 24 * 60 * 60 * 1000;

                if (currentEnd.getTime() < dayStart.getTime()) {
                    const msBefore = dayStart.getTime() - currentEnd.getTime();
                    const intervalsToSkip = Math.floor(msBefore / repeatIntervalMs);
                    if (intervalsToSkip > 0) {
                        currentStart.setDate(currentStart.getDate() + (intervalsToSkip * intervalDays));
                        currentEnd.setDate(currentEnd.getDate() + (intervalsToSkip * intervalDays));
                    }
                }

                let instanceCount = 0;
                while (currentStart.getTime() <= dayEnd.getTime()) {
                    if (currentEnd.getTime() >= dayStart.getTime()) {
                        expanded.push({
                            ...todo,
                            id: `${todo.id}-rep-${currentStart.getTime()}`,
                            startAt: currentStart.toISOString(),
                            endAt: currentEnd.toISOString(),
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
        }, [todos, selectedDate]);

        React.useEffect(() => {
            fetchDailyData(authFetch, selectedDate);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedDate]);

        React.useEffect(() => {
            setLocalMemo(memo || "");
        }, [memo]);

        const handleAddTask = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newTaskText.trim()) return;
            const text = newTaskText.trim();
            setNewTaskText("");
            await addDailyTask(authFetch, selectedDate, text);
        };

        const handleMemoBlur = async () => {
            if (localMemo !== memo) {
                await updateDailyMemo(authFetch, selectedDate, localMemo);
            }
        };

        const getSlotColor = React.useCallback((hour: number, slotIdx: number) => {
            const slotStart = new Date(selectedDate);
            slotStart.setHours(hour, slotIdx * 10, 0, 0);

            const slotEnd = new Date(selectedDate);
            slotEnd.setHours(hour, slotIdx * 10 + 9, 59, 999);

            const overlappingTodo = expandedTodos.find(todo => {
                if (todo.isAllDay || !todo.startAt || !todo.endAt) return false;
                const start = new Date(todo.startAt as string | number | Date);
                const end = new Date(todo.endAt as string | number | Date);
                return start <= slotEnd && end >= slotStart;
            });

            if (overlappingTodo) {
                const cat = categories.find(c => c.id === overlappingTodo.categoryId);
                return cat?.color || "var(--primary-color)";
            }
            return null;
        }, [expandedTodos, categories, selectedDate]);

        const hours = Array.from({ length: 24 }, (_, i) => i);
        const formattedDate = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`;

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>
                <S.DateHeader>
                    <span>{formattedDate}</span>
                    <hr />
                </S.DateHeader>

                <S.ContentLayout>
                    <S.TimelineSection>
                        <div className="timeline-header">Time Line</div>
                        <S.TimelineScrollArea>
                            {hours.map((hour) => (
                                <S.TimeRow key={hour}>
                                    <div className="time-label">
                                        {hour.toString().padStart(2, '0')}:00
                                    </div>
                                    <div className="time-slots">
                                        <div className="slot-bar-container">
                                            {Array.from({ length: 6 }).map((_, slotIdx) => {
                                                const slotColor = getSlotColor(hour, slotIdx);
                                                return (
                                                    <div
                                                        key={slotIdx}
                                                        className={`slot-box ${slotColor ? 'filled' : ''}`}
                                                        style={slotColor ? { backgroundColor: `${slotColor}CC`, borderColor: slotColor } : {}}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </S.TimeRow>
                            ))}
                        </S.TimelineScrollArea>
                    </S.TimelineSection>

                    <S.SideSection>
                        <S.TaskCard>
                            <div className="card-header">To-do List</div>

                            <S.TaskList>
                                {tasks.map(task => (
                                    <S.TaskItem key={task.id} $isDone={task.isDone}>
                                        <button className="check-btn" onClick={() => toggleDailyTask(authFetch, task.id)}>
                                            {task.isDone && <Check size={14} strokeWidth={3} />}
                                        </button>
                                        <span className="task-text">{task.text}</span>
                                        <button className="delete-btn" onClick={() => deleteDailyTask(authFetch, task.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </S.TaskItem>
                                ))}
                            </S.TaskList>

                            <S.TaskForm onSubmit={handleAddTask}>
                                <input
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    placeholder="할 일 추가"
                                />
                                <button type="submit"><Plus size={18} /></button>
                            </S.TaskForm>
                        </S.TaskCard>

                        <S.MemoCard>
                            <div className="card-header">Daily Memo</div>
                            <textarea
                                value={localMemo}
                                onChange={(e) => setLocalMemo(e.target.value)}
                                onBlur={handleMemoBlur}
                                placeholder="메모나 일기를 남겨보세요."
                            />
                        </S.MemoCard>
                    </S.SideSection>
                </S.ContentLayout>
            </S.CelestialCalendarWrapper>
        );
    }
);

CelestialDayCalendar.displayName = "CelestialDayCalendar";

export default CelestialDayCalendar;