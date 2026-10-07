import type { ReactNode } from "react";
import type { CategoryType } from "@/types";
import type * as CelestialS from "./celestial/CelestialCategory.styles";

/** 갈래의 모양 묶음 — Celestial·Maple 은 같은 배치(CelestialCategoryLayout)에 제 모양을 입힌다 */
export type CategoryStyles = typeof CelestialS;

/**
 * 갈래 공용 자료·손잡이와 이미 그린 조각 — 어디에 어떻게 놓을지는 갈래가 정한다.
 * 조각(plate…todos)은 고른 카테고리가 있을 때만 쓴다.
 */
export interface CategoryLayoutProps {
    S: CategoryStyles;
    categories: CategoryType[];
    selectedCategoryId: string | null;
    selectedCategory: CategoryType | undefined;
    select: (id: string) => void;
    /** 새 카테고리 창 열기 */
    onAdd: () => void;
    /** 고른 카테고리 지우기 (묻고 나서) */
    onDelete: () => void;
    activeTab: 'info' | 'todos';
    /** 색 견본(눌러 색 바꾸기)과 이름 입력칸·요약 */
    plate: ReactNode;
    /** 상세 정보 / 할 일 목록 탭 */
    tabs: ReactNode;
    /** 만든 사람 한 줄 */
    creator: ReactNode;
    /** 설명 입력칸 */
    description: ReactNode;
    /** 멤버 구역 이름과 참여자들(+ 초대) */
    members: ReactNode;
    /** 할 일 구역 이름과 카드들 (없으면 빈 상자) */
    todos: ReactNode;
    /** 고르기 전 안내 */
    empty: ReactNode;
    /** 초대 · 내보내기 창 */
    dialogs: ReactNode;
}
