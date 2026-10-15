/**
 * Maple 의 고르기 — 둥근 칸과 깨끗한 차림표 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 여는 칸은 다른 입력칸과 같은 inkInput(10px), 손잡이는 아래 화살 하나. 열리면 붉은 테와 옅은 번짐.
 * 차림표는 12px 카드 — 줄은 8px 모서리로 올리면 옅게 물들고, 고른 줄은 옅은 붉음에 붉은 글씨와 체크.
 * 항목 앞의 표식은 색이 있는 것(카테고리)만 색 점으로 — 예전의 잎 글머리표는 줄마다 반복되어 어수선했다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialSelect.styles";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { checkStamp } from "@/styles/maple/ink";
import { chevronMark, dropIn, fieldButton, menuRow, popCard, tint } from "@/components/modal/baseModal/maple/mapleLayer";

export * from "../celestial/CelestialSelect.styles";

export const Trigger = styled(C.Trigger)`
    ${fieldButton}
    gap: 8px;
    min-height: ${(p) => (p.$size === "sm" ? "34px" : "40px")};
    padding: ${(p) => (p.$size === "sm" ? "0 10px" : "0 12px")};
    font-size: ${(p) => (p.$size === "sm" ? "0.8125rem" : "0.875rem")};
    font-weight: 500;
    color: ${(p) => p.theme.colors.text};

    &:hover:not(:disabled) { border-color: ${(p) => withAlpha(p.theme.colors.text, 0.26)}; }
    &:disabled { opacity: 0.5; }

    /* 열린 동안은 초점을 받은 칸처럼 — 눌러서 생긴 초점의 "테 없음"(fieldButton)보다 뒤에, 같은 세기로 */
    &[aria-expanded="true"]:not(:disabled) {
        border-color: ${(p) => p.theme.colors.primary};
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.14)};
    }

    ${MOBILE} { min-height: 44px; }
`;

/** 화살 — 옅은 아래 화살 하나. 열면 뒤집힌다(뼈대) */
export const Chev = styled(C.Chev)`
    ${chevronMark("16px")}
    margin-right: -2px;
    transition: transform 0.18s ease, background-color 0.15s ease;
    ${(p) => p.$open && css`background-color: ${p.theme.colors.primary};`}
`;

export const Menu = styled(C.Menu)`
    ${popCard("12px")}
    position: fixed;
    padding: 6px;
    max-height: 264px;
    animation: ${dropIn} 0.16s cubic-bezier(0.2, 0.8, 0.3, 1) both;
`;

export const Item = styled(C.Item)`
    ${menuRow}
    gap: 10px;
    font-weight: ${(p) => (p.$on ? 600 : 400)};
    color: ${(p) => (p.$on ? p.theme.colors.primary : p.theme.colors.text)};
    background-color: ${(p) => (p.$on ? tint(p.theme, 0.08, 0.14) : "transparent")};

    & + & { margin-top: 2px; }
    &:hover { background-color: ${(p) => (p.$on ? tint(p.theme, 0.12, 0.2) : withAlpha(p.theme.colors.text, p.theme.mode === "dark" ? 0.08 : 0.05))}; }
    &:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.4)};
    }

    ${MOBILE} { min-height: 44px; }
`;

/** 색 없는 항목의 마름모는 그리지 않는다 — 고른 줄은 체크(Tick)와 붉은 글씨가 알린다 */
export const Diamond = styled(C.Diamond)`
    display: none;
`;

/** 카테고리 색 점 — 바탕과 떨어져 보이게 옅은 테 */
export const Dot = styled(C.Dot)`
    width: 10px;
    height: 10px;
    box-shadow: inset 0 0 0 1px ${(p) => withAlpha(p.theme.colors.text, 0.12)};
`;

/** 고른 줄의 체크 — ✦ 글자 대신 또렷한 체크 */
export const Tick = styled(C.Tick)`
    ${checkStamp("15px")}
    font-size: 0;
    color: ${(p) => p.theme.colors.primary};
`;
