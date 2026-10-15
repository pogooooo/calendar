/**
 * Maple 의 프로젝트 머리글 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트: 작은 단풍잎 + 명조 굵은 제목, 카테고리는 색 점이 든 알약, 단추는 카드 같은 알약(새 프로젝트만 단풍 붉음으로 채움),
 * 프로젝트 고르개는 알약 칩. 예전의 긴 먹선·넓은 자간·상자 꼬리표는 걷었다.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialProjectHeader.styles";
import { crest, hair, inkChip, stampButton } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialProjectHeader.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Header = styled(C.Header)`
    margin-bottom: 14px;

    ${MOBILE} { margin-bottom: 12px; }
`;

export const HeaderTitle = styled(C.HeaderTitle)`
    gap: 12px;
`;

/** 화면 제목 — 앞에 작은 단풍잎 하나 */
export const TitleText = styled(C.TitleText)`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.2;

    &::before {
        content: "";
        ${crest("16px")}
        flex-shrink: 0;
        color: ${(p) => p.theme.colors.primary};
    }

    ${MOBILE} { font-size: 22px; gap: 8px; }
`;

/** 고른 프로젝트의 카테고리 — 그 색을 옅게 깐 알약에 색 점 하나 */
export const CategoryTag = styled(C.CategoryTag)`
    display: inline-flex;
    gap: 6px;
    height: 24px;
    padding: 0 10px 0 9px;
    border: none;
    border-radius: 999px;
    background-color: ${(p) => `color-mix(in srgb, ${p.$color} ${dark(p) ? 22 : 14}%, transparent)`};
    color: ${(p) => p.theme.colors.text};
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0;

    &::before {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        transform: none;
    }
`;

/** 제목 옆으로 긋던 긴 선 — 걷는다(제목과 단추만으로 줄이 선다) */
export const HeaderLine = styled(C.HeaderLine)`
    visibility: hidden;
`;

/** 단추: 카드 같은 알약. 마지막(새 프로젝트)이 이 줄의 할 일이라 단풍 붉음으로 채운다 */
export const HeaderActionButton = styled(C.HeaderActionButton)`
    ${stampButton("default")}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding: 0 16px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 13.5px;
    letter-spacing: 0;

    &:last-child {
        ${stampButton("primary")}
        /* 금박 결(gilt)과 스치는 빛(sheen)은 Celestial 만 */
        background-image: none;
        &::after { content: none; }
    }

    ${MOBILE} {
        height: 40px;
        padding: 0 10px;
        font-size: 13px;
        letter-spacing: 0;
    }
`;

export const TabContainer = styled(C.TabContainer)`
    gap: 8px;
    margin-bottom: 14px;
    /* 초점 테(3px)가 잘리지 않게 위아래로 조금 */
    padding: 3px 2px 4px;

    ${MOBILE} { gap: 6px; margin-bottom: 12px; }
`;

/** 프로젝트 고르개 — 알약 칩. 고른 것은 단풍 붉음이 옅게 */
export const Tab = styled(C.Tab)`
    ${(p) => inkChip(p.$active)}
    min-height: 34px;
    padding: 0 14px;
    font-weight: ${(p) => (p.$active ? 600 : 500)};
    color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.text)};
    background-color: ${(p) => (p.$active ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.08) : p.theme.colors.surface)};
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

    /* 밑줄·가운데 마름모는 Celestial 만 */
    &::after { content: none; }

    &:hover {
        color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.text)};
        border-color: ${(p) => (p.$active ? withAlpha(p.theme.colors.primary, 0.5) : hair(p.theme, 0.26))};
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.28)};
    }

    ${MOBILE} { min-height: 40px; }
`;

export const TabText = styled(C.TabText)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 13.5px;
    letter-spacing: 0;
`;
