"use client";

import * as React from "react";
import { MoreModalProps } from "../MoreModal";
import * as S from "./CelestialMoreModal.styles";
import { X } from 'lucide-react';
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";
import { isBetween } from "@/utils/DateUtils";

export default function CelestialMoreModal({
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
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="360px">
            <S.ContentWrapper>
                <S.Header>
                    <span className="title-text">{formattedDate} 일정</span>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X size={26} />
                    </button>
                </S.Header>

                <S.ScrollBody>
                    <S.TodoList>
                        {dayTodos.map((todo) => {
                            const category = categories.find(c => c.id === todo.categoryId);
                            const isDone = todo.check === "done";

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
        </CelestialBaseModal>
    );
}