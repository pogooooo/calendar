"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Plus, Trash2, Check } from "lucide-react";

import { DayProps } from "../DayCalendar";
import * as S from "./CelestialDayCalendar.styles";

interface LocalTask {
    id: string;
    text: string;
    isDone: boolean;
}

const CelestialDayCalendar = React.forwardRef<HTMLDivElement, DayProps>(
    ({ asChild, selectedDate = new Date(), todos = [], categories = [], onDateChange, ...props }, ref) => {
        const Component = asChild ? Slot : 'div';

        // TODO: DB 연동 및 전역 상태 관리 로직 추가 필요
        const [dailyTasks, setDailyTasks] = React.useState<LocalTask[]>([
            { id: '1', text: '알고리즘 문제 풀이', isDone: true },
            { id: '2', text: '리액트 컴포넌트 분리', isDone: false }
        ]);
        const [newTaskText, setNewTaskText] = React.useState("");
        const [dailyMemo, setDailyMemo] = React.useState("오늘은 집중력이 좋았다. 내일도 이대로 유지하자!");

        const [timeSlots, setTimeSlots] = React.useState<Record<number, boolean[]>>({
            9: [false, false, false, true, true, true],
            10: [true, true, true, true, true, true],
            11: [true, true, false, false, false, false],
        });

        const handleAddTask = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newTaskText.trim()) return;
            setDailyTasks([...dailyTasks, { id: Date.now().toString(), text: newTaskText.trim(), isDone: false }]);
            setNewTaskText("");
        };

        const handleToggleTask = (id: string) => {
            setDailyTasks(dailyTasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t));
        };

        const handleDeleteTask = (id: string) => {
            setDailyTasks(dailyTasks.filter(t => t.id !== id));
        };

        const handleToggleSlot = (hour: number, slotIdx: number) => {
            setTimeSlots(prev => {
                const hourSlots = prev[hour] ? [...prev[hour]] : [false, false, false, false, false, false];
                hourSlots[slotIdx] = !hourSlots[slotIdx];
                return { ...prev, [hour]: hourSlots };
            });
        };

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
                                                const isFilled = timeSlots[hour]?.[slotIdx] || false;
                                                return (
                                                    <div
                                                        key={slotIdx}
                                                        className={`slot-box ${isFilled ? 'filled' : ''}`}
                                                        onClick={() => handleToggleSlot(hour, slotIdx)}
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
                                {dailyTasks.map(task => (
                                    <S.TaskItem key={task.id} $isDone={task.isDone}>
                                        <button className="check-btn" onClick={() => handleToggleTask(task.id)}>
                                            {task.isDone && <Check size={14} strokeWidth={3} />}
                                        </button>
                                        <span className="task-text">{task.text}</span>
                                        <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>
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
                                value={dailyMemo}
                                onChange={(e) => setDailyMemo(e.target.value)}
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