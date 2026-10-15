"use client";
/**
 * Maple 위젯의 바탕 무늬 — 앱의 가을 노트를 닮게: 카드 위에 진 단풍잎 몇 장(또렷한 벡터 잎, 단풍 붉음·호박빛·갈잎빛을 옅게),
 * 오른쪽 아래 구석에 크게 걸친 선 잎 한 장(가는 선과 잎맥), 위쪽에서 비치는 따뜻한 빛 한 겹.
 * (사용자: "다른 위젯에서도 테마의 느낌이 잘 보이게 — 오션처럼 물결이 보인다던가") 앱의 바탕은 잎이 지는 장면이라 위젯에는 이미 진 잎을 깐다.
 * 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 커서가 들어오면 잎이 한 번 살짝 들썩인다(useHoverOnce).
 * 칸이 판을 채우는 위젯(달력·주간, busy)에서는 잎을 몇 장만, 구석 잎은 작게 — 날짜 숫자 뒤에 잎이 겹치면 읽기 어렵다.
 * 2026-10-15 다시 그리며 수채 잎 그림·먹 카드 테(card-frame)·수채 가지(hero-branch)를 걷었다.
 */
import { useMemo, useRef } from "react";
import * as S from "./MapleWidgetDecor.styles";
import useHoverOnce from "@/hooks/useHoverOnce";
import { seededRandom } from "../seededRandom";
import type { WidgetKind } from "@/store/useWidgetStore";

/**
 * 잎이 놓일 자리 — 가장자리를 따라(글이 가장 적은 곳). [왼쪽 % 범위, 위쪽 % 범위, 크기 배].
 * 오른쪽 아래 구석은 큰 잎 자리라 비운다. 왼쪽 띠는 체크 칸이 있어 아주 끝에만 작게.
 */
const SLOTS: [[number, number], [number, number], number][] = [
    [[6, 16], [8, 15], 1],
    [[52, 68], [5, 10], 0.8],
    [[90, 95], [26, 40], 0.9],
    [[4, 14], [84, 92], 1.1],
    [[32, 46], [88, 94], 0.85],
    [[0, 3], [48, 60], 0.7],
];
/** 칸이 가득한 위젯에서 남길 자리 */
const BUSY_SLOTS = [0, 2, 4];
const TONES = ["red", "amber", "brown"] as const;

export default function MapleWidgetDecor({ kind, busy }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useHoverOnce(ref, 1800);
    const leaves = useMemo(() => {
        const r = seededRandom(`maple:${kind}`);
        const start = Math.floor(r() * 3);
        return SLOTS.map(([[x0, x1], [y0, y1], scale], i) => ({
            i,
            tone: TONES[(start + i) % TONES.length],
            left: Math.round((x0 + r() * (x1 - x0)) * 10) / 10,
            top: Math.round((y0 + r() * (y1 - y0)) * 10) / 10,
            size: Math.round(scale * (0.8 + r() * 0.4) * 100) / 100,
            turn: Math.round(r() * 360),
            delay: Math.round(r() * 25) / 100,
        })).filter((l) => !busy || BUSY_SLOTS.includes(l.i));
    }, [kind, busy]);

    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor" data-busy={busy || undefined}>
            <span className="light" />
            {leaves.map((l) => (
                <i
                    key={l.i}
                    className={`leaf ${l.tone}`}
                    style={{ left: `${l.left}%`, top: `${l.top}%`, ["--s" as string]: l.size, ["--turn" as string]: `${l.turn}deg`, animationDelay: `${l.delay}s` }}
                />
            ))}
            <i className="corner" />
        </S.Decor>
    );
}
