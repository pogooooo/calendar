"use client";

import * as React from "react";
import { Plus, Trash2, Settings2, X, Check } from "lucide-react";

import CategoryFilter from "@/components/calendar/botanical/categoryFilter/CategoryFilter";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import ChallengeModal, { ChallengeData } from "@/components/modal/challengeModal/ChallengeModal";
import { BotanicalDynamicSticker } from "@/assets/botanical/BotanicalStickers";
import * as S from "./BotanicalChallenge.styles";
import type { CategoryType, ChallengeType } from "@/types";

interface BotanicalChallengeProps {
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

const BotanicalBranchDecor = () => (
    <svg width="100%" height="32" viewBox="0 0 400 32" preserveAspectRatio="none" fill="none">
        <path d="M0 16 Q100 10 200 16 Q300 22 400 16" stroke="#C9B59C" strokeWidth="0.8" strokeLinecap="round" opacity="0.35"/>
        <circle cx="200" cy="16" r="2.5" stroke="#C9B59C" strokeWidth="0.8" opacity="0.4"/>
        <path d="M200 16 C196 10 192 6 190 2" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.3"/>
        <path d="M200 16 C204 10 208 6 210 2" stroke="#C9B59C" strokeWidth="0.6" strokeLinecap="round" opacity="0.3"/>
        <circle cx="80" cy="13" r="1.5" stroke="#C9B59C" strokeWidth="0.6" opacity="0.3"/>
        <circle cx="320" cy="19" r="1.5" stroke="#C9B59C" strokeWidth="0.6" opacity="0.3"/>
    </svg>
);

const LeafWatermark = () => (
    <svg width="120" height="160" viewBox="0 0 120 160" fill="none"
        style={{ position: 'absolute', bottom: 12, right: 12, opacity: 0.06, pointerEvents: 'none' }}>
        <path d="M60 10 C60 10 20 40 20 80 C20 120 60 150 60 150 C60 150 100 120 100 80 C100 40 60 10 60 10Z"
              stroke="#C9B59C" strokeWidth="2"/>
        <path d="M60 10 L60 150" stroke="#C9B59C" strokeWidth="1.2"/>
        <path d="M60 50 C50 58 36 64 28 72" stroke="#C9B59C" strokeWidth="1"/>
        <path d="M60 50 C70 58 84 64 92 72" stroke="#C9B59C" strokeWidth="1"/>
        <path d="M60 85 C48 95 38 108 30 118" stroke="#C9B59C" strokeWidth="1"/>
        <path d="M60 85 C72 95 82 108 90 118" stroke="#C9B59C" strokeWidth="1"/>
    </svg>
);

export default function BotanicalChallenge({
    categories, challenges, selectedCategoryIds, toggleCategory,
    selectedChallenge, setSelectedChallengeId,
    handleCreateNew, handleEditClick, handleDelete,
    handleToggleToday, isCompletedToday, isTodayValidDay, isChallengeEnded,
    isModalOpen, setIsModalOpen, modalMode, handleSaveChallenge,
}: BotanicalChallengeProps) {

    const [leftRatio, setLeftRatio] = React.useState(50);
    const [topRatio, setTopRatio] = React.useState(50);
    const leftRatioRef = React.useRef(50);
    const topRatioRef = React.useRef(50);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const leftPanelRef = React.useRef<HTMLDivElement>(null);
    const rightPanelRef = React.useRef<HTMLDivElement>(null);
    const stickerCardRef = React.useRef<HTMLDivElement>(null);
    const detailCardRef = React.useRef<HTMLDivElement>(null);

    const handleHResize = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startRatio = leftRatioRef.current;
        let rafId: number | null = null;

        const onMouseMove = (mv: MouseEvent) => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (!contentRef.current) return;
                const rect = contentRef.current.getBoundingClientRect();
                const newRatio = startRatio + ((mv.clientX - startX) / rect.width) * 100;
                if (newRatio <= 20 || newRatio >= 80) return;
                leftRatioRef.current = newRatio;
                if (leftPanelRef.current) leftPanelRef.current.style.flex = `${newRatio} 1 0`;
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
        const startY = e.clientY;
        const startRatio = topRatioRef.current;
        let rafId: number | null = null;

        const onMouseMove = (mv: MouseEvent) => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (!rightPanelRef.current) return;
                const rect = rightPanelRef.current.getBoundingClientRect();
                const newRatio = startRatio + ((mv.clientY - startY) / rect.height) * 100;
                if (newRatio <= 20 || newRatio >= 80) return;
                topRatioRef.current = newRatio;
                if (stickerCardRef.current) stickerCardRef.current.style.flex = `${newRatio} 1 0`;
                if (detailCardRef.current) detailCardRef.current.style.flex = `${100 - newRatio} 1 0`;
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

    const ongoingChallenges = challenges.filter(c => {
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
        if (!selectedChallenge) return <span className="placeholder">챌린지를 선택하여 스티커 보드를 확인하세요.</span>;

        const start = new Date(selectedChallenge.startAt);
        start.setHours(0, 0, 0, 0);
        const interval = selectedChallenge.interval;
        const target = selectedChallenge.targetCount ?? null;
        const now = new Date(); now.setHours(0, 0, 0, 0);

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
            if (pastCount === 0) return <span className="placeholder">아직 챌린지 시작일이 도래하지 않았습니다.</span>;
            slots = Array.from({ length: pastCount }, (_, i) => {
                const d = new Date(start); d.setDate(start.getDate() + i * interval);
                return completedSet.has(toKey(d));
            });
        }

        if (slots.length === 0) return <span className="placeholder">오늘의 챌린지를 달성하고 첫 스티커를 받아보세요!</span>;

        return (
            <S.StickerGrid>
                <LeafWatermark />
                {slots.map((isFilled, idx) => (
                    <S.StickerSlot key={idx}>
                        <BotanicalDynamicSticker isFilled={isFilled} idx={idx} />
                    </S.StickerSlot>
                ))}
            </S.StickerGrid>
        );
    };

    const renderChallengeCard = (challenge: ChallengeType) => {
        const completedCount = challenge.completions?.length ?? 0;
        const targetCount = challenge.targetCount ?? null;
        const isCompleted = targetCount !== null && completedCount >= targetCount;
        const progress = targetCount ? Math.round((completedCount / targetCount) * 100) : 0;
        const catColor = categories.find(c => c.id === challenge.categoryId)?.color ?? "gray";

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
                        {challenge.interval === 1 ? '매일' : `${challenge.interval}일마다`} 반복
                        {targetCount !== null && ` · 목표 ${targetCount}회`}
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
                        <span className="count">무기한 · {completedCount}회 달성</span>
                    )}
                </div>
            </S.ChallengeRow>
        );
    };

    return (
        <S.BotanicalCalendarWrapper>
            <S.DateHeader>
                <S.LeafAccent />
                <span>Challenges</span>
                <S.TwigDivider />
            </S.DateHeader>

            <S.ContentLayout ref={contentRef}>
                <S.TimelineSection ref={leftPanelRef} $flex={leftRatio}>
                    <div className="timeline-header">
                        My Challenges
                        <div className="header-actions">
                            <CategoryFilter
                                categories={categories}
                                selectedCategoryIds={selectedCategoryIds}
                                onToggle={toggleCategory}
                            />
                            <button className="add-header-btn" onClick={handleCreateNew}>
                                <Plus size={16} /> New
                            </button>
                        </div>
                    </div>
                    <S.TimelineScrollArea>
                        {ongoingChallenges.length > 0 && (
                            <div style={{ padding: '12px 16px 4px', fontSize: '0.8rem', fontWeight: 600, color: 'inherit', opacity: 0.6 }}>
                                진행 중인 챌린지
                            </div>
                        )}
                        {ongoingChallenges.map(renderChallengeCard)}

                        {challenges.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
                                표시할 챌린지가 없습니다.
                            </div>
                        )}

                        {finishedChallenges.length > 0 && (
                            <>
                                <div style={{ padding: '12px 16px 4px', marginTop: '10px', fontSize: '0.8rem', fontWeight: 600, opacity: 0.6 }}>
                                    완료된 챌린지
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
                            Sticker Board {selectedChallenge && `- ${selectedChallenge.title}`}
                        </div>
                        <BotanicalBranchDecor />
                        <div className="sticker-content">
                            {renderStickerBoard()}
                        </div>
                    </S.StickerBoardCard>

                    <S.VResizer onMouseDown={handleVResize}>
                        <div className="handle" />
                    </S.VResizer>

                    <S.TaskCard ref={detailCardRef} $flex={100 - topRatio}>
                        <div className="card-header">Challenge Details</div>
                        <S.DetailArea>
                            {selectedChallenge ? (
                                <div className="detail-content">
                                    <h3>{selectedChallenge.title}</h3>
                                    <p>{selectedChallenge.description || "설명이 없습니다."}</p>
                                    <div className="stats">
                                        <div><strong>카테고리:</strong> {categories.find(c => c.id === selectedChallenge.categoryId)?.name}</div>
                                        <div><strong>반복 주기:</strong> {selectedChallenge.interval === 1 ? '매일' : `${selectedChallenge.interval}일마다`}</div>
                                        <div><strong>현재 달성:</strong> {selectedChallenge.completions?.length ?? 0}회</div>
                                        {selectedChallenge.targetCount != null && <div><strong>목표 횟수:</strong> {selectedChallenge.targetCount}회</div>}
                                    </div>
                                    <div className="actions">
                                        {(() => {
                                            const completedCount = selectedChallenge.completions?.length ?? 0;
                                            const targetCount = selectedChallenge.targetCount ?? null;
                                            const isFinished = targetCount !== null && completedCount >= targetCount;
                                            const canToggle = isTodayValidDay && (!isFinished || isCompletedToday);

                                            if (canToggle) {
                                                return (
                                                    <SecondaryButton
                                                        $variant={isCompletedToday ? "default" : "primary"}
                                                        onClick={handleToggleToday}
                                                        style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, gap: '8px' }}
                                                    >
                                                        {isCompletedToday ? <X size={18} /> : <Check size={18} />}
                                                        {isCompletedToday ? "오늘 달성 취소" : "오늘 달성 완료!"}
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
                                                        {isChallengeEnded && !isFinished ? "챌린지 종료" : "목표 달성 완료"}
                                                    </SecondaryButton>
                                                );
                                            }
                                            return (
                                                <SecondaryButton
                                                    $variant="default"
                                                    disabled
                                                    style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, gap: '8px', opacity: 0.5, cursor: 'not-allowed' }}
                                                >
                                                    오늘은 달성일이 아닙니다
                                                </SecondaryButton>
                                            );
                                        })()}
                                        <div className="sub-actions">
                                            <SecondaryButton onClick={handleEditClick} style={{ gap: '6px' }}>
                                                <Settings2 size={16} /> Edit
                                            </SecondaryButton>
                                            <SecondaryButton $variant="danger" onClick={handleDelete} style={{ gap: '6px' }}>
                                                <Trash2 size={16} /> Delete
                                            </SecondaryButton>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="placeholder">챌린지를 선택하거나 새로 생성해주세요.</div>
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
        </S.BotanicalCalendarWrapper>
    );
}
