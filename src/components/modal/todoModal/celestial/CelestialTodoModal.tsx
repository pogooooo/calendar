"use client";

import * as React from "react";
import { TodoModalProps } from "../TodoModal";
import useTodoStore from "@/store/useTodoStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import * as S from "./CelestialTodoModal.styles";
import { X, ChevronDown, ChevronUp, MapPin, Repeat, AlignLeft, Clock } from 'lucide-react';
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";

const getLocalDatetimeString = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function CelestialTodoModal({ isOpen, onClose, todo, categories, selectedDate }: TodoModalProps) {
    const { addTodo, updateTodo, deleteTodo } = useTodoStore();
    const authFetch = useAuthFetch();

    const [title, setTitle] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [memo, setMemo] = React.useState("");
    const [startAt, setStartAt] = React.useState("");
    const [endAt, setEndAt] = React.useState("");
    const [isAllDay, setIsAllDay] = React.useState(false);

    // ✨ 새로 추가된 상태: 장소와 반복
    const [location, setLocation] = React.useState("");
    const [repeat, setRepeat] = React.useState<number>(0);

    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);

    const selectedCategory = categories.find(c => c.id === categoryId);

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
            } else {
                setTitle("");
                setCategoryId(categories.length > 0 ? categories[0].id : "");
                setMemo("");
                setIsAllDay(false);
                setLocation("");
                setRepeat(0);

                const defaultDate = selectedDate ? new Date(selectedDate) : new Date();
                setStartAt(getLocalDatetimeString(defaultDate));

                const defaultEndDate = new Date(defaultDate.getTime() + 60 * 60 * 1000);
                setEndAt(getLocalDatetimeString(defaultEndDate));
            }
        }
    }, [isOpen, todo, categories, selectedDate]);

    React.useEffect(() => {
        const closeDropdown = () => setIsCategoryOpen(false);
        if (isCategoryOpen) {
            window.addEventListener('click', closeDropdown);
        }
        return () => window.removeEventListener('click', closeDropdown);
    }, [isCategoryOpen]);

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

    const handleDateChange = (setter: React.Dispatch<React.SetStateAction<string>>, currentValue: string, newValue: string) => {
        if (isAllDay) {
            setter(`${newValue}T${currentValue.slice(11, 16) || "00:00"}`);
        } else {
            setter(newValue);
        }
    };

    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="450px">
            <S.FormWrapper onSubmit={handleSubmit}>
                <S.Header>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={todo?.title || "새로운 할 일"}
                        required
                        className="title-input"
                        autoFocus
                    />
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X size={26} />
                    </button>
                </S.Header>

                <S.ScrollBody>
                    <S.CategorySelect onClick={(e) => e.stopPropagation()}>
                        <S.SelectedCategory onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                            <div>
                                <S.ColorDot $color={selectedCategory?.color || "#e0e0e0"} />
                                <span className={!selectedCategory ? "placeholder" : ""}>
                                    {selectedCategory ? selectedCategory.name : "카테고리 선택"}
                                </span>
                            </div>
                            {isCategoryOpen ? <ChevronUp size={20} color="#888" /> : <ChevronDown size={20} color="#888" />}
                        </S.SelectedCategory>

                        {isCategoryOpen && (
                            <S.CategoryList>
                                {categories.map((cat) => (
                                    <S.CategoryItem
                                        key={cat.id}
                                        onClick={() => {
                                            setCategoryId(cat.id);
                                            setIsCategoryOpen(false);
                                        }}
                                    >
                                        <S.ColorDot $color={cat.color} />
                                        <span>{cat.name}</span>
                                    </S.CategoryItem>
                                ))}
                            </S.CategoryList>
                        )}
                    </S.CategorySelect>

                    <S.FieldRow>
                        <label><Clock size={16} /> 하루 종일</label>
                        <S.ToggleSwitch>
                            <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} />
                            <span className="slider"></span>
                        </S.ToggleSwitch>
                    </S.FieldRow>

                    <S.FieldRow>
                        <label>시작</label>
                        <input
                            type={isAllDay ? "date" : "datetime-local"}
                            value={isAllDay ? startAt.slice(0, 10) : startAt}
                            onChange={(e) => handleDateChange(setStartAt, startAt, e.target.value)}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <label>종료</label>
                        <input
                            type={isAllDay ? "date" : "datetime-local"}
                            value={isAllDay ? endAt.slice(0, 10) : endAt}
                            onChange={(e) => handleDateChange(setEndAt, endAt, e.target.value)}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <label><MapPin size={16} /> 장소</label>
                        <input
                            type="text"
                            placeholder="장소를 입력하세요"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </S.FieldRow>

                    <S.FieldRow>
                        <label><Repeat size={16} /> 반복</label>
                        <div className="repeat-input-wrapper">
                            <input
                                type="number"
                                min="0"
                                value={repeat === 0 ? "" : repeat}
                                onChange={(e) => setRepeat(Number(e.target.value))}
                                placeholder="0"
                            />
                            <span>일마다</span>
                        </div>
                    </S.FieldRow>

                    <S.MemoRow>
                        <label><AlignLeft size={16} /> 메모</label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="추가적인 설명이나 메모를 남겨보세요."
                        />
                    </S.MemoRow>
                </S.ScrollBody>

                <S.Footer>
                    {todo && (
                        <SecondaryButton type="button" onClick={handleDelete} $width="70px" $height="40px" $variant="danger">
                            삭제
                        </SecondaryButton>
                    )}
                    <SecondaryButton type="submit" $width="90px" $height="40px">
                        {todo ? "수정하기" : "저장하기"}
                    </SecondaryButton>
                </S.Footer>
            </S.FormWrapper>
        </CelestialBaseModal>
    );
}