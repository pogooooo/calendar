"use client";

import * as React from "react";
import DayCalendarView from "./DayCalendarView";
import { CategoryType } from "@/store/useCategoryStore";
import { TodoType } from "@/store/useTodoStore";

import useDailyStore from "@/store/useDailyStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useExpandedTodos, ExpandedTodoType } from "@/hooks/useExpandedTodos";
import useProjectStore from "@/store/useProjectStore";
import { projectCalendarItems } from "@/lib/projectCalendar";
import { useProjectItemActions } from "@/hooks/useProjectItemActions";
import useChallengeStore from "@/store/useChallengeStore";
import useTodoStore from "@/store/useTodoStore";
import { useT } from "@/i18n/useT";
import { useDialog } from "@/components/dialog/DialogProvider";
import { localDateKey } from "@/lib/dateKey";
import { isBetween } from "@/utils/DateUtils";
import { completionKey, completionTargetFor, slotIndexOn } from "@/lib/challengeDays";
import { todayKey as labelKey } from "@/lib/localTime";

export interface CalendarTodoType extends ExpandedTodoType {
    isProject?: boolean;
    isProjectTask?: boolean;
    isDone?: boolean;
}

// contextMenu 는 div 의 HTML 속성 이름과 겹친다. 우리 뜻(열린 메뉴 상태)을 쓴다.
export interface DayProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'contextMenu'> {
    asChild?: boolean;
    selectedDate?: Date;
    todos?: TodoType[];
    categories?: CategoryType[];
}

export interface DayChallengeItem {
    id: string;
    challengeId: string;
    title: string;
    isDone: boolean;
}

export interface DayThemeProps {
    asChild?: boolean;
    formattedDate: string;
    /** 선택한 날짜에 해당하는 챌린지 (없으면 빈 배열) */
    dayChallenges: DayChallengeItem[];
    toggleChallenge: (item: DayChallengeItem) => void;
    hours: number[];
    getSlotTodos: (hour: number, slotIdx: number) => CalendarTodoType[]; // ✨ 타입 확장
    tasks: { id: string; title: string; isDone: boolean }[];
    newTaskText: string;
    setNewTaskText: (text: string) => void;
    handleAddTask: (e: React.FormEvent) => void;
    toggleDailyTask: (task: { id: string; title: string; isDone: boolean }) => void;
    deleteDailyTask: (task: { id: string; title: string; isDone: boolean }) => void;
    localMemo: string;
    setLocalMemo: (text: string) => void;
    handleMemoBlur: () => void;
    memoError: string | null;
    /** 이 날의 메모를 받아 왔는가 — 받기 전에는 칸을 읽기 전용으로 둔다(치던 글이 도착한 메모에 덮이거나 저장되지 않는다) */
    memoReady: boolean;

    categories: CategoryType[];
    selectedCategoryIds: string[];
    toggleCategory: (categoryId: string) => void;
    showProjects: boolean;
    onToggleProjects: () => void;

    /** 이 날에 걸린 일정들. 폰에서는 이 목록이 일정을 고치는 유일한 길이다. */
    dayTodos: CalendarTodoType[];
    selectedDate: Date;
    isModalOpen: boolean;
    modalTodo: TodoType | null;
    setIsModalOpen: (open: boolean) => void;
    contextMenu: { x: number; y: number; todo: CalendarTodoType } | null;
    setContextMenu: (menu: { x: number; y: number; todo: CalendarTodoType } | null) => void;
    openTodoMenu: (e: React.MouseEvent, todo: CalendarTodoType) => void;
    handleQuickEdit: (todo: CalendarTodoType) => void;
    handleQuickDelete: (todo: CalendarTodoType) => void;
    handleQuickDeleteOne: (todo: CalendarTodoType) => void;
    handleQuickToggle: (todo: CalendarTodoType) => void;
    /** 시간표의 빈 칸을 누르면 그 시각(10분 단위)에 새 일정 */
    createAt: (hour: number, minute: number) => void;
    /** 새 일정 창에 미리 채울 시각 (빈 칸을 눌러 열었을 때) */
    modalDate: Date;
}

