/**
 * 바다의 폰 탭바 — 화면 폭을 다 덮는 띠(Celestial 금빛 마름모, Maple 잎) 대신 아래 가장자리 위에 떠 있는 유리 알약 하나.
 *   양옆 12px, 바닥은 시스템 막대(SAFE_B) 위 6px, 높이 52px, 모서리 28px(높이의 반을 넘어 양끝이 온전히 둥글다) — 껍데기(AppShell)가 비워 둔 자리
 *   (TAB_BAR_HEIGHT 58 + SAFE_B)에 꼭 들어가 본문은 어디서도 가리지 않는다.
 *   고른 탭 = 청록 아이콘·글자 + 탭 뒤의 옅은 청록 캡슐(알약 안의 알약). 누르면 아이콘이 살짝 눌린다.
 * 더보기 = 알약 바로 위에 뜨는 유리 카드(옆 12px, 모서리 24px) — 데스크톱의 오른쪽 시트와 같은 말(16px·600 제목, 글자 단추
 *   닫기, 아이콘 + 이름 줄). 더보기 탭이 있는 오른쪽 아래 귀퉁이에서 자라 나온다(한 번). 알약은 그 위에 남아 다시 누르면 닫힌다.
 */
import styled, { keyframes } from "styled-components";
import * as C from "../celestial/CelestialMobileTabBar.styles";
import { MOBILE, SAFE_B } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { EASE, calm, focusRing, hairline, ink, seaButton, surface } from "@/styles/ocean/water";
import { dockGlass } from "@/components/sideBar/ocean/oceanShell";

export * from "../celestial/CelestialMobileTabBar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 알약 자리 — 바닥 여백·높이 */
const PILL_GAP = "6px";
const PILL_H = "52px";

export const Bar = styled(C.Bar)`
    ${MOBILE} {
        ${dockGlass}
        left: 12px;
        right: 12px;
        bottom: calc(${SAFE_B} + ${PILL_GAP});
        height: ${PILL_H};
        padding: 0 4px;
        align-items: center;
        gap: 2px;
        border-radius: 28px;
    }
`;

export const Tab = styled(C.Tab)`
    height: 44px;
    gap: 2px;
    border-radius: 22px;
    color: ${(p) => (p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    background-color: ${(p) => (p.$on ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1) : "transparent")};
    transition: background-color 0.2s ease, color 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    ${focusRing}

    svg {
        width: 20px;
        height: 20px;
        flex: none;
        stroke-width: 1.75;
        transition: transform 0.1s ease;
    }

    span {
        font-size: 0.625rem;
        font-weight: ${(p) => (p.$on ? 600 : 500)};
        letter-spacing: -0.005em;
    }

    &:active { background-color: ${(p) => (p.$on ? withAlpha(p.theme.colors.primary, dark(p) ? 0.2 : 0.14) : ink(p.theme, dark(p) ? 0.08 : 0.05))}; }
    &:active svg { transform: scale(0.92); }

    /* 마름모 자리 — 캡슐이 대신한다 */
    &::before { display: none; }
`;

/* 가림막은 투명도(opacity) 대신 바탕색으로 나타난다 — 투명도가 움직인 막 안에서는 카드의 흐림(backdrop-filter)이
   뒤 화면을 못 보고 막 색만 흐려서, 카드 너머 글씨가 흐려지지 않은 채 비쳤다 */
const scrimIn = keyframes`
    from { background-color: transparent; }
    to   { background-color: var(--scrim); }
`;

/** 카드가 더보기 탭(오른쪽 아래)에서 자라 나온다 */
const cardIn = keyframes`
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to   { opacity: 1; transform: none; }
`;

/** 가림막 — 탭바 아래(z 59)에 깔아서 알약은 위에 남는다. 더보기를 다시 누르면 닫힌다 */
export const Sheet = styled(C.Sheet)`
    --scrim: ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.5)" : "rgba(18, 33, 32, 0.22)")};
    z-index: 59;
    background: var(--scrim);
    animation: ${scrimIn} 0.18s ease-out both;
    ${calm}
`;

/** 떠 있는 카드 — 알약 바로 위, 양옆은 알약과 같은 12px */
export const SheetBody = styled(C.SheetBody)`
    ${surface("float")}
    position: relative;
    flex: 1;
    width: auto;
    margin: 0 12px calc(${SAFE_B} + ${PILL_GAP} + ${PILL_H} + 8px);
    padding: 4px 0 6px;
    border-radius: 24px;
    overflow: hidden;
    transform-origin: 88% 100%;
    animation: ${cardIn} 0.28s ${EASE} both;
    ${calm}
`;

export const SheetHead = styled(C.SheetHead)`
    padding: 10px 8px 6px 20px;
    border-bottom: none;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};

    i { display: none; }
`;

export const CloseBtn = styled(C.CloseBtn)`
    ${seaButton("ghost")}
    width: 44px;
    height: 44px;
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
