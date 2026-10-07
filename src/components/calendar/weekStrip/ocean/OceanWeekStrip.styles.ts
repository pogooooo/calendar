/**
 * 바다의 폰 주간 띠 — 바탕색 띠에 테두리 상자(Celestial), 종이 쪽지·눌러 말린 잎(Maple) 대신
 * **반투명 판 하나에 12px 모서리 날짜 칸 일곱**. 요일은 작은 고정폭 대문자, 숫자는 굵은 고정폭 숫자,
 * 고른 날은 청록으로 꽉 찬 칸에 흰 글씨, 오늘은 청록 숫자에 작은 청록 점. 일정은 카테고리 색 점(마름모 대신).
 */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialWeekStrip.styles";
import { EASE, R, calm, focusRing, ink, label, surface, surfaceIn } from "@/styles/ocean/water";

export * from "../celestial/CelestialWeekStrip.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
const onTeal = (p: { theme: { mode: string } }) => (dark(p) ? "#06110F" : "#FFFFFF");

/** 주가 바뀔 때 머리 글씨가 살짝 올라오며 나타난다 (한 번만) */
const titleIn = keyframes`
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const Strip = styled(C.Strip)`
    ${surface("panel")}
    border-radius: 16px;
    padding: 6px 6px 8px;
    margin-bottom: 10px;
    animation: ${surfaceIn} 0.4s ${EASE} both;
    ${calm}
`;

/** ‹ 2026년 10월 [오늘] › — 굵은 글씨 한 줄과 글씨만 있는 단추 */
export const Head = styled(C.Head)`
    min-height: 36px;
    margin-bottom: 2px;

    .title {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.875rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        animation: ${titleIn} 0.3s ${EASE} both;
        ${calm}
    }

    button {
        min-width: 36px;
        min-height: 36px;
        border: none;
        border-radius: 10px;
        color: ${(p) => p.theme.colors.textSecondary};
        transition: background-color 0.15s ease, color 0.15s ease;

        &:active { color: ${(p) => p.theme.colors.text}; background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)}; }
        ${focusRing}
    }

    .today {
        min-height: 32px;
        padding: 0 10px;
        border: 1px solid ${(p) => ink(p.theme, dark(p) ? 0.16 : 0.13)};
        border-radius: 8px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.text};
        background: ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.85)")};
    }
`;

export const Days = styled(C.Days)`
    gap: 4px;
`;

/** 날 하나 — 12px 모서리 칸. 고르면 청록 칸, 오늘은 청록 숫자와 점 */
export const Day = styled(C.Day)`
    position: relative;
    gap: 4px;
    min-height: 62px;
    padding: 8px 0 7px;
    border: none;
    border-radius: ${R.md};
    /* 고른 칸은 글자색을 흰빛으로 — 색 없는 일정 점(currentColor)도 따라 하얘진다 */
    color: ${(p) => (p.$selected ? onTeal(p) : p.$weekend ? p.theme.colors.weekend : p.theme.colors.text)};
    background: ${(p) => (p.$selected ? p.theme.colors.primary : "transparent")};
    transition: background-color 0.15s ease, color 0.15s ease;

    .name {
        ${label}
        font-size: 0.58rem;
        letter-spacing: 0.06em;
        color: ${(p) => (p.$selected ? onTeal(p) : p.theme.colors.textSecondary)};
        opacity: ${(p) => (p.$selected ? 0.8 : 1)};
    }

    .num {
        width: auto;
        height: 22px;
        line-height: 22px;
        border: none;
        border-radius: 0;
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 1.05rem;
        font-weight: ${(p) => (p.$today || p.$selected ? 700 : 500)};
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.01em;
        color: inherit;
        ${(p) => p.$today && !p.$selected && css`color: ${p.theme.colors.primary};`}
    }

    /* 일정 점 — 마름모 대신 동그라미. 청록 칸 위에서는 흰 점 (색은 아래 일간이 보여 준다 — 인라인 색을 이겨야 해서 !important) */
    .dots {
        gap: 3px;
        min-height: 6px;
        i {
            width: 5px;
            height: 5px;
            transform: none;
            border-radius: 50%;
            ${(p) => p.$selected && css`background: ${onTeal(p)} !important; opacity: 0.85;`}
        }
        em {
            font-family: ${(p) => p.theme.fonts.numeral};
            font-size: 0.58rem;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
            color: ${(p) => (p.$selected ? onTeal(p) : p.theme.colors.textSecondary)};
        }
    }

    /* 오늘 — 칸 위쪽 가운데의 작은 청록 점 */
    ${(p) => p.$today && css`
        &::after {
            content: "";
            position: absolute;
            top: 3px;
            left: 50%;
            width: 4px;
            height: 4px;
            margin-left: -2px;
            border-radius: 50%;
            background: ${p.$selected ? onTeal(p) : p.theme.colors.primary};
        }
    `}

    &:active { background: ${(p) => (p.$selected ? p.theme.colors.primary : ink(p.theme, dark(p) ? 0.1 : 0.06))}; transform: scale(0.97); }
    ${focusRing}
`;
