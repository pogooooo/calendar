"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialTodoModal from "./celestial/CelestialTodoModal";
import { CategoryType } from "@/types/calendar";
import { TodoType } from "@/store/useTodoStore";

import useTodoStore from "@/store/useTodoStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";

export interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    todo?: TodoType | null;
    categories: CategoryType[];
    selectedDate?: Date;
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

    handleDateChange: (setter: (val: string) => void, currentValue: string, newValue: string) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    handleDelete: () => Promise<void>;
}

const getLocalDatetimeString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function TodoModal(props: TodoModalProps) {
    const { isOpen, onClose, todo, categories, selectedDate } = props;
    const theme = useTheme();
    const themeName = theme?.name || "celestial";

    const { addTodo, updateTodo, deleteTodo } = useTodoStore();
    const authFetch = useAuthFetch();

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

    const repeatEndOptions = [
        { value: 'never', label: '계속 반복 (종료 없음)' },
        { value: 'until', label: '특정 날짜에 종료' },
        { value: 'count', label: '특정 횟수만큼 반복' }
    ];

    const selectedRepeatEndLabel = repeatEndOptions.find(o => o.value === repeatEndType)?.label;

    React.useEffect(() => {
        if (isOpen) {
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
                setTitle("");
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
    }, [isOpen, todo, categories, selectedDate]);

    React.useEffect(() => {
        const closeDropdowns = () => {
            setIsCategoryOpen(false);
            setIsRepeatEndOpen(false);
        };
        window.addEventListener('click', closeDropdowns);
        return () => window.removeEventListener('click', closeDropdowns);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryId) {
            alert("카테고리를 선택해주세요.");
            return;
        }

        const todoData = {
            title,
            categoryId,
            memo,
            startAt: new Date(startAt).toISOString(),
            endAt: new Date(endAt).toISOString(),
            isAllDay,
            location,
            repeat,
            repeatEndDate: repeat > 0 && repeatEndType === 'until' && repeatEndDate ? new Date(repeatEndDate).toISOString() : null,
            repeatCount: repeat > 0 && repeatEndType === 'count' && repeatCount ? Number(repeatCount) : null,
        };

        if (todo) {
            await updateTodo(authFetch, todo.id, todoData);
        } else {
            await addTodo(authFetch, todoData);
        }

        onClose();
    };

    const handleDelete = async () => {
        if (todo && window.confirm("정말 삭제하시겠습니까?")) {
            await deleteTodo(authFetch, todo.id);
            onClose();
        }
    };

    const handleDateChange = (setter: (val: string) => void, currentValue: string, newValue: string) => {
        if (isAllDay) {
            setter(`${newValue}T${currentValue.slice(11, 16) || "00:00"}`);
        } else {
            setter(newValue);
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
        handleDateChange, handleSubmit, handleDelete
    };

    switch (themeName) {
        case "celestial":
            return <CelestialTodoModal {...themeProps} />;
        default:
            return <CelestialTodoModal {...themeProps} />;
    }
}