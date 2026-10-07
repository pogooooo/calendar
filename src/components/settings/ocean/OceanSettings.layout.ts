/**
 * 바다의 설정 판 짜임 — 뼈대(무엇이 있는가)는 Celestial 과 같고, 놓는 법과 겉이 다르다.
 *
 * 짜임: Celestial 은 왼쪽 성좌 목차 + 오른쪽 판, Maple 은 종이 색인. 바다는 **위에 떠 있는 알약 줄 하나**가 목차이고
 *   그 아래 바다유리 판 하나가 넓게 깔린다(위아래로 쌓기). 목차의 별자리 그림·표지별은 쓰지 않는다.
 * 겉: 금빛 실선 대신 물결 줄, 별 대신 진주, 고른 것엔 불가사리. 판 머리에는 멈춘 물빛 그물이 옅게 비치고 가리비 하나.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialSettings.layout";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";
import { LATIN, R, calm, causticNetImage, pearl, scallopImage, seaGlass, starfishImage, surfaceIn, waveRule } from "@/styles/ocean/water";

export * from "../celestial/CelestialSettings.layout";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/* ── 짜임: 목차 줄 위, 판 아래 ───────────────────────────────────────── */

export const Frame = styled(C.Frame)`
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 10px 0 30px;
    ${MOBILE} { padding: 0 0 24px; gap: 10px; }
`;

/** 목차 — 물 위에 뜬 알약 줄. 판을 굴려도 위에 붙어 있다 */
export const Constellation = styled(C.Constellation)`
    top: 10px;
    z-index: 5;
    display: flex;
    justify-content: center;
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
    gap: 4px;
    padding: 5px;
    ${seaGlass("float")}
    border-radius: ${R.pill};

    ${MOBILE} {
        display: grid;
        width: 100%;
        padding: 4px;
    }
`;

export const TabButton = styled(C.TabButton)`
    width: auto;
    height: 42px;
    padding: 0 18px;
    gap: 8px;
    border-radius: ${R.pill};
    color: ${(p) => (p.$active ? (dark(p) ? "#062A36" : "#FFFFFF") : p.theme.colors.textSecondary)};
    background: ${(p) => (p.$active ? `linear-gradient(135deg, ${p.theme.colors.accent}, ${p.theme.colors.primary})` : "transparent")};
    box-shadow: ${(p) => (p.$active ? `0 6px 14px -6px ${withAlpha(p.theme.colors.primary, 0.7)}, inset 0 1px 0 rgba(255, 255, 255, 0.45)` : "none")};
    transition: color 0.25s ease, background-color 0.25s ease, box-shadow 0.3s ease;

    &:hover { color: ${(p) => (p.$active ? (dark(p) ? "#062A36" : "#FFFFFF") : p.theme.colors.primary)}; background-color: ${(p) => (p.$active ? "transparent" : withAlpha(p.theme.colors.accent, 0.16))}; }

    .lbl { font-size: 0.86rem; letter-spacing: 0.08em; text-shadow: none; }
    /* 갯수 — 작은 물방울 */
    .cnt {
        margin-left: 0;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: ${R.pill};
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 0.64rem;
        color: ${(p) => (p.$active ? (dark(p) ? "#062A36" : "#FFFFFF") : p.theme.colors.primary)};
        background: ${(p) => (p.$active ? "rgba(255, 255, 255, 0.25)" : withAlpha(p.theme.colors.accent, 0.2))};
    }

    ${MOBILE} { height: 40px; padding: 0 6px; .lbl { font-size: 0.78rem; letter-spacing: 0.02em; } }
`;

/** 판 — 바다유리 한 장 */
export const Pane = styled(C.Pane)`
    ${seaGlass("panel")}
    border-radius: 26px;
    overflow: hidden;
    animation: ${surfaceIn} 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
    ${calm}
    ${MOBILE} { border-radius: 20px; margin: 0 8px; }
`;

/** 판 머리 — 실선 대신 물결 한 줄, 뒤로 멈춘 물빛 그물이 옅게, 오른쪽에 가리비 하나 */
export const PaneHeader = styled(C.PaneHeader)`
    border-bottom: none;
    padding: 34px 40px 26px;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: ${(p) => causticNetImage(p.theme)} 0 0 / 520px 520px;
        opacity: ${(p) => (dark(p) ? 0.35 : 0.55)};
        -webkit-mask: linear-gradient(180deg, #000 0%, transparent 92%);
        mask: linear-gradient(180deg, #000 0%, transparent 92%);
    }
    &::after {
        content: "";
        position: absolute;
        left: 40px;
        right: 40px;
        bottom: 4px;
        ${waveRule(0.3)}
    }
    ${MOBILE} { padding: 24px 20px 20px; &::after { left: 20px; right: 20px; } }
`;

/** 궤도 그림 대신 가리비 — 판 머리 오른쪽에 비스듬히 */
export const Orbit = styled(C.Orbit)`
    right: 34px;
    top: 26px;
    width: 64px;
    height: 64px;
    opacity: 1;
    stroke: none;
    background: ${scallopImage("peach")} center / contain no-repeat;
    transform: rotate(16deg);
    filter: drop-shadow(0 4px 6px rgba(4, 78, 92, 0.2));
    & > * { display: none; }
`;

