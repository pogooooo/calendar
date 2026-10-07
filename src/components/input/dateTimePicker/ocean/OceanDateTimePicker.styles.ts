/**
 * 바다의 날짜·시간 고르기 — 금빛 실선 칸과 마름모 틀(Celestial), 붉은 잎(Maple) 대신 **깨끗한 격자**:
 *   여는 칸은 10px 모서리의 흰 칸(선 하나), 펼친 판은 떠 있는 흰 판(12px)
 *   달 넘기기는 28px 글자 단추, 요일은 작은 옅은 글씨
 *   날짜는 28px 동그라미 자리 — 올리면 옅게 칠해지고, 오늘은 청록 글씨 밑에 작은 점, 고른 날은 청록으로 꽉 찬 동그라미
 *   기간은 두 날 사이를 잇는 옅은 청록 띠, 시작·종료는 납작한 둘짜리 고르개
 * 폰에서는 아래에서 올라오는 시트 — 위 모서리만 16px.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialDateTimePicker.styles";
import { EASE, hairline, ink, seaButton, surface, surfaceIn, tideInput } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE, SAFE_B } from "@/styles/breakpoints";
import { ghostIcon, menuIn, menuInUp } from "@/components/modal/baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialDateTimePicker.styles";

const onPrimary = (p: { theme: { mode: string } }) => (p.theme.mode === "dark" ? "#06110F" : "#FFFFFF");

/** 여는 칸 — 흰 칸에 선 하나. 열리면 청록 선과 옅은 고리 */
export const Trigger = styled(C.Trigger)`
    ${tideInput}
    gap: 8px;
    padding: 7px 10px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.colors.text};

    svg { width: 14px; height: 14px; color: ${(p) => p.theme.colors.textSecondary}; }
    &:hover { border-color: ${(p) => ink(p.theme, 0.2)}; }

    ${(p) => p.$open && css`
        border-color: ${p.theme.colors.primary};
        box-shadow: 0 0 0 3px ${withAlpha(p.theme.colors.primary, 0.16)};
    `}
`;

/** 펼친 판 — 떠 있는 흰 판. 위로 펼치면 아래에서, 아래로 펼치면 위에서 살짝 */
export const Popover = styled(C.Popover)`
    ${surface("float")}
    position: fixed;
    padding: 12px;
    border-radius: 12px;
    animation: ${(p) => (p.$up ? menuInUp : menuIn)} 0.16s ${EASE} both;

    ${MOBILE} {
        border: none;
        border-top: 1px solid ${(p) => hairline(p.theme, true)};
        border-radius: 16px 16px 0 0;
        padding: 14px 16px calc(14px + ${SAFE_B});
        animation: ${surfaceIn} 0.3s ${EASE} both;
    }
`;

/** ‹ 2026. 10 › — 가운데 14px·600 숫자, 양옆 28px 글자 단추 */
export const MonthNav = styled(C.MonthNav)`
    margin-bottom: 8px;

    strong {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.text};
    }

    button {
        ${ghostIcon("28px")}
        &:active { background-color: ${(p) => ink(p.theme, 0.08)}; }
        ${MOBILE} { width: 40px; height: 40px; }
    }
`;

/** 요일 — 선 없이 작은 옅은 글씨 */
export const WeekHead = styled(C.WeekHead)`
    margin-bottom: 2px;
    padding-bottom: 4px;
    border-bottom: none;

    span {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.6875rem;
        font-weight: 500;
        letter-spacing: 0;
    }
`;

/** 시작·종료 — 옅은 홈 안에서 고른 쪽만 흰 면으로 떠 있는 둘짜리 고르개 */
export const EdgeTabs = styled(C.EdgeTabs)`
    gap: 2px;
    margin-bottom: 8px;
    padding: 2px;
    border: none;
    border-radius: 8px;
    background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05)};

    button {
        padding: 5px 0;
        border-radius: 6px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0;
        transition: background-color 0.15s ease, color 0.15s ease;
        &:hover { color: ${(p) => p.theme.colors.text}; }
        ${MOBILE} { padding: 10px 0; font-size: 0.78rem; }
    }
    button + button { border-left: none; }

    button[data-on="1"] {
        color: ${(p) => p.theme.colors.text};
        font-weight: 600;
        background-color: ${(p) => (p.theme.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#FFFFFF")};
        box-shadow: 0 1px 2px ${(p) => (p.theme.mode === "dark" ? "rgba(0, 0, 0, 0.4)" : "rgba(18, 33, 32, 0.12)")};
    }
`;

