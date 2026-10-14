"use client";
/**
 * Celestial 위젯의 바탕 무늬 — 앱의 별하늘·혼천의를 닮게(직선·달·별·혼천의만, 촘촘하게):
 * 옅은 별하늘(작은 점, 위젯마다 다른 자리), 금선 두 겹 테와 거기 꿴 네 갈래 별(네 귀퉁이·양옆 가운데·아래 두 곳 — 타로 카드의 겉테·속테),
 * 테 안쪽 양옆의 눈금(혼천의 고리의 도수), 아래 테에 꿴 달의 위상 줄, 오른쪽 아래의 옅은 혼천의.
 * 네 갈래 별·초승달은 하늘에 흩지 않고 테에만 꿴다 — 위젯의 칸(체크 상자)은 바탕이 비쳐서, 그 안에 별이 비치면
 * 고른 표시처럼 읽히고 초승달은 글자(C)처럼 읽혔다. 하늘에는 점만 둔다.
 * 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 커서가 들어오면 별이 차례로 한 번 반짝이고
 * 위상 줄의 달이 차례로 부풀고 혼천의의 고리가 조금 돈다(useHoverOnce). 글 뒤에 깔리고 누르는 것은 받지 않는다.
 */
import { useMemo, useRef } from "react";
import * as S from "./CelestialWidgetDecor.styles";
import { Armillary, MoonDisc, f } from "@/components/ornament/celestial/CelestialOrnaments";
import useHoverOnce from "@/hooks/useHoverOnce";
import { seededRandom } from "../seededRandom";
import type { WidgetKind } from "@/store/useWidgetStore";

/** 아래 테의 위상 줄 — 삭에서 보름을 지나 다시 삭으로 */
const PHASES = 9, PR = 3, PGAP = 6;
const PW = PHASES * PR * 2 + (PHASES - 1) * PGAP;

export default function CelestialWidgetDecor({ kind, busy }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useHoverOnce(ref, 1800);
    const stars = useMemo(() => {
        const r = seededRandom(`celestial:${kind}`);
        return Array.from({ length: 64 }, (_, i) => {
            const big = i % 7 === 0;
            return { x: f(8 + r() * 384), y: f(8 + r() * 284), s: big ? f(1.3 + r() * 0.5) : f(0.45 + r() * 0.8), delay: f(r() * 0.8) };
        });
    }, [kind]);

    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor">
            <svg className="sky" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                {stars.map((s, i) => <circle key={i} className="fill star" cx={s.x} cy={s.y} r={s.s} style={{ animationDelay: `${s.delay}s` }} />)}
            </svg>
            <S.Frame><i /><i /><i /><i /><i /><i /><i /><i /></S.Frame>
            <svg className="phases" viewBox={`-1 -1 ${PW + 2} ${PR * 2 + 2}`} width={PW + 2} height={PR * 2 + 2}>
                {Array.from({ length: PHASES }, (_, i) => (
                    <g key={i} className="moon" style={{ animationDelay: `${f(i * 0.07)}s` }}>
                        <MoonDisc cx={PR + i * (PR * 2 + PGAP)} cy={PR} r={PR} phase={i / (PHASES - 1)} />
                    </g>
                ))}
            </svg>
            {!busy && (
                <svg className="seal" viewBox="0 0 60 60">
                    <circle className="hair dash" cx="30" cy="30" r="27" />
                    <g className="turn"><Armillary cx={30} cy={30} r={17} axis={1.45} planet={false} /></g>
                </svg>
            )}
        </S.Decor>
    );
}