export const Eyebrow = styled(C.Eyebrow)`
    font-family: ${LATIN};
    font-size: 0.78rem;
    letter-spacing: 0.3em;
    &::after { width: 60px; height: 8px; background: none; ${waveRule(0.5)} }
`;

export const PaneTitle = styled(C.PaneTitle)`
    font-size: 2.3rem;
    letter-spacing: 0.06em;
    color: ${(p) => p.theme.colors.primary};
    ${MOBILE} { font-size: 1.6rem; letter-spacing: 0.04em; }
`;

export const PaneBody = styled(C.PaneBody)`
    padding: 22px 40px 48px;
    ${MOBILE} { padding: 18px 18px 40px; }
`;

/** 묶음 머리 — 실선 대신 물결 */
export const BlockHead = styled(C.BlockHead)`
    h2 { font-size: 0.92rem; letter-spacing: 0.1em; color: ${(p) => (p.$danger ? p.theme.colors.error : p.theme.colors.primary)}; }
    &::after { height: 8px; background: none; ${waveRule(0.3)} opacity: ${(p) => (p.$danger ? 0.6 : 1)}; }
`;

export const DangerBlock = styled(C.DangerBlock)`
    border-top: none;
    padding: 18px;
    border-radius: ${R.lg};
    background: ${(p) => withAlpha(p.theme.colors.error, dark(p) ? 0.08 : 0.06)};
`;

/** 고름 표시 — 별 대신 진주 */
export const Star = styled(C.Star)`
    clip-path: none;
    ${(p) => pearl(p.$small ? "7px" : "9px")}
    visibility: ${(p) => (p.$on ? "visible" : "hidden")};
`;

/* ── 분절 단추 — 둥근 물길 속 알약들 ─────────────────────────────────── */
export const SegGroup = styled(C.SegGroup)`
    gap: 3px;
    padding: 3px;
    border: none;
    border-radius: ${R.pill};
    background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.05)" : withAlpha(p.theme.colors.primary, 0.08))};
    box-shadow: inset 0 2px 4px ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.3 : 0.12)};
`;

export const Seg = styled(C.Seg)`
    border-right: none;
    border-radius: ${R.pill};
    padding: 7px 15px;
    font-family: ${(p) => p.theme.fonts.display};
    color: ${(p) => (p.$selected ? (dark(p) ? "#062A36" : "#FFFFFF") : p.theme.colors.textSecondary)};
    background: ${(p) => (p.$selected ? `linear-gradient(135deg, ${p.theme.colors.accent}, ${p.theme.colors.primary})` : "transparent")};
    box-shadow: ${(p) => (p.$selected ? `0 4px 10px -4px ${withAlpha(p.theme.colors.primary, 0.7)}` : "none")};
    transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.25s ease;

    &:hover { color: ${(p) => (p.$selected ? (dark(p) ? "#062A36" : "#FFFFFF") : p.theme.colors.primary)}; }
    em { color: inherit; opacity: 0.75; font-family: ${(p) => p.theme.fonts.numeral}; }
    /* 진주 표시는 알약 안에서는 흰 진주 */
    ${C.Star} { background: radial-gradient(circle at 35% 30%, #FFFFFF 0 30%, rgba(255, 255, 255, 0.6) 60%, transparent 70%); box-shadow: none; }
`;

/* ── 테마 고르기 — 바다유리 조각 진열장 ─────────────────────────────── */
export const FamilyTile = styled(C.FamilyTile)`
    ${seaGlass("card")}
    border-radius: 18px;
    border: 1px solid ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.85) : dark(p) ? "rgba(127, 245, 234, 0.14)" : "rgba(255, 255, 255, 0.95)")};
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;

    &:hover { border-color: ${(p) => p.theme.colors.primary}; transform: translateY(-3px); }
    ${(p) => p.$selected && css`
        box-shadow: 0 0 0 2px ${withAlpha(p.theme.colors.accent, 0.8)}, 0 12px 26px -12px ${withAlpha(p.theme.colors.primary, 0.7)};
        /* 고른 조각엔 불가사리 한 마리 */
        &::after {
            top: 6px;
            left: 6px;
            width: 26px;
            height: 26px;
            background: ${starfishImage("amber")} center / contain no-repeat;
            transform: rotate(-14deg);
            filter: drop-shadow(0 2px 3px rgba(120, 70, 20, 0.35));
        }
    `}
`;

export const FamilyFoot = styled(C.FamilyFoot)`
    border-top: none;
    padding: 9px 11px 10px;
`;

export const FamilyName = styled(C.FamilyName)`
    font-family: ${LATIN};
    font-size: 0.86rem;
    letter-spacing: 0.08em;
`;

/** 벌 표시 — 마름모 대신 물방울 둘 */
export const VariantDots = styled(C.VariantDots)`
    i { transform: none; width: 7px; height: 7px; border-radius: 50%; border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.45)}; }
    i.on { background: radial-gradient(circle at 35% 30%, #FFFFFF 0 25%, transparent 50%), ${(p) => p.theme.colors.primary}; }
`;

