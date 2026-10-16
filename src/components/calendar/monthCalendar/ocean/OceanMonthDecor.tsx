"use client";
/**
 * 바다 월간의 장면과 칸 표시 — 물웅덩이.
 *   - 오늘: 칸에 물이 차 있다 — 하루가 흐른 만큼(고른 시간대의 벽시계) 물때가 오르고, 물낯은 두 겹 물결로 천천히 흐른다.
 *     숫자는 알약 없이 깊은 물빛 글씨(OceanMonthCalendar.styles). 글 뒤에 깔린다
 *     (2026-10-17 — 사용자: "오션 테마에서 오늘을 표시하는 방식이 별론데 다른걸로" — 알약·햇살 기둥·물결 고리·물방울을 걷었다)
 *   - 장면: 달을 넘기면 물마루 빛 한 줄이 오는 쪽에서 격자를 건너가고, 칸들이 그 물결을 따라 차례로 살짝 출렁인다
 *     (칸의 내용은 숨기지 않는다 — 출렁임은 OceanMonthCalendar.styles 의 DayCell)
 *   - 고른 날: 칸 가운데서 물결 한 번이 퍼진다(고른 순간)
 * 물결이 흐르는 것은 움직임 '풍성하게'에서만, 위젯 창에서는 멈춘 그림이다.
 */
import * as React from "react";
import { wallNow } from "@/lib/dateKey";
import type { CellMarksProps, MonthStageProps } from "../MonthDecor.types";
import * as S from "./OceanMonthDecor.styles";

/** 물때 — 0시에는 바닥 가까이, 자정 앞에는 칸의 4분의 3 쯤(숫자 줄은 남긴다) */
const LOW = 0.14;
const HIGH = 0.76;
const tideNow = () => {
    const w = wallNow();
    return LOW + (HIGH - LOW) * ((w.getHours() * 60 + w.getMinutes()) / 1440);
};

/** 오늘 칸의 물 — 몇 분마다 물때를 다시 잰다 */
function Tide() {
    const [tide, setTide] = React.useState<number | null>(null);
    React.useEffect(() => {
        // 서버 그림과 어긋나지 않게 처음 값도 그린 뒤에 잰다
        setTide(tideNow());
        const id = window.setInterval(() => setTide(tideNow()), 5 * 60_000);
        return () => window.clearInterval(id);
    }, []);
    if (tide == null) return null;
    return (
        <S.Tide aria-hidden="true" style={{ "--tide": tide.toFixed(3) } as React.CSSProperties}>
            <i className="back" />
            <i className="front" />
        </S.Tide>
    );
}

export const Board = () => null;

export function Stage({ month, direction }: MonthStageProps) {
    const key = month.getFullYear() * 12 + month.getMonth();
    const [first] = React.useState(key);
    // 처음 연 달에는 없다 — 넘길 때마다 새로 그려져(key) 한 번 건너간다
    if (key === first) return null;
    return <S.Crest key={key} data-dir={direction < 0 ? "prev" : "next"} aria-hidden="true" />;
}

export function Marks({ isToday, isSelected }: CellMarksProps) {
    return <>
        {isToday && <Tide />}
        {isSelected && <S.Splash aria-hidden="true" />}
    </>;
}