const DayCalendar = React.forwardRef<HTMLDivElement, DayProps>(
    ({ asChild = false, selectedDate = new Date(), todos = [], categories = [], ...props }, ref) => {

        /**
         * 끈 카테고리를 기억한다 (켠 것이 아니라). 예전엔 카테고리가 처음 왔을 때 전부 켜 둔 목록을 들고 있어서,
         * 그 뒤에 생긴 카테고리(본 창에서 만든 것, 새로 공유받은 것)는 켜지지 않았다 — 늘 떠 있는 월간·주간 위젯에서
         * 새 카테고리의 일정이 다시 열 때까지 보이지 않았고, 다 끈 뒤 목록을 다시 받으면 도로 다 켜졌다
         */
        const [hiddenCategoryIds, setHiddenCategoryIds] = React.useState<string[]>([]);
        const selectedCategoryIds = React.useMemo(
            () => categories.filter(c => !hiddenCategoryIds.includes(c.id)).map(c => c.id),
            [categories, hiddenCategoryIds]
        );
        const [showProjects, setShowProjects] = React.useState(true);

        const { tasks, memo, memoDate, fetchDailyData, addDailyTask, toggleDailyTask, deleteDailyTask, updateDailyMemo } = useDailyStore();
        const { projects, fetchProjects } = useProjectStore();
        const { challenges, fetchChallenges, toggleChallengeCompletion } = useChallengeStore();
        const { deleteTodo, deleteTodoOccurrence, toggleTodo } = useTodoStore();
        const authFetch = useAuthFetch();
        const dialog = useDialog();
        const t = useT();

        const [newTaskText, setNewTaskText] = React.useState("");
        const [localMemo, setLocalMemo] = React.useState("");
        const [memoError, setMemoError] = React.useState<string | null>(null);

        /**
         * 일간 스토어는 한 날짜만 든다. 토큰이 갱신될 때마다(한 시간쯤) StoreInitializer 가 '오늘'을 다시 읽어서,
         * 다른 날을 보던 일간 머리 밑에 오늘 메모·임시 작업이 앉았고 — 거기서 메모를 고치면 오늘 메모가 이 날에 덮어써졌다.
         * 스토어가 이 날 것을 들고 있을 때만 보여 주고 저장하며, 다른 날 것이 앉으면 이 날 것을 다시 부른다.
         */
        const dayKey = localDateKey(selectedDate);
        const fresh = memoDate === dayKey;

        // 날짜가 바뀔 때는 그날 자료만. 프로젝트·챌린지는 날짜와 상관없으니 처음 한 번
        React.useEffect(() => {
            fetchDailyData(authFetch, selectedDate);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [selectedDate]);
        React.useEffect(() => {
            if (memoDate && memoDate !== dayKey) fetchDailyData(authFetch, selectedDate);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [memoDate, dayKey]);
        React.useEffect(() => {
            fetchProjects(authFetch);
            fetchChallenges(authFetch);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        /** 이 칸이 마지막으로 받은 서버 값과 날 */
        const memoBase = React.useRef<{ key: string; memo: string } | null>(null);
        /** 사용자가 쳐서 아직 저장하지 않은 글이 있는가 — 칸에 친 때만 켠다 (값을 견주면 다시 그리기 전의 낡은 값과 견주게 된다) */
        const memoDirty = React.useRef(false);
        const localMemoRef = React.useRef(localMemo);
        localMemoRef.current = localMemo;
        const memoErrorRef = React.useRef(memoError);
        memoErrorRef.current = memoError;
        const editMemo = React.useCallback((text: string) => {
            memoDirty.current = true;
            setLocalMemo(text);
        }, []);

        // 날을 넘길 때: 폰에서 쓸어 넘기면 칸이 초점을 잃지 않아(blur 가 없다) 적던 메모가 저장되지 않은 채 사라졌다 — 그 날에 마저 저장한다.
        // (아래 맞추기보다 먼저 돈다 — 새 날 것이 이미 와 있으면 그쪽이 비운 칸을 다시 채운다)
        const shownDay = React.useRef({ key: dayKey, date: selectedDate });
        React.useEffect(() => {
            const prev = shownDay.current;
            shownDay.current = { key: dayKey, date: selectedDate };
            if (prev.key === dayKey) return;
            const base = memoBase.current;
            if (base && base.key === prev.key && (memoDirty.current || memoErrorRef.current)) {
                void updateDailyMemo(authFetch, prev.date, localMemoRef.current);
            }
            memoDirty.current = false;
            // 새 날 것이 오기 전까지 지난 날 메모를 이 날 머리 밑에 두지 않는다
            setLocalMemo("");
            setMemoError(null);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [dayKey]);
        // 일간이 내려갈 때도 (폰의 월간·주간 전환, 위젯에서 연 길) 적던 메모를 그 날에 저장한다
        const authFetchRef = React.useRef(authFetch);
        authFetchRef.current = authFetch;
        React.useEffect(() => () => {
            const base = memoBase.current;
            const day = shownDay.current;
            if (base && base.key === day.key && (memoDirty.current || memoErrorRef.current)) {
                void useDailyStore.getState().updateDailyMemo(authFetchRef.current, day.date, localMemoRef.current);
            }
        }, []);

        React.useEffect(() => {
            if (!fresh) return;
            const base = memoBase.current;
            const next = memo || "";
            // 다른 날에서 넘어왔거나 손대지 않은 칸만 서버 값으로 맞춘다 — 다시 읽기가 치던 글을 덮지 않게
            if (!base || base.key !== dayKey || !memoDirty.current) {
                memoDirty.current = false;
                setLocalMemo(next);
            }
            memoBase.current = { key: dayKey, memo: next };
        }, [fresh, dayKey, memo]);

        const filteredTodos = React.useMemo(() => {
            const baseTodos = todos.filter(todo => selectedCategoryIds.includes(todo.categoryId));

            if (!showProjects) return baseTodos;

            const projectItems: TodoType[] = projectCalendarItems(projects, { categoryIds: selectedCategoryIds, marked: true })
                // 며칠에 걸친 할 일은 시간대에 놓지 않는다. 그 기간 매일 00~24시가 막대로 꽉 차서
                // 타임라인이 쓸모없어진다. 그런 건 위 "할 일" 목록에 '하루 종일' 로 선다.
                .map(item => item.isProjectTask && !item.isAllDay && localDateKey(item.startAt!) !== localDateKey(item.endAt!)
                    ? { ...item, isAllDay: true }
                    : item);

            return [...baseTodos, ...projectItems];
        }, [todos, projects, selectedCategoryIds, showProjects]);

        const expandedTodos = useExpandedTodos(filteredTodos, selectedDate, selectedDate) as CalendarTodoType[];

        // 선택한 날짜에 해당하는 챌린지 (월간·주간과 동일한 간격/목표횟수 규칙)
        const dayChallenges = React.useMemo<DayChallengeItem[]>(() => {
            const current = new Date(selectedDate);
            current.setHours(0, 0, 0, 0);
            // 칸·완료는 날짜 키로 센다 (src/lib/challengeDays.ts) — 월간 달력과 같은 까닭
            const currentStr = labelKey(current);

            return challenges.reduce<DayChallengeItem[]>((acc, challenge) => {
                if (!selectedCategoryIds.includes(challenge.categoryId)) return acc;
                if (slotIndexOn(challenge, currentStr) === null) return acc;

                const isDone = (challenge.completions ?? []).some(comp => completionKey(comp) === currentStr);

                acc.push({
                    id: `challenge-${challenge.id}-${current.getTime()}`,
                    challengeId: challenge.id,
                    title: challenge.title,
                    isDone,
                });
                return acc;
            }, []);
        }, [challenges, selectedCategoryIds, selectedDate]);

        const handleToggleChallenge = React.useCallback((item: DayChallengeItem) => {
            // 그날의 날짜 키를 정오(UTC)로 보낸다 — 서버·스토어가 그 UTC 날로 적는다
            toggleChallengeCompletion(authFetch, item.challengeId, completionTargetFor(labelKey(selectedDate)));
        }, [authFetch, selectedDate, toggleChallengeCompletion]);

        const handleAddTask = async (e: React.FormEvent) => {
            e.preventDefault();
            // 이 날 것을 받기 전에 넣으면 다른 날 목록 끝에 붙었다가, 이 날 것이 오면서 사라진다 — 받을 때까지 기다린다(글은 칸에 남는다)
            if (!newTaskText.trim() || !fresh) return;
            const text = newTaskText.trim();
            setNewTaskText("");
            const error = await addDailyTask(authFetch, selectedDate, text);
            if (error) setNewTaskText(value => value || text);
        };

        const handleMemoBlur = async () => {
            const base = memoBase.current;
            // 이 날 것을 받기 전에는 저장하지 않는다 — 다른 날 메모를 이 날에 덮어쓰게 된다
            if (!fresh || !base || base.key !== dayKey) return;
            // 저장이 실패했으면 같은 글이라도 다시 보낸다. 실패해도 스토어는 이 글을 들고 있어서
            // 예전엔 '바뀐 것 없음' 으로 보고 넘어갔다 — "다시 시도" 단추가 아무 일도 하지 않았다
            if (localMemo === base.memo && !memoError) { memoDirty.current = false; return; }
            memoDirty.current = false;
            const error = await updateDailyMemo(authFetch, selectedDate, localMemo);
            setMemoError(error);
        };

        const getSlotTodos = React.useCallback((hour: number, slotIdx: number) => {
            const slotStart = new Date(selectedDate);
            slotStart.setHours(hour, slotIdx * 10, 0, 0);

            const slotEnd = new Date(selectedDate);
            slotEnd.setHours(hour, slotIdx * 10 + 9, 59, 999);

            return expandedTodos.filter(todo => {
                if (todo.isAllDay || !todo.startAt || !todo.endAt) return false;
                const start = new Date(todo.startAt as string | number | Date).getTime();
                const end = new Date(todo.endAt as string | number | Date).getTime();
                // 끝 시각은 칸에 들지 않는다 — 예전엔 19:00~20:00 일정이 20:00 칸까지 칠했다(모든 일정이 10분 길게).
                // 길이가 0 인 일정은 시작 칸 하나를 칠한다
                const last = end > start ? end - 1 : end;
                return start <= slotEnd.getTime() && last >= slotStart.getTime();
            });
        }, [expandedTodos, selectedDate]);

        const hours = Array.from({ length: 24 }, (_, i) => i);
        const formattedDate = t.calendar.dayTitle(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate());

        /* ── 이 날의 일정 목록 ────────────────────────────────────────────
           폰에서는 달력 칸이 48px 라 일정이 6px 짜리 마름모로만 찍힌다.
           고치거나 지우려면 집을 수 있는 목록이 있어야 한다. */
        const dayTodos = React.useMemo(() => {
            const at = (v: unknown) => new Date(v as string | number | Date).getTime();
            // useExpandedTodos 는 반복 없는 일정을 창(window)과 무관하게 전부 돌려준다.
            // 여기서 이 날에 걸리는 것만 골라내지 않으면 남의 날 일정까지 목록에 선다.
            return expandedTodos
                .filter(todo => isBetween(selectedDate, todo.startAt, todo.endAt))
                .sort((a, b) => {
                    if (!!a.isAllDay !== !!b.isAllDay) return a.isAllDay ? -1 : 1;
                    return at(a.startAt) - at(b.startAt);
                });
        }, [expandedTodos, selectedDate]);

        const [isModalOpen, setIsModalOpen] = React.useState(false);
        const [modalTodo, setModalTodo] = React.useState<TodoType | null>(null);
        const [contextMenu, setContextMenu] =
            React.useState<{ x: number; y: number; todo: CalendarTodoType } | null>(null);

        const openTodoMenu = (e: React.MouseEvent, todo: CalendarTodoType) => {
            e.preventDefault();
            e.stopPropagation();
            const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setContextMenu({ x: box.left + box.width / 2, y: box.bottom, todo });
        };

        const isForeign = (todo: CalendarTodoType) => !!todo.isProject || !!todo.isProjectTask;

        // 시간표의 빈 칸을 눌러 그 시각에 바로 일정을 넣는다 (한 시간짜리로 시작)
        const [createDate, setCreateDate] = React.useState<Date | null>(null);
        const createAt = (hour: number, minute: number) => {
            const d = new Date(selectedDate);
            d.setHours(hour, minute, 0, 0);
            setContextMenu(null);
            setModalTodo(null);
            setCreateDate(d);
            setIsModalOpen(true);
        };
        // 프로젝트·프로젝트 할 일도 여기서 바로 고치고 끝낸다 (예전엔 "프로젝트 화면에서" 안내만)
        const projectActions = useProjectItemActions();

        const handleQuickEdit = async (todo: CalendarTodoType) => {
            setContextMenu(null);
            if (isForeign(todo)) {
                projectActions.open(todo);
                return;
            }
            setModalTodo(todo.originalTodo || (todo as unknown as TodoType));
            setIsModalOpen(true);
        };

        const handleQuickDelete = async (todo: CalendarTodoType) => {
            setContextMenu(null);
            if (isForeign(todo)) {
                await projectActions.remove(todo);
                return;
            }
            const ok = await dialog.confirmDanger({
                title: t.alert.deleteTodoTitle,
                message: (todo.originalTodo?.repeat ?? todo.repeat ?? 0) > 0 ? t.alert.deleteTodoMsg : t.alert.deleteTodoOnceMsg,
            });
            if (!ok) return;
            const error = await deleteTodo(authFetch, todo.originalTodo?.id || todo.id);
            if (error) await dialog.notify({ title: t.alert.deleteFailed, message: error });
        };

        const handleQuickDeleteOne = async (todo: CalendarTodoType) => {
            setContextMenu(null);
            if (isForeign(todo)) { await projectActions.remove(todo); return; }
            const ok = await dialog.confirm({
                title: t.alert.deleteOneDayTitle,
                message: t.alert.deleteOneDayMsg,
                confirmLabel: t.dialog.delete,
            });
            if (!ok) return;
            // 완료·삭제 기록은 그 회차의 날짜에 붙는다. 보고 있는 날이 아니다.
            const occurrence = todo.date ?? new Date(todo.startAt || Date.now());
            await deleteTodoOccurrence(authFetch, todo.originalTodo?.id || todo.id, localDateKey(occurrence));
        };

        const handleQuickToggle = async (todo: CalendarTodoType) => {
            setContextMenu(null);
            if (isForeign(todo)) {
                await projectActions.toggle(todo);
                return;
            }
            const occurrence = todo.date ?? new Date(todo.startAt || Date.now());
            await toggleTodo(authFetch, todo.originalTodo?.id || todo.id, occurrence.toISOString());
        };

        const handleToggleTask = (task: { id: string; title: string; isDone: boolean }) => toggleDailyTask(authFetch, task.id);
        const handleDeleteTask = (task: { id: string; title: string; isDone: boolean }) => deleteDailyTask(authFetch, task.id);

        // 서버가 title 로 주는 판과 text 로 주는 판이 섞여 있어 둘 다 받는다.
        const mappedTasks = (fresh ? tasks : []).map((t: { id: string; title?: string; text?: string; isDone: boolean }) => ({
            id: t.id,
            title: t.title || t.text || "",
            isDone: t.isDone
        }));

        const toggleCategory = (categoryId: string) => {
            setHiddenCategoryIds(prev =>
                prev.includes(categoryId)
                    ? prev.filter(id => id !== categoryId)
                    : [...prev, categoryId]
            );
        };

        const themeProps: DayThemeProps = {
            asChild,
            formattedDate,
            dayChallenges,
            toggleChallenge: handleToggleChallenge,
            hours,
            getSlotTodos,
            tasks: mappedTasks,
            newTaskText,
            setNewTaskText,
            handleAddTask,
            toggleDailyTask: handleToggleTask,
            deleteDailyTask: handleDeleteTask,
            localMemo,
            setLocalMemo: editMemo,
            handleMemoBlur,
            memoError,
            memoReady: fresh,
            categories,
            selectedCategoryIds,
            toggleCategory,
            showProjects,
            onToggleProjects: () => setShowProjects(prev => !prev),

            dayTodos,
            selectedDate,
            isModalOpen,
            modalTodo,
            setIsModalOpen: (open: boolean) => { setIsModalOpen(open); if (!open) setCreateDate(null); },
            createAt,
            modalDate: createDate ?? selectedDate,
            contextMenu,
            setContextMenu,
            openTodoMenu,
            handleQuickEdit,
            handleQuickDelete,
            handleQuickDeleteOne,
            handleQuickToggle,
        };

        return (
            <>
                <DayCalendarView ref={ref} {...themeProps} {...props} />
                {projectActions.editor}
            </>
        );
    }
);

DayCalendar.displayName = "DayCalendar";

export default DayCalendar;
