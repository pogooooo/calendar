"use client";
/**
 * Maple 월간의 칸 표시 — 가을 다이어리 한 쪽.
 *   - 오늘: 숫자 알약 뒤에 눌러 말린 수채 단풍잎 한 장(날마다 붉음·주황·노랑·갈빛이 돌아간다). 칸에 마우스가 오면 한 번 흔들린다
 *   - 고른 날: 붉은 연필로 날짜 둘레에 동그라미를 그린다(고른 순간 그어지는 획)
 * 판·장면(Board·Stage)은 따로 없다 — 앱 바탕의 단풍 가지가 그 몫이고, 달을 넘기면 다이어리 한 장이 책등을 축으로 넘어간다
 * (paperMotion — 넘어가는 장은 종이로 칠하고 그늘을 드리운다, MapleMonthCalendar.styles 의 CalendarWindow).
 */
import { todaySprite } from "@/components/objet/maple/art";
import type { CellMarksProps } from "../MonthDecor.types";
import * as S from "./MapleMonthDecor.styles";

export const Board = () => null;
export const Stage = () => null;

export function Marks({ date, isToday, isSelected }: CellMarksProps) {
    return <>
        {isToday && <S.PressedLeaf aria-hidden="true" data-leaf={todaySprite(date)} />}
        {isSelected && (
            <S.Pencil viewBox="0 0 40 28" aria-hidden="true" focusable="false" data-today={isToday ? "" : undefined}>
                <path pathLength={100} d="M8.5 6.2C15 1.6 31.4 1.8 35.6 8.9C39.4 15.4 31.2 24.4 19.6 24.6C9.4 24.8 2.6 19.4 4.3 12.6C5.5 7.9 11 4.1 18.4 3.2" />
            </S.Pencil>
        )}
    </>;
}
