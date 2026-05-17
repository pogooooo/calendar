"use client";

import * as React from "react";
import { Plus, Trash2, Settings2, Sparkles, X, Check } from "lucide-react";

import CategoryFilter from "@/components/calendar/celestial/categoryFilter/CategoryFilter";
import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import ChallengeModal, { ChallengeData } from "@/components/modal/challengeModal/ChallengeModal";
import { DynamicSticker } from "@/assets/celestial/ChallengeStickers";
import * as S from "./CelestialChallenge.styles";
import { CategoryType } from "@/store/useCategoryStore";
import { ChallengeType } from "@/store/useChallengeStore";

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
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    modalMode: 'create' | 'edit';
    handleSaveChallenge: (data: ChallengeData) => Promise<void>;
    leftRatio: number;
    topRatio: number;
    handleHResize: (e: React.MouseEvent) => void;
    handleVResize: (e: React.MouseEvent) => void;
    contentRef: React.RefObject<HTMLDivElement | null>;
    rightPanelRef: React.RefObject<HTMLDivElement | null>;
}

export default function CelestialChallenge({
                                               categories, challenges, selectedCategoryIds, toggleCategory,
                                               selectedChallenge, setSelectedChallengeId,
                                               handleCreateNew, handleEditClick, handleDelete,
                                               handleToggleToday, isCompletedToday,
                                               isModalOpen, setIsModalOpen, modalMode, handleSaveChallenge,
                                               leftRatio, topRatio, handleHResize, handleVResize, contentRef, rightPanelRef
                                           }: CelestialChallengeProps) {

    const renderStickerBoard = () => {
        if (!selectedChallenge) return <span className="placeholder">챌린지를 선택하여 스티커 보드를 확인하세요.</span>;

        const completions = selectedChallenge.completions || [];
        const currentCount = completions.length;
        // undefined 방지
        const target = selectedChallenge.targetCount ?? null;

        const totalSlots = target ? target : currentCount;
        const slots = Array.from({ length: totalSlots }, (_, i) => i < currentCount);

        if (totalSlots === 0) {
            return <span className="placeholder">오늘의 챌린지를 달성하고 첫 스티커를 받아보세요!</span>;
        }

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

    return (
        <S.CelestialCalendarWrapper>
            <S.DateHeader>
                <span>Celestial Challenges</span>
                <hr />
            </S.DateHeader>

            <S.ContentLayout ref={contentRef}>
                <S.TimelineSection $flex={leftRatio}>
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
                        {challenges.map((challenge) => {
                            const completedCount = challenge.completions?.length || 0;
                            const targetCount = challenge.targetCount ?? null;
                            const isCompleted = targetCount !== null && completedCount >= targetCount;
                            const progress = targetCount
                                ? Math.round((completedCount / targetCount) * 100)
                                : 0;
                            const catColor = categories.find(c => c.id === challenge.categoryId)?.color || "gray";

                            return (
                                <S.ChallengeRow
                                    key={challenge.id}
                                    onClick={() => setSelectedChallengeId(challenge.id)}
                                    $isSelected={selectedChallenge?.id === challenge.id}
                                    $catColor={catColor}
                                >
                                    <div className="challenge-info">
                                        <div className="title">
                                            {isCompleted && <Sparkles size={16} fill="gold" color="gold" className="star-icon" />}
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
                        })}
                        {challenges.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'gray', fontSize: '0.9rem' }}>
                                표시할 챌린지가 없습니다.
                            </div>
                        )}
                    </S.TimelineScrollArea>
                </S.TimelineSection>

                <S.HResizer onMouseDown={handleHResize}>
                    <div className="handle" />
                </S.HResizer>

                <S.SideSection $flex={100 - leftRatio} ref={rightPanelRef}>
                    <S.StickerBoardCard $flex={topRatio}>
                        <div className="card-header">
                            Sticker Board {selectedChallenge && `- ${selectedChallenge.title}`}
                        </div>
                        <div className="sticker-content">
                            {renderStickerBoard()}
                        </div>
                    </S.StickerBoardCard>

                    <S.VResizer onMouseDown={handleVResize}>
                        <div className="handle" />
                    </S.VResizer>

                    <S.TaskCard $flex={100 - topRatio}>
                        <div className="card-header">
                            Challenge Details
                        </div>

                        <S.DetailArea>
                            {selectedChallenge ? (
                                <div className="detail-content">
                                    <h3>{selectedChallenge.title}</h3>
                                    <p>{selectedChallenge.description || "설명이 없습니다."}</p>
                                    <div className="stats">
                                        <div><strong>카테고리:</strong> {categories.find(c => c.id === selectedChallenge.categoryId)?.name}</div>
                                        <div><strong>반복 주기:</strong> {selectedChallenge.interval === 1 ? '매일' : `${selectedChallenge.interval}일마다`}</div>
                                        <div><strong>현재 달성:</strong> {selectedChallenge.completions?.length || 0}회</div>
                                        {selectedChallenge.targetCount != null && <div><strong>목표 횟수:</strong> {selectedChallenge.targetCount}회</div>}
                                    </div>
                                    <div className="actions">
                                        <SecondaryButton
                                            $variant={isCompletedToday ? "default" : "primary"}
                                            onClick={handleToggleToday}
                                            style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, gap: '8px' }}
                                        >
                                            {isCompletedToday ? <X size={18} /> : <Check size={18} />}
                                            {isCompletedToday ? "오늘 달성 취소" : "오늘 달성 완료!"}
                                        </SecondaryButton>

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
                                <div className="placeholder">
                                    챌린지를 선택하거나 새로 생성해주세요.
                                </div>
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
                        ? {
                            ...selectedChallenge,
                            description: selectedChallenge.description ?? null,
                            targetCount: selectedChallenge.targetCount ?? null
                        }
                        : null
                }
                onSave={handleSaveChallenge}
            />
        </S.CelestialCalendarWrapper>
    );
}