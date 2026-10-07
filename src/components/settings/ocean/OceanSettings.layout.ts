/**
 * 바다의 설정 판 짜임 — 뼈대(무엇이 있는가)는 Celestial 과 같고, 놓는 법과 겉이 다르다.
 *
 * 짜임: Celestial 은 왼쪽 성좌 목차 + 오른쪽 판, Maple 은 종이 색인. 바다는 **위에 뜬 분절 단추 하나**가 목차이고
 *   그 아래 반투명 판 하나가 넓게 깔린다(위아래로 쌓기). 목차의 별자리 그림·표지별은 쓰지 않는다.
 * 겉: 머리카락 선, 옅은 면, 고른 것엔 청록 테두리. 테마 이름만 기울인 세리프로.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialSettings.layout";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";
import { EASE, MONO, R, SERIF, calm, focusRing, hairline, ink, pearl, surface, surfaceIn } from "@/styles/ocean/water";

export * from "../celestial/CelestialSettings.layout";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
/** 분절 단추의 고른 칸 — 홈 위에 올라앉은 흰 판 */
const segOn = css`
    color: ${(p) => p.theme.colors.text};
    background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.12)" : "#FFFFFF")};
    box-shadow: 0 1px 3px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.4)" : "rgba(18, 33, 32, 0.12)")};
`;

/* ── 짜임: 목차 줄 위, 판 아래 ───────────────────────────────────────── */

export const Frame = styled(C.Frame)`
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    max-width: 1040px;
    margin: 0 auto;
    padding: 18px 0 32px;
    ${MOBILE} { padding: 0 0 24px; gap: 10px; }
`;

/** 목차 — 분절 단추 하나. 판을 굴려도 위에 붙어 있다 */
export const Constellation = styled(C.Constellation)`
    top: 12px;
    z-index: 5;
    display: flex;
    justify-content: flex-start;
    border-right: none;
    ${MOBILE} { position: sticky; top: 0; border-bottom: none; padding: 8px 8px 0; overflow: visible; }
`;

export const ConstellationArt = styled(C.ConstellationArt)`
    display: none;
`;

export const Mark = styled(C.Mark)`
    display: none;
`;

export const TabList = styled(C.TabList)`
    display: inline-flex;
    gap: 2px;
    padding: 3px;
    border-radius: 12px;
    background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);

    ${MOBILE} { display: grid; width: 100%; }
`;

export const TabButton = styled(C.TabButton)`
    width: auto;
    height: 34px;
    padding: 0 14px;
    gap: 6px;
    border-radius: 9px;
    color: ${(p) => (p.$active ? p.theme.colors.text : p.theme.colors.textSecondary)};
    transition: color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
    ${(p) => p.$active && segOn}

    &:hover { color: ${(p) => p.theme.colors.text}; }
    ${focusRing}

    .lbl { font-family: ${(p) => p.theme.fonts.body}; font-size: 0.86rem; font-weight: ${(p) => (p.$active ? 600 : 500)}; letter-spacing: 0; text-shadow: none; }
    .cnt { margin-left: 0; font-family: ${MONO}; font-size: 0.66rem; color: ${(p) => p.theme.colors.textSecondary}; }

    ${MOBILE} { height: 36px; padding: 0 6px; .lbl { font-size: 0.8rem; } }
`;

/** 판 — 반투명 판 한 장 */
export const Pane = styled(C.Pane)`
    ${surface("panel")}
    border-radius: ${R.lg};
    overflow: hidden;
    animation: ${surfaceIn} 0.5s ${EASE} both;
    ${calm}
    ${MOBILE} { border-radius: 16px; margin: 0 8px; }
`;

export const PaneHeader = styled(C.PaneHeader)`
    border-bottom: none;
    padding: 28px 32px 6px;
    ${MOBILE} { padding: 22px 18px 4px; }
`;

/** 궤도 그림은 바다에 없다 */
export const Orbit = styled(C.Orbit)`
    display: none;
`;

/** 판 번호(로마 숫자)는 바다에 없다 — 제목 하나로 충분하다 */
export const Eyebrow = styled(C.Eyebrow)`
    display: none;
`;

export const PaneTitle = styled(C.PaneTitle)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: ${(p) => p.theme.colors.text};
    margin-bottom: 8px;
    ${MOBILE} { font-size: 1.4rem; letter-spacing: -0.02em; }
`;

export const PaneNote = styled(C.PaneNote)`
    font-size: 0.84rem;
`;

export const PaneBody = styled(C.PaneBody)`
    padding: 20px 32px 40px;
    ${MOBILE} { padding: 16px 18px 36px; }
`;

/** 묶음 머리 — 작은 굵은 글씨와 머리카락 선 */
export const BlockHead = styled(C.BlockHead)`
    margin-bottom: 14px;
    h2 { font-family: ${(p) => p.theme.fonts.body}; font-size: 0.84rem; font-weight: 600; letter-spacing: 0; color: ${(p) => (p.$danger ? p.theme.colors.error : p.theme.colors.textSecondary)}; }
    &::after { height: 1px; background: ${(p) => (p.$danger ? withAlpha(p.theme.colors.error, 0.3) : hairline(p.theme))}; }
`;

export const DangerBlock = styled(C.DangerBlock)`
    border-top: none;
    padding: 18px;
    border-radius: ${R.md};
    border: 1px solid ${(p) => withAlpha(p.theme.colors.error, 0.25)};
    background: ${(p) => withAlpha(p.theme.colors.error, dark(p) ? 0.06 : 0.04)};
