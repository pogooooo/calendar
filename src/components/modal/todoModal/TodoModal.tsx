"use client";

import * as React from "react";
import TodoModalView from "./TodoModalView";
import { CategoryType } from "@/types/calendar";
import { TodoType } from "@/store/useTodoStore";

import useTodoStore from "@/store/useTodoStore";
import useProjectStore from "@/store/useProjectStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { useT } from "@/i18n/useT";
import { useDialog } from "@/components/dialog/DialogProvider";

export interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    todo?: TodoType | null;
    categories: CategoryType[];
    selectedDate?: Date;
    /** 새로 만들 때 제목을 미리 채운다 (홈의 빠른 추가에서 "자세히" 로 넘어올 때) */
    initialTitle?: string;
    /** 저장이 끝났을 때 (onClose 앞에). 그냥 닫은 것과 가려야 하는 곳(홈의 빠른 추가 칸)이 쓴다 */
    onSaved?: () => void;
}

export interface TodoModalThemeProps extends TodoModalProps {
    title: string;
    setTitle: (title: string) => void;
    categoryId: string;
    setCategoryId: (id: string) => void;
    memo: string;
    setMemo: (memo: string) => void;
    startAt: string;
    setStartAt: (date: string) => void;
    endAt: string;
    setEndAt: (date: string) => void;
    isAllDay: boolean;
    setIsAllDay: (isAllDay: boolean) => void;
    location: string;
    setLocation: (loc: string) => void;
    repeat: number;
    setRepeat: (repeat: number) => void;
    repeatEndType: 'never' | 'until' | 'count';
    setRepeatEndType: (type: 'never' | 'until' | 'count') => void;
    repeatEndDate: string;
    setRepeatEndDate: (date: string) => void;
    repeatCount: number | "";
    setRepeatCount: (count: number | "") => void;

    isCategoryOpen: boolean;
    setIsCategoryOpen: (isOpen: boolean) => void;
    isRepeatEndOpen: boolean;
    setIsRepeatEndOpen: (isOpen: boolean) => void;

    selectedCategory: CategoryType | undefined;
    repeatEndOptions: { value: string; label: string }[];
    selectedRepeatEndLabel: string | undefined;

    /** 새로 만들 때 그 카테고리의 프로젝트에 할 일로 넣을 수 있다. "" 면 보통 일정 */
    projectId: string;
    setProjectId: (id: string) => void;
    projectOptions: { value: string; label: string }[];

    handleDateChange: (setter: (val: string) => void, currentValue: string, newValue: string) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleDelete: () => Promise<void>;
}

