"use client";

import * as React from "react";
import styled from "styled-components";
import { TodoModalProps } from "../TodoModal";
import useTodoStore from "@/store/todo/useTodoStore";
import useAuthStore from "@/store/auth/useAuthStore";

export default function CelestialTodoModal({ isOpen, onClose, todo, categories, selectedDate }: TodoModalProps) {
    const { addTodo, updateTodo, deleteTodo } = useTodoStore();
    const accessToken = useAuthStore((state) => state.accessToken);

    // Store에서 요구하는 authFetch 헬퍼 함수 구성
    const authFetch = React.useCallback(async (url: string, init?: RequestInit) => {
        return fetch(url, {
            ...init,
            headers: {
                ...init?.headers,
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }, [accessToken]);

    // 폼 상태 관리
    const [title, setTitle] = React.useState("");
    const [categoryId, setCategoryId] = React.useState("");
    const [memo, setMemo] = React.useState("");
    const [startAt, setStartAt] = React.useState("");
    const [endAt, setEndAt] = React.useState("");

    // 모달이 열리거나 todo/카테고리가 바뀔 때 초기값 세팅
    React.useEffect(() => {
        if (isOpen) {
            if (todo) {
                // 수정 모드
                setTitle(todo.title);
                setCategoryId(todo.categoryId);
                setMemo(todo.memo || "");
                setStartAt(todo.startAt ? new Date(todo.startAt).toISOString().slice(0, 16) : "");
                setEndAt(todo.endAt ? new Date(todo.endAt).toISOString().slice(0, 16) : "");
            } else {
                // 생성 모드
                setTitle("");
                setCategoryId(categories.length > 0 ? categories[0].id : "");
                setMemo("");
                const defaultDate = selectedDate ? new Date(selectedDate) : new Date();
                setStartAt(defaultDate.toISOString().slice(0, 16));

                // 기본 종료시간은 시작시간 + 1시간으로 세팅
                const defaultEndDate = new Date(defaultDate);
                defaultEndDate.setHours(defaultEndDate.getHours() + 1);
                setEndAt(defaultEndDate.toISOString().slice(0, 16));
            }
        }
    }, [isOpen, todo, categories, selectedDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const todoData = {
            title,
            categoryId,
            memo,
            startAt: new Date(startAt).toISOString(),
            endAt: new Date(endAt).toISOString(),
            isAllDay: false, // 필요시 UI에 추가
        };

        if (todo) {
            // 수정
            await updateTodo(authFetch, todo.id, todoData);
        } else {
            // 생성
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

    return (
        <S.Overlay onClick={onClose}>
            <S.Container onClick={(e) => e.stopPropagation()}>
                <S.Header>
                    <h2>{todo ? "할 일 수정" : "새 할 일"}</h2>
                    <button type="button" onClick={onClose}>X</button>
                </S.Header>

                <S.Form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>제목</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label>카테고리</label>
                        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                            <option value="">선택해주세요</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>시작</label>
                        <input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>종료</label>
                        <input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>메모</label>
                        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} />
                    </div>

                    <S.Footer>
                        {todo && (
                            <button type="button" className="delete-btn" onClick={handleDelete}>
                                삭제
                            </button>
                        )}
                        <button type="submit" className="submit-btn">
                            {todo ? "수정하기" : "저장하기"}
                        </button>
                    </S.Footer>
                </S.Form>
            </S.Container>
        </S.Overlay>
    );
}

// --- Minimal Styled Components ---

const S = {
    Overlay: styled.div`
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
    `,
    Container: styled.div`
        background-color: #fff;
        width: 400px;
        max-width: 90%;
        border-radius: 8px;
        padding: 20px;
        display: flex;
        flex-direction: column;
    `,
    Header: styled.div`
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    `,
    Form: styled.form`
        display: flex;
        flex-direction: column;
        gap: 15px;

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        input, select, textarea {
            padding: 8px;
        }
    `,
    Footer: styled.div`
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
    `
};