"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Plus, Trash2, Settings2, X, Check } from "lucide-react";

import CategoryFilter from "@/components/calendar/celestial/categoryFilter/CategoryFilter";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import ChallengeModal, { ChallengeData } from "@/components/modal/challengeModal/ChallengeModal";
import { DynamicSticker } from "@/assets/celestial/ChallengeStickers";
import * as S from "./CelestialChallenge.styles";
import { useT } from "@/i18n/useT";
import type { CategoryType, ChallengeType } from "@/types";

interface CelestialChallengeProps {
    categories: CategoryType[];
    challenges: ChallengeType[];
    selectedCategoryIds: string[];
    toggleCategory: (id: string) => void;
    selectedChallenge: ChallengeType | null;
    setSelectedChallengeId: (id: string | null) => void;
    handleCreateNew: () => void;
    handleEditClick: () => void;
    handleDelete: () => void;
    handleToggleToday: () => void;
    isCompletedToday: boolean;
    isTodayValidDay: boolean;
    isChallengeEnded: boolean;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    modalMode: 'create' | 'edit';
    handleSaveChallenge: (data: ChallengeData) => Promise<void>;
}

export default function CelestialChallenge({
    categories, challenges, selectedCategoryIds, toggleCategory,
    selectedChallenge, setSelectedChallengeId,
    handleCreateNew, handleEditClick, handleDelete,
    handleToggleToday, isCompletedToday, isTodayValidDay, isChallengeEnded,
    isModalOpen, setIsModalOpen, modalMode, handleSaveChallenge,
}: CelestialChallengeProps) {
    const theme = useTheme();
    const tr = useT().challenge;

    // ── 리사이즈: useRef + 직접 DOM 업데이트 — 리렌더 없음 ────────────────────
    const [leftRatio, setLeftRatio] = React.useState(50);
    const [topRatio,  setTopRatio]  = React.useState(50);
    const leftRatioRef  = React.useRef(50);
    const topRatioRef   = React.useRef(50);
    const contentRef    = React.useRef<HTMLDivElement>(null);
    const leftPanelRef  = React.useRef<HTMLDivElement>(null);
    const rightPanelRef = React.useRef<HTMLDivElement>(null);
    const stickerCardRef  = React.useRef<HTMLDivElement>(null);
    const detailCardRef   = React.useRef<HTMLDivElement>(null);

    const handleHResize = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX     = e.clientX;
        const startRatio = leftRatioRef.current;
        let rafId: number | null = null;

        const onMouseMove = (mv: MouseEvent) => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (!contentRef.current) return;
                const rect     = contentRef.current.getBoundingClientRect();
                const newRatio = startRatio + ((mv.clientX - startX) / rect.width) * 100;
                if (newRatio <= 20 || newRatio >= 80) return;
                leftRatioRef.current = newRatio;
                if (leftPanelRef.current)  leftPanelRef.current.style.flex  = `${newRatio} 1 0`;
                if (rightPanelRef.current) rightPanelRef.current.style.flex = `${100 - newRatio} 1 0`;
            });
        };

        const onMouseUp = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            setLeftRatio(leftRatioRef.current);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseup', onMouseUp);
    }, []);

    const handleVResize = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startY     = e.clientY;
        const startRatio = topRatioRef.current;
        let rafId: number | null = null;

        const onMouseMove = (mv: MouseEvent) => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (!rightPanelRef.current) return;
                const rect     = rightPanelRef.current.getBoundingClientRect();
                const newRatio = startRatio + ((mv.clientY - startY) / rect.height) * 100;
                if (newRatio <= 20 || newRatio >= 80) return;
                topRatioRef.current = newRatio;
                if (stickerCardRef.current) stickerCardRef.current.style.flex = `${newRatio} 1 0`;
                if (detailCardRef.current)  detailCardRef.current.style.flex  = `${100 - newRatio} 1 0`;
            });
        };

        const onMouseUp = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            setTopRatio(topRatioRef.current);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseup', onMouseUp);
    }, []);

    // ── 유틸 ─────────────────────────────────────────────────────────────────
    const isChallengeExpired = (c: typeof challenges[0]) => {
        const t = c.targetCount ?? null;
        if (t === null) return false;
        const start = new Date(c.startAt);
        start.setHours(0, 0, 0, 0);
        const lastSlot = new Date(start);
        lastSlot.setDate(start.getDate() + (t - 1) * c.interval);
        lastSlot.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today > lastSlot;
    };

    const ongoingChallenges  = challenges.filter(c => {
        const t = c.targetCount ?? null;
        if (t !== null && (c.completions?.length ?? 0) >= t) return false;
        return !isChallengeExpired(c);
    });
    const finishedChallenges = challenges.filter(c => {
        const t = c.targetCount ?? null;
        if (t !== null && (c.completions?.length ?? 0) >= t) return true;
        return isChallengeExpired(c);
    });

    const renderStickerBoard = () => {
        if (!selectedChallenge) return <span className="placeholder">{tr.selectForBoard}</span>;

        const start    = new Date(selectedChallenge.startAt);
        start.setHours(0, 0, 0, 0);
        const interval = selectedChallenge.interval;
        const target   = selectedChallenge.targetCount ?? null;
        const now      = new Date(); now.setHours(0, 0, 0, 0);

        const completedSet = new Set(
            (selectedChallenge.completions ?? []).map(comp => {
                const d = new Date(comp.targetDate);
                return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            })
        );

        const toKey = (d: Date) =>
            `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

        let slots: boolean[];
        if (target !== null) {
            slots = Array.from({ length: target }, (_, i) => {
                const d = new Date(start); d.setDate(start.getDate() + i * interval);
                return completedSet.has(toKey(d));
            });
        } else {
            const pastCount = Math.floor(Math.max(0, now.getTime() - start.getTime()) / (86400000 * interval)) + 1;
            if (pastCount === 0) return <span className="placeholder">{tr.notStarted}</span>;
            slots = Array.from({ length: pastCount }, (_, i) => {
                const d = new Date(start); d.setDate(start.getDate() + i * interval);
                return completedSet.has(toKey(d));
            });
        }

        if (slots.length === 0) return <span className="placeholder">{tr.firstSticker}</span>;

        return (
            <S.StickerGrid>
                {slots.map((isFilled, idx) => (
                    <S.StickerSlot key={idx}>
                        <DynamicSticker isFilled={isFilled} idx={idx} />
                    </S.StickerSlot>
                ))}
            </S.StickerGrid>
        );
    };

    const renderChallengeCard = (challenge: ChallengeType) => {
        const completedCount = challenge.completions?.length ?? 0;
        const targetCount    = challenge.targetCount ?? null;
        const isCompleted    = targetCount !== null && completedCount >= targetCount;
        const progress       = targetCount ? Math.round((completedCount / targetCount) * 100) : 0;
        const catColor       = categories.find(c => c.id === challenge.categoryId)?.color ?? "gray";

        return (
            <S.ChallengeRow
                key={challenge.id}
                onClick={() => setSelectedChallengeId(challenge.id)}
                $isSelected={selectedChallenge?.id === challenge.id}
                style={{ opacity: isCompleted ? 0.6 : 1 }}
            >
                <div className="challenge-info">
                    <div className="title">
                        <span style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
                            {challenge.title}
                        </span>
                    </div>
                    <div className="desc">{challenge.description}</div>
                    <div className="meta">
                        {tr.repeats(challenge.interval === 1 ? tr.everyday : tr.everyNDays(challenge.interval))}
                        {targetCount !== null && tr.goal(targetCount)}
                    </div>
                </div>

                <div className="challenge-progress">
                    {targetCount !== null ? (
                        <>
                            <span className="count">{completedCount} / {targetCount}</span>
                            <S.ProgressBar $progress={progress} $catColor={catColor}>
                                <div className="fill" />
                            </S.ProgressBar>
                        </>
                    ) : (
                        <span className="count">{tr.indefinite(completedCount)}</span>
                    )}
                </div>
            </S.ChallengeRow>
        );
    };

    return (
        <S.CelestialCalendarWrapper>
            <S.DateHeader>
                <span>{tr.title}</span>
                <hr />
            </S.DateHeader>

            <S.ContentLayout ref={contentRef}>
                <S.TimelineSection ref={leftPanelRef} $flex={leftRatio}>
                    <div className="timeline-header">
                        {tr.myChallenges}
                        <div className="header-actions">
                            <CategoryFilter
                                categories={categories}
                                selectedCategoryIds={selectedCategoryIds}
                                onToggle={toggleCategory}
                            />
                            <button className="add-header-btn" onClick={handleCreateNew}>
                                <Plus size={16} /> {tr.new}
                            </button>
                        </div>
                    </div>
                    <S.TimelineScrollArea>
                        {ongoingChallenges.length > 0 && (
                            <div style={{ padding: '12px 16px 4px', fontSize: '0.8rem', fontWeight: 600, color: theme?.colors.textSecondary }}>
                                {tr.ongoing}
                            </div>
                        )}
                        {ongoingChallenges.map(renderChallengeCard)}

                        {challenges.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'gray', fontSize: '0.9rem' }}>
                                {tr.none}
                            </div>
                        )}

                        {finishedChallenges.length > 0 && (
                            <>
                                <div style={{ padding: '12px 16px 4px', marginTop: '10px', fontSize: '0.8rem', fontWeight: 600, color: theme?.colors.textSecondary, borderTop: `1px solid ${theme?.colors.primary}33` }}>
                                    {tr.finished}
                                </div>
                                {finishedChallenges.map(renderChallengeCard)}
                            </>
                        )}
                    </S.TimelineScrollArea>
                </S.TimelineSection>

                <S.HResizer onMouseDown={handleHResize}>
                    <div className="handle" />
                </S.HResizer>

                <S.SideSection ref={rightPanelRef} $flex={100 - leftRatio}>
                    <S.StickerBoardCard ref={stickerCardRef} $flex={topRatio}>
                        <div className="card-header">
                            {selectedChallenge ? `${tr.stickerBoard} - ${selectedChallenge.title}` : tr.stickerBoard}
                        </div>
                        <div className="sticker-content">
                            {renderStickerBoard()}
                        </div>
                    </S.StickerBoardCard>

                    <S.VResizer onMouseDown={handleVResize}>
                        <div className="handle" />
                    </S.VResizer>

                    <S.TaskCard ref={detailCardRef} $flex={100 - topRatio}>
                        <div className="card-header">{tr.details}</div>
                        <S.DetailArea>
                            {selectedChallenge ? (
                                <div className="detail-content">
                                    <h3>{selectedChallenge.title}</h3>
                                    <p>{selectedChallenge.description || tr.noDescription}</p>
                                    <div className="stats">
                                        <div><strong>{tr.category}:</strong> {categories.find(c => c.id === selectedChallenge.categoryId)?.name}</div>
                                        <div><strong>{tr.interval}:</strong> {selectedChallenge.interval === 1 ? tr.everyday : tr.everyNDays(selectedChallenge.interval)}</div>
                                        <div><strong>{tr.currentCount}:</strong> {tr.times(selectedChallenge.completions?.length ?? 0)}</div>
                                        {selectedChallenge.targetCount != null && <div><strong>{tr.targetCount}:</strong> {tr.times(selectedChallenge.targetCount)}</div>}
                                    </div>
                                    <div className="actions">
                                        {(() => {
                                            const completedCount = selectedChallenge.completions?.length ?? 0;
                                            const targetCount    = selectedChallenge.targetCount ?? null;
                                            const isFinished     = targetCount !== null && completedCount >= targetCount;
                                            const canToggle      = isTodayValidDay && (!isFinished || isCompletedToday);

                                            if (canToggle) {
                                                return (
                                                    <SecondaryButton
                                                        $variant={isCompletedToday ? "default" : "primary"}
                                                        onClick={handleToggleToday}
                                                        style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, gap: '8px' }}
                                                    >
                                                        {isCompletedToday ? <X size={18} /> : <Check size={18} />}
                                                        {isCompletedToday ? tr.cancelToday : tr.doneToday}
                                                    </SecondaryButton>
                                                );
                                            }
                                            if (isFinished || isChallengeEnded) {
                                                return (
                                                    <SecondaryButton
                                                        $variant="default"
                                                        disabled
                                                        style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, opacity: 0.6, cursor: 'not-allowed' }}
                                                    >
                                                        {isChallengeEnded && !isFinished ? tr.ended : tr.goalReached}
                                                    </SecondaryButton>
                                                );
                                            }
                                            return (
                                                <SecondaryButton
                                                    $variant="default"
                                                    disabled
                                                    style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, gap: '8px', opacity: 0.5, cursor: 'not-allowed' }}
                                                >
                                                    {tr.notTodaySlot}
                                                </SecondaryButton>
                                            );
                                        })()}
                                        <div className="sub-actions">
                                            <SecondaryButton onClick={handleEditClick} style={{ gap: '6px' }}>
                                                <Settings2 size={16} /> {tr.edit}
                                            </SecondaryButton>
                                            <SecondaryButton $variant="danger" onClick={handleDelete} style={{ gap: '6px' }}>
                                                <Trash2 size={16} /> {tr.delete}
                                            </SecondaryButton>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="placeholder">{tr.selectOrCreate}</div>
                            )}
                        </S.DetailArea>
                    </S.TaskCard>
                </S.SideSection>
            </S.ContentLayout>

            <ChallengeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
                initialData={
                    modalMode === 'edit' && selectedChallenge
                        ? { ...selectedChallenge, description: selectedChallenge.description ?? null, targetCount: selectedChallenge.targetCount ?? null }
                        : null
                }
                onSave={handleSaveChallenge}
            />
        </S.CelestialCalendarWrapper>
    );
}
