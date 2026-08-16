"use client";

import React from "react";
import * as S from "./styles";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import { CategoryThemeProps } from "../CategoryPage";
import { useT } from "@/i18n/useT";
import { localDateKey, utcDayKey, dayKeyToIso } from "@/lib/dateKey";
import { useDialog } from "@/components/dialog/DialogProvider";

const ROMAN = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];

export default function CelestialCategory(props: CategoryThemeProps) {
    const t = useT();
    const dialog = useDialog();

    const {
        categories, selectedCategory, selectedCategoryId, setSelectedCategoryId,
        activeTab, setActiveTab, editName, setEditName, editColor, setEditColor,
        editDescription, setEditDescription, handleNameBlur, handleColorBlur,
        handleDescriptionBlur, handleNameKeyDown, handleDelete, categoryTodos,
        handleEditTodo, toggleTodo, deleteTodo, authFetch,
        openInviteModal, closeInviteModal, isInviteModalOpen, inviteEmail,
        setInviteEmail, handleInviteSubmit, inviteError,
        kickTarget, setKickTarget, closeKickModal, handleKickSubmit,
        setIsAddModalOpen
    } = props;

    const selectedIdx = categories.findIndex((c) => c.id === selectedCategoryId);
    const memberCount = selectedCategory?.participants?.length ?? 0;

    return (
        <S.CategoryWrapper>
        <S.CenterWrapper>
            <S.Zodiac viewBox="0 0 400 400" aria-hidden>
                <circle className="dashed" cx="200" cy="200" r="190" />
                <circle cx="200" cy="200" r="160" />
                {Array.from({ length: 24 }, (_, i) => (
                    <line key={i} x1="200" y1="14" x2="200" y2="26" transform={`rotate(${i * 15} 200 200)`} />
                ))}
            </S.Zodiac>

            <S.PageHeader>
                <i />
                <span>{t.category.title}</span>
                <hr />
            </S.PageHeader>

            <S.BodyRow>
            <S.SidebarContainer>
                <S.CategoryList>
                    {categories.map((cat, idx) => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                            <S.DeckCard
                                key={cat.id}
                                type="button"
                                $color={cat.color}
                                $isSelected={isSelected}
                                style={{ animationDelay: `${Math.min(idx, 10) * 45}ms` }}
                                onClick={() => setSelectedCategoryId(cat.id)}
                            >
                                <span className="num">{ROMAN[idx] ?? String(idx + 1)}</span>
                                <span className="chip" />
                                <span className="nm">{cat.name}</span>
                                {isSelected && <span className="mark">✦</span>}
                            </S.DeckCard>
                        );
                    })}

                    <S.DeckAddCard type="button" onClick={() => setIsAddModalOpen(true)}>
                        {t.category.addCategory}
                    </S.DeckAddCard>
                </S.CategoryList>
            </S.SidebarContainer>

            <S.ContentContainer>
                {selectedCategory ? (
                    <S.DetailInfo key={selectedCategory.id}>
                        {/* ── 표제부 ── */}
                        <S.Plate>
                            <S.Corners><i /><i /><i /><i /></S.Corners>

                            <S.EmblemWrap $color={editColor} title={t.category.namePlaceholder}>
                                <svg viewBox="0 0 48 48" aria-hidden>
                                    <circle className="ring" cx="24" cy="24" r="17" />
                                    <path className="star" d={S.SLENDER_STAR_48} />
                                </svg>
                                <input
                                    type="color"
                                    className="color-input"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    onBlur={handleColorBlur}
                                />
                            </S.EmblemWrap>

                            <S.PlateText>
                                <span className="numeral">
                                    {ROMAN[selectedIdx] ?? String(selectedIdx + 1)}
                                </span>
                                <input
                                    value={editName}
                                    className="title-input"
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={handleNameBlur}
                                    onKeyDown={handleNameKeyDown}
                                    placeholder={t.category.namePlaceholder}
                                />
                                <span className="sub">
                                    {t.category.members} {memberCount} · {t.category.todosTab} {categoryTodos.length}
                                </span>
                            </S.PlateText>
                        </S.Plate>

                        {/* ── 탭 ── */}
                        <S.DetailHeader $activeTab={activeTab}>
                            <button onClick={() => setActiveTab('info')} className="info-tab">{t.category.infoTab}</button>
                            <button onClick={() => setActiveTab('todos')} className="todo-tab">{t.category.todosTab}</button>
                        </S.DetailHeader>

                        {activeTab === 'info' ? (
                            <S.InfoContainer>
                                {/* 점선 리더 속성 */}
                                <S.LoreRow>
                                    <span className="k">{t.category.creator}</span>
                                    <span className="dots" />
                                    <span className="v">{selectedCategory.creatorName || t.category.unknown}</span>
                                </S.LoreRow>

                                <S.DescBlock>
                                    <span className="cap">{t.category.description}</span>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        onBlur={handleDescriptionBlur}
                                        placeholder={t.category.descriptionPlaceholder}
                                        rows={3}
                                    />
                                </S.DescBlock>

                                {/* 멤버 메달 */}
                                <div>
                                    <S.SectionCap style={{ marginBottom: 14 }}>
                                        {t.category.members} <b>{memberCount}</b>
                                        <hr />
                                    </S.SectionCap>

                                    <S.MedalRow>
                                        {(selectedCategory.participants ?? []).map((participant: { id: string; name: string; email: string }) => {
                                            const isOwner = participant.id === selectedCategory.creatorId;
                                            return (
                                                <S.Medal key={participant.id} title={participant.email}>
                                                    <span className="av">
                                                        {participant.name.charAt(0)}
                                                        {!isOwner && (
                                                            <button
                                                                type="button"
                                                                className="kick"
                                                                title={t.category.kick}
                                                                onClick={() => setKickTarget({ id: participant.id, name: participant.name })}
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </span>
                                                    <span>{participant.name}</span>
                                                    {isOwner && <span className="owner-mark">✦</span>}
                                                </S.Medal>
                                            );
                                        })}

                                        <S.Medal $ghost onClick={openInviteModal}>
                                            <span className="av">＋</span>
                                            <span>{t.category.invite}</span>
                                        </S.Medal>
                                    </S.MedalRow>
                                </div>

                                <S.ActionFooter>
                                    <SecondaryButton $height={32} $width={140} $variant="danger" onClick={() => handleDelete(selectedCategory.id)}>
                                        {t.category.deleteCategory}
                                    </SecondaryButton>
                                </S.ActionFooter>
                            </S.InfoContainer>
                        ) : (
                            <S.TodoListContainer>
                                <S.SectionCap>
                                    {t.category.todosTab} <b>{categoryTodos.length}</b>
                                    <hr />
                                </S.SectionCap>

                                {categoryTodos.length > 0 ? (
                                    <S.TodoGrid>
                                        {categoryTodos.map(todo => {
                                            // 완료는 그 일정이 놓인 날짜에 기록해야 한다. '오늘'로 찍으면 다른 날 일정의 체크가 엉뚱한 날에 남는다.
                                            const todoDateStr = localDateKey(todo.startAt ?? new Date());
                                            const isDone = (todo.completions ?? []).some(c =>
                                                utcDayKey(c.targetDate) === todoDateStr
                                            );
                                            return (
                                            <S.TodoCard key={todo.id} $isDone={isDone} onClick={() => handleEditTodo(todo)}>
                                                <button
                                                    className="check-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleTodo(authFetch, todo.id, dayKeyToIso(todoDateStr));
                                                    }}
                                                >
                                                    {isDone && '✦'}
                                                </button>

                                                <div className="todo-info">
                                                    <span className="title">{todo.title}</span>
                                                    <span className="date">
                                                        {todo.startAt ? new Date(todo.startAt as string).toLocaleDateString() : t.category.noDate}
                                                        {todo.repeat > 0 && ` (↻ ${todo.repeat}${t.todo.perNDays})`}
                                                    </span>
                                                </div>

                                                <button
                                                    className="delete-btn"
                                                    title={t.todo.delete}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const ok = await dialog.confirmDanger({
                                                            title: t.category.deleteConfirm,
                                                            message: todo.title,
                                                        });
                                                        if (ok) deleteTodo(authFetch, todo.id);
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </S.TodoCard>
                                            );
                                        })}
                                    </S.TodoGrid>
                                ) : (
                                    <S.EmptyBox>
                                        <S.Corners><i /><i /><i /><i /></S.Corners>
                                        <p>{t.category.noTodos}</p>
                                    </S.EmptyBox>
                                )}
                            </S.TodoListContainer>
                        )}
                    </S.DetailInfo>
                ) : (
                    <S.EmptyStateContainer>
                        <svg viewBox="0 0 48 48" aria-hidden>
                            <circle className="ring" cx="24" cy="24" r="19" />
                            <path className="star" d={S.SLENDER_STAR_48} />
                        </svg>
                        <p>{t.category.selectOrAdd}</p>
                    </S.EmptyStateContainer>
                )}
            </S.ContentContainer>
            </S.BodyRow>
        </S.CenterWrapper>

            {isInviteModalOpen && (
                <S.ModalOverlay onClick={closeInviteModal}>
                    <S.ModalContent onClick={(e) => e.stopPropagation()}>
                        <S.Corners><i /><i /><i /><i /></S.Corners>
                        <div className="modal-header">
                            <h3>{t.category.inviteTitle}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{t.category.inviteHint}</p>
                            <input
                                type="email"
                                placeholder="example@email.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleInviteSubmit()}
                                autoFocus
                            />
                            {inviteError && <InlineError>{inviteError}</InlineError>}
                        </div>
                        <div className="modal-actions">
                            <SecondaryButton $width={70} $height={32} onClick={closeInviteModal}>{t.category.cancel}</SecondaryButton>
                            <SecondaryButton $width={70} $height={32} $variant="primary" onClick={handleInviteSubmit}>{t.category.invite}</SecondaryButton>
                        </div>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}

            {kickTarget && (
                <S.ModalOverlay onClick={closeKickModal}>
                    <S.ModalContent onClick={(e) => e.stopPropagation()}>
                        <S.Corners><i /><i /><i /><i /></S.Corners>
                        <div className="modal-header">
                            <h3>{t.category.kickTitle}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{t.category.kickConfirm(kickTarget.name)}</p>
                        </div>
                        <div className="modal-actions">
                            <SecondaryButton $width={70} $height={32} onClick={closeKickModal}>{t.category.cancel}</SecondaryButton>
                            <SecondaryButton $width={80} $height={32} $variant="danger" onClick={handleKickSubmit}>{t.category.kick}</SecondaryButton>
                        </div>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
        </S.CategoryWrapper>
    );
}
