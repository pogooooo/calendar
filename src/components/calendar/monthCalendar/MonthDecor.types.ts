/**
 * 월간 달력의 갈래 장식 — 갈래마다 한 벌(celestial/·maple/·ocean/ 의 *MonthDecor.tsx). MonthCalendarView 가 usePickTheme 로 고른다.
 *   Board — 판(요일 줄+격자)에 붙어 함께 들어오고 나가는 장면 (바다: 오늘 칸 위로 내려오는 햇살). 칸 뒤에 깔린다.
 *   Stage — 격자 위에 잠깐 얹는 장면, 판이 갈려도 제자리 (바다: 달을 넘길 때 물마루 빛 한 줄).
 *   Marks — 칸 하나의 표시 (오늘·고른 날·괘선의 별·그날의 달 따위). 칸 안에 깔린다.
 *   셋 다 누르는 것은 받지 않는다 — 글을 덮지 않는다.
 * 달을 넘겨 새 판이 들어오면 판에 data-entering 이 붙는다(SwapLayer) — 칸의 차례(--cell, 0~41)로 장식이 물결처럼 차례로 움직인다.
 * 움직이는 동안만 data-swapping, 나가는 판에는 data-leaving(+ data-dir) — 넘어가는 장을 종이로 칠하는 것 따위가 본다.
 * 칸의 내용(날짜·막대)은 숨겼다 보이지 않는다 — 예전 바다의 칸마다 떠오르는 등장은 깜빡임으로 보였다.
 */
import type { ReactNode } from "react";

/** 갈래 한 벌 — 갈래마다 celestial/·maple/·ocean/ 의 *MonthDecor.tsx 가 이 꼴로 내보낸다 */
export interface MonthDecor {
    Board: (p: MonthBoardProps) => ReactNode;
    Stage: (p: MonthStageProps) => ReactNode;
    Marks: (p: CellMarksProps) => ReactNode;
}

export interface MonthBoardProps {
    /** 판의 주들 (보통 6주 × 7일) */
    weeks: Date[][];
    /** 오늘 (Date.toDateString — 칸의 isToday 와 같은 셈) */
    todayStr: string;
}

export interface MonthStageProps {
    /** 펼친 달 */
    month: Date;
    /** 1: 다음 달로 · -1: 이전 달로 */
    direction: number;
}

export interface CellMarksProps {
    date: Date;
    /** 칸의 날 키 (YYYY-MM-DD) */
    cellKey: string;
    isToday: boolean;
    isSelected: boolean;
    isCurrentMonth: boolean;
    /** 몇째 칸·몇째 주 (0부터) */
    col: number;
    row: number;
}
