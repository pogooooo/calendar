"use client";

import * as React from "react";

import CategoryFilter from "@/components/calendar/parts/categoryFilter/CategoryFilter";
import ChallengeModal, { ChallengeData } from "@/components/modal/challengeModal/ChallengeModal";
import { DynamicSticker } from "@/assets/ChallengeStickers";
import { useT } from "@/i18n/useT";
import type { CategoryType, ChallengeType } from "@/types";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialChallenge.styles";
import * as MapleS from "./maple/MapleChallenge.styles";
import * as OceanS from './ocean/OceanChallenge.styles';
import CelestialChallengeLayout from "./celestial/CelestialChallengeLayout";
import OceanChallengeLayout from "./ocean/OceanChallengeLayout";
import type { ChallengeTodayState } from "./ChallengeLayout.types";

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

/** 갈래마다 제 배치 — Maple 은 Celestial 의 배치(목록 | 판 둘)에 제 모양을 입히고, 바다는 카드 갤러리와 펼친 무대 */
const LAYOUTS = { celestial: CelestialChallengeLayout, maple: CelestialChallengeLayout, ocean: OceanChallengeLayout };

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

export default function ChallengeView({
    categories, challenges, selectedCategoryIds, toggleCategory,
    selectedChallenge, setSelectedChallengeId,
    handleCreateNew, handleEditClick, handleDelete,
    handleToggleToday, isCompletedToday, isTodayValidDay, isChallengeEnded,
    isModalOpen, setIsModalOpen, modalMode, handleSaveChallenge,
}: CelestialChallengeProps) {
    const S = usePickTheme(STYLES);
    const Layout = usePickTheme(LAYOUTS);
    const tr = useT().challenge;

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

    // ── 오늘 칸에 대해 할 수 있는 것 ──────────────────────────────────────────
    const completedCount = selectedChallenge?.completions?.length ?? 0;
    const targetCount    = selectedChallenge?.targetCount ?? null;
    const isFinished     = targetCount !== null && completedCount >= targetCount;
    const canToggle      = isTodayValidDay && (!isFinished || isCompletedToday);
    const today: ChallengeTodayState = canToggle
        ? (isCompletedToday ? "undo" : "mark")
        : isFinished || isChallengeEnded
            ? (isChallengeEnded && !isFinished ? "ended" : "reached")
            : "rest";

    return (
        <Layout
            S={S}
            categories={categories}
            challenges={challenges}
            ongoing={ongoingChallenges}
            finished={finishedChallenges}
            selectedChallenge={selectedChallenge}
            select={setSelectedChallengeId}
            onCreate={handleCreateNew}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            today={today}
            onToggleToday={handleToggleToday}
            filter={(
                <CategoryFilter
                    categories={categories}
                    selectedCategoryIds={selectedCategoryIds}
                    onToggle={toggleCategory}
                />
            )}
            board={renderStickerBoard()}
            dialogs={(
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
            )}
        />
    );
}
