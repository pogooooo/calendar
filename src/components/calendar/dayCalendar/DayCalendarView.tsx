"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Plus, Trash2, Check, ChevronDown } from "lucide-react";

import { DayThemeProps } from "./DayCalendar";

import CategoryFilter from "@/components/calendar/parts/categoryFilter/CategoryFilter";
import RulerScroll from "@/components/scroll/RulerScroll";
import TodoContextMenu from "@/components/calendar/parts/contextMenu/TodoContextMenu";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import { useT } from "@/i18n/useT";
import { wallTime } from "@/lib/dateKey";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialDayCalendar.styles";
import * as MapleS from "./maple/MapleDayCalendar.styles";
import * as OceanS from './ocean/OceanDayCalendar.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

// contextMenu 는 div 의 HTML 속성 이름과 겹친다. 우리 뜻(열린 메뉴 상태)을 쓴다.
type CelestialDayProps = DayThemeProps & Omit<React.HTMLAttributes<HTMLDivElement>, "contextMenu">;

const STORAGE_MAIN = 'cronos-day-main-split';
const STORAGE_SIDE = 'cronos-day-side-split';
const STORAGE_FOLD = 'cronos-day-folded';

type SectionKey = 'timeline' | 'challenge' | 'task' | 'memo';
type FoldState = Record<SectionKey, boolean>;

const DEFAULT_FOLD: FoldState = { timeline: false, challenge: false, task: false, memo: false };

const DayCalendarView = React.forwardRef<HTMLDivElement, CelestialDayProps>(
    ({
         asChild, formattedDate, hours, getSlotTodos, createAt, modalDate,
         dayChallenges, toggleChallenge,
         tasks, newTaskText, setNewTaskText, handleAddTask,
         toggleDailyTask, deleteDailyTask,
         localMemo, setLocalMemo, handleMemoBlur, memoError, memoReady,
         categories, selectedCategoryIds, toggleCategory,
         showProjects, onToggleProjects,
         dayTodos, selectedDate, isModalOpen, modalTodo, setIsModalOpen,
         contextMenu, setContextMenu, openTodoMenu,
         handleQuickEdit, handleQuickDelete, handleQuickDeleteOne, handleQuickToggle,
         ...props
     }, ref) => {
        const S = usePickTheme(STYLES);
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
                    {/* 그날의 일정 목록 — 폰에서는 달력 칸이 좁아 일정이 점으로만 찍히니 고치고 지우는 유일한 길이고,
                        데스크톱에서는 달력에서 날짜를 누르면 그날 할 일을 시간표 위에서 한눈에 본다. */}
                    <S.TodoCard>
                        <S.TodoCardHead>
                            <i />
                            <span>{t.home.tasks}</span>
                            {dayTodos.length > 0 && <span className="count">{dayTodos.length}</span>}
                        </S.TodoCardHead>

                        {dayTodos.length > 0 ? (
                            <S.TodoList>
                                {dayTodos.map((todo) => {
                                    const color = categories.find(c => c.id === todo.categoryId)?.color;
                                    // 고른 시간대의 시각 — 예전엔 이 기기 시각이라 시간대가 다르면 홈·시간표와 다른 시각이 섰다
                                    const start = todo.startAt ? wallTime(todo.startAt as string) : null;
                                    const time = todo.isAllDay || !start
                                        ? null
                                        : `${String(start.hour).padStart(2, "0")}:${String(start.minute).padStart(2, "0")}`;
                                    return (
                                        <S.TodoRow
                                            key={todo.id}
                                            type="button"
                                            $isDone={!!todo.isDone}
                                            onClick={(e) => openTodoMenu(e, todo)}
                                        >
                                            <span className="dot" style={color ? { backgroundColor: color } : undefined} />
                                            <span className="title">{todo.title}</span>
                                            <span className="time">{time ?? t.todo.allDay}</span>
                                        </S.TodoRow>
                                    );
                                })}
                            </S.TodoList>
                        ) : (
                            <S.ChallengeEmpty>{t.home.noTodayTodos}</S.ChallengeEmpty>
                        )}
                    </S.TodoCard>

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
                        <RulerScroll flagFor={(r) => `${Math.round(r * 23).toString().padStart(2, "0")}:00`}>
                            {hours.map((hour) => (
                                <S.TimeRow
                                    key={hour}
                                    data-ruler-tick
                                    data-ruler-label={hour.toString().padStart(2, "0")}
                                    {...(Array.from({ length: 6 }).some((_, s) => getSlotTodos(hour, s).length > 0)
                                        ? { "data-ruler-mark": "" }
                                        : {})}
                                >
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
                                                        // 빈 칸을 누르면 그 시각에 새 일정 (예전엔 손가락 모양만 바뀌고 아무 일도 없었다)
                                                        onClick={hasTodo ? undefined : () => createAt(hour, slotIdx * 10)}
                                                        title={hasTodo ? undefined : `${hour.toString().padStart(2, '0')}:${(slotIdx * 10).toString().padStart(2, '0')} · ${t.calendar.addTask}`}
                                                    >
                                                        {slotTodos.map((todo, idx) => {
                                                            const isContinuingPrev = prevSlotTodos.some(pt => pt.id === todo.id);
                                                            const isContinuingNext = nextSlotTodos.some(nt => nt.id === todo.id);

                                                            return (
                                                                <S.SlotTodoItem
                                                                    key={`${todo.id}-${idx}`}
                                                                    onClick={(e) => openTodoMenu(e, todo)}
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
                        </RulerScroll>
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
                                            // 한글 조합을 끝내는 Enter 로 폼이 넘어가면(사파리·맥) 마지막 글자가 칸에 남거나 두 번 들어간다 — 홈의 빠른 추가와 같게
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault();
                                            }}
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
                                <>
                                    <textarea
                                        value={localMemo}
                                        readOnly={!memoReady}
                                        onChange={(e) => setLocalMemo(e.target.value)}
                                        onBlur={handleMemoBlur}
                                        placeholder={t.calendar.memoPlaceholder}
                                    />
                                    {memoError && (
                                        <S.MemoError role="alert">
                                            {memoError}
                                            <button type="button" onClick={handleMemoBlur}>{t.calendar.retry}</button>
                                        </S.MemoError>
                                    )}
                                </>
                            )}
                        </S.MemoCard>
                    </S.SideSection>
                </S.ContentLayout>

                <TodoContextMenu
                    menuState={contextMenu}
                    onClose={() => setContextMenu(null)}
                    onToggle={handleQuickToggle}
                    onEdit={handleQuickEdit}
                    onDelete={handleQuickDelete}
                    onDeleteOne={handleQuickDeleteOne}
                />

                <TodoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    todo={modalTodo}
                    categories={categories}
                    selectedDate={modalDate}
                />
            </S.CelestialCalendarWrapper>
        );
    }
);

DayCalendarView.displayName = "DayCalendarView";

export default DayCalendarView;
