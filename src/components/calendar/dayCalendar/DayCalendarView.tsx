"use client";

import * as React from "react";
import {createPortal} from 'react-dom';
import PanelHeightHandle, { type DayPanel } from "./PanelHeightHandle";
import EngravedDayBar from "./celestial/EngravedDayBar";
import useIsMobile from "@/hooks/useIsMobile";
import { DateActions, FocusPicker } from "./DayFocus.styles";
import { Slot } from "@radix-ui/react-slot";
import { Plus, Trash2, Check, ChevronDown, GripVertical } from "lucide-react";

import { DayThemeProps,type CalendarTodoType } from "./DayCalendar";
import useDragTarget from '@/hooks/useDragTarget';
import {shiftTimedRange} from '@/lib/taskInteractions';

import CategoryFilter from "@/components/calendar/parts/categoryFilter/CategoryFilter";
import RulerScroll from "@/components/scroll/RulerScroll";
import TodoContextMenu from "@/components/calendar/parts/contextMenu/TodoContextMenu";
import TodoModal from "@/components/modal/todoModal/TodoModal";
import { useT } from "@/i18n/useT";
import { labelKey, wallTime, wallNow, activeTimeZone, localDateKey } from "@/lib/dateKey";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { useListMotion, useSwapMotion } from "@/hooks/useMotion";
import useMobilePresentation from '@/hooks/useMobilePresentation';
import useThemeMotion from '@/hooks/useThemeMotion';
import { usePickTheme, useThemeFamily, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialDayCalendar.styles";
import * as GemS from "./gem/GemDayCalendar.styles";
import * as MapleS from "./maple/MapleDayCalendar.styles";
import * as OceanS from './ocean/OceanDayCalendar.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS, gem: GemS };

// contextMenu 는 div 의 HTML 속성 이름과 겹친다. 우리 뜻(열린 메뉴 상태)을 쓴다.
type CelestialDayProps = DayThemeProps & Omit<React.HTMLAttributes<HTMLDivElement>, "contextMenu">;

const STORAGE_MAIN = 'cronos-day-main-split';
const STORAGE_SIDE = 'cronos-day-side-split';
const STORAGE_FOLD = 'cronos-day-folded';

type SectionKey = DayPanel;
type DayView = 'all' | DayPanel;
type FoldState = Record<SectionKey, boolean>;

/** The six cells remain the drop targets. Reserve one lane for the full run within this hour. */
function layoutHour(slots: CalendarTodoType[][]) {
    const spans = new Map<string, { first: number; last: number; lane: number }>();
    slots.forEach((items, slot) => {
        for (const { id } of items) {
            const span = spans.get(id);
            if (span) span.last = slot;
            else spans.set(id, { first: slot, last: slot, lane: 0 });
        }
    });
    const occupiedUntil: number[] = [];
    for (const span of spans.values()) {
        const free = occupiedUntil.findIndex(end => end < span.first);
        span.lane = free < 0 ? occupiedUntil.length : free;
        occupiedUntil[span.lane] = span.last;
    }
    return { spans, lanes: Math.max(1, occupiedUntil.length) };
}

const DEFAULT_FOLD: FoldState = { todos: false, timeline: false, challenge: false, task: false, memo: false };

const DayCalendarView = React.forwardRef<HTMLDivElement, CelestialDayProps>(
    ({
         asChild, formattedDate, hours, getSlotTodos, createAt, modalDate,
         dayChallenges, toggleChallenge,
         tasks, newTaskText, setNewTaskText, handleAddTask,
         toggleDailyTask, deleteDailyTask,
         localMemo, setLocalMemo, handleMemoBlur, memoError, memoReady, memoSaveStatus,
         categories, selectedCategoryIds, toggleCategory,
         showProjects, onToggleProjects,
         dayTodos, selectedDate, isModalOpen, modalTodo, setIsModalOpen,
         contextMenu, setContextMenu, openTodoMenu,
         handleQuickEdit, handleQuickDelete, handleQuickDeleteOne, handleQuickToggle,
         moveTime,timeMoveSaving,timeMoveNotice,undoTimeMove,retryTimeMove,dismissTimeMove,
         ...props
     }, ref) => {
        const S = usePickTheme(STYLES);
        const Component = asChild ? Slot : 'div';
        const t = useT();
        const mobileApp = useMobilePresentation();
        const narrow = useIsMobile();
        const family = useThemeFamily();
        const gem = family === "gem";
        const categoryColors = React.useMemo(() => new Map(categories.map(c => [c.id, c.color])), [categories]);
        const keyboardList = gem && !mobileApp;
        const timeDragHint = mobileApp ? t.interaction.timeDragHandleHint : t.interaction.timeDragHint;
        const foldKey = mobileApp ? 'cronos-mobile-day-folded' : STORAGE_FOLD;
        const timeGridRef=React.useRef<HTMLDivElement>(null);
        const timeDrag=useDragTarget<{todo:CalendarTodoType;slot:number;y:number}>('data-day-slot',(source,target)=>{
            const slot=Number(target);
            if(Number.isInteger(slot)&&slot>=0&&slot<144)void moveTime(source.todo,(slot-source.slot)*10);
        });
        const draggingTime=!!timeDrag.drag;
        const dragPoint=React.useRef(timeDrag.drag);
        React.useEffect(()=>{dragPoint.current=timeDrag.drag;},[timeDrag.drag]);
        const {refreshTarget}=timeDrag;
        React.useEffect(()=>{
            if(!draggingTime)return;
            let frame=0;
            const preventScroll=(event:TouchEvent)=>{if(event.cancelable)event.preventDefault();};
            const step=()=>{
                const point=dragPoint.current,area=timeGridRef.current?.querySelector<HTMLElement>('[data-ruler-tick]')?.parentElement;
                if(point&&area){
                    const box=area.getBoundingClientRect();
                    if(point.x>=box.left&&point.x<=box.right&&point.y>=box.top-16&&point.y<=box.bottom+16&&Math.abs(point.y-point.source.y)>12){
                        const edge=Math.min(24,box.height/4);
                        const speed=point.y<box.top+edge?-2:point.y>box.bottom-edge?2:0;
                        const before=area.scrollTop;
                        if(speed)area.scrollTop+=speed;
                        if(area.scrollTop!==before)refreshTarget();
                    }
                }
                frame=requestAnimationFrame(step);
            };
            frame=requestAnimationFrame(step);
            document.addEventListener('touchmove',preventScroll,{passive:false});
            return()=>{cancelAnimationFrame(frame);document.removeEventListener('touchmove',preventScroll);};
        },[draggingTime,refreshTarget]);
        const preview=timeDrag.drag?.target!==null&&timeDrag.drag?.target!==undefined&&timeDrag.drag.source.todo.startAt&&timeDrag.drag.source.todo.endAt
            ?shiftTimedRange(timeDrag.drag.source.todo.startAt,timeDrag.drag.source.todo.endAt,(Number(timeDrag.drag.target)-timeDrag.drag.source.slot)*10,activeTimeZone()):null;
        const previewTime=(value:string,withDate=false)=>{const w=wallTime(value);return w?`${withDate?`${w.month}/${w.day} `:''}${w.hour.toString().padStart(2,'0')}:${w.minute.toString().padStart(2,'0')}`:'--:--';};

        const [mainSplit] = React.useState(() => {
            try {
                const v = parseFloat(localStorage.getItem(STORAGE_MAIN) ?? '');
                return isNaN(v) ? 0.6 : v;
            } catch { return 0.6; }
        });

        const [sideSplit] = React.useState(() => {
            try {
                const v = parseFloat(localStorage.getItem(STORAGE_SIDE) ?? '');
                return isNaN(v) ? 0.6 : v;
            } catch { return 0.6; }
        });

        const [focus, setFocus] = React.useState<DayView>("all");
        const [savedFold, setFold] = React.useState<FoldState>(() => {
            try {
                const raw = localStorage.getItem(STORAGE_FOLD);
                return raw ? { ...DEFAULT_FOLD, ...JSON.parse(raw) } : DEFAULT_FOLD;
            } catch { return DEFAULT_FOLD; }
        });
        React.useEffect(() => {
            const defaults = mobileApp
                ? { ...DEFAULT_FOLD, timeline: family !== 'celestial', task: true, memo: true }
                : DEFAULT_FOLD;
            try {
                const saved = localStorage.getItem(foldKey);
                setFold(saved ? { ...defaults, ...JSON.parse(saved) } : defaults);
            } catch { setFold(defaults); }
        }, [family, foldKey, mobileApp]);

        // Focusing a folded section temporarily opens it without changing the saved overview.
        const fold = React.useMemo(() => focus === "all"
            ? savedFold : { ...savedFold, [focus]: false }, [focus, savedFold]);
        const hide = (section: DayView) => focus !== "all" && focus !== section ? true : undefined;
        const contentRef = React.useRef<HTMLDivElement>(null);
        const dayKey = labelKey(selectedDate);
        const motion = useThemeMotion();
        const foldStart = React.useRef<{ panel: HTMLElement; height: number } | null>(null);
        const foldAnimation = React.useRef<Animation | null>(null);
        const timelinePosition = React.useRef<{ day: string; top: number } | null>(null);
        const positionTimeline = gem || family === "celestial";
        const toggleFold = React.useCallback((key: SectionKey) => {
            if (positionTimeline) {
                const panel = contentRef.current?.querySelector<HTMLElement>(`[data-calendar-panel="${key}"]`);
                if (gem && panel && motion !== "off") foldStart.current = { panel, height: panel.getBoundingClientRect().height };
                const scroll = key === "timeline" ? panel?.querySelector('[data-ruler-tick]')?.parentElement : null;
                if (scroll) timelinePosition.current = { day: dayKey, top: scroll.scrollTop };
            }
            setFold(prev => {
                const next = { ...prev, [key]: !prev[key] };
                try { localStorage.setItem(foldKey, JSON.stringify(next)); } catch {}
                return next;
            });
        }, [dayKey, foldKey, gem, motion, positionTimeline]);
        React.useLayoutEffect(() => {
            const from = foldStart.current;
            foldStart.current = null;
            foldAnimation.current?.cancel();
            if (!from || motion === "off" || !from.panel.isConnected) return;
            const height = from.panel.getBoundingClientRect().height;
            if (Math.abs(height - from.height) < 2) return;
            foldAnimation.current = from.panel.animate([
                { minHeight: `${from.height}px`, maxHeight: `${from.height}px` },
                { minHeight: `${height}px`, maxHeight: `${height}px` },
            ], { duration: motion === "gentle" ? 125 : 200, easing: "ease-out" });
        }, [fold, motion]);
        React.useLayoutEffect(() => () => { foldAnimation.current?.cancel(); }, []);

        const doneChallenges = dayChallenges.filter(c => c.isDone).length;

        /* 날을 옮기면(달력 칸·쓸기·주간 띠) 그날 내용이 오는 쪽에서 들어온다 — 다음 날이면 오른쪽에서.
           요소는 그대로라 적던 메모·임시 작업 칸·접어 둔 칸·시간표 스크롤이 남는다.
           목록에 든 줄은 들어오고 빠진 줄은 접히며, 끝낸 줄은 한 번 — 날을 옮긴 때는 통째로 갈린 것이라 빼고 */
        const todayKey = useCurrentDayKey();
        const positionedDay = React.useRef<string | null>(null);
        React.useLayoutEffect(() => {
            if (!positionTimeline || fold.timeline) return;
            const rows = Array.from(timeGridRef.current?.querySelectorAll<HTMLElement>('[data-ruler-tick]') ?? []);
            if (!rows.length) return;
            if (positionedDay.current === dayKey) {
                const saved = timelinePosition.current;
                const area = rows[0].parentElement;
                if (area && saved?.day === dayKey) area.scrollTop = saved.top;
                return;
            }
            const marked = rows.filter(row => row.hasAttribute('data-ruler-mark'));
            const currentHour = wallNow().getHours();
            const row = dayKey === todayKey
                ? marked.find(item => Number(item.dataset.rulerLabel) >= currentHour) ?? marked.at(-1) ?? rows[currentHour]
                : marked[0] ?? rows[8];
            const scroll = row?.parentElement;
            if (!row || !scroll) return;
            scroll.scrollTop += row.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
            positionedDay.current = dayKey;
        }, [dayKey, fold.timeline, positionTimeline, todayKey]);
        const titleRef = React.useRef<HTMLSpanElement>(null);
        const stampRef = React.useRef<HTMLDivElement>(null);
        const todoListRef = React.useRef<HTMLDivElement>(null);
        const taskListRef = React.useRef<HTMLDivElement>(null);
        const challengeListRef = React.useRef<HTMLDivElement>(null);
        useSwapMotion(dayKey, titleRef, { size: "line" });
        useSwapMotion(dayKey, stampRef, { size: 'line', axis: 'y' });
        // Keep the Gem frames and scroll containers anchored; only their contents change days.
        useSwapMotion(dayKey, () => gem
            ? Array.from(contentRef.current?.querySelectorAll('[data-day-todo-list], [data-day-empty], [data-calendar-panel] > :not(button):not([data-motion-snapshot])') ?? [])
            : contentRef.current);
        // 펼친 내용만 갈래의 몸짓으로 드러낸다. 입력 요소를 다시 만들지 않아 메모와 초점이 유지된다.
        const foldSize = gem ? 'pane' : 'line';
        useSwapMotion(String(fold.timeline), () => Array.from(contentRef.current?.querySelectorAll('[data-calendar-panel="timeline"] > :not(button):not([role="status"])') ?? []), { axis:'y', size:foldSize });
        useSwapMotion(String(fold.challenge), () => contentRef.current?.querySelector('[data-calendar-panel="challenge"] > :not(button)'), { axis:'y', size:foldSize });
        useSwapMotion(String(fold.task), () => contentRef.current?.querySelector('[data-calendar-panel="task"] > :not(button)'), { axis:'y', size:foldSize });
        useSwapMotion(String(fold.memo), () => contentRef.current?.querySelector('[data-calendar-panel="memo"] > :not(button)'), { axis:'y', size:foldSize });
        useListMotion(todoListRef, { reset: dayKey, exit: "collapse" });
        useListMotion(taskListRef, { reset: dayKey, exit: "collapse" });
        useListMotion(challengeListRef, { reset: dayKey });

        const panelLabels = { todos: t.home.tasks, timeline: t.calendar.timeline, challenge: t.popup.challenges, task: t.calendar.temporaryTask, memo: t.calendar.dailyMemo };
        const resize = (panel: DayPanel) => focus === "all" && !fold[panel] && (
            <PanelHeightHandle panel={panel} label={panelLabels[panel]} mobile={mobileApp || narrow} />
        );
        const [selectedId, selectTodo] = React.useState<string>();
        const showMenu: typeof openTodoMenu = (event, todo) => { selectTodo(todo.id); openTodoMenu(event, todo); };

        const timeMoveFeedback = (timeMoveSaving || timeMoveNotice) && (
            <S.TimeMoveNotice role="status" data-day-time-feedback>
                <span>{timeMoveSaving ? t.account.saving : timeMoveNotice}</span>
                {!timeMoveSaving && undoTimeMove && <button type="button" onClick={() => void undoTimeMove()}>{t.interaction.undo}</button>}
                {!timeMoveSaving && retryTimeMove && <button type="button" onClick={() => void retryTimeMove()}>{t.calendar.retry}</button>}
                {!timeMoveSaving && <button type="button" aria-label={t.interaction.dismiss} onClick={dismissTimeMove}>×</button>}
            </S.TimeMoveNotice>
        );

        return (
            <S.CelestialCalendarWrapper data-day-calendar data-day-focus={focus === "all" ? undefined : focus} as={Component} ref={ref} {...props}>
                <S.DateHeader data-day-date-heading>
                    <S.DateStamp data-day-date-stamp ref={stampRef} aria-hidden="true">{selectedDate.getDate()}<small>{selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}</small></S.DateStamp>
                    <span data-day-date-text ref={titleRef}>{formattedDate}</span>
                    <hr />
                    <DateActions>
                        <FocusPicker>
                            <span aria-hidden="true">{t.calendar.focusSection}</span>
                            <select aria-label={t.calendar.focusSection} value={focus} onChange={event => setFocus(event.target.value as DayView)}>
                                <option value="all">{t.calendar.allSections}</option>
                                <option value="todos">{t.home.tasks}</option>
                                <option value="timeline">{t.calendar.timeline}</option>
                                <option value="challenge">{t.popup.challenges}</option>
                                <option value="task">{t.calendar.temporaryTask}</option>
                                <option value="memo">{t.calendar.dailyMemo}</option>
                            </select>
                        </FocusPicker>
                        <CategoryFilter
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            onToggle={toggleCategory}
                            showProjects={showProjects}
                            onToggleProjects={onToggleProjects}
                        />
                    </DateActions>
                </S.DateHeader>

                {!mobileApp && timeMoveFeedback}
                <S.ContentLayout data-day-content ref={contentRef}>
                    {/* 그날의 일정 목록 — 폰에서는 달력 칸이 좁아 일정이 점으로만 찍히니 고치고 지우는 유일한 길이고,
                        데스크톱에서는 달력에서 날짜를 누르면 그날 할 일을 시간표 위에서 한눈에 본다. */}
                    <S.TodoCard data-day-todo-card data-calendar-panel="todos" data-collapsed={fold.todos || undefined} data-focus-hidden={hide("todos")}>
                        <S.SectionToggle type="button" $collapsed={fold.todos} aria-expanded={!fold.todos} onClick={() => toggleFold("todos")}>
                            <span className="chev"><ChevronDown size={14}/></span><span className="label">{t.home.tasks}</span>
                            {dayTodos.length > 0 && <span className="count">{dayTodos.length}</span>}
                        </S.SectionToggle>

                        {!fold.todos && (dayTodos.length > 0 ? (
                            <S.TodoList data-day-todo-list ref={todoListRef} tabIndex={keyboardList ? 0 : undefined}
                                role={keyboardList ? "region" : undefined}
                                aria-label={keyboardList ? `${t.home.tasks} · ${dayTodos.length}` : undefined}>
                                {dayTodos.map((todo) => {
                                    const color = todo.categoryId ? categoryColors.get(todo.categoryId) : undefined;
                                    // 고른 시간대의 시각 — 예전엔 이 기기 시각이라 시간대가 다르면 홈·시간표와 다른 시각이 섰다
                                    const start = todo.startAt ? wallTime(todo.startAt as string) : null;
                                    const time = todo.isAllDay || !start
                                        ? null
                                        : `${String(start.hour).padStart(2, "0")}:${String(start.minute).padStart(2, "0")}`;
                                    return (
                                        <S.TodoRow
                                            data-engraved-row={family === "celestial" ? "" : undefined}
                                            title={todo.title}
                                            data-day-todo-row
                                            key={todo.id}
                                            type="button"
                                            $isDone={!!todo.isDone}
                                            data-done={todo.isDone ? "" : undefined}
                                            onClick={(e) => showMenu(e, todo)}
                                        >
                                            {family === "celestial" ? <EngravedDayBar title={todo.title} time={time ?? t.todo.allDay} color={color} done={todo.isDone} selected={todo.id === selectedId}/> : <>
                                            <span className="dot" data-motion-mark="" style={color ? { backgroundColor: color } : undefined} />
                                            <span className="title">{todo.title}</span>
                                            <span className="time">{time ?? t.todo.allDay}</span>
                                            </>}
                                        </S.TodoRow>
                                    );
                                })}
                            </S.TodoList>
                        ) : (
                            <S.ChallengeEmpty data-day-empty>{t.home.noTodayTodos}</S.ChallengeEmpty>
                        ))}
                        {resize("todos")}
                    </S.TodoCard>

                    <S.TimelineSection ref={timeGridRef} data-calendar-panel="timeline" data-focus-hidden={hide("timeline")} aria-busy={timeMoveSaving}
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
                        {mobileApp && timeMoveFeedback}
                        {!fold.timeline && (
                        <>
                        <S.TimeDragHint title={timeDragHint}>{mobileApp ? t.interaction.timeDragHandleHint : t.interaction.timeDragLabel}</S.TimeDragHint>
                        <RulerScroll flagFor={(r) => `${Math.round(r * 23).toString().padStart(2, "0")}:00`}>
                            {hours.map((hour) => {
                                const hourSlots = Array.from({ length: 6 }, (_, slotIdx) => getSlotTodos(hour, slotIdx));
                                const { spans, lanes } = layoutHour(hourSlots);
                                return (
                                <S.TimeRow
                                    key={hour}
                                    style={{ '--day-slot-count': lanes } as React.CSSProperties}
                                    data-ruler-tick
                                    data-ruler-label={hour.toString().padStart(2, "0")}
                                    {...(hourSlots.some(todos => todos.length > 0)
                                        ? { "data-ruler-mark": "" }
                                        : {})}
                                >
                                    <div className="time-label">
                                        {hour.toString().padStart(2, '0')}:00
                                    </div>
                                    <div className="time-slots">
                                        <div className="slot-bar-container">
                                            {Array.from({ length: 6 }).map((_, slotIdx) => {
                                                const slotTodos = hourSlots[slotIdx];
                                                const hasTodo = slotTodos.length > 0;

                                                const prevSlotTodos = slotIdx > 0
                                                    ? hourSlots[slotIdx - 1]
                                                    : (hour > 0 ? getSlotTodos(hour - 1, 5) : []);

                                                const nextSlotTodos = slotIdx < 5
                                                    ? hourSlots[slotIdx + 1]
                                                    : (hour < 23 ? getSlotTodos(hour + 1, 0) : []);

                                                return (
                                                    <div
                                                        key={slotIdx}
                                                        data-day-slot={hour*6+slotIdx}
                                                        data-time-drop={timeDrag.drag?.target===String(hour*6+slotIdx)?'':undefined}
                                                        className={`slot-box ${hasTodo ? 'filled' : ''}`}
                                                        // 빈 칸을 누르면 그 시각에 새 일정 (예전엔 손가락 모양만 바뀌고 아무 일도 없었다)
                                                        onClick={hasTodo ? undefined : () => {if(!timeDrag.consumeClick())createAt(hour, slotIdx * 10);}}
                                                        title={hasTodo ? undefined : `${hour.toString().padStart(2, '0')}:${(slotIdx * 10).toString().padStart(2, '0')} · ${t.calendar.addTask}`}
                                                    >
                                                        {slotTodos.map(todo => {
                                                            const span = spans.get(todo.id)!;
                                                            const isContinuingPrev = prevSlotTodos.some(pt => pt.id === todo.id);
                                                            const isContinuingNext = nextSlotTodos.some(nt => nt.id === todo.id);

                                                            return (
                                                                <S.SlotTodoItem
                                                                    key={todo.id}
                                                                    style={{ gridRow: span.lane + 1, '--time-span': span.last - slotIdx + 1,
                                                                        '--time-category': todo.categoryId ? categoryColors.get(todo.categoryId) : undefined } as React.CSSProperties}
                                                                    data-short-time={span.last === slotIdx ? '' : undefined}
                                                                    title={todo.title}
                                                                    role={!isContinuingPrev?'button':undefined}
                                                                    tabIndex={!isContinuingPrev?0:-1}
                                                                    aria-hidden={isContinuingPrev||undefined}
                                                                    aria-label={!isContinuingPrev?`${todo.title} · ${timeDragHint}`:undefined}
                                                                    data-day-timed-task={todo.id}
                                                                    data-time-dragging={timeDrag.drag?.source.todo.id===todo.id?'':undefined}
                                                                    onPointerDown={e=>{
                                                                        e.stopPropagation();
                                                                        if(mobileApp&&e.pointerType==='touch'){timeDrag.consumeClick();return;}
                                                                        if(!timeMoveSaving)timeDrag.begin(e,{todo,slot:hour*6+slotIdx,y:e.clientY});
                                                                    }}
                                                                    onKeyDown={e=>{
                                                                        if(e.altKey&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();e.stopPropagation();void moveTime(todo,e.key==='ArrowUp'?-10:10);}
                                                                        else if(e.key==='Enter'||e.key===' '){e.preventDefault();showMenu(e,todo);}
                                                                    }}
                                                                    onClick={(e) => {e.stopPropagation();if(!timeDrag.consumeClick())showMenu(e, todo);}}
                                                                    $isContinuingPrev={isContinuingPrev}
                                                                    $isContinuingNext={isContinuingNext}
                                                                    $isDone={todo.isDone}
                                                                >
                                                                    {mobileApp && !isContinuingPrev && <span
                                                                            className="time-drag-handle"
                                                                            data-day-time-handle={todo.id}
                                                                            aria-hidden="true"
                                                                            title={t.interaction.timeDragHandleHint}
                                                                            onPointerDown={e=>{
                                                                                e.stopPropagation();
                                                                                if(!timeMoveSaving)timeDrag.begin(e,{todo,slot:hour*6+slotIdx,y:e.clientY},{immediateTouch:true});
                                                                            }}
                                                                            onClick={e=>{e.stopPropagation();timeDrag.consumeClick();}}
                                                                    ><GripVertical size={20} /></span>}
                                                                    {(!isContinuingPrev || slotIdx === 0) && (family === "celestial" ?
                                                                        <EngravedDayBar timed title={todo.title} done={todo.isDone} selected={selectedId === todo.id}
                                                                            color={todo.categoryId ? categoryColors.get(todo.categoryId) : undefined}
                                                                            handle={mobileApp && !isContinuingPrev} begins={!isContinuingPrev}
                                                                            ends={span.last < 5 || hour === 23 || !getSlotTodos(hour + 1, 0).some(next => next.id === todo.id)} />
                                                                        : <span className="todo-text">{todo.title}</span>)}
                                                                </S.SlotTodoItem>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </S.TimeRow>
                                );
                            })}
                        </RulerScroll>
                        </>
                        )}
                        {resize("timeline")}
                    </S.TimelineSection>


                    <S.SideSection
                        data-day-side data-focus-hidden={focus === "todos" || focus === "timeline" || undefined}
                        style={fold.timeline ? { flex: 1 } : { flex: 1 - mainSplit }}
                    >
                        {/* 오늘의 챌린지 — 여기서 바로 완료 처리 */}
                        <S.ChallengeCard data-calendar-panel="challenge" data-focus-hidden={hide("challenge")} $collapsed={fold.challenge}>
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
                                    <S.ChallengeList data-day-challenge-list ref={challengeListRef}>
                                        {dayChallenges.map(item => (
                                            <S.ChallengeItem key={item.id} $isDone={item.isDone} data-done={item.isDone ? "" : undefined}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.isDone}
                                                    onChange={() => toggleChallenge(item)}
                                                />
                                                <span className="box" data-motion-mark="">
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
                            {resize("challenge")}
                        </S.ChallengeCard>

                        <S.TaskCard data-calendar-panel="task" data-focus-hidden={hide("task")}
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
                                    <S.TaskList ref={taskListRef}>
                                        {tasks.map(task => (
                                            <S.TaskItem key={task.id} $isDone={task.isDone} data-done={task.isDone ? "" : undefined}>
                                                <button type="button" className="check-btn" data-motion-mark="" aria-label={`${task.isDone?t.interaction.undo:t.menu.done}: ${task.title}`} aria-pressed={task.isDone} onClick={() => toggleDailyTask(task)}>
                                                    {task.isDone && <Check size={14} strokeWidth={3}/>}
                                                </button>
                                                <span className="task-text">{task.title}</span>
                                                <button type="button" className="delete-btn" aria-label={`${t.menu.delete}: ${task.title}`} onClick={() => deleteDailyTask(task)}>
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
                                            aria-label={t.calendar.temporaryTask}
                                            // 한글 조합을 끝내는 Enter 로 폼이 넘어가면(사파리·맥) 마지막 글자가 칸에 남거나 두 번 들어간다 — 홈의 빠른 추가와 같게
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault();
                                            }}
                                        />
                                        <button type="submit" aria-label={t.calendar.addTask} disabled={!newTaskText.trim() || !memoReady}><Plus size={18} /></button>
                                    </S.TaskForm>
                                </>
                            )}
                            {resize("task")}
                        </S.TaskCard>


                        <S.MemoCard data-calendar-panel="memo" data-focus-hidden={hide("memo")}
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
                                        aria-label={t.calendar.dailyMemo}
                                        value={localMemo}
                                        readOnly={!memoReady}
                                        onChange={(e) => setLocalMemo(e.target.value)}
                                        onBlur={handleMemoBlur}
                                        placeholder={t.calendar.memoPlaceholder}
                                    />
                                    {!memoError && <div data-memo-status role="status" style={{fontSize:'.78rem',lineHeight:1.5,padding:'6px 10px',color:'inherit'}}>{memoSaveStatus==='saving'?t.account.saving:memoSaveStatus==='saved'?t.interaction.saved:memoSaveStatus==='dirty'?t.interaction.unsaved:t.interaction.autoSaveHint}</div>}
                                    {memoError && (
                                        <S.MemoError role="alert">
                                            {memoError}
                                            <button type="button" onClick={handleMemoBlur}>{t.calendar.retry}</button>
                                        </S.MemoError>
                                    )}
                                </>
                            )}
                            {resize("memo")}
                        </S.MemoCard>
                    </S.SideSection>
                </S.ContentLayout>
                {timeDrag.drag&&preview&&createPortal(<S.TimeDragPreview role="status" style={{left:Math.max(12,Math.min(timeDrag.drag.x+14,window.innerWidth-280)),top:Math.max(12,Math.min(timeDrag.drag.y+14,window.innerHeight-86))}}>
                    <strong>{timeDrag.drag.source.todo.title}</strong><span>{previewTime(preview.startAt)} — {previewTime(preview.endAt,localDateKey(preview.startAt)!==localDateKey(preview.endAt))}</span>
                </S.TimeDragPreview>,document.body)}

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
