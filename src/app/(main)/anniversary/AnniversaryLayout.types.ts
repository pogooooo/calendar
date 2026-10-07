import type { FormEvent, ReactNode } from "react";
import type { AnniversaryType } from "@/store/useAnniversaryStore";
import type * as CelestialS from "./celestial/CelestialAnniversary.styles";

/** 갈래의 모양 묶음 — Celestial·Maple 은 같은 배치(CelestialAnniversaryLayout)에 제 모양을 입힌다 */
export type AnniversaryStyles = typeof CelestialS;

/** 다가오는 차례로 선 기념일 하나 — 다음에 돌아오는 날, 남은 날 수, 오늘인지 */
export interface AnniversaryItem {
    anniversary: AnniversaryType;
    date: Date;
    diff: number;
    isToday: boolean;
}

/** 갈래 공용 자료·손잡이와 이미 그린 서식 칸 — 어디에 어떻게 놓을지는 갈래가 정한다 */
export interface AnniversaryLayoutProps {
    S: AnniversaryStyles;
    /** 다가오는 차례 */
    items: AnniversaryItem[];
    onDelete: (a: AnniversaryType) => void;
    /** 새 기념일 서식 보내기 */
    onSubmit: (e: FormEvent) => void;
    /** 서식의 칸들 — 아이콘 고르개 줄과 이름·월·일·추가 줄 */
    fields: ReactNode;
}
