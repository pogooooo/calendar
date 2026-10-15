/**
 * Maple 의 홈 — 배치는 MapleHomeLayout 에, 공용 행과 단추의 모양은 여기에 둔다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트: 카드 머리글은 명조, 할 일은 둥근 체크 칸, 챌린지의 이레는 둥근 네모 칸, 기념일은 붉은 잎과 D-날 알약.
 * 줄은 괘선 없이 둥근 줄 — 올리면 옅은 바탕이 깔린다.
 * 2026-10-15 다시 그리며 로마 숫자 쪽 번호·먹 괘선·점선 진행 막대·잎 체크를 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialHome.styles";
import { withAlpha } from "@/styles/color";
import { autumnFill, crest, hair, inkCheckbox, leafBullet, stampButton } from "@/styles/maple/ink";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialHome.styles";

type P = { theme: { mode: string; colors: { primary: string; text: string } } };
const dark = (p: P) => p.theme.mode === "dark";
/** 고른 것의 바탕 — 단풍 붉음을 옅게 */
const tint = (p: P) => withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.1);
/** 줄에 마우스를 올렸을 때의 바탕 */
const rowHover = (p: P) => hair(p.theme, dark(p) ? 0.07 : 0.045);

/** 둥근 줄 — 카드 안쪽 여백까지 바탕이 번지도록 양옆으로 8px 내민다 */
const roundRow = css`
    margin: 0 -8px;
    padding-left: 8px;
    padding-right: 8px;
    border-bottom: none;
    border-radius: 8px;
    transition: background-color 0.15s ease;

    &:hover { background-color: ${rowHover}; }
    &:hover .name { color: inherit; }
    &:active { background-color: ${(p: P) => hair(p.theme, dark(p) ? 0.1 : 0.07)}; }
`;

/* ── 머리: 날짜·막대 띠·요약 ─────────────────────────────────────────── */

/** 칸을 풀어 날짜·띠·요약이 MapleHomeLayout 머리의 격자에 바로 선다 */
export const ArchWrap = styled(C.ArchWrap)`
    display: contents;
`;

export const ArchFoot = styled(C.ArchFoot)`
    grid-area: foot;
    gap: 12px;
    margin-top: 0;
    padding-top: 0;
    border-top: none;

    .edge {
        font-size: 0.75rem;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    .center {
        gap: 0;
        font-family: inherit;
        font-size: 0.85rem;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }
    .center i { display: none; }

    ${MOBILE} {
        .center { font-size: 0.8rem; letter-spacing: 0; }
    }
`;

/* ── 보는 날 옮기기 ────────────────────────────────────────────────── */

export const DayNav = styled(C.DayNav)`
    gap: 6px;
    padding: 0;

    ${MOBILE} { padding: 0; }
`;

export const NavButton = styled(C.NavButton)`
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 10px;
    color: ${(p) => p.theme.colors.textSecondary};
    opacity: 1;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover { filter: none; background-color: ${rowHover}; color: ${(p) => p.theme.colors.text}; }
    &:focus-visible { outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.45)}; outline-offset: 1px; }

    ${MOBILE} { width: 44px; height: 44px; }
`;

export const DayPick = styled(C.DayPick)`
    min-width: 9.5em;

    button {
        ${stampButton("default")}
        width: 100%;
        justify-content: center;
        gap: 8px;
        padding: 7px 14px;
        font-family: inherit;
        font-size: 0.875rem;
    }

    ${MOBILE} {
        button { font-size: 0.875rem; padding: 9px 12px; min-height: 44px; }
    }
`;

export const DayLabel = styled(C.DayLabel)`
    font-family: inherit;

    b { font-weight: 600; font-size: 0.95rem; letter-spacing: 0; }
    em { font-size: 0.75rem; letter-spacing: 0; }
`;

export const TodayButton = styled(C.TodayButton)`
    ${stampButton("default")}
    padding: 7px 14px;
    font-family: inherit;
    font-size: 0.8rem;
    color: ${(p) => p.theme.colors.primary};

    &:hover:not(:disabled) { box-shadow: none; }
    &:disabled { opacity: 0.4; }
`;