/**
 * 날짜 한 칸 — ::after 가 28px 동그라미(올리면 옅게, 고르면 청록으로 꽉), ::before 가 기간의 띠,
 * 오늘 표시는 숫자 밑의 작은 점(span::after).
 */
export const Day = styled(C.Day)`
    height: 32px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    opacity: ${(p) => (p.$out ? 0.35 : 1)};

    ${MOBILE} { height: 40px; font-size: 0.82rem; }

    &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 28px;
        height: 28px;
        margin: -14px 0 0 -14px;
        border-radius: 50%;
        z-index: 1;
        pointer-events: none;
        background-color: transparent;
        transition: background-color 0.12s ease;
        ${MOBILE} { width: 34px; height: 34px; margin: -17px 0 0 -17px; }
    }
    &:hover::after { background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.1 : 0.06)}; }
    &:hover span { color: inherit; }

    &:focus-visible { outline: none; }
    &:focus-visible::after { box-shadow: 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.55)}; }

    /* 기간 — 두 날 사이를 잇는 옅은 청록 띠 (1px 실선 대신) */
    ${(p) => (p.$inRange || p.$edgeStart || p.$edgeEnd) && css`
        &::before {
            top: 50%;
            height: 28px;
            margin-top: -14px;
            background-color: ${withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.16 : 0.1)};
            ${MOBILE} { height: 34px; margin-top: -17px; }
        }
    `}

    /* 오늘 — 청록 글씨, 밑에 작은 점 */
    ${(p) => p.$today && !p.$selected && css`
        span {
            text-decoration: none;
            color: ${p.theme.colors.primary};
            font-weight: 700;
        }
        span::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: -5px;
            width: 4px;
            height: 4px;
            margin-left: -2px;
            border-radius: 50%;
            background-color: ${p.theme.colors.primary};
        }
        &:hover span { color: ${p.theme.colors.primary}; }
    `}

    /* 고른 날 — 청록으로 꽉 찬 동그라미 */
    ${(p) => p.$selected && css`
        &::after, &:hover::after {
            width: 28px;
            height: 28px;
            margin: -14px 0 0 -14px;
            border: none;
            transform: none;
            background-color: ${p.theme.colors.primary};
            ${MOBILE} { width: 34px; height: 34px; margin: -17px 0 0 -17px; }
        }
        span, &:hover span { color: ${onPrimary(p)}; font-weight: 600; }
    `}
`;

/** 시간 칸 — 위에 머리카락 선 하나 */
export const TimeArea = styled(C.TimeArea)`
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid ${(p) => hairline(p.theme)};
`;

export const TimeLabel = styled(C.TimeLabel)`
    gap: 6px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.72rem;
    letter-spacing: 0;

    svg { color: ${(p) => p.theme.colors.textSecondary}; }
    b {
        font-size: 0.8125rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.text};
    }
`;

/** 바닥 — 위에 머리카락 선, "지금·오늘" 은 글자 단추, "완료" 는 청록 단추 */
export const Foot = styled(C.Foot)`
    align-items: center;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid ${(p) => hairline(p.theme)};

    button {
        ${seaButton("ghost")}
        height: 28px;
        padding: 0 10px;
        font-size: 0.75rem;
        letter-spacing: 0;
        &:hover:not(:disabled) { border-color: transparent; }
    }

    .ok {
        ${seaButton("primary")}
        height: 28px;
        padding: 0 14px;
        font-size: 0.75rem;
        letter-spacing: 0;
        &::after { content: none; }
        &:hover:not(:disabled) { border-color: transparent; color: ${onPrimary}; box-shadow: none; }
    }
`;
