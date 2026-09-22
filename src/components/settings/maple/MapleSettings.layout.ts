/**
 * Maple 의 설정 판 짜임 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 성좌(목차)의 별은 잎으로, 판 머리의 궤도 그림은 뗀다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialSettings.layout";
import { crest, hair, leafBullet, paperCard } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialSettings.layout";

export const Orbit = styled(C.Orbit)`
    display: none;
`;

/** 성좌의 표지별은 뗀다 — 색인의 잎(TabButton::before)이 그 자리를 맡는다 */
export const Mark = styled(C.Mark)`
    display: none;
`;

export const Star = styled(C.Star)`
    clip-path: none;
    ${(p) => leafBullet(true, p.$small ? "7px" : "9px")}
    color: ${(p) => p.theme.colors.primary};
`;

export const ThemeCard = styled(C.ThemeCard)`
    border-color: ${(p) => (p.$selected ? p.theme.colors.primary : hair(p.theme, 0.3))};
    ${(p) => p.$selected && css`
        box-shadow: 0 0 0 1px ${p.theme.colors.primary};
        &::after { display: none; }
    `}
`;

const FontCard = styled(C.FontCard)`
    border-color: ${(p) => (p.$selected ? p.theme.colors.primary : hair(p.theme, 0.3))};
`;

const WidgetCard = styled(C.WidgetCard)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

const Note = styled(C.Note)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const NoteHead = styled(C.NoteHead)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

/* ── 목차: 성좌 대신 도감의 색인 ─────────────────────────────────────────
   Celestial 은 왼쪽에 별자리(선으로 이은 표지별)를 두고 그것이 곧 목차다.
   Maple 은 종이 색인이다 — 먹 하이라인으로 나뉜 줄, 고른 줄 앞에 잎 하나. */

export const ConstellationArt = styled(C.ConstellationArt)`
    display: none;
`;

export const TabList = styled(C.TabList)`
    padding-top: 42px;
`;

export const TabButton = styled(C.TabButton)`
    height: 58px;
    padding: 0 18px 0 44px;
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.16)};

    &::before {
        content: "";
        position: absolute;
        left: 18px;
        top: 50%;
        ${leafBullet(true, "12px")}
        transform: translateY(-50%) scale(${(p) => (p.$active ? 1 : 0.7)});
        background-color: ${(p) => p.theme.colors.primary};
        opacity: ${(p) => (p.$active ? 1 : 0.28)};
        transition: transform 0.22s ease, opacity 0.22s ease;
    }

    .lbl {
        letter-spacing: 0.1em;
        text-shadow: none;
    }

    .cnt {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 0.8rem;
    }

    @media (max-width: 768px) {
        height: 52px;
        padding: 0 6px;
        border-bottom: none;

        &::before { display: none; }
    }
`;

export const Eyebrow = styled(C.Eyebrow)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 0.8rem;
    letter-spacing: 0.12em;

    &::after { background-color: ${(p) => hair(p.theme, 0.4)}; }
`;

export const PaneTitle = styled(C.PaneTitle)`
    letter-spacing: 0.2em;
`;

export const PaneHeader = styled(C.PaneHeader)`
    border-bottom-color: ${(p) => hair(p.theme, 0.3)};
`;

export const Constellation = styled(C.Constellation)`
    border-right-color: ${(p) => hair(p.theme, 0.3)};

    @media (max-width: 768px) {
        border-bottom-color: ${(p) => hair(p.theme, 0.3)};
    }
`;

/* ── 조작부: 갈라 고르기·글꼴 카드·위젯 카드·블록 머리 ───────────────── */

export const SegGroup = styled(C.SegGroup)`
    border-color: ${(p) => hair(p.theme, 0.4)};
    border-radius: 2px;
    overflow: hidden;
`;

export const Seg = styled(C.Seg)`
    border-right-color: ${(p) => hair(p.theme, 0.3)};
    font-family: ${(p) => p.theme.fonts.display};
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.accent, 0.24) : "transparent")};
    color: ${(p) => (p.$selected ? p.theme.colors.primary : p.theme.colors.textSecondary)};

    &:hover { color: ${(p) => p.theme.colors.text}; background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.14)}; }

    em { font-family: ${(p) => p.theme.fonts.numeral}; font-size: 0.78rem; }
`;

export const FontCardInk = styled(FontCard)`
    ${paperCard("3px")}
    background-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.accent, 0.18) : p.theme.colors.surface)};
    border-color: ${(p) => (p.$selected ? p.theme.colors.primary : hair(p.theme, 0.3))};

    &:hover { border-color: ${(p) => hair(p.theme, 0.75)}; }
    &::after { display: none; }
`;
export { FontCardInk as FontCard };

export const WidgetCardInk = styled(WidgetCard)`
    ${paperCard("3px")}
    border-color: ${(p) => hair(p.theme, 0.3)};
    &:hover { border-color: ${(p) => hair(p.theme, 0.75)}; }
`;
export { WidgetCardInk as WidgetCard };

export const BlockHead = styled(C.BlockHead)`
    h2 { letter-spacing: 0.12em; font-size: 0.9rem; }
    &::after { background-color: ${(p) => (p.$danger ? withAlpha(p.theme.colors.error, 0.35) : hair(p.theme, 0.3))}; }
`;

export const DangerBlock = styled(C.DangerBlock)`
    border-top-color: ${(p) => withAlpha(p.theme.colors.error, 0.35)};
`;

export const ThemeName = styled(C.ThemeName)`
    font-family: ${(p) => p.theme.fonts.display};
    letter-spacing: 0.06em;
`;

export const CardName = styled(C.CardName)`
    letter-spacing: 0.06em;
`;

export const NoteInk = styled(Note)`
    ${paperCard("3px")}
    border-color: ${(p) => (p.$current ? p.theme.colors.primary : hair(p.theme, 0.3))};
`;
export { NoteInk as Note };

/** 글꼴 미리보기 끝의 표식: 별 → 잎 문장 */
export const FontPreview = styled(C.FontPreview)`
    &::after {
        content: "";
        display: inline-block;
        margin-left: 6px;
        width: 11px;
        height: 11px;
        vertical-align: -1px;
        ${crest("11px")}
        background-color: ${(p) => p.theme.colors.primary};
    }
`;