/* ── 오늘 · 이번 주 ───────────────────────────────────────────────── */

/** 카드 머리글 — 명조 굵게, 오른쪽 끝에 개수 알약 */
export const SectionHead = styled(C.SectionHead)`
    gap: 8px;
    margin-bottom: 14px;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};

    .hd { display: none; }
    .hr { background: none; }

    b {
        min-width: 24px;
        padding: 2px 8px;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.09 : 0.06)};
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 600;
        text-align: center;
        color: ${(p) => p.theme.colors.textSecondary};
    }
`;

/** 한 줄 추가 — 카드 안의 입력칸(종이색), 앞에 카테고리 색 잎 */
export const QuickForm = styled(C.QuickForm)`
    gap: 6px;
    margin-bottom: 10px;
    padding: 0 4px 0 0;
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.14 : 0.12)};
    border-radius: 10px;
    background-color: ${(p) => p.theme.colors.background};

    &:focus-within {
        border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)};
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.12)};
    }

    /* 색은 인라인 style(카테고리 색)로 온다 */
    .dot {
        ${leafBullet(true, "12px")}
        margin-left: 12px;
        border-radius: 0;
        color: ${(p) => p.theme.colors.primary};
    }

    input {
        padding: 10px 0 10px 2px;
        font-size: 0.9rem;
    }

    button {
        width: 30px;
        height: 30px;
        align-self: center;
        border-left: none;
        border-radius: 8px;
        color: ${(p) => p.theme.colors.primary};

        &:not(:disabled):hover { background-color: ${tint}; }
        &:not(:disabled):active { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.2)}; }
        &.detail { color: ${(p) => p.theme.colors.textSecondary}; }
        &.detail:hover { color: ${(p) => p.theme.colors.primary}; }
    }

    ${MOBILE} {
        input { padding: 12px 0 12px 2px; font-size: 0.9rem; }
        button { width: 40px; height: 40px; }
    }
`;

export const QuickError = styled(C.QuickError)`
    margin: -4px 0 8px;
    font-size: 0.78rem;
`;

export const Empty = styled(C.Empty)`
    padding: 10px 0;
    font-size: 0.85rem;
`;

/** 할 일의 체크 칸 — 둥근 네모, 끝내면 단풍 붉음에 흰 체크 */
export const Mark = styled(C.Mark)`
    width: 18px;
    height: 18px;
    transform: none;
    ${(p) => inkCheckbox(p.$on)}
`;

export const Row = styled(C.Row)`
    ${roundRow}
    gap: 12px;
    width: calc(100% + 16px);
    padding-top: ${(p) => (p.$soft ? "8px" : "9px")};
    padding-bottom: ${(p) => (p.$soft ? "8px" : "9px")};
    font-size: ${(p) => (p.$soft ? "0.875rem" : "0.92rem")};
    color: ${(p) => (p.$done ? p.theme.colors.textSecondary : p.theme.colors.text)};

    .name { text-decoration-color: ${(p) => hair(p.theme, 0.45)}; }

    em {
        font-size: 0.78rem;
        letter-spacing: 0;
    }

    &:hover { color: ${(p) => (p.$done ? p.theme.colors.textSecondary : p.theme.colors.text)}; }
    &:hover ${Mark} { box-shadow: none; }

    /* 이번 주 줄은 누르면 달력으로 데려가는 줄 — 체크 칸 대신 작은 잎 */
    ${(p) => p.$soft && css`
        ${Mark} {
            ${leafBullet(p.$done, "12px")}
            margin: 0 3px;
            border-radius: 0;
            background-image: none;
            color: ${p.theme.colors.primary};
            opacity: 0.85;

            &::after { content: none; }
        }
    `}
`;

/* ── 프로젝트 · 챌린지 · 기념일 ───────────────────────────────────── */

