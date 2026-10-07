/**
 * 바다의 폰 탭바 — 물빛 위에 얹힌 반투명 서리 띠 한 줄. 위 가장자리는 머리카락 선 하나.
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 *
 * 고른 탭 = 청록 아이콘·글자에 글자 밑 작은 점 하나 (Celestial 은 위의 금빛 마름모, Maple 은 위의 잎).
 * 더보기 = 탭바 뒤에서 올라오는 떠 있는 판(위 모서리 20px) — 탭바는 그 위에 그대로 남아 다시 누르면 닫힌다.
 */
import styled, { keyframes } from "styled-components";
import * as C from "../celestial/CelestialMobileTabBar.styles";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { EASE, calm, focusRing, hairline, ink, sand, seaButton, surface } from "@/styles/ocean/water";

export * from "../celestial/CelestialMobileTabBar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Bar = styled(C.Bar)`
    ${MOBILE} {
        ${sand}
        border-top: 1px solid ${(p) => hairline(p.theme)};
    }
`;

export const Tab = styled(C.Tab)`
    gap: 3px;
    padding-bottom: 8px;
    color: ${(p) => (p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    transition: color 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    ${focusRing}

    svg {
        width: 22px;
        height: 22px;
        flex: none;
        stroke-width: 1.75;
        transition: transform 0.1s ease;
    }

    span {
        font-size: 0.66rem;
        font-weight: ${(p) => (p.$on ? 600 : 500)};
        letter-spacing: -0.005em;
    }

    &:active { background-color: transparent; }
    &:active svg { transform: scale(0.92); }

    /* 마름모 자리 → 글자 밑의 4px 점 */
    &::before {
        top: auto;
        bottom: 5px;
        left: 50%;
        width: 4px;
        height: 4px;
        margin: 0 0 0 -2px;
        border-radius: 50%;
        background: ${(p) => p.theme.colors.primary};
        transform: scale(${(p) => (p.$on ? 1 : 0)});
        transition: transform 0.2s ${EASE};
    }
`;

/* 가림막은 투명도(opacity) 대신 바탕색으로 나타난다 — 투명도가 움직인 막 안에서는 판의 흐림(backdrop-filter)이
   뒤 화면을 못 보고 막 색만 흐려서, 판 너머 글씨가 흐려지지 않은 채 비쳤다 */
const scrimIn = keyframes`
    from { background-color: transparent; }
    to   { background-color: var(--scrim); }
`;

/** 가림막 — 탭바 아래(z 59)에 깔아서 탭바는 위에 남는다. 더보기를 다시 누르면 닫힌다 */
export const Sheet = styled(C.Sheet)`
    --scrim: ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.5)" : "rgba(18, 33, 32, 0.22)")};
    z-index: 59;
    background: var(--scrim);
    animation: ${scrimIn} 0.18s ease-out both;
    ${calm}
`;

/** 떠 있는 판 — 위 모서리만 둥글고, 아래는 탭바 뒤로 들어간다 */
export const SheetBody = styled(C.SheetBody)`
    ${surface("float")}
    position: relative;
    border-width: 1px 0 0;
    border-radius: 20px 20px 0 0;
    padding-top: 10px;

    /* 손잡이 자리 표시 */
    &::before {
        content: "";
        position: absolute;
        top: 7px;
        left: 50%;
        width: 36px;
        height: 4px;
        margin-left: -18px;
        border-radius: 2px;
        background: ${(p) => ink(p.theme, dark(p) ? 0.22 : 0.14)};
    }
`;

export const SheetHead = styled(C.SheetHead)`
    padding: 14px 12px 8px 20px;
    border-bottom: none;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};

    i { display: none; }
`;

export const CloseBtn = styled(C.CloseBtn)`
    ${seaButton("ghost")}
    width: 36px;
    height: 36px;
    padding: 0;
    align-items: center;
    justify-content: center;
`;

/** 한 줄 — 48px, 사이는 아이콘 뒤에서 시작하는 머리카락 선 */
export const SheetRow = styled(C.SheetRow)`
    position: relative;
    gap: 14px;
    min-height: 48px;
    padding: 0 20px;
    border-bottom: none;
    font-size: 0.94rem;
    font-weight: ${(p) => (p.$on ? 600 : 400)};
    color: ${(p) => (p.$on ? p.theme.colors.primary : p.theme.colors.text)};
    -webkit-tap-highlight-color: transparent;
    ${focusRing}

    & > svg {
        flex: none;
        width: 20px;
        height: 20px;
        stroke-width: 1.75;
        color: ${(p) => (p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    }

    &::after {
        content: "";
        position: absolute;
        left: 54px;
        right: 0;
        bottom: 0;
        height: 1px;
        background: ${(p) => hairline(p.theme)};
    }
    &:last-child::after { display: none; }

    &:active { background-color: ${(p) => (p.$on ? withAlpha(p.theme.colors.primary, 0.08) : ink(p.theme, dark(p) ? 0.08 : 0.05))}; }
`;
