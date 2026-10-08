"use client";

import * as React from "react";
import { MoreModalProps } from "./MoreModal";
import { X, Check } from 'lucide-react';
import BaseModal from "@/components/modal/baseModal/BaseModal";
import { isBetween, isSameDay } from "@/utils/DateUtils";
import { useT } from "@/i18n/useT";
import { localDateKey, utcDayKey } from "@/lib/dateKey";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialMoreModal.styles";
import * as MapleS from "./maple/MapleMoreModal.styles";
import * as OceanS from './ocean/OceanMoreModal.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

export default function MoreModalView({
                                               isOpen,
                                               onClose,
                                               date,
                                               todos,
                                               categories,
                                               handleContextMenu,
                                               onEditTodo,
                                               challenges,
                                               onToggleChallenge
                                           }: MoreModalProps) {
    const S = usePickTheme(STYLES);
    const t = useT();

    if (!date) return null;

    const dayTodos = todos.filter(todo => isBetween(date, todo.startAt, todo.endAt));
    const dayChallenges = (challenges ?? []).filter(c =>
        c.startAt ? isSameDay(date, new Date(c.startAt)) : false
    );

    return (
        <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="360px" ariaLabel={t.popup.dayTodosTitle(date)}>
            <S.ContentWrapper>
                <S.Header>
                    <span className="title-text">{t.popup.dayTodosTitle(date)}</span>
                    <button type="button" className="close-btn" onClick={onClose} aria-label={t.interaction.dismiss}>
                        <X size={20} />
                    </button>
                </S.Header>

                <S.CountLabel>{t.popup.itemCount(dayTodos.length)}</S.CountLabel>

                <S.ScrollBody>
                    {dayTodos.length === 0 && <S.EmptyText>{t.popup.noTodos}</S.EmptyText>}
                    <S.TodoList>
                        {dayTodos.map((todo) => {
                            const category = categories.find(c => c.id === todo.categoryId);
                            // 달력이 펼친 회차는 제 완료 여부(isDone — 그 회차 시작일의 기록, 프로젝트는 상태)를 들고 온다. 바와 같은 값을 쓴다.
                            // 칸 날짜로 다시 세면 며칠짜리 일정은 둘째 날부터, 프로젝트 항목은 늘 안 끝난 것으로 보였다
                            const expanded = (todo as { isDone?: boolean }).isDone;
                            // date 는 캘린더 셀의 로컬 자정이라 toISOString 하면 하루가 밀린다
                            const dateStr = localDateKey(date);
                            const isDone = typeof expanded === "boolean" ? expanded : (todo.completions ?? []).some(c =>
                                utcDayKey(c.targetDate) === dateStr
                            );

                            return (
                                <S.TodoItem
                                    key={todo.id}
                                    type="button"
                                    $color={category?.color}
                                    $isDone={isDone}
                                    onContextMenu={(e) => handleContextMenu(e, todo)}
                                    onClick={(e) => onEditTodo ? onEditTodo(todo) : handleContextMenu(e, todo)}
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
                                            aria-label={challenge.title}
                                            aria-pressed={!!challenge.isDone}
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
        </BaseModal>
    );
}
