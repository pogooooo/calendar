"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Plus, Trash2, Check } from "lucide-react";

import * as S from "./BotanicalDayCalendar.styles";
import { DayThemeProps } from "../DayCalendar";

import CategoryFilter from "@/components/calendar/botanical/categoryFilter/CategoryFilter";
import { useT } from "@/i18n/useT";

type BotanicalDayProps = DayThemeProps & React.HTMLAttributes<HTMLDivElement>;

const STORAGE_MAIN = 'cronos-day-main-split';
const STORAGE_SIDE = 'cronos-day-side-split';

const BotanicalDayCalendar = React.forwardRef<HTMLDivElement, BotanicalDayProps>(
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
        const t = useT();

        const [mainSplit, setMainSplit] = React.useState(() => {
            try {
                const v = parseFloat(localStorage.getItem(STORAGE_MAIN) ?? '');
                return isNaN(v) ? 0.6 : v;
            } catch { return 0.6; }
        });

        const [sideSplit, setSideSplit] = React.useState(() => {
            try {
                const v = parseFloat(localStorage.getItem(STORAGE_SIDE) ?? '');
                return isNaN(v) ? 0.6 : v;
            } catch { return 0.6; }
        });

        const contentRef = React.useRef<HTMLDivElement>(null);
        const sideRef = React.useRef<HTMLDivElement>(null);
        const mainSplitRef = React.useRef(mainSplit);
        const sideSplitRef = React.useRef(sideSplit);
        mainSplitRef.current = mainSplit;
        sideSplitRef.current = sideSplit;

        const handleMainDrag = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            const container = contentRef.current;
            if (!container) return;
            const startY = e.clientY;
            const startSplit = mainSplitRef.current;
            const containerH = container.getBoundingClientRect().height;

            const onMove = (ev: MouseEvent) => {
                const delta = ev.clientY - startY;
                const next = Math.max(0.15, Math.min(0.85, startSplit + delta / containerH));
                setMainSplit(next);
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                try { localStorage.setItem(STORAGE_MAIN, mainSplitRef.current.toString()); } catch {}
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        }, []);

        const handleSideDrag = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();
            const container = sideRef.current;
            if (!container) return;
            const startY = e.clientY;
            const startSplit = sideSplitRef.current;
            const containerH = container.getBoundingClientRect().height;

            const onMove = (ev: MouseEvent) => {
                const delta = ev.clientY - startY;
                const next = Math.max(0.15, Math.min(0.85, startSplit + delta / containerH));
                setSideSplit(next);
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                try { localStorage.setItem(STORAGE_SIDE, sideSplitRef.current.toString()); } catch {}
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        }, []);

        return (
            <S.BotanicalCalendarWrapper as={Component} ref={ref} {...props}>
                <S.DateHeader>
                    <S.LeafAccent />
                    <span>{formattedDate}</span>
                    <S.TwigDivider />
                    <CategoryFilter
                        categories={categories}
                        selectedCategoryIds={selectedCategoryIds}
                        onToggle={toggleCategory}
                        showProjects={showProjects}
                        onToggleProjects={onToggleProjects}
                    />
                </S.DateHeader>

                <S.ContentLayout ref={contentRef}>
                    <S.TimelineSection style={{ flex: mainSplit }}>
                        <div className="timeline-header">{t.calendar.timeline}</div>
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

                    <S.ResizeHandle onMouseDown={handleMainDrag}>
                        <span /><span /><span />
                    </S.ResizeHandle>

                    <S.SideSection ref={sideRef} style={{ flex: 1 - mainSplit }}>
                        <S.TaskCard style={{ flex: sideSplit }}>
                            <div className="card-header">{t.calendar.temporaryTask}</div>

                            <S.TaskList>
                                {tasks.map(task => (
                                    <S.TaskItem key={task.id} $isDone={task.isDone}>
                                        <button className="check-btn" onClick={() => toggleDailyTask(task)}>
                                            {task.isDone && <Check size={14} strokeWidth={3} />}
                                        </button>
                                        <span className="task-text">{task.title}</span>
                                        <button className="delete-btn" onClick={() => deleteDailyTask(task)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </S.TaskItem>
                                ))}
                            </S.TaskList>

                            <S.TaskForm onSubmit={handleAddTask}>
                                <input
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    placeholder={t.calendar.addTask}
                                />
                                <button type="submit"><Plus size={18} /></button>
                            </S.TaskForm>
                        </S.TaskCard>

                        <S.ResizeHandle onMouseDown={handleSideDrag}>
                            <span /><span /><span />
                        </S.ResizeHandle>

                        <S.MemoCard style={{ flex: 1 - sideSplit }}>
                            <div className="card-header">{t.calendar.dailyMemo}</div>
                            <textarea
                                value={localMemo}
                                onChange={(e) => setLocalMemo(e.target.value)}
                                onBlur={handleMemoBlur}
                                placeholder={t.calendar.memoPlaceholder}
                            />
                        </S.MemoCard>
                    </S.SideSection>
                </S.ContentLayout>
            </S.BotanicalCalendarWrapper>
        );
    }
);

BotanicalDayCalendar.displayName = "BotanicalDayCalendar";

export default BotanicalDayCalendar;
