"use client";

import * as React from "react";
import { TodoModalProps } from "../TodoModal";
import useTodoStore from "@/store/useTodoStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import * as S from "./CelestialTodoModal.styles";
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import SecondaryButton from "@/components/button/secondary/SecondaryButton";

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
    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);

    const selectedCategory = categories.find(c => c.id === categoryId);

    React.useEffect(() => {
        if (isOpen) {
            if (todo) {
                setTitle(todo.title);
                setCategoryId(todo.categoryId);
                setMemo(todo.memo || "");
                setIsAllDay(todo.isAllDay || false);

                setStartAt(todo.startAt ? getLocalDatetimeString(new Date(todo.startAt)) : "");
                setEndAt(todo.endAt ? getLocalDatetimeString(new Date(todo.endAt)) : "");
            } else {
                setTitle("");
                setCategoryId(categories.length > 0 ? categories[0].id : "");
                setMemo("");
                setIsAllDay(false);

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

    // ✨ 날짜 입력 핸들러 (종일 모드일 때 기존 시간을 유지하면서 날짜만 바꾸는 로직)
    const handleDateChange = (setter: React.Dispatch<React.SetStateAction<string>>, currentValue: string, newValue: string) => {
        if (isAllDay) {
            // 종일일 경우 yyyy-mm-dd만 들어오므로, 뒤에 기존 시간(Thh:mm)을 붙여줌
            setter(`${newValue}T${currentValue.slice(11, 16) || "00:00"}`);
        } else {
            setter(newValue);
        }
    };

    return (
        <S.Overlay onClick={onClose}>
            <S.Container onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <S.Header>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={todo?.title || "새 할 일"}
                            required
                            className="title-input"
                        />
                        <button type="button" className="close-btn" onClick={onClose}>
                            <X size={30} />
                        </button>
                    </S.Header>

                    {/* ✨ 커스텀 카테고리 셀렉트 */}
                    <S.CategorySelect onClick={(e) => e.stopPropagation()}>
                        <S.SelectedCategory onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                            <div>
                                <S.ColorDot $color={selectedCategory?.color || "#e0e0e0"} />
                                <span className={!selectedCategory ? "placeholder" : ""}>
                                {selectedCategory ? selectedCategory.name : "카테고리를 선택해주세요"}
                                </span>
                            </div>
                            {isCategoryOpen ? (
                                <ChevronUp size={30} color="#888" />
                            ) : (
                                <ChevronDown size={30} color="#888" />
                            )}

                        </S.SelectedCategory>

                        {/* 드롭다운 메뉴 */}
                        {isCategoryOpen && (
                            <S.CategoryList>
                                {categories.map((cat) => (
                                    <S.CategoryItem
                                        key={cat.id}
                                        className="option-item"
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

                    <S.AllDay>
                        <span>하루 종일</span>

                        <S.ToggleSwitch>
                            <input
                                type="checkbox"
                                checked={isAllDay}
                                onChange={(e) => setIsAllDay(e.target.checked)}
                            />
                            <span className="slider"></span>
                        </S.ToggleSwitch>
                    </S.AllDay>

                    <S.DateRow>
                        <label>시작</label>
                        <input
                            type={isAllDay ? "date" : "datetime-local"}
                            value={isAllDay ? startAt.slice(0, 10) : startAt}
                            onChange={(e) => handleDateChange(setStartAt, startAt, e.target.value)}
                        />
                    </S.DateRow>

                    <S.DateRow>
                        <label>종료</label>
                        <input
                            type={isAllDay ? "date" : "datetime-local"}
                            value={isAllDay ? endAt.slice(0, 10) : endAt}
                            onChange={(e) => handleDateChange(setEndAt, endAt, e.target.value)}
                        />
                    </S.DateRow>

                    <S.MemoRow>
                        <label>메모</label>
                        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
                    </S.MemoRow>

                    <S.Footer>
                        {todo && (
                            <SecondaryButton type="button" onClick={handleDelete} $width="80px" $height="40px" $variant="danger">
                                삭제
                            </SecondaryButton>
                        )}

                        <SecondaryButton type="submit" $width="80px" $height="40px">
                            {todo ? "수정하기" : "저장하기"}
                        </SecondaryButton>
                    </S.Footer>
                </form>
            </S.Container>
        </S.Overlay>
    );
}