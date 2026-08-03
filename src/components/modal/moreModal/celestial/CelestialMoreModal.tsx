"use client";

import * as React from "react";
import { MoreModalProps } from "../MoreModal";
import * as S from "./CelestialMoreModal.styles";
import { X, Check } from 'lucide-react';
import CelestialBaseModal from "@/components/modal/baseModal/celestial/CelestialBaseModal";
import { isBetween, isSameDay } from "@/utils/DateUtils";
import { useT } from "@/i18n/useT";

export default function CelestialMoreModal({
                                               isOpen,
                                               onClose,
                                               date,
                                               todos,
                                               categories,
                                               handleContextMenu,
                                               challenges,
                                               onToggleChallenge
                                           }: MoreModalProps) {
    const t = useT();

    if (!date) return null;

    const dayTodos = todos.filter(todo => isBetween(date, todo.startAt, todo.endAt));
    const dayChallenges = (challenges ?? []).filter(c =>
        c.startAt ? isSameDay(date, new Date(c.startAt)) : false
    );

    return (
        <CelestialBaseModal isOpen={isOpen} onClose={onClose} maxWidth="360px">
            <S.ContentWrapper>
                <S.Header>
                    <span className="title-text">{t.popup.dayTodosTitle(date)}</span>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </S.Header>

                <S.CountLabel>{t.popup.itemCount(dayTodos.length)}</S.CountLabel>

                <S.ScrollBody>
                    {dayTodos.length === 0 && <S.EmptyText>{t.popup.noTodos}</S.EmptyText>}
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

                    {dayChallenges.length > 0 && (
                        <>
                            <S.SectionLabel>{t.popup.challenges}</S.SectionLabel>
                            <S.ChallengeList>
                                {dayChallenges.map(challenge => (
                                    <S.ChallengeItem key={challenge.id} $isDone={!!challenge.isDone}>
                                        <button
                                            type="button"
                                            className="check"
                                            onClick={() => onToggleChallenge?.(challenge)}
                                        >
                                            {challenge.isDone && <Check size={10} strokeWidth={3} />}
                                        </button>
                                        <span className="challenge-title">{challenge.title}</span>
                                    </S.ChallengeItem>
                                ))}
                            </S.ChallengeList>
                        </>
                    )}
                </S.ScrollBody>
            </S.ContentWrapper>
        </CelestialBaseModal>
    );
}