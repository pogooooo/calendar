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
import { challengeExpired, completionKey, slotKey, slotsUntil } from "@/lib/challengeDays";
import { useListMotion, useSwapMotion } from "@/hooks/useMotion";

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
    /** 오늘 (사용자 시간대의 날짜 키) */
    todayKey: string;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
    modalMode: 'create' | 'edit';
    handleSaveChallenge: (data: ChallengeData) => Promise<void>;
}

export default function ChallengeView({
    categories, challenges, selectedCategoryIds, toggleCategory,
    selectedChallenge, setSelectedChallengeId,
    handleCreateNew, handleEditClick, handleDelete,
    handleToggleToday, isCompletedToday, isTodayValidDay, isChallengeEnded, todayKey,
    isModalOpen, setIsModalOpen, modalMode, handleSaveChallenge,
}: CelestialChallengeProps) {
    const S = usePickTheme(STYLES);
    const Layout = usePickTheme(LAYOUTS);
    const tr = useT().challenge;

    // ── 유틸 — 날 셈은 날짜 키로 (src/lib/challengeDays.ts) ────────────────────
    const isChallengeExpired = (c: typeof challenges[0]) => challengeExpired(c, todayKey);

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

    /* Celestial·Maple 의 배치(CelestialChallengeLayout — 갈래 폴더라 여기서 ref 를 달 수 없다)의 판을 모양 이름(S.X 의 고유 클래스)으로 찾는다.
       다른 챌린지를 고르면 스티커 판·자세히가 그 차례 쪽에서 들어오고(목록 아래쪽이면 아래에서), 목록에 든 줄·지운 줄은 한 줄씩.
       바다는 제 배치(OceanChallengeLayout)가 따로 한다 — 이 이름들이 그 화면엔 없어 여기서는 아무 일도 없다 */
    useSwapMotion(selectedChallenge?.id, () => Array.from(document.querySelectorAll(`${S.StickerBoardCard} .sticker-content, ${S.DetailArea}`)), {
        order: [...ongoingChallenges, ...finishedChallenges].map(c => c.id),
        axis: "y",
    });
    useListMotion(() => document.querySelector(`${S.TimelineScrollArea}`), { exit: "collapse", filter: (el) => el.matches(`${S.ChallengeRow}`) });
    // 오늘 칸을 채우면 그 스티커가 갈래의 끝냄 몸짓을 한 번 한다(바다: 물결 고리 · Maple: 도장 · Celestial: 톡) — 다른 챌린지로 갈면 빼고
    const stickerGridRef = React.useRef<HTMLDivElement>(null);
    useListMotion(stickerGridRef, { reset: selectedChallenge?.id, enter: false });

    const renderStickerBoard = () => {
        if (!selectedChallenge) return <span className="placeholder">{tr.selectForBoard}</span>;

        const target   = selectedChallenge.targetCount ?? null;
        // 완료는 서버가 적은 UTC 날로, 칸은 시작일에서 interval 일마다 (서쪽 시간대에서 하루씩 밀려 보이던 것)
        const completedSet = new Set((selectedChallenge.completions ?? []).map(completionKey));
        const count = target !== null ? target : slotsUntil(selectedChallenge, todayKey);
        if (count === 0) return <span className="placeholder">{tr.notStarted}</span>;
        const slots: boolean[] = Array.from({ length: count }, (_, i) => completedSet.has(slotKey(selectedChallenge, i)));

        if (slots.length === 0) return <span className="placeholder">{tr.firstSticker}</span>;

        return (
            <S.StickerGrid ref={stickerGridRef}>
                {slots.map((isFilled, idx) => (
                    <S.StickerSlot key={idx} data-done={isFilled ? "" : undefined} data-motion-mark="">
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
