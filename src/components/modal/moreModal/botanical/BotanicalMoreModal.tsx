"use client";

import * as React from "react";
import { MoreModalProps } from "../MoreModal";
import * as S from "./BotanicalMoreModal.styles";
import { X } from 'lucide-react';
import BotanicalBaseModal from "@/components/modal/baseModal/botanical/BotanicalBaseModal";
import { isBetween } from "@/utils/DateUtils";

export default function BotanicalMoreModal({
    isOpen,
    onClose,
    date,
    todos,
    categories,
    handleContextMenu
}: MoreModalProps) {

    if (!date) return null;

    const dayTodos = todos.filter(todo => isBetween(date, todo.startAt, todo.endAt));
    const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

    return (
        <BotanicalBaseModal isOpen={isOpen} onClose={onClose} maxWidth="360px">
            <S.ContentWrapper>
                <S.Header>
                    <span className="title-text">{formattedDate} 일정</span>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X size={22} />
                    </button>
                </S.Header>

                <S.ScrollBody>
                    <S.TodoList>
                        {dayTodos.map((todo) => {
                            const category = categories.find(c => c.id === todo.categoryId);
                            const dateStr = date.toISOString().split('T')[0];
                            const isDone = (todo.completions ?? []).some(c =>
                                new Date(c.targetDate).toISOString().split('T')[0] === dateStr
                            );

                            return (
                                <S.TodoItem
                                    key={todo.id}
                                    $color={category?.color}
                                    $isDone={isDone}
                                    onContextMenu={(e) => handleContextMenu(e, todo)}
                                >
                                    <div className="color-bar" />
                                    <span className="todo-title">{todo.title}</span>
                                </S.TodoItem>
                            );
                        })}
                    </S.TodoList>
                </S.ScrollBody>
            </S.ContentWrapper>
        </BotanicalBaseModal>
    );
}
