/**
 * CelestialMonthDecor 의 모양 — 괘선의 별·그날의 달·오늘의 궤도·고른 날의 조준선, 달 머리의 혼천의.
 * 모두 금(primary) 선화이고 누르는 것은 받지 않는다. 끝없이 도는 것(행성)은 움직임 '풍성하게'에서만, 위젯 창에서는 멈춘다
 * (ornamentStrokes 의 .orbiter).
 */
import styled, { css, keyframes } from "styled-components";
import { ornamentStrokes } from "@/components/ornament/celestial/CelestialOrnaments.styles";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";

const gold = css`color: ${(p) => p.theme.colors.primary};`;

/** 달을 넘기면 괘선의 별이 차례로 반짝인다 — 커졌다 제자리로 */
const twinkle = keyframes`
    0%   { transform: scale(0.2); opacity: 0; }
    55%  { transform: scale(1.7); opacity: 1; filter: brightness(1.8); }
    100% { transform: scale(1); opacity: 0.8; }
`;

/** 자오선이 판을 건넌다 — 다음 달이면 오른쪽 끝에서 왼쪽 끝으로(판의 clip-path 와 같은 결·길이: starMotion 의 SWEEP) */
const crossNext = keyframes`
    0%   { transform: translateX(100%); opacity: 0; }
    6%   { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateX(0); opacity: 0; }
`;
const crossPrev = keyframes`
    0%   { transform: translateX(0); opacity: 0; }
    6%   { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
`;

/** 고른 날의 조준선이 바깥에서 다가와 잡힌다 */
const lock = keyframes`
    from { inset: -4px; opacity: 0; }
    to   { inset: 3px; opacity: 1; }
`;

/** 괘선이 만나는 자리(칸의 왼쪽 위 모서리)의 별 */
export const Node = styled.svg`
    position: absolute;
    left: -5.5px;
    top: -5.5px;
    width: 11px;
    height: 11px;
    z-index: 3;
    pointer-events: none;
    overflow: visible;
    opacity: 0.8;
    ${gold}
    ${ornamentStrokes}

    :where(html:not([data-theme-motion="off"])) [data-entering] & {
        animation: ${twinkle} 0.7s cubic-bezier(0.2, 0.8, 0.3, 1) both;
        animation-delay: calc(var(--cell, 0) * 18ms);
    }
    /* '풍성하게'면 판이 자오선으로 갈린다 — 금선이 이 모서리를 지나는 때에 반짝인다(Marks 의 --pass-*) */
    :where(html[data-theme-motion="full"]) [data-entering][data-dir="next"] & { animation-delay: calc(var(--pass-next, 0ms) - 40ms); }
    :where(html[data-theme-motion="full"]) [data-entering][data-dir="prev"] & { animation-delay: calc(var(--pass-prev, 0ms) - 40ms); }
    [data-widget] & { display: none; }
    ${MOBILE} { ${NOT_WIDGET} & { width: 8px; height: 8px; left: -4px; top: -4px; } }
`;

/** 그날의 달 — 칸 오른쪽 위 구석. + 단추가 뜨면(칸에 마우스) 비켜 준다 */
export const Moon = styled.svg`
    position: absolute;
    top: 8px;
    right: 8px;
    width: 10px;
    height: 10px;
    z-index: 1;
    pointer-events: none;
    overflow: visible;
    opacity: 0.34;
    transition: opacity 0.2s ease;
    ${gold}
    ${ornamentStrokes}
    .line { stroke-width: 0.9; }

    &[data-principal] { opacity: 0.9; }
    [data-calendar-date]:hover > & { opacity: 0; }

    /* 폰·위젯은 칸이 작다 — 삭·상현·보름·하현 무렵만 */
    ${MOBILE} { ${NOT_WIDGET} & { top: 4px; right: 3px; width: 8px; height: 8px; &:not([data-principal]) { display: none; } } }
    [data-widget] &:not([data-principal]) { display: none; }
`;

/** 오늘 숫자 알약 둘레의 궤도와 행성 — 알약(머리 줄, z 2) 뒤로 고리의 위아래가 지난다 */
export const Ring = styled.svg`
    --orbit: 7s;
    position: absolute;
    left: -8px;
    top: 3px;
    width: 52px;
    height: 24px;
    z-index: 1;
    pointer-events: none;
    overflow: visible;
    ${gold}
    ${ornamentStrokes}
    .line { stroke-width: 0.9; opacity: 0.75; }

    ${MOBILE} { ${NOT_WIDGET} & { display: none; } }
`;