`;

/** 고름 표시 — 별 대신 작은 점 */
export const Star = styled(C.Star)`
    clip-path: none;
    ${(p) => pearl(p.$small ? "5px" : "6px")}
    visibility: ${(p) => (p.$on ? "visible" : "hidden")};
`;

/* ── 분절 단추 ────────────────────────────────────────────────────────── */
export const SegGroup = styled(C.SegGroup)`
    gap: 2px;
    padding: 3px;
    border: none;
    border-radius: 10px;
    background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)};
`;

export const Seg = styled(C.Seg)`
    border-right: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-family: ${(p) => p.theme.fonts.body};
    font-weight: ${(p) => (p.$selected ? 600 : 500)};
    color: ${(p) => (p.$selected ? p.theme.colors.text : p.theme.colors.textSecondary)};
    background: transparent;
    transition: color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
    ${(p) => p.$selected && segOn}
    &:hover { color: ${(p) => p.theme.colors.text}; }
    ${focusRing}
    em { font-family: ${MONO}; color: ${(p) => p.theme.colors.textSecondary}; }
    ${C.Star} { display: none; }
`;

/* ── 테마 고르기 — 타일 진열장과 무대 ───────────────────────────────── */
const ring = css`box-shadow: 0 0 0 2px ${(p) => p.theme.colors.primary}, 0 8px 20px -12px ${(p) => withAlpha(p.theme.colors.primary, 0.6)};`;

export const FamilyTile = styled(C.FamilyTile)`
    ${surface("card")}
    border-radius: 14px;
    transition: transform 0.2s ${EASE}, box-shadow 0.2s ease, border-color 0.2s ease;
    &:hover { border-color: ${(p) => hairline(p.theme, true)}; transform: translateY(-2px); }
    ${focusRing}
    ${(p) => p.$selected && css`
        border-color: transparent;
        ${ring}
        &::after { display: none; }
    `}
`;

export const FamilyFoot = styled(C.FamilyFoot)`
    border-top: 1px solid ${(p) => hairline(p.theme)};
    padding: 9px 12px 10px;
    ${C.Star} { display: none; }
`;

export const FamilyName = styled(C.FamilyName)`
    font-family: ${SERIF};
    font-style: italic;
    font-size: 1.12rem;
    letter-spacing: 0;
`;

/** 벌 표시 — 작은 점 둘 */
export const VariantDots = styled(C.VariantDots)`
    i { transform: none; width: 6px; height: 6px; border-radius: 50%; border-color: ${(p) => ink(p.theme, 0.25)}; }
    i.on { background: ${(p) => p.theme.colors.primary}; border-color: ${(p) => p.theme.colors.primary}; }
`;

export const ThemeStage = styled(C.ThemeStage)`
    ${surface("card")}
    border-radius: 16px;
    padding: 16px;
`;

export const StageThumb = styled(C.StageThumb)`
    border: 1px solid ${(p) => hairline(p.theme)};
    border-radius: 12px;
    box-shadow: 0 12px 28px -18px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.8)" : "rgba(18, 33, 32, 0.35)")};
`;

export const StageName = styled(C.StageName)`
    font-family: ${SERIF};
    font-style: italic;
    font-size: 2.4rem;
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1;
`;

export const StageDesc = styled(C.StageDesc)`
    font-size: 0.84rem;
`;

/* ── 글꼴 카드 ────────────────────────────────────────────────────────── */
export const FontCard = styled(C.FontCard)`
    ${surface("card")}
    border-radius: 12px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    &:hover { border-color: ${(p) => hairline(p.theme, true)}; }
    ${focusRing}
    ${(p) => p.$selected && css`
        border-color: transparent;
        ${ring}
        &::after { display: none; }
    `}
`;

/** 문장 끝 표식은 없다 */
export const FontPreview = styled(C.FontPreview)`
    &::after { content: none; }
`;

export const CardName = styled(C.CardName)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0;
    ${C.Star} { display: none; }
`;

/* ── 위젯 카드 ────────────────────────────────────────────────────────── */
export const WidgetCard = styled(C.WidgetCard)`
    ${surface("card")}
    border-radius: 14px;
    overflow: hidden;
    &:hover { border-color: ${(p) => hairline(p.theme, true)}; }
`;

export const WidgetFrame = styled(C.WidgetFrame)`
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    background: ${(p) => ink(p.theme, dark(p) ? 0.06 : 0.03)};
`;

/* ── 패치 노트 — 가는 세로선 위의 점들 ───────────────────────────────── */
export const Note = styled(C.Note)`
    border-left: 1px solid ${(p) => hairline(p.theme, true)};
    padding-left: 20px;
    &::before {
        content: "";
        position: absolute;
        left: -4px;
        top: 6px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: ${(p) => (p.$current ? p.theme.colors.primary : dark(p) ? "#2F3A39" : "#CBD3D1")};
        box-shadow: 0 0 0 3px ${(p) => (dark(p) ? "#121B1C" : "#F4F7F6")};
    }
    li::marker { color: ${(p) => p.theme.colors.textSecondary}; }
`;

export const NoteHead = styled(C.NoteHead)`
    .ver { font-family: ${MONO}; font-size: 0.8rem; letter-spacing: 0; }
    em {
        border: none;
        border-radius: 6px;
        padding: 2px 7px;
        font-family: ${MONO};
        font-size: 0.62rem;
        letter-spacing: 0.06em;
        color: ${(p) => p.theme.colors.primary};
        background: ${(p) => withAlpha(p.theme.colors.primary, 0.1)};
    }
`;
