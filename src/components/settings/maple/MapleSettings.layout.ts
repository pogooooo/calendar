/**
 * Maple 의 설정 판 짜임 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트의 설정: 왼쪽 목차는 둥근 줄(고른 줄은 단풍 붉음을 옅게 깐 바탕), 판 제목은 자간 없는 명조,
 * 고르기는 둥근 분절 단추(고른 칸이 카드처럼 떠오른다), 타일·글꼴·위젯은 카드.
 * 2026-10-15 다시 그리며 로마 숫자 머리표·줄마다의 잎·넓은 자간·각진 테를 걷었다. 성좌 그림·궤도 그림은 전처럼 뗀다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialSettings.layout";
import { cardShadow, crest, hair, paperCard, paperTab } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialSettings.layout";

type P = { theme: { mode: string; colors: { primary: string; text: string } } };
const dark = (p: P) => p.theme.mode === "dark";
const tint = (p: P) => withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1);
const line = (p: P) => hair(p.theme, dark(p) ? 0.12 : 0.09);

export const Orbit = styled(C.Orbit)`
    display: none;
`;

export const Mark = styled(C.Mark)`
    display: none;
`;

export const ConstellationArt = styled(C.ConstellationArt)`
    display: none;
`;

/** 고른 것의 표지 — 고른 칸이 바탕·글씨로 이미 드러나므로 Maple 은 따로 달지 않는다 */
export const Star = styled(C.Star)`
    display: none;
`;

/* ── 목차 ─────────────────────────────────────────────────────────── */

export const Constellation = styled(C.Constellation)`
    border-right-color: ${line};

    ${MOBILE} { border-bottom-color: ${line}; }
`;

export const TabList = styled(C.TabList)`
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 28px 14px 0 0;

    ${MOBILE} { display: grid; gap: 0; padding: 0; }
`;

export const TabButton = styled(C.TabButton)`
    height: 42px;
    padding: 0 12px;
    border-radius: 10px;
    color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.text)};
    background-color: ${(p) => (p.$active ? tint(p) : "transparent")};
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
        color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.text)};
        background-color: ${(p) => (p.$active ? tint(p) : hair(p.theme, dark(p) ? 0.07 : 0.045))};
    }

    .lbl {
        font-family: inherit;
        font-size: 0.92rem;
        font-weight: ${(p) => (p.$active ? 600 : 500)};
        letter-spacing: 0;
        text-shadow: none;
    }

    .cnt { display: none; }

    /* 폰: 넷이 폭을 나눠 갖는 탭 — 고른 탭은 밑의 붉은 막대 */
    ${MOBILE} {
        height: 48px;
        padding: 0 6px;
        ${(p) => paperTab(p.$active)}
        background-color: transparent;

        &:hover { background-color: transparent; }
        .lbl { font-size: 0.875rem; letter-spacing: 0; }
    }
`;

/* ── 판 머리 ──────────────────────────────────────────────────────── */

export const PaneHeader = styled(C.PaneHeader)`
    padding: 36px 40px 24px;
    border-bottom-color: ${line};

    ${MOBILE} { padding: 22px 20px 18px; }
`;

/** 로마 숫자 머리표는 뗀다 */
export const Eyebrow = styled(C.Eyebrow)`
    display: none;
`;

export const PaneTitle = styled(C.PaneTitle)`
    margin-bottom: 8px;
    font-weight: 700;
    font-size: 1.85rem;
    letter-spacing: 0;
    line-height: 1.2;

    ${MOBILE} { font-size: 1.5rem; letter-spacing: 0; }
`;

export const PaneNote = styled(C.PaneNote)`
    font-size: 0.875rem;
`;

/** 판을 갈아 끼우는 몸짓은 갈래의 꼴로 SettingsView 가 그린다 — 뼈대의 CSS 몸짓은 끈다 */
export const PaneBody = styled(C.PaneBody)`
    padding-top: 28px;
    animation: none;
`;

export const BlockHead = styled(C.BlockHead)`
    margin-bottom: 12px;

    h2 {
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0;
    }

    &::after { display: none; }
`;

export const DangerBlock = styled(C.DangerBlock)`
    border-top-color: ${(p) => withAlpha(p.theme.colors.error, 0.3)};
`;

export const RowNote = styled(C.RowNote)`
    font-size: 0.8rem;
`;

/* ── 테마 고르기 ───────────────────────────────────────────────────── */

