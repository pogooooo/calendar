/**
 * Maple 의 날짜·시간 고르기 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 붉은 잎 위의 흰 숫자·잎 밑줄·황토 물 띠를 걷고 깨끗한 달력으로.
 *   여는 칸은 다른 칸과 같은 inkInput, 펼친 판은 14px 모서리의 카드(폰은 위 모서리만 둥근 시트)
 *   ‹ 2026. 10 › — 고운바탕 굵은 달 이름, 양옆은 동그란 글자 단추
 *   고른 날은 붉음으로 꽉 찬 알약에 흰 숫자, 오늘은 옅은 붉음 바탕에 붉은 숫자, 기간은 두 날을 잇는 옅은 붉음 띠
 *   시작·종료는 칩 두 개(고른 쪽이 옅은 붉음), 바닥은 "지금·오늘"(글자 단추)과 "완료"(붉은 알약)
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialDateTimePicker.styles";
import { MOBILE, SAFE_B } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { hair, inkChip, stampButton } from "@/styles/maple/ink";
import {
    dropIn, dropInUp, fieldButton, onFill, popCard, roundIcon, sheetShadow, sheetUp, tint, wash,
} from "@/components/modal/baseModal/maple/mapleLayer";

export * from "../celestial/CelestialDateTimePicker.styles";

/** 여는 칸 — 다른 칸과 같은 둥근 칸. 열리면 붉은 테와 옅은 번짐 */
export const Trigger = styled(C.Trigger)`
    ${fieldButton}
    gap: 8px;
    min-height: 38px;
    padding: 0 12px;
    font-size: 0.875rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: ${(p) => p.theme.colors.text};

    svg { width: 15px; height: 15px; color: ${(p) => p.theme.colors.textSecondary}; opacity: 1; }
    &:hover:not(:disabled) { border-color: ${(p) => withAlpha(p.theme.colors.text, 0.26)}; }

    ${(p) => p.$open && css`
        &, &:hover:not(:disabled), &:focus:not(:focus-visible) {
            border-color: ${p.theme.colors.primary};
            box-shadow: 0 0 0 3px ${withAlpha(p.theme.colors.primary, 0.14)};
        }
        svg { color: ${p.theme.colors.primary}; }
    `}

    ${MOBILE} { min-height: 44px; }
`;

/** 펼친 판 — 폭은 뼈대 그대로(272 — DateTimePicker 가 화면 끝에 닿지 않게 자리를 셀 때 그 값을 쓴다) */
export const Popover = styled(C.Popover)`
    ${popCard("14px")}
    position: fixed;
    padding: 12px;
    animation: ${(p) => (p.$up ? dropInUp : dropIn)} 0.16s cubic-bezier(0.2, 0.8, 0.3, 1) both;

    ${MOBILE} {
        width: auto;
        border: none;
        border-top: 1px solid ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.12 : 0.06)};
        border-radius: 20px 20px 0 0;
        box-shadow: ${(p) => sheetShadow(p.theme)};
        padding: 16px 18px calc(16px + ${SAFE_B});
        animation: ${sheetUp} 0.28s cubic-bezier(0.2, 0.8, 0.3, 1) both;
    }
`;

/** ‹ 2026. 10 › — 가운데 고운바탕 굵은 달 이름, 양옆 동그란 글자 단추 */
export const MonthNav = styled(C.MonthNav)`
    margin-bottom: 10px;

    strong {
        font-family: ${(p) => p.theme.fonts.display};
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.text};
    }

    button {
        ${roundIcon("32px", "18px")}
        ${MOBILE} { width: 40px; height: 40px; }
    }
`;

/** 요일 — 선 없이 12px 옅은 글씨 (일요일만 주말색) */
export const WeekHead = styled(C.WeekHead)`
    margin-bottom: 4px;
    padding-bottom: 4px;
    border-bottom: none;

    span {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0;
    }
`;

/** 시작·종료 — 칩 두 개. 고른 쪽이 옅은 붉음에 붉은 글씨 */
export const EdgeTabs = styled(C.EdgeTabs)`
    gap: 6px;
    margin-bottom: 8px;
    border: none;

    button {
        ${inkChip(false)}
        padding: 6px 0;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.8125rem;
        font-weight: 500;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
        transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

        &:hover { color: ${(p) => p.theme.colors.text}; border-color: ${(p) => hair(p.theme, 0.24)}; }
        ${MOBILE} { padding: 10px 0; }
    }
    button + button { border-left: 1px solid ${(p) => hair(p.theme, 0.14)}; }

    button[data-on="1"], button[data-on="1"]:hover {
        ${inkChip(true)}
        font-weight: 600;
    }
`;

