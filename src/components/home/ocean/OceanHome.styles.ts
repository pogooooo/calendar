/**
 * 바다의 홈 — 줄·단추·체크칸의 모양 (배치는 OceanHomeLayout, 날짜와 눈금 띠는 OceanMonthArch).
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * Celestial 의 마름모 점·금빛 실선·로마 숫자, Maple 의 잎·먹선·도장 대신:
 *   머리글은 15px 굵은 글씨와 고정폭 개수, 줄은 40px 에 머리카락 선, 체크칸은 청록으로 차는 동그라미,
 *   단추는 납작한 10px 면, 진행은 가는 막대 하나, 기념일은 산호 점과 고정폭 D-day.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialHome.styles";
import { bubbleCheck, focusRing, hairline, ink, label, seaButton, tideInput } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialHome.styles";

/** 목록 줄 — 아래 머리카락 선 하나, 마지막 줄엔 없다. 올리면 아주 옅은 면 */
const listRow = css`
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    transition: background-color 0.15s ease, color 0.15s ease;
    &:last-of-type { border-bottom-color: transparent; }
`;
const hoverFill = css`
    &:hover { background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.05 : 0.03)}; }
`;

/** 끝낸 체크칸 안의 흰 체크 — 그림 없이 선 두 개로 */
const tick = (on: boolean, size: number) => css`
    &::after {
        content: "";
        position: absolute;
        left: ${size * 0.3}px;
        top: ${size * 0.13}px;
        width: ${size * 0.22}px;
        height: ${size * 0.42}px;
        border: solid currentColor;
        border-width: 0 1.6px 1.6px 0;
        transform: rotate(45deg);
        opacity: ${on ? 1 : 0};
        transition: opacity 0.15s ease;
    }
`;

/* ── 날짜 판 ──────────────────────────────────────────────────────── */

/** 날짜·요약·눈금을 세로로 — 요약 줄(ArchFoot)은 날짜와 눈금 사이로 들어간다 */
export const ArchWrap = styled(C.ArchWrap)`
    display: flex;
    flex-direction: column;
    padding: 0;
    ${MOBILE} { padding: 0; }
`;

/** 그달 요약 한 줄 — 금빛 실선·✦·양 끝 숫자 없이 글씨만 */
export const ArchFoot = styled(C.ArchFoot)`
    order: 1;
    justify-content: flex-start;
    border-top: none;
    padding: 0;
    margin: 8px 0 18px;

    .edge, .center i { display: none; }
    .center {
        gap: 0;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.82rem;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
        font-variant-numeric: tabular-nums;
    }
    ${MOBILE} { margin: 6px 0 14px; .center { font-size: 0.78rem; } }
`;

/* ── 보는 날 옮기기 ────────────────────────────────────────────────── */

export const DayNav = styled(C.DayNav)`
    justify-content: flex-start;
    gap: 4px;
    padding: 0;
    ${MOBILE} { gap: 4px; padding: 0; flex-wrap: nowrap; }
`;

/** ‹ › — 글씨만 있는 네모 단추 */
export const NavButton = styled(C.NavButton)`
    ${seaButton("ghost")}
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 8px;
    opacity: 1;
    /* 화살이 받은 자리(34×13)는 이 작은 단추에 넘치니 꺾쇠 크기로 줄인다 */
    & > span { width: 20px !important; height: 20px !important; }
    &:hover { filter: none; opacity: 1; }
    ${focusRing}
    ${MOBILE} { width: 40px; height: 40px; min-width: 40px; min-height: 40px; }
`;

/** 가운데 날짜 — 입력칸과 같은 면 (고르개 단추를 이 줄에 맞춰 입힌다) */
export const DayPick = styled(C.DayPick)`
    min-width: 9em;

    button {
        ${tideInput}
        height: 32px;
        gap: 8px;
        padding: 0 12px;
        justify-content: center;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.84rem;
        font-weight: 600;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.text};
        svg { color: ${(p) => p.theme.colors.textSecondary}; }
    }

    ${MOBILE} {
        min-width: 0;
        button { height: 40px; min-height: 40px; padding: 0 10px; font-size: 0.86rem; }
    }
`;

export const TodayButton = styled(C.TodayButton)`
    ${seaButton("default")}
    height: 32px;
    margin-left: 6px;
    padding: 0 12px;
    font-size: 0.78rem;
    letter-spacing: 0;
    &:hover:not(:disabled) { box-shadow: none; }

    ${MOBILE} {
        flex-basis: auto;
        height: 40px;
        min-height: 40px;
        margin-left: 2px;
        &:disabled { display: none; }
    }
`;

/* ── 목록 ─────────────────────────────────────────────────────────── */