export const FamilyTile = styled(C.FamilyTile)`
    ${paperCard()}
    overflow: hidden;
    border-radius: 12px;
    border-color: ${(p) => (p.$selected ? p.theme.colors.primary : line(p))};
    ${(p) => p.$selected && css`
        box-shadow: 0 0 0 1px ${p.theme.colors.primary}, ${cardShadow(p)};
    `}

    &:hover { border-color: ${(p) => (p.$selected ? p.theme.colors.primary : hair(p.theme, 0.22))}; }
    &::after { display: none; }
`;

export const FamilyFoot = styled(C.FamilyFoot)`
    padding: 9px 12px;
    border-top-color: ${line};
`;

export const FamilyName = styled(C.FamilyName)`
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0;
`;

/** 벌 표시 — 둥근 점 */
export const VariantDots = styled(C.VariantDots)`
    i { transform: none; border-radius: 50%; border-color: ${(p) => hair(p.theme, 0.4)}; }
`;

export const ThemeStage = styled(C.ThemeStage)`
    ${paperCard()}
    padding: 16px;
    border-radius: 14px;

    ${MOBILE} { padding: 12px; }
`;

export const StageThumb = styled(C.StageThumb)`
    border-color: ${line};
    border-radius: 10px;
`;

export const StageName = styled(C.StageName)`
    font-weight: 700;
    font-size: 1.5rem;
    letter-spacing: 0;
`;

export const StageDesc = styled(C.StageDesc)`
    font-size: 0.875rem;
`;

export const MiniRail = styled(C.MiniRail)`
    border-right-color: ${line};
`;

export const MiniBody = styled(C.MiniBody)`
    .title, .week b { border-radius: 2px; }
    .grid span { border-radius: 2px; }
`;

/* ── 분절 고르기 — 둥근 홈 안에서 고른 칸이 카드처럼 떠오른다 ─────────── */

export const SegRow = styled(C.SegRow)`
    gap: 16px;
`;

export const SegLabel = styled(C.SegLabel)`
    min-width: 92px;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0;
`;

export const SegGroup = styled(C.SegGroup)`
    gap: 2px;
    padding: 3px;
    border: none;
    border-radius: 10px;
    background-color: ${(p) => hair(p.theme, dark(p) ? 0.08 : 0.06)};
`;

export const Seg = styled(C.Seg)`
    padding: 7px 14px;
    border: none;
    border-right: none;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: ${(p) => (p.$selected ? 600 : 500)};
    color: ${(p) => (p.$selected ? p.theme.colors.text : p.theme.colors.textSecondary)};
    background-color: ${(p) => (p.$selected ? p.theme.colors.surface : "transparent")};
    box-shadow: ${(p) => (p.$selected ? (dark(p) ? "0 1px 3px rgba(0, 0, 0, 0.4)" : "0 1px 3px rgba(86, 54, 32, 0.12)") : "none")};
    transition: color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;

    &:hover { color: ${(p) => p.theme.colors.text}; }

    em { font-size: 0.75rem; }

    ${MOBILE} { min-height: 42px; }
`;

/* ── 글꼴 ────────────────────────────────────────────────────────── */

export const FontCard = styled(C.FontCard)`
    ${paperCard()}
    border-radius: 12px;
    background-color: ${(p) => (p.$selected ? tint(p) : p.theme.colors.surface)};
    border-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.6) : line(p))};

    &:hover { border-color: ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.6) : hair(p.theme, 0.22))}; }
    &::after { display: none; }
`;

/** 글꼴 미리보기 끝의 표식: 별 → 작은 잎 */
export const FontPreview = styled(C.FontPreview)`
    &::after {
        content: "";
        display: inline-block;
        margin-left: 6px;
        vertical-align: -1px;
        ${crest("11px")}
        color: ${(p) => p.theme.colors.primary};
    }
`;

export const CardName = styled(C.CardName)`
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0;
`;

/* ── 위젯 ────────────────────────────────────────────────────────── */

export const WidgetCard = styled(C.WidgetCard)`
    ${paperCard()}
    overflow: hidden;

    &:hover { border-color: ${(p) => hair(p.theme, 0.22)}; }
`;

export const WidgetFrame = styled(C.WidgetFrame)`
    background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.07 : 0.04)};
    border-bottom-color: ${line};
`;

export const WidgetDesc = styled(C.WidgetDesc)`
    font-size: 0.8rem;
`;

/* ── 정보: 패치 노트 ──────────────────────────────────────────────── */

export const Note = styled(C.Note)`
    border-left: 2px solid ${(p) => (p.$current ? p.theme.colors.primary : line(p))};
`;

export const NoteHead = styled(C.NoteHead)`
    .ver {
        font-family: inherit;
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0;
    }

    em {
        padding: 2px 8px;
        border: none;
        border-radius: 999px;
        background-color: ${tint};
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0;
    }
`;