/**
 * 날짜 한 칸 — ::after 가 알약(올리면 옅게, 오늘이면 옅은 붉음, 고르면 붉음으로 꽉), ::before 가 기간의 띠.
 */
export const Day = styled(C.Day)`
    height: 34px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    opacity: ${(p) => (p.$out ? 0.36 : 1)};

    ${MOBILE} { height: 42px; font-size: 0.875rem; }

    &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 32px;
        height: 28px;
        margin: -14px 0 0 -16px;
        border-radius: 999px;
        z-index: 1;
        pointer-events: none;
        background-color: transparent;
        transition: background-color 0.12s ease;
        ${MOBILE} { width: 40px; height: 34px; margin: -17px 0 0 -20px; }
    }
    &:hover::after { background-color: ${(p) => wash(p.theme)}; }
    &:hover span { color: inherit; }

    &:focus-visible { outline: none; }
    &:focus-visible::after { box-shadow: 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.55)}; }

    /* 기간 — 두 날 사이를 잇는 옅은 붉음 띠 (1px 실선 대신). 줄이 바뀌는 끝(일·토요일)은 둥글게 닫는다 */
    ${(p) => (p.$inRange || p.$edgeStart || p.$edgeEnd) && css`
        &::before {
            top: 50%;
            height: 28px;
            margin-top: -14px;
            background-color: ${tint(p.theme, 0.08, 0.14)};
            ${MOBILE} { height: 34px; margin-top: -17px; }
        }
        &:nth-child(7n + 1)::before { border-top-left-radius: 999px; border-bottom-left-radius: 999px; }
        &:nth-child(7n)::before { border-top-right-radius: 999px; border-bottom-right-radius: 999px; }
    `}

    /* 오늘 — 옅은 붉음 바탕에 붉은 숫자 */
    ${(p) => p.$today && !p.$selected && css`
        span {
            text-decoration: none;
            color: ${p.theme.colors.primary};
            font-weight: 700;
        }
        &::after, &:hover::after { background-color: ${tint(p.theme)}; }
        &:hover span { color: ${p.theme.colors.primary}; }
    `}

    /* 고른 날 — 붉음으로 꽉 찬 알약에 흰 숫자 */
    ${(p) => p.$selected && css`
        &::after, &:hover::after {
            border: none;
            transform: none;
            background-color: ${p.theme.colors.primary};
            box-shadow: 0 1px 2px ${withAlpha(p.theme.colors.primary, 0.3)};
        }
        span, &:hover span { color: ${onFill(p.theme)}; font-weight: 700; }
    `}
`;

/** 시간 칸 — 위에 옅은 선 하나 */
export const TimeArea = styled(C.TimeArea)`
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid ${(p) => hair(p.theme, 0.08)};
`;

export const TimeLabel = styled(C.TimeLabel)`
    gap: 6px;
    margin-bottom: 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0;

    svg { width: 14px; height: 14px; color: ${(p) => p.theme.colors.textSecondary}; }
    b {
        margin-left: auto;
        font-size: 0.875rem;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.text};
    }
`;

/** 바닥 — 위에 옅은 선, "지금·오늘" 은 글자 단추, "완료" 는 붉은 알약 */
export const Foot = styled(C.Foot)`
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid ${(p) => hair(p.theme, 0.08)};

    button {
        height: 32px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.8125rem;
        letter-spacing: 0;
    }

    button:not(.ok) {
        ${stampButton("ghost")}
        padding: 0 12px;
        color: ${(p) => p.theme.colors.textSecondary};
        &:hover { color: ${(p) => p.theme.colors.text}; }
    }

    .ok {
        ${stampButton("primary")}
        padding: 0 18px;
        /* 뼈대의 button:hover(붉은 글씨)가 이 단추에도 걸린다 — 채운 붉음 위 글씨를 지킨다 */
        &:hover { color: ${(p) => onFill(p.theme)}; }
        &::after { content: none; }
    }

    ${MOBILE} {
        button, .ok { height: 40px; }
    }
`;
