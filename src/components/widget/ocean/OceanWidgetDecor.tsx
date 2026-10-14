"use client";
/**
 * Ocean 위젯의 바탕 무늬 — 앱의 물을 닮게: 물빛(위는 청록, 아래는 모래빛), 물바닥에 어른거리는 빛 그물(물결이 모은 햇빛 — 커스틱),
 * 위에서 비스듬히 내려오는 햇살, 구석에 떠 있는 유리 방울 몇 개(위젯마다 다른 자리).
 * 멈춘 그림이다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 커서가 들어오면 방울이 한 번 떠오르고
 * 빛 그물이 조금 흘렀다 돌아온다(useHoverOnce). 글 뒤에 깔리고 누르는 것은 받지 않는다.
 *
 * 빛 그물은 SVG 의 난류(feTurbulence)로 그린다: 'turbulence' 는 |잡음| 의 합이라 0 근처가 가는 주름 그물이 되는데,
 * 그 낮은 값만 밝게(feFuncA 표) 남기면 물바닥의 빛 그물이 된다. 색은 표를 지난 뒤에 입힌다 — 먼저 입히면
 * 잡음의 알파가 꼭 0 인 점(미리 곱한 색이 0)이 표를 지나 불투명해지면서 검은 점으로 남는다.
 */
import { useId, useMemo, useRef } from "react";
import { useTheme } from "styled-components";
import * as S from "./OceanWidgetDecor.styles";
import useHoverOnce from "@/hooks/useHoverOnce";
import { seededRandom } from "../seededRandom";
import type { WidgetKind } from "@/store/useWidgetStore";

export default function OceanWidgetDecor({ kind, busy }: { kind: WidgetKind; locked: boolean; busy: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    useHoverOnce(ref, 2200);
    const dark = useTheme().mode === "dark";
    const fid = `${useId().replace(/[^\w-]/g, "")}-caustic`;
    const { seed, bubbles } = useMemo(() => {
        const r = seededRandom(`ocean:${kind}`);
        const seed = 1 + Math.floor(r() * 90);
        // 왼쪽·오른쪽 아래 구석에 모여 뜬다 — 글이 가장 적은 자리
        const bubbles = Array.from({ length: busy ? 3 : 7 }, (_, i) => {
            const side = i % 2 === 0;
            return {
                left: Math.round((side ? 3 + r() * 16 : 80 + r() * 16) * 10) / 10,
                bottom: Math.round((4 + r() * 34) * 10) / 10,
                size: Math.round(5 + r() * 11),
                delay: Math.round(r() * 40) / 100,
            };
        });
        return { seed, bubbles };
    }, [kind, busy]);

    return (
        <S.Decor ref={ref} aria-hidden="true" data-ambient="widget-decor">
            <span className="tint" />
            <span className="caustics">
                <svg width="100%" height="100%" focusable="false">
                    <filter id={fid} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                        <feTurbulence type="turbulence" baseFrequency="0.022 0.03" numOctaves={2} seed={seed} />
                        <feComponentTransfer><feFuncA type="table" tableValues="1 0.22 0 0 0 0 0 0" /></feComponentTransfer>
                        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
                        <feGaussianBlur stdDeviation={0.4} />
                        {/* 밝은 바탕에서는 흰 그물이 묻힌다 — 그물 아래에 청록 그늘을 조금 비켜 깔아 물속의 깊이를 낸다 */}
                        {!dark && <feDropShadow dx={1} dy={1.6} stdDeviation={0.9} floodColor="#1f8a8f" floodOpacity={0.35} />}
                    </filter>
                    <rect width="100%" height="100%" filter={`url(#${fid})`} />
                </svg>
            </span>
            <span className="rays" />
            {bubbles.map((b, i) => (
                <i key={i} className="bubble" style={{ left: `${b.left}%`, bottom: `${b.bottom}%`, width: b.size, height: b.size, animationDelay: `${b.delay}s` }} />
            ))}
        </S.Decor>
    );
}