/** 머리글 — 15px 굵은 글씨, 개수는 고정폭 꼬리표. 마름모·실선 없음 */
export const SectionHead = styled(C.SectionHead)`
    gap: 8px;
    margin-bottom: 10px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.94rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};

    .hd { display: none; }
    .hr { flex: 1; height: 0; background: none; }
    b {
        ${label}
        font-variant-numeric: tabular-nums;
    }
`;

/** 오늘 한 줄 추가 — 입력칸 하나, 끝에 작은 단추 둘 (+ 는 청록) */
export const QuickForm = styled(C.QuickForm)`
    ${tideInput}
    gap: 8px;
    height: 40px;
    margin-bottom: 6px;
    padding: 0 4px 0 12px;

    .dot {
        width: 8px;
        height: 8px;
        margin-left: 0;
        border-radius: 50%;
        transform: none;
    }
    input { padding: 0; height: 100%; font-size: 0.88rem; }

    button {
        width: 30px;
        height: 30px;
        align-self: center;
        border-left: none;
        border-radius: 8px;
        transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
        &:not(:disabled):hover { background-color: ${(p) => ink(p.theme, 0.05)}; }
        &:not(:disabled):active { transform: scale(0.96); }
        ${focusRing}
    }
    button[type="submit"] {
        color: ${(p) => (p.theme.mode === "dark" ? "#06110F" : "#FFFFFF")};
        background-color: ${(p) => p.theme.colors.primary};
        &:not(:disabled):hover { background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.primary} 86%, ${p.theme.mode === "dark" ? "#FFFFFF" : "#000000"})`}; }
    }
    button[type="submit"]:disabled {
        opacity: 1;
        color: ${(p) => p.theme.colors.textSecondary};
        background-color: ${(p) => ink(p.theme, 0.06)};
    }

    ${MOBILE} {
        height: 44px;
        margin-bottom: 8px;
        input { padding: 0; font-size: 0.9rem; }
        button { width: 36px; height: 36px; }
    }
`;

export const QuickError = styled(C.QuickError)`
    margin: 0 0 6px;
    font-size: 0.76rem;
`;

/** 그날 목록이 구르는 칸 — 비었을 때 문구가 남은 자리 가운데 오도록 세로로 쌓는다 */
export const Scroll = styled(C.Scroll)`
    display: flex;
    flex-direction: column;
    ${MOBILE} { display: block; }
`;

export const Empty = styled(C.Empty)`
    padding: 10px 0;
    font-size: 0.8rem;
    line-height: 1.6;
    color: ${(p) => p.theme.colors.textSecondary};

    /* 구르는 칸에 홀로 든 빈 문구는 남은 자리 가운데로 */
    &:only-child, &:has([data-empty-art]) { margin: auto 0; padding: 18px 0; text-align: center; }
    ${MOBILE} { &:only-child, &:has([data-empty-art]) { margin: 0; } }
`;

/** 체크칸 — 동그라미. 끝내면 청록으로 차고 흰 체크가 선다 */
export const Mark = styled(C.Mark)`
    ${(p) => bubbleCheck(p.$on, "18px")}
    transform: none;
    ${(p) => tick(p.$on, 18)}
