import type { ReactNode } from "react";
import type { CategoryType, ChallengeType } from "@/types";
import type * as CelestialS from "./celestial/CelestialChallenge.styles";

/** 갈래의 모양 묶음 — Celestial·Maple 은 같은 배치(CelestialChallengeLayout)에 제 모양을 입힌다 */
export type ChallengeStyles = typeof CelestialS;

/**
 * 고른 챌린지의 오늘 칸에 대해 할 수 있는 것.
 * mark: 달성하기 · undo: 달성 취소 · ended: 기간이 끝남 · reached: 목표를 채움 · rest: 오늘은 칸이 아님
 */
export type ChallengeTodayState = "mark" | "undo" | "ended" | "reached" | "rest";

/** 갈래 공용 자료·손잡이와 이미 그린 조각 — 어디에 어떻게 놓을지는 갈래가 정한다 */
export interface ChallengeLayoutProps {
    S: ChallengeStyles;
    categories: CategoryType[];
    /** 카테고리로 거른 것 전부와, 그것을 진행 중 / 끝남 으로 나눈 것 */
    challenges: ChallengeType[];
    ongoing: ChallengeType[];
    finished: ChallengeType[];
    selectedChallenge: ChallengeType | null;
    select: (id: string | null) => void;
    onCreate: () => void;
    onEdit: () => void;
    onDelete: () => void;
    today: ChallengeTodayState;
    onToggleToday: () => void;
    /** 카테고리 거르개 */
    filter: ReactNode;
    /** 고른 챌린지의 스티커 판 (고르지 않았거나 칸이 없으면 안내 문구) */
    board: ReactNode;
    /** 만들기·고치기 창 */
    dialogs: ReactNode;
}
