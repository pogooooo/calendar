"use client";

import { useT } from "@/i18n/useT";
import * as S from "./MapleNotebook.styles";

/** 달 카드의 일정 막대 — [줄, 첫 칸, 칸 수, 색] (5줄 × 7칸) */
const BARS: readonly (readonly [number, number, number, "primary" | "accent" | "sage"])[] = [
    [0, 2, 2, "accent"],
    [1, 5, 1, "primary"],
    [2, 0, 3, "sage"],
    [3, 3, 2, "accent"],
    [4, 1, 1, "primary"],
];
const TODAY = 2 * 7 + 4;

/** 칸 i 에 걸친 막대 조각 — 막대의 처음·끝이면 그쪽 끝을 둥글게 */
const pieceAt = (i: number) => {
    const row = Math.floor(i / 7);
    const col = i % 7;
    const bar = BARS.find(([r, c, w]) => r === row && col >= c && col < c + w);
    if (!bar) return null;
    const [, c, w, tone] = bar;
    return [tone, col === c ? "start" : "", col === c + w - 1 ? "end" : ""].filter(Boolean).join(" ");
};

/**
 * Maple 의 그림 한 장 — 가을 노트 두 장(달 카드 뒤에 오늘 카드)이 비스듬히 겹쳐 놓이고, 그 귀퉁이에 붉은 단풍잎 하나.
 * 작은 잎 몇 장이 카드 앞으로 천천히 진다. 로그인 옆 그림판(MapleAuthPanel)과 내려받기 화면의 큰 그림(MapleHeroScene)이 같이 쓴다.
 * 크기는 부르는 쪽이 글자 크기(--nb, 기본 10px)로 준다 — 모든 치수가 em 이다.
 * 2026-10-15 다시 그리며 3D 표본 카드(테이프·도장·도감 이름표를 그린 그림, MapleSpecimen)를 이것으로 바꿨다.
 */
export default function MapleNotebook({ busy = false }: { busy?: boolean }) {
    const t = useT();
    return (
        <S.Scene aria-hidden="true" data-busy={busy ? "" : undefined}>
            <S.MonthCard>
                <div className="head"><b /><i /></div>
                <div className="grid">
                    {Array.from({ length: 35 }, (_, i) => {
                        const piece = pieceAt(i);
                        return (
                            <span key={i} className={i === TODAY ? "today" : undefined}>
                                {piece && <em className={piece} />}
                            </span>
                        );
                    })}
                </div>
            </S.MonthCard>

            <S.TodayCard>
                <div className="title">{t.home.today}<small>3</small></div>
                <div className="row done"><i /><span className="w62" /></div>
                <div className="row"><i /><span className="w78" /></div>
                <div className="row"><i /><span className="w48" /></div>
                <div className="progress"><b /></div>
            </S.TodayCard>

            <S.Leaf className="rest" />
            {[0, 1, 2, 3].map((i) => <S.Leaf key={i} className={`fall fall-${i}`} />)}
        </S.Scene>
    );
}