`;

export const Row = styled(C.Row)`
    min-height: 40px;
    gap: 12px;
    padding: 8px 2px;
    font-size: ${(p) => (p.$soft ? "0.84rem" : "0.88rem")};
    ${listRow}
    ${hoverFill}

    &:hover { color: ${(p) => (p.$done || p.$soft ? p.theme.colors.textSecondary : p.theme.colors.text)}; }
    &:hover ${Mark} { border-color: ${(p) => (p.$done ? p.theme.colors.primary : ink(p.theme, 0.55))}; box-shadow: none; }

    .name {
        text-decoration-color: ${(p) => ink(p.theme, 0.4)};
        text-decoration-thickness: 1px;
    }

    /* 이번 주의 요일 — 한글이라 고정폭 글꼴 대신 본문 글꼴로 작게 */
    em {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.74rem;
        font-weight: 500;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    ${MOBILE} { min-height: 46px; gap: 12px; }
`;

/* ── 오른쪽 판의 머리글 ───────────────────────────────────────────── */

/** 로마 숫자 상자·금선 대신 굵은 글씨만 — 올리면 청록 */
export const PillarHead = styled(C.PillarHead)`
    gap: 8px;
    margin-bottom: 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.94rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
    transition: color 0.15s ease;

    .idx { display: none; }
    .rule { flex: 1; height: 0; background: none; }
    &:hover { color: ${(p) => p.theme.colors.primary}; }
    &:hover .rule { background: none; }
    ${focusRing}
`;

export const PillarHeadRow = styled(C.PillarHeadRow)`
    margin-bottom: 8px;
    &.mt { margin-top: 0; }
`;

/** 머리글 옆 + — 글씨만 있는 작은 네모 단추 */
export const PillarAdd = styled(C.PillarAdd)`
    ${seaButton("ghost")}
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 8px;
    &:hover { box-shadow: none; }
    ${MOBILE} { width: 36px; height: 36px; }
`;

/** 기념일 한 줄 추가 — 입력칸 둘과 청록 + */
export const AnvForm = styled(C.AnvForm)`
    gap: 6px;
    margin: 0 0 8px;

    input {
        ${tideInput}
        height: 34px;
        padding: 0 10px;
        font-size: 0.8rem;
    }
    button {
        ${seaButton("primary")}
        width: 34px;
        height: 34px;
        align-self: center;
        &:not(:disabled):hover { box-shadow: none; }
    }

    ${MOBILE} {
        input { height: 42px; font-size: 0.86rem; }
        button { width: 42px; height: 42px; }
    }
`;

/** 프로젝트 — 이름 아래 가는 진행 막대 하나 */
export const ProjectRow = styled(C.ProjectRow)`
    gap: 6px 10px;
    padding: 10px 2px;
    font-size: 0.86rem;
    ${listRow}
    ${hoverFill}

    &:hover .name { color: ${(p) => p.theme.colors.text}; }
    &:active { background-color: ${(p) => ink(p.theme, 0.06)}; }

    .bar {
        height: 4px;
        border-radius: 999px;
        overflow: hidden;
        background: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.12 : 0.08)};
    }
    .bar b {
        top: 0;
        height: 100%;
        border-radius: 999px;
        background: ${(p) => p.theme.colors.primary};
        transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    em {
        ${label}
        letter-spacing: 0.02em;
        font-variant-numeric: tabular-nums;
    }
`;

export const ChallengeRow = styled(C.ChallengeRow)`
    gap: 6px 8px;
    padding: 10px 2px;
    font-size: 0.86rem;
    ${listRow}

    em {
        ${label}
        letter-spacing: 0.02em;
        font-variant-numeric: tabular-nums;
    }
    .streak { gap: 6px; margin-top: 2px; }
    ${MOBILE} { .streak { gap: 4px; } }
`;

/** 이레 칸 — 작은 동그라미 일곱. 한 날은 청록으로 차고, 오늘은 청록 테 */
export const Slot = styled(C.Slot)`
    width: 14px;
    height: 14px;
    padding: 0;
    transform: none;
    border-radius: 50%;
    border: 1.5px solid ${(p) => (p.$on ? p.theme.colors.primary : p.$today ? p.theme.colors.primary : ink(p.theme, 0.25))};
    background: ${(p) => (p.$on ? p.theme.colors.primary : "transparent")};
    box-shadow: none;
    outline: ${(p) => (p.$today ? `1.5px solid ${withAlpha(p.theme.colors.primary, 0.35)}` : "none")};
    outline-offset: 2px;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover { box-shadow: none; border-color: ${(p) => p.theme.colors.primary}; }
    ${focusRing}

    /* 폰: 동그라미는 ::after 로 옮기고 단추는 넓은 짚을 자리가 된다 */
    ${MOBILE} {
        width: auto;
        height: 32px;
        min-width: 0;
        border: none;
        border-radius: 8px;
        background: none;
        outline: none;
        display: flex;
        align-items: center;
        justify-content: center;

        &::after {
            width: 16px;
            height: 16px;
            transform: none;
            border-radius: 50%;
            border: 1.5px solid ${(p) => (p.$on || p.$today ? p.theme.colors.primary : ink(p.theme, 0.25))};
            background: ${(p) => (p.$on ? p.theme.colors.primary : "transparent")};
            box-shadow: ${(p) => (p.$today && !p.$on ? `0 0 0 3px ${withAlpha(p.theme.colors.primary, 0.14)}` : "none")};
        }
        &:active { background-color: ${(p) => ink(p.theme, 0.06)}; }
    }
`;

/** 기념일 — ✦ 대신 산호 점, D-day 는 고정폭 꼬리표 */
export const AnniversaryRow = styled(C.AnniversaryRow)`
    gap: 10px;
    padding: 10px 2px;
    font-size: 0.86rem;
    ${listRow}
    ${hoverFill}

    &:hover .name { color: ${(p) => p.theme.colors.text}; }
    &:active { background-color: ${(p) => ink(p.theme, 0.06)}; }

    .star {
        width: 6px;
        height: 6px;
        font-size: 0;
        border-radius: 50%;
        background: ${(p) => p.theme.colors.weekend};
    }
    em {
        ${label}
        letter-spacing: 0.04em;
        color: ${(p) => p.theme.colors.text};
        font-variant-numeric: tabular-nums;
    }
`;
