/**
 * MapleMonthDecor 의 모양 — 오늘의 말린 잎, 고른 날의 연필 동그라미.
 * 날짜는 칸의 오른쪽 위(MapleMonthCalendar.styles) — 오늘 알약의 가운데는 칸 오른쪽에서 18px, 위에서 16px 쯤이다.
 * 잎은 날짜 왼쪽 빈자리에, 연필 동그라미는 날짜 둘레에 — 숫자를 덮지 않는다.
 */
import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";
import { AGED_TONE, vintage } from "@/styles/vintage";

const sway = keyframes`
    0%, 100% { rotate: 58deg; }
    30%      { rotate: 70deg; }
    62%      { rotate: 50deg; }
`;

const draw = keyframes`
    from { stroke-dashoffset: 100; }
    to   { stroke-dashoffset: 0; }
`;

/** 눌러 말린 수채 잎 — 날짜 알약 왼쪽의 빈자리(머리 줄)에 잎자루를 날짜 쪽으로 두고 눕혀 둔다. 그림 둘레가 비어 있어 상자는 잎보다 크다 */
export const PressedLeaf = styled.span`
    position: absolute;
    right: 30px;
    top: -1px;
    width: 34px;
    height: 34px;
    z-index: 1;
    pointer-events: none;
    background: url("/themes/maple/leaf-red.webp") center / contain no-repeat;
    rotate: 58deg;
    opacity: ${(p) => (p.theme.mode === "dark" ? 0.82 : 0.95)};
    /* 빈티지 벌은 빛바랜 사진처럼(그림자 앞에 톤을 누른다) */
    filter: ${(p) => (vintage(p) ? `${AGED_TONE} ` : "")}drop-shadow(-1px 2px 2px ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.45)" : "rgba(80, 36, 18, 0.22)")});

    &[data-leaf="orange"] { background-image: url("/themes/maple/leaf-orange.webp"); }
    &[data-leaf="yellow"] { background-image: url("/themes/maple/leaf-yellow.webp"); }
    &[data-leaf="brown"] { background-image: url("/themes/maple/leaf-brown.webp"); }

    :where(html:not([data-theme-motion="off"])) [data-calendar-date]:hover > & { animation: ${sway} 1.2s ease-in-out; }

    ${MOBILE} { ${NOT_WIDGET} & { display: none; } }
    [data-widget] & { right: 26px; width: 28px; height: 28px; }
`;

/** 붉은 연필 동그라미 — 날짜 둘레에 고른 순간 한 획으로 그어진다 */
export const Pencil = styled.svg`
    position: absolute;
    right: 0;
    top: 1px;
    width: 40px;
    height: 28px;
    z-index: 3;
    pointer-events: none;
    overflow: visible;
    fill: none;
    stroke: ${(p) => withAlpha(p.theme.colors.primary, 0.85)};
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;

    path { stroke-dasharray: 100; }
    :where(html:not([data-theme-motion="off"])) & path { animation: ${draw} 0.5s cubic-bezier(0.45, 0.05, 0.3, 1) both; }

    /* 오늘 알약 둘레는 조금 크게 */
    &[data-today] { right: -3px; top: -2px; width: 46px; height: 33px; }

    ${MOBILE} { ${NOT_WIDGET} & { right: -2px; top: 0; width: 32px; height: 23px; stroke-width: 1.4; } }
`;
