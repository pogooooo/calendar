"use client";

import React from "react";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import InlineError from "@/components/error/inlineError/InlineError";
import { CategoryThemeProps } from "./CategoryPage";
import { useT } from "@/i18n/useT";
import { localDateKey, utcDayKey, endDateKey, activeTimeZone } from "@/lib/dateKey";
import { zonedDayStart } from "@/lib/timezone";
import { expandTodos, type ExpandedTodoType } from "@/hooks/useExpandedTodos";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { isOccurrenceDone, occurrenceKey, toggleOccurrence } from "@/lib/todoDone";
import type { TodoType } from "@/types";
import { useDialog } from "@/components/dialog/DialogProvider";
import useAuthStore from "@/store/useAuthStore";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialCategory.styles";
import * as MapleS from "./maple/MapleCategory.styles";
import * as OceanS from './ocean/OceanCategory.styles';
import CelestialCategoryLayout from "./celestial/CelestialCategoryLayout";
import OceanCategoryLayout from "./ocean/OceanCategoryLayout";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

/** 갈래마다 제 배치 — Maple 은 Celestial 의 배치(덱 | 내용)에 제 모양을 입히고, 바다는 위의 색 칩 띠와 아래 판 셋 */
const LAYOUTS = { celestial: CelestialCategoryLayout, maple: CelestialCategoryLayout, ocean: OceanCategoryLayout };

const ROMAN = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
    "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];

const DAY_MS = 86400000;
/** 카테고리 화면의 한 줄이 가리키는 회차 — 반복이면 오늘 걸린 회차, 없으면 가장 가까운 지난 회차, 그것도 없으면 다음 회차 */
function focusOccurrence(todo: TodoType, todayKey: string): ExpandedTodoType {
    if (!todo.repeat || todo.repeat <= 0 || !todo.startAt) return todo;
    const today = zonedDayStart(todayKey, activeTimeZone());
    if (!today) return todo;
    const past = expandTodos([todo], new Date(today.getTime() - 400 * DAY_MS), new Date(today.getTime() + DAY_MS - 1));
    const onToday = past.filter(o => localDateKey(o.startAt!) <= todayKey && todayKey <= endDateKey(o.startAt!, o.endAt!));
    if (onToday.length) return onToday[onToday.length - 1];
    const started = past.filter(o => localDateKey(o.startAt!) < todayKey);
    if (started.length) return started[started.length - 1];
    return expandTodos([todo], today, new Date(today.getTime() + 400 * DAY_MS))[0] ?? todo;
}