/** 고른 날 — 네 모서리의 조준선 (가로·세로 선만) */
export const Reticle = styled.span`
    position: absolute;
    inset: 3px;
    z-index: 1;
    pointer-events: none;
    ${gold}

    :where(html:not([data-theme-motion="off"])) & { animation: ${lock} 0.32s cubic-bezier(0.2, 0.8, 0.3, 1) both; }

    i {
        position: absolute;
        width: 9px;
        height: 9px;
        border: 0 solid currentColor;
    }
    i:nth-child(1) { left: 0; top: 0; border-left-width: 1.4px; border-top-width: 1.4px; }
    i:nth-child(2) { right: 0; top: 0; border-right-width: 1.4px; border-top-width: 1.4px; }
    i:nth-child(3) { left: 0; bottom: 0; border-left-width: 1.4px; border-bottom-width: 1.4px; }
    i:nth-child(4) { right: 0; bottom: 0; border-right-width: 1.4px; border-bottom-width: 1.4px; }

    ${MOBILE} { ${NOT_WIDGET} & { inset: 2px; i { width: 6px; height: 6px; } } }
`;

/**
 * 자오선 — 눈금 새긴 세로 금선 한 줄. 판 전체 크기의 겹을 옆으로 옮겨 그 왼쪽 끝(금선)이 판을 건넌다.
 * '풍성하게'에서만 보인다(그 밖에는 판이 옅게 갈리기만 한다 — gentleSwap). 위젯 창에는 없다.
 */
export const Meridian = styled.span`
    position: absolute;
    inset: 0;
    z-index: 6;
    pointer-events: none;
    display: none;
    ${gold}
    ${ornamentStrokes}

    :where(html[data-theme-motion="full"]) & { display: block; }
    &[data-dir="next"] { animation: ${crossNext} 0.72s cubic-bezier(0.45, 0.05, 0.35, 1) both; }
    &[data-dir="prev"] { animation: ${crossPrev} 0.72s cubic-bezier(0.45, 0.05, 0.35, 1) both; }
    [data-widget] & { display: none; }

    i { position: absolute; top: 0; bottom: 0; display: block; }
    /* 금선 둘레의 옅은 빛 */
    .glow {
        left: -16px;
        width: 32px;
        background: linear-gradient(90deg, transparent, ${(p) => withAlpha(p.theme.colors.primary, 0.18)}, transparent);
    }
    .rule {
        left: -0.5px;
        width: 1px;
        background: linear-gradient(180deg, transparent, currentColor 5%, currentColor 95%, transparent);
        box-shadow: 0 0 6px ${(p) => withAlpha(p.theme.colors.primary, 0.6)};
    }
    /* 눈금 — 가로로 짧게, 다섯째마다 길게 */
    .ticks {
        left: -3.5px;
        width: 7px;
        opacity: 0.7;
        background:
            repeating-linear-gradient(180deg, currentColor 0 1px, transparent 1px 90px) 0 0 / 7px 100%,
            repeating-linear-gradient(180deg, currentColor 0 1px, transparent 1px 18px) 2px 0 / 3px 100%;
        background-repeat: no-repeat;
        -webkit-mask-image: linear-gradient(180deg, transparent, #000 8%, #000 92%, transparent);
        mask-image: linear-gradient(180deg, transparent, #000 8%, #000 92%, transparent);
    }
    .tip {
        position: absolute;
        left: -7px;
        top: 2px;
        width: 14px;
        height: 14px;
        overflow: visible;
        filter: drop-shadow(0 0 3px currentColor);
    }
    .tip.foot { top: auto; bottom: 2px; width: 10px; height: 10px; left: -5px; }
`;

/** 달 머리의 혼천의 — 열두 달의 별 고리는 달을 넘길 때 돈다 */
export const Instrument = styled.svg`
    --orbit: 40s;
    width: 40px;
    height: 40px;
    flex: none;
    overflow: visible;
    ${gold}
    ${ornamentStrokes}

    .dial {
        transform-origin: 32px 32px;
        transform-box: view-box;
        transition: transform 1.1s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .now { filter: drop-shadow(0 0 2px currentColor); }
    :where(html[data-theme-motion="off"]) & .dial { transition: none; }
`;