const getLocalDatetimeString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function TodoModal(props: TodoModalProps) {
    const { isOpen, onClose, todo, categories, selectedDate, initialTitle } = props;
    const t = useT();

    const { addTodo, updateTodo, deleteTodo } = useTodoStore();
    const projects = useProjectStore((s) => s.projects);
    const fetchProjects = useProjectStore((s) => s.fetchProjects);
    const addProjectTask = useProjectStore((s) => s.addProjectTask);
    const [projectId, setProjectId] = React.useState("");
    const authFetch = useAuthFetch();
    const dialog = useDialog();

    const [title, setTitle] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [memo, setMemo] = React.useState("");
    const [startAt, setStartAt] = React.useState("");
    const [endAt, setEndAt] = React.useState("");
    const [isAllDay, setIsAllDay] = React.useState(false);
    const [location, setLocation] = React.useState("");

    const [repeat, setRepeat] = React.useState<number>(0);
    const [repeatEndType, setRepeatEndType] = React.useState<'never' | 'until' | 'count'>('never');
    const [repeatEndDate, setRepeatEndDate] = React.useState("");
    const [repeatCount, setRepeatCount] = React.useState<number | "">("");

    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
    const [isRepeatEndOpen, setIsRepeatEndOpen] = React.useState(false);

    const selectedCategory = categories.find(c => c.id === categoryId);

    // 고른 카테고리의 아직 안 끝난 프로젝트들 — 여기서 고르면 일정 대신 그 프로젝트의 할 일로 들어간다
    const projectOptions = React.useMemo(
        () => projects.filter(p => p.categoryId === categoryId && p.status !== "done").map(p => ({ value: p.id, label: p.title })),
        [projects, categoryId],
    );
    // 카테고리를 바꿔 그 프로젝트가 목록에서 빠지면 고른 것도 푼다
    React.useEffect(() => {
        if (projectId && !projectOptions.some(o => o.value === projectId)) setProjectId("");
    }, [projectOptions, projectId]);
    // 프로젝트를 한 번도 안 읽은 화면(홈 등)에서 열어도 고를 수 있게
    React.useEffect(() => {
        if (isOpen && !todo && projects.length === 0) void fetchProjects(authFetch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, todo]);

    const repeatEndOptions = [
        { value: 'never', label: t.todo.repeatEndNever },
        { value: 'until', label: t.todo.repeatEndUntil },
        { value: 'count', label: t.todo.repeatEndCount },
    ];

    const selectedRepeatEndLabel = repeatEndOptions.find(o => o.value === repeatEndType)?.label;

    /**
     * 칸을 채우는 것은 창이 열릴 때(그리고 열린 채 다른 일정으로 바뀔 때)뿐이다.
     * 예전엔 categories·selectedDate·todo 의 "참조"가 바뀔 때마다 다시 채웠다 — 토큰 갱신·위젯 동기화·안드로이드 위젯 폴링으로
     * 카테고리를 다시 읽기만 해도 치던 제목이 지워졌다(데스크톱·앱에서 "제목 입력이 안 된다").
     */
    const initKey = isOpen ? `${todo?.id ?? "new"}|${selectedDate ? new Date(selectedDate).getTime() : ""}` : null;
    const initDone = React.useRef<string | null>(null);
    React.useEffect(() => {
        if (!initKey) { initDone.current = null; return; }
        if (initDone.current === initKey) return;
        initDone.current = initKey;
        {
            if (todo) {
                setTitle(todo.title);
                setCategoryId(todo.categoryId);
                setMemo(todo.memo || "");
                setIsAllDay(todo.isAllDay || false);
                setLocation(todo.location || "");
                setRepeat(todo.repeat || 0);

                setStartAt(todo.startAt ? getLocalDatetimeString(new Date(todo.startAt)) : "");
                setEndAt(todo.endAt ? getLocalDatetimeString(new Date(todo.endAt)) : "");

                if (todo.repeatCount) {
                    setRepeatEndType('count');
                    setRepeatCount(todo.repeatCount);
                    setRepeatEndDate("");
                } else if (todo.repeatEndDate) {
                    setRepeatEndType('until');
                    setRepeatEndDate(getLocalDatetimeString(new Date(todo.repeatEndDate)).slice(0, 10));
                    setRepeatCount("");
                } else {
                    setRepeatEndType('never');
                    setRepeatCount("");
                    setRepeatEndDate("");
                }
            } else {
                setProjectId("");
                setTitle(initialTitle ?? "");
                setCategoryId(categories.length > 0 ? categories[0].id : "");
                setMemo("");
                setIsAllDay(false);
                setLocation("");
                setRepeat(0);
                setRepeatEndType('never');
                setRepeatCount("");
                setRepeatEndDate("");

                const defaultDate = selectedDate ? new Date(selectedDate) : new Date();
                setStartAt(getLocalDatetimeString(defaultDate));
                const defaultEndDate = new Date(defaultDate.getTime() + 60 * 60 * 1000);
                setEndAt(getLocalDatetimeString(defaultEndDate));
            }
        }
    // 열릴 때의 값만 읽는다 — 나머지가 바뀌어도 사용자가 고치던 칸을 덮지 않는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initKey]);

    // 카테고리가 창이 열린 뒤에 도착하면 빈 자리만 채운다 (다른 칸은 그대로)
    React.useEffect(() => {
        if (isOpen && !categoryId && categories.length > 0) setCategoryId(categories[0].id);
    }, [isOpen, categoryId, categories]);

    React.useEffect(() => {
        const closeDropdowns = () => {
            setIsCategoryOpen(false);
            setIsRepeatEndOpen(false);
        };
        window.addEventListener('click', closeDropdowns);
        return () => window.removeEventListener('click', closeDropdowns);
    }, []);

    // 저장 단추를 두 번 누르면(느린 망에서 흔하다) 같은 일정이 두 개 생겼다 — 저장하는 동안은 다시 받지 않는다
    const submitting = React.useRef(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        try {
            await submit();
        } finally {
            submitting.current = false;
        }
    };

    const submit = async () => {
        if (!categoryId) {
            await dialog.notify({ title: t.todo.selectCategoryAlert });
            return;
        }

        const start = new Date(startAt);
        const end = new Date(endAt);
        // 끝이 시작보다 앞서면 (끝 고르개의 "지금"·시계로 쉽게 생긴다) 달력·시간표 어디에도 서지 않아 고칠 길도 없어졌다.
        // 하루 종일은 날짜만 본다 — 시각은 화면에 없으니
        const inverted = isAllDay ? endAt.slice(0, 10) < startAt.slice(0, 10) : end.getTime() < start.getTime();
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || inverted) {
            await dialog.notify({ title: t.form.timeCheckTitle, message: t.form.timeCheckMsg });
            return;
        }

        // 프로젝트 할 일로 넣기 — 반복·장소는 없다. 하루 종일이면 그날 0시 ~ 23:59 로 맞춘다 (프로젝트 할 일의 약속)
        if (!todo && projectId) {
            const dayStart = new Date(start); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(end); dayEnd.setHours(23, 59, 0, 0);
            const error = await addProjectTask(authFetch, projectId, {
                title,
                description: memo || null,
                status: "todo",
                priority: "medium",
                startAt: (isAllDay ? dayStart : start).toISOString(),
                endAt: (isAllDay ? dayEnd : end).toISOString(),
                isAllDay,
            });
            if (error) {
                await dialog.notify({ title: t.alert.saveFailed, message: error });
                return;
            }
            props.onSaved?.();
            onClose();
            return;
        }

        const safeRepeat = Number.isFinite(repeat) && repeat > 0 ? Math.floor(repeat) : 0;

        const todoData = {
            title,
            categoryId,
            memo,
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            isAllDay,
            location,
            repeat: safeRepeat,
            // "YYYY-MM-DD" 를 new Date 로 읽으면 UTC 0시가 된다 — 서쪽(UTC-) 시간대에서는 그게 전날이라 반복이 하루 일찍 끝나고,
            // 다시 열면 전날로 보여 저장할 때마다 하루씩 당겨졌다. 이 기기의 그날 0시로 둔다(읽는 쪽도 이 기기의 날로 읽는다)
            repeatEndDate: safeRepeat > 0 && repeatEndType === 'until' && repeatEndDate ? new Date(`${repeatEndDate.slice(0, 10)}T00:00`).toISOString() : null,
            repeatCount: safeRepeat > 0 && repeatEndType === 'count' && repeatCount ? Number(repeatCount) : null,
        };

        const errorMessage = todo
            ? await updateTodo(authFetch, todo.id, todoData)
            : await addTodo(authFetch, todoData);

        if (errorMessage) {
            await dialog.notify({ title: t.alert.saveFailed, message: errorMessage });
            return;
        }

        props.onSaved?.();
        onClose();
    };

    const handleDelete = async () => {
        if (!todo) return;
        const ok = await dialog.confirmDanger({
            title: t.todo.deleteConfirm,
            message: todo.title,
        });
        if (!ok) return;
        const error = await deleteTodo(authFetch, todo.id);
        if (error) { await dialog.notify({ title: t.alert.deleteFailed, message: error }); return; }
        onClose();
    };

    const handleDateChange = (setter: (val: string) => void, currentValue: string, newValue: string) => {
        const composed = isAllDay
            ? `${newValue}T${currentValue.slice(11, 16) || "00:00"}`
            : newValue;

        setter(composed);

        // 시작을 옮기면 종료도 같은 길이만큼 따라간다 (새 일정은 1시간짜리라 1시간 뒤).
        // 예전엔 늘 1시간 뒤(종일은 같은 날)로 다시 맞춰서, 며칠짜리 일정의 시작 시각만 고쳐도 끝 날짜가 시작 날로 당겨졌다
        if (setter === setStartAt && composed) {
            const start = new Date(composed);
            if (!isNaN(start.getTime())) {
                const length = new Date(endAt).getTime() - new Date(startAt).getTime();
                const end = Number.isFinite(length) && length >= 0
                    ? new Date(start.getTime() + length)
                    : isAllDay ? start : new Date(start.getTime() + 60 * 60 * 1000);
                setEndAt(getLocalDatetimeString(end));
            }
        }
    };

    if (!isOpen) return null;

    const themeProps: TodoModalThemeProps = {
        ...props,
        title, setTitle,
        categoryId, setCategoryId,
        memo, setMemo,
        startAt, setStartAt,
        endAt, setEndAt,
        isAllDay, setIsAllDay,
        location, setLocation,
        repeat, setRepeat,
        repeatEndType, setRepeatEndType,
        repeatEndDate, setRepeatEndDate,
        repeatCount, setRepeatCount,
        isCategoryOpen, setIsCategoryOpen,
        isRepeatEndOpen, setIsRepeatEndOpen,
        selectedCategory, repeatEndOptions, selectedRepeatEndLabel,
        projectId, setProjectId, projectOptions,
        handleDateChange, handleSubmit, handleDelete
    };

    return <TodoModalView {...themeProps} />;
}