export default function CategoryView(props: CategoryThemeProps) {
    const S = usePickTheme(STYLES);
    const Layout = usePickTheme(LAYOUTS);
    const t = useT();
    const dialog = useDialog();
    const todayKey = useCurrentDayKey();

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

    // 내보내기(×)는 만든 사람만, 참여자는 자기 자신만(나가기) — 서버도 같은 규칙이다
    const me = useAuthStore((s) => s.user?.id);
    const isCreator = !!selectedCategory && selectedCategory.creatorId === me;

    const selectedIdx = categories.findIndex((c) => c.id === selectedCategoryId);
    const memberCount = selectedCategory?.participants?.length ?? 0;

    /* ── 고른 카테고리의 조각들 — 놓는 자리는 갈래의 배치가 정한다 ── */
    let plate: React.ReactNode = null;
    let tabs: React.ReactNode = null;
    let creator: React.ReactNode = null;
    let description: React.ReactNode = null;
    let members: React.ReactNode = null;
    let todos: React.ReactNode = null;

    if (selectedCategory) {
        plate = (
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
        );

        tabs = (
            <S.DetailHeader $activeTab={activeTab}>
                <button onClick={() => setActiveTab('info')} className="info-tab">{t.category.infoTab}</button>
                <button onClick={() => setActiveTab('todos')} className="todo-tab">{t.category.todosTab}</button>
            </S.DetailHeader>
        );

        creator = (
            <S.LoreRow>
                <span className="k">{t.category.creator}</span>
                <span className="dots" />
                <span className="v">{selectedCategory.creatorName || t.category.unknown}</span>
            </S.LoreRow>
        );

        description = (
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
        );

        members = (
            <>
                <S.SectionCap style={{ marginBottom: 14 }}>
                    {t.category.members} <b>{memberCount}</b>
                    <hr />
                </S.SectionCap>

                <S.MedalRow>
                    {(selectedCategory.participants ?? []).map((participant: { id: string; name: string; email: string }) => {
                        const isOwner = participant.id === selectedCategory.creatorId;
                        const isMe = participant.id === me;
                        return (
                            <S.Medal key={participant.id} title={participant.email}>
                                <span className="av">
                                    {participant.name.charAt(0)}
                                    {!isOwner && (isCreator || isMe) && (
                                        <button
                                            type="button"
                                            className="kick"
                                            title={isMe ? t.category.leave : t.category.kick}
                                            aria-label={isMe ? t.category.leave : `${t.category.kick} — ${participant.name}`}
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

                    {/* 자판으로도 열리게 — 예전엔 div 라 Tab 으로 닿지 않았다 */}
                    <S.Medal $ghost role="button" tabIndex={0} onClick={openInviteModal}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openInviteModal(); } }}>
                        <span className="av">＋</span>
                        <span>{t.category.invite}</span>
                    </S.Medal>
                </S.MedalRow>
            </>
        );

        todos = (
            <>
                <S.SectionCap>
                    {t.category.todosTab} <b>{categoryTodos.length}</b>
                    <hr />
                </S.SectionCap>

                {categoryTodos.length > 0 ? (
                    <S.TodoGrid>
                        {categoryTodos.map(todo => {
                            // 완료는 그 일정이 놓인 회차의 첫날에 적는다(여러 날 일정은 한 번, src/lib/todoDone.ts). 날짜 없는 일정은 오늘에.
                            // 반복 일정은 오늘 걸린 회차를 — 예전엔 늘 첫 회차로 체크해, 오늘 끝내도 이 화면엔 안 끝난 것으로 남았다
                            const occ = focusOccurrence(todo, todayKey);
                            const occKey = todo.startAt ? occurrenceKey(occ) : todayKey;
                            const isDone = todo.startAt
                                ? isOccurrenceDone(occ)
                                : (todo.completions ?? []).some(c => utcDayKey(c.targetDate) === todayKey);
                            const [y, m, d] = occKey.split("-").map(Number);
                            return (
                            <S.TodoCard key={todo.id} $isDone={isDone} onClick={() => handleEditTodo(todo)}>
                                <button
                                    className="check-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // 날짜 키 그대로 넘긴다 — UTC 0시로 바꿔 넘기면 서쪽 시간대에서 전날에 적혔다
                                        if (todo.startAt) void toggleOccurrence(occ, async (k) => { await toggleTodo(authFetch, todo.id, k); });
                                        else toggleTodo(authFetch, todo.id, todayKey);
                                    }}
                                >
                                    {isDone ? '✦' : ''}
                                </button>

                                <div className="todo-info">
                                    <span className="title">{todo.title}</span>
                                    <span className="date">
                                        {`${todo.startAt ? t.calendar.dayTitle(y, m, d) : t.category.noDate}${todo.repeat > 0 ? ` (↻ ${todo.repeat}${t.todo.perNDays})` : ''}`}
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
            </>
        );
    }

    const empty = (
        <S.EmptyStateContainer>
            <svg viewBox="0 0 48 48" aria-hidden>
                <circle className="ring" cx="24" cy="24" r="19" />
                <path className="star" d={S.SLENDER_STAR_48} />
            </svg>
            <p>{t.category.selectOrAdd}</p>
        </S.EmptyStateContainer>
    );

    const dialogs = (
        <>
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
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleInviteSubmit(); }}
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
                            <h3>{kickTarget.id === me ? t.category.leaveTitle : t.category.kickTitle}</h3>
                        </div>
                        <div className="modal-body">
                            <p>{kickTarget.id === me ? t.category.leaveConfirm : t.category.kickConfirm(kickTarget.name)}</p>
                        </div>
                        <div className="modal-actions">
                            <SecondaryButton $width={70} $height={32} onClick={closeKickModal}>{t.category.cancel}</SecondaryButton>
                            <SecondaryButton $width={80} $height={32} $variant="danger" onClick={handleKickSubmit}>{kickTarget.id === me ? t.category.leave : t.category.kick}</SecondaryButton>
                        </div>
                    </S.ModalContent>
                </S.ModalOverlay>
            )}
        </>
    );

    return (
        <Layout
            S={S}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            selectedCategory={selectedCategory}
            select={setSelectedCategoryId}
            onAdd={() => setIsAddModalOpen(true)}
            onDelete={isCreator ? () => { if (selectedCategory) handleDelete(selectedCategory.id); } : undefined}
            activeTab={activeTab}
            plate={plate}
            tabs={tabs}
            creator={creator}
            description={description}
            members={members}
            todos={todos}
            empty={empty}
            dialogs={dialogs}
        />
    );
}