/** 고른 갈래의 무대 — 큰 바다유리 판, 바닥에 멈춘 물빛 그물 */
export const ThemeStage = styled(C.ThemeStage)`
    position: relative;
    overflow: hidden;
    ${seaGlass("card")}
    border-radius: 22px;
    padding: 18px;

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: ${(p) => causticNetImage(p.theme)} 0 0 / 420px 420px;
        opacity: ${(p) => (dark(p) ? 0.25 : 0.4)};
        -webkit-mask: linear-gradient(90deg, transparent 30%, #000 100%);
        mask: linear-gradient(90deg, transparent 30%, #000 100%);
    }
    & > * { position: relative; }
`;

export const StageThumb = styled(C.StageThumb)`
    border: none;
    border-radius: 16px;
    box-shadow: 0 14px 28px -14px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.8)" : "rgba(4, 78, 92, 0.55)")}, 0 0 0 1px ${(p) => (dark(p) ? "rgba(127, 245, 234, 0.18)" : "rgba(255, 255, 255, 0.9)")};
`;

export const StageName = styled(C.StageName)`
    font-family: ${LATIN};
    font-size: 2rem;
    letter-spacing: 0.06em;
    line-height: 1.1;
    background: linear-gradient(180deg, ${(p) => (dark(p) ? "#BFFBF5" : "#1AA3AE")}, ${(p) => (dark(p) ? "#5FD8CF" : "#0B6A74")});
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
`;

/* ── 글꼴 카드 ────────────────────────────────────────────────────────── */
export const FontCard = styled(C.FontCard)`
    ${seaGlass("card")}
    border-radius: 18px;
    border: 1px solid ${(p) => (p.$selected ? withAlpha(p.theme.colors.primary, 0.8) : dark(p) ? "rgba(127, 245, 234, 0.14)" : "rgba(255, 255, 255, 0.95)")};
    ${(p) => p.$selected && css`
        box-shadow: 0 0 0 2px ${withAlpha(p.theme.colors.accent, 0.7)}, 0 10px 22px -12px ${withAlpha(p.theme.colors.primary, 0.6)};
        &::after {
            top: 8px;
            left: auto;
            right: 8px;
            width: 20px;
            height: 20px;
            background: ${starfishImage("amber")} center / contain no-repeat;
            transform: rotate(10deg);
        }
    `}
`;

/** 문장 끝의 작은 표식 — 별 대신 진주 한 알 */
export const FontPreview = styled(C.FontPreview)`
    &::after {
        content: "";
        display: inline-block;
        margin-left: 6px;
        vertical-align: 0;
        ${pearl("0.5em")}
    }
`;

export const CardName = styled(C.CardName)`
    letter-spacing: 0.04em;
`;

/* ── 위젯 카드 ────────────────────────────────────────────────────────── */
export const WidgetCard = styled(C.WidgetCard)`
    ${seaGlass("card")}
    border-radius: 18px;
    overflow: hidden;
    &:hover { border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)}; }
`;

export const WidgetFrame = styled(C.WidgetFrame)`
    border-bottom: none;
    background: ${(p) => causticNetImage(p.theme)} 0 0 / 300px 300px, ${(p) => withAlpha(p.theme.colors.accent, dark(p) ? 0.12 : 0.18)};
`;

/* ── 패치 노트 — 물방울이 이어진 줄 ─────────────────────────────────── */
export const Note = styled(C.Note)`
    border-left: none;
    padding-left: 24px;

    &::before {
        content: "";
        position: absolute;
        left: 5px;
        top: 4px;
        bottom: -14px;
        width: 4px;
        background: radial-gradient(circle, ${(p) => withAlpha(p.theme.colors.primary, 0.35)} 0 1.6px, transparent 2px) 0 0 / 4px 9px repeat-y;
    }
    &::after {
        content: "";
        position: absolute;
        left: ${(p) => (p.$current ? "-4px" : "1px")};
        top: ${(p) => (p.$current ? "-2px" : "3px")};
        width: ${(p) => (p.$current ? "22px" : "12px")};
        height: ${(p) => (p.$current ? "22px" : "12px")};
        border-radius: 50%;
        ${(p) => (p.$current
            ? css`background: ${starfishImage("amber")} center / contain no-repeat; border-radius: 0; transform: rotate(-12deg);`
            : css`background: radial-gradient(circle at 34% 30%, #FFFFFF 0 20%, transparent 45%), ${withAlpha(p.theme.colors.accent, 0.8)};`)}
    }
    li::marker { color: ${(p) => p.theme.colors.accent}; }
`;

export const NoteHead = styled(C.NoteHead)`
    .ver { font-family: ${(p) => p.theme.fonts.numeral}; letter-spacing: 0.06em; }
    em {
        border: none;
        border-radius: ${R.pill};
        padding: 2px 9px;
        color: ${(p) => (dark(p) ? "#062A36" : "#FFFFFF")};
        background: linear-gradient(135deg, ${(p) => p.theme.colors.accent}, ${(p) => p.theme.colors.primary});
    }
`;
