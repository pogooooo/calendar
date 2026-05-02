"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Plus, Trash2, Check } from "lucide-react";

import * as S from "./CelestialDayCalendar.styles";
import { DayThemeProps } from "../DayCalendar";

import CategoryFilter from "@/components/calendar/celestial/categoryFilter/CategoryFilter";

type CelestialDayProps = DayThemeProps & React.HTMLAttributes<HTMLDivElement>;

const CelestialDayCalendar = React.forwardRef<HTMLDivElement, CelestialDayProps>(
    ({
         asChild, formattedDate, hours, getSlotTodos,
         tasks, newTaskText, setNewTaskText, handleAddTask,
         toggleDailyTask, deleteDailyTask,
         localMemo, setLocalMemo, handleMemoBlur,
         categories, selectedCategoryIds, toggleCategory,
         showProjects, onToggleProjects,
         ...props
     }, ref) => {
        const Component = asChild ? Slot : 'div';

        return (
            <S.CelestialCalendarWrapper as={Component} ref={ref} {...props}>
                <S.DateHeader>
                    <span>{formattedDate}</span>
                    <CategoryFilter
                        categories={categories}
                        selectedCategoryIds={selectedCategoryIds}
                        onToggle={toggleCategory}
                        showProjects={showProjects}
                        onToggleProjects={onToggleProjects}
                    />
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
                                                const slotTodos = getSlotTodos(hour, slotIdx);
                                                const hasTodo = slotTodos.length > 0;

                                                const prevSlotTodos = slotIdx > 0
                                                    ? getSlotTodos(hour, slotIdx - 1)
                                                    : (hour > 0 ? getSlotTodos(hour - 1, 5) : []);

                                                const nextSlotTodos = slotIdx < 5
                                                    ? getSlotTodos(hour, slotIdx + 1)
                                                    : (hour < 23 ? getSlotTodos(hour + 1, 0) : []);

                                                return (
                                                    <div
                                                        key={slotIdx}
                                                        className={`slot-box ${hasTodo ? 'filled' : ''}`}
                                                    >
                                                        {slotTodos.map((todo, idx) => {
                                                            const isContinuingPrev = prevSlotTodos.some(pt => pt.id === todo.id);
                                                            const isContinuingNext = nextSlotTodos.some(nt => nt.id === todo.id);

                                                            return (
                                                                <S.SlotTodoItem
                                                                    key={`${todo.id}-${idx}`}
                                                                    $isContinuingPrev={isContinuingPrev}
                                                                    $isContinuingNext={isContinuingNext}
                                                                    $isDone={todo.isDone}
                                                                >
                                                                    {!isContinuingPrev && <span className="todo-text">{todo.title}</span>}
                                                                </S.SlotTodoItem>
                                                            );
                                                        })}
                                                    </div>
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
                            <div className="card-header">Temporary Task</div>

                            <S.TaskList>
                                {tasks.map(task => (
                                    <S.TaskItem key={task.id} $isDone={task.isDone}>
                                        <button className="check-btn" onClick={() => toggleDailyTask(task)}>
                                            {task.isDone && <Check size={14} strokeWidth={3}/>}
                                        </button>
                                        <span className="task-text">{task.title}</span>
                                        <button className="delete-btn" onClick={() => deleteDailyTask(task)}>
                                            <Trash2 size={14}/>
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