export const PillarHead = styled(C.PillarHead)`
    gap: 8px;
    margin-bottom: 12px;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};
    transition: color 0.15s ease;

    .idx { display: none; }
    .rule { background: none; }

    &:hover { color: ${(p) => p.theme.colors.primary}; }
    &:hover .rule { background: none; }
`;

export const PillarHeadRow = styled(C.PillarHeadRow)`
    margin-bottom: 12px;

    &.mt { margin-top: 0; }
`;

export const PillarAdd = styled(C.PillarAdd)`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.16 : 0.12)};
    color: ${(p) => p.theme.colors.textSecondary};
    transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

    &:hover {
        border-color: transparent;
        background-color: ${tint};
        color: ${(p) => p.theme.colors.primary};
        box-shadow: none;
    }

    ${MOBILE} { width: 36px; height: 36px; }
`;

export const AnvForm = styled(C.AnvForm)`
    gap: 6px;
    margin: 0 0 10px;

    input {
        padding: 7px 10px;
        border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.16 : 0.14)};
        border-radius: 8px;
        background-color: ${(p) => p.theme.colors.background};
        font-size: 0.85rem;

        &:focus { border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)}; }
    }

    button {
        width: 34px;
        border: none;
        border-radius: 8px;
        background-color: ${(p) => p.theme.colors.primary};
        color: #fff;

        &:not(:disabled):hover { background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.primary} 88%, #000)`}; }
        &:disabled { opacity: 0.4; }
    }

    ${MOBILE} {
        input { padding: 10px 12px; font-size: 0.9rem; }
        button { width: 44px; }
    }
`;

/** 진행 막대 — 둥근 홈에 호박빛에서 단풍 붉음으로 물이 든다 */
export const ProjectRow = styled(C.ProjectRow)`
    ${roundRow}
    gap: 7px 10px;
    padding-top: 9px;
    padding-bottom: 9px;
    font-size: 0.9rem;

    .bar {
        height: 6px;
        border-radius: 999px;
        overflow: hidden;
        background: ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.08)};
    }

    .bar b {
        top: 0;
        height: 100%;
        border-radius: inherit;
        background: ${autumnFill};
    }

    em { font-size: 0.75rem; }
`;

/** 챌린지 줄은 누르는 줄이 아니다(칸만 누른다) — 바탕이 깔리지 않는다 */
export const ChallengeRow = styled(C.ChallengeRow)`
    margin: 0 -8px;
    padding: 9px 8px 10px;
    gap: 7px 10px;
    border-bottom: none;
    font-size: 0.9rem;

    em { font-size: 0.75rem; }
    .streak { gap: 5px; }
`;

/** 챌린지 이레 칸 — 둥근 네모. 채운 날은 단풍 붉음, 오늘은 붉은 테 */
const slotFace = (p: P & { $on: boolean; $today: boolean }) => css`
    border-radius: 5px;
    border: 1.5px solid ${p.$on ? p.theme.colors.primary : p.$today ? withAlpha(p.theme.colors.primary, 0.75) : "transparent"};
    background: ${p.$on ? p.theme.colors.primary : hair(p.theme, dark(p) ? 0.12 : 0.08)};
    box-shadow: none;
    transform: none;
`;

export const Slot = styled(C.Slot)`
    width: 18px;
    height: 18px;
    ${(p) => slotFace(p)}
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover { box-shadow: none; border-color: ${(p) => p.theme.colors.primary}; }

    ${MOBILE} {
        width: auto;
        height: 30px;
        border: none;
        background: none;

        &::after {
            width: 18px;
            height: 18px;
            ${(p) => slotFace(p)}
        }
    }
`;

export const AnniversaryRow = styled(C.AnniversaryRow)`
    ${roundRow}
    gap: 10px;
    padding-top: 9px;
    padding-bottom: 9px;
    font-size: 0.9rem;

    .star {
        ${crest("12px")}
        width: 12px;
        font-size: 0;
        color: ${(p) => p.theme.colors.primary};
    }

    em {
        padding: 2px 8px;
        border-radius: 999px;
        background-color: ${tint};
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.primary};
    }
`;
