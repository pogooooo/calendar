"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import { Plus, Trash2, Settings2, X, Check } from "lucide-react";

import SecondaryButton from "@/components/button/secondary/SecondaryButton";
import EmptyArt from "@/components/empty/EmptyArt";
import { useT } from "@/i18n/useT";
import type { ChallengeType } from "@/types";
import type { ChallengeLayoutProps } from "../ChallengeLayout.types";

/**
 * Celestial(과 Maple)의 챌린지 배치 — 왼쪽 목록 | 오른쪽 위 스티커 판 · 아래 자세히. 판 사이를 끌어 넓이를 바꾼다.
 * 예전 ChallengeView 의 뼈대를 그대로 옮겼다. 모양은 받은 S(갈래의 *.styles)가 입힌다.
 */
export default function CelestialChallengeLayout({
    S, categories, challenges, ongoing, finished,
    selectedChallenge, select, onCreate, onEdit, onDelete,
    today, onToggleToday, filter, board, dialogs,
}: ChallengeLayoutProps) {
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

    const renderChallengeCard = (challenge: ChallengeType) => {
        const completedCount = challenge.completions?.length ?? 0;
        const targetCount    = challenge.targetCount ?? null;
        const isCompleted    = targetCount !== null && completedCount >= targetCount;
        const progress       = targetCount ? Math.round((completedCount / targetCount) * 100) : 0;
        const catColor       = categories.find(c => c.id === challenge.categoryId)?.color ?? "gray";

        return (
            <S.ChallengeRow
                key={challenge.id}
                onClick={() => select(challenge.id)}
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
                            {filter}
                            <button className="add-header-btn" onClick={onCreate}>
                                <Plus size={16} /> {tr.new}
                            </button>
                        </div>
                    </div>
                    <S.TimelineScrollArea>
                        {ongoing.length > 0 && (
                            <div style={{ padding: '12px 16px 4px', fontSize: '0.8rem', fontWeight: 600, color: theme?.colors.textSecondary }}>
                                {tr.ongoing}
                            </div>
                        )}
                        {ongoing.map(renderChallengeCard)}

                        {challenges.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'gray', fontSize: '0.9rem' }}>
                                {tr.none}
                            </div>
                        )}

                        {finished.length > 0 && (
                            <>
                                <div style={{ padding: '12px 16px 4px', marginTop: '10px', fontSize: '0.8rem', fontWeight: 600, color: theme?.colors.textSecondary, borderTop: `1px solid ${theme?.colors.primary}33` }}>
                                    {tr.finished}
                                </div>
                                {finished.map(renderChallengeCard)}
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
                            {board}
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
                                        {today === "mark" || today === "undo" ? (
                                            <SecondaryButton
                                                $variant={today === "undo" ? "default" : "primary"}
                                                onClick={onToggleToday}
                                                style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, gap: '8px' }}
                                            >
                                                {today === "undo" ? <X size={18} /> : <Check size={18} />}
                                                {today === "undo" ? tr.cancelToday : tr.doneToday}
                                            </SecondaryButton>
                                        ) : today === "ended" || today === "reached" ? (
                                            <SecondaryButton
                                                $variant="default"
                                                disabled
                                                style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, opacity: 0.6, cursor: 'not-allowed' }}
                                            >
                                                {today === "ended" ? tr.ended : tr.goalReached}
                                            </SecondaryButton>
                                        ) : (
                                            <SecondaryButton
                                                $variant="default"
                                                disabled
                                                style={{ padding: '12px', fontSize: '1rem', fontWeight: 600, gap: '8px', opacity: 0.5, cursor: 'not-allowed' }}
                                            >
                                                {tr.notTodaySlot}
                                            </SecondaryButton>
                                        )}
                                        <div className="sub-actions">
                                            <SecondaryButton onClick={onEdit} style={{ gap: '6px' }}>
                                                <Settings2 size={16} /> {tr.edit}
                                            </SecondaryButton>
                                            <SecondaryButton $variant="danger" onClick={onDelete} style={{ gap: '6px' }}>
                                                <Trash2 size={16} /> {tr.delete}
                                            </SecondaryButton>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="placeholder"><EmptyArt kind="challenges" />{tr.selectOrCreate}</div>
                            )}
                        </S.DetailArea>
                    </S.TaskCard>
                </S.SideSection>
            </S.ContentLayout>

            {dialogs}
        </S.CelestialCalendarWrapper>
    );
}
