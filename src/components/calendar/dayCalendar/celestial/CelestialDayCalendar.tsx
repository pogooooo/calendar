"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Plus, Trash2, Check, ChevronDown } from "lucide-react";

import * as S from "./CelestialDayCalendar.styles";
import { DayThemeProps } from "../DayCalendar";

import CategoryFilter from "@/components/calendar/celestial/categoryFilter/CategoryFilter";
import { useT } from "@/i18n/useT";

type CelestialDayProps = DayThemeProps & React.HTMLAttributes<HTMLDivElement>;

const STORAGE_MAIN = 'cronos-day-main-split';
const STORAGE_SIDE = 'cronos-day-side-split';
const STORAGE_FOLD = 'cronos-day-folded';

type SectionKey = 'timeline' | 'challenge' | 'task' | 'memo';
type FoldState = Record<SectionKey, boolean>;

const DEFAULT_FOLD: FoldState = { timeline: false, challenge: false, task: false, memo: false };

const CelestialDayCalendar = React.forwardRef<HTMLDivElement, CelestialDayProps>(
    ({
         asChild, formattedDate, hours, getSlotTodos,
         dayChallenges, toggleChallenge,
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

        const [fold, setFold] = React.useState<FoldState>(() => {
            try {
                const raw = localStorage.getItem(STORAGE_FOLD);
                return raw ? { ...DEFAULT_FOLD, ...JSON.parse(raw) } : DEFAULT_FOLD;
            } catch { return DEFAULT_FOLD; }
        });

        const toggleFold = React.useCallback((key: SectionKey) => {
            setFold(prev => {
                const next = { ...prev, [key]: !prev[key] };
                try { localStorage.setItem(STORAGE_FOLD, JSON.stringify(next)); } catch {}
                return next;
            });
        }, []);

        const doneChallenges = dayChallenges.filter(c => c.isDone).length;

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

                <S.ContentLayout ref={contentRef}>
                    <S.TimelineSection
                        $collapsed={fold.timeline}
                        style={fold.timeline ? { flex: '0 0 auto' } : { flex: mainSplit }}
                    >
                        <S.SectionToggle
                            type="button"
                            $collapsed={fold.timeline}
                            onClick={() => toggleFold('timeline')}
                            aria-expanded={!fold.timeline}
                        >
                            <span className="chev"><ChevronDown size={14} /></span>
                            <span className="label">{t.calendar.timeline}</span>
                        </S.SectionToggle>
                        {!fold.timeline && (
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
                        )}
                    </S.TimelineSection>

                    {!fold.timeline && (
                        <S.ResizeHandle onMouseDown={handleMainDrag}>
                            <span /><span /><span />
                        </S.ResizeHandle>
                    )}

                    <S.SideSection
                        ref={sideRef}
                        style={fold.timeline ? { flex: 1 } : { flex: 1 - mainSplit }}
                    >
                        {/* 오늘의 챌린지 — 여기서 바로 완료 처리 */}
                        <S.ChallengeCard $collapsed={fold.challenge}>
                            <S.SectionToggle
                                type="button"
                                $collapsed={fold.challenge}
                                onClick={() => toggleFold('challenge')}
                                aria-expanded={!fold.challenge}
                            >
                                <span className="chev"><ChevronDown size={14} /></span>
                                <span className="label">{t.popup.challenges}</span>
                                {dayChallenges.length > 0 && (
                                    <span className="count">{doneChallenges}/{dayChallenges.length}</span>
                                )}
                            </S.SectionToggle>

                            {!fold.challenge && (
                                dayChallenges.length > 0 ? (
                                    <S.ChallengeList>
                                        {dayChallenges.map(item => (
                                            <S.ChallengeItem key={item.id} $isDone={item.isDone}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.isDone}
                                                    onChange={() => toggleChallenge(item)}
                                                />
                                                <span className="box">
                                                    {item.isDone && <Check size={12} strokeWidth={3} />}
                                                </span>
                                                <span className="title">{item.title}</span>
                                            </S.ChallengeItem>
                                        ))}
                                    </S.ChallengeList>
                                ) : (
                                    <S.ChallengeEmpty>{t.calendar.noChallengeToday}</S.ChallengeEmpty>
                                )
                            )}
                        </S.ChallengeCard>

                        <S.TaskCard
                            $collapsed={fold.task}
                            style={fold.task ? { flex: '0 0 auto' } : (fold.memo ? { flex: 1 } : { flex: sideSplit })}
                        >
                            <S.SectionToggle
                                type="button"
                                $collapsed={fold.task}
                                onClick={() => toggleFold('task')}
                                aria-expanded={!fold.task}
                            >
                                <span className="chev"><ChevronDown size={14} /></span>
                                <span className="label">{t.calendar.temporaryTask}</span>
                            </S.SectionToggle>

                            {!fold.task && (
                                <>
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
                                            placeholder={t.calendar.addTask}
                                        />
                                        <button type="submit"><Plus size={18} /></button>
                                    </S.TaskForm>
                                </>
                            )}
                        </S.TaskCard>

                        {!fold.task && !fold.memo && (
                            <S.ResizeHandle onMouseDown={handleSideDrag}>
                                <span /><span /><span />
                            </S.ResizeHandle>
                        )}

                        <S.MemoCard
                            $collapsed={fold.memo}
                            style={fold.memo ? { flex: '0 0 auto' } : (fold.task ? { flex: 1 } : { flex: 1 - sideSplit })}
                        >
                            <S.SectionToggle
                                type="button"
                                $collapsed={fold.memo}
                                onClick={() => toggleFold('memo')}
                                aria-expanded={!fold.memo}
                            >
                                <span className="chev"><ChevronDown size={14} /></span>
                                <span className="label">{t.calendar.dailyMemo}</span>
                            </S.SectionToggle>

                            {!fold.memo && (
                                <textarea
                                    value={localMemo}
                                    onChange={(e) => setLocalMemo(e.target.value)}
                                    onBlur={handleMemoBlur}
                                    placeholder={t.calendar.memoPlaceholder}
                                />
                            )}
                        </S.MemoCard>
                    </S.SideSection>
                </S.ContentLayout>
            </S.CelestialCalendarWrapper>
        );
    }
);

CelestialDayCalendar.displayName = "CelestialDayCalendar";

export default CelestialDayCalendar;
