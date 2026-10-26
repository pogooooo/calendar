/** 바탕의 물빛을 이어 쓰는 주간 띠. 오늘은 숫자 밑선, 고른 날은 칸 아래의 얇은 강조선. */
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialWeekStrip.styles";
import { EASE, calm, focusRing, hairline, ink, surfaceIn } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialWeekStrip.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 주가 바뀔 때 머리 글씨가 살짝 올라오며 나타난다 (한 번만) */
const titleIn = keyframes`
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const Strip = styled(C.Strip)`
    background: transparent;
    border: none;
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    border-radius: 0;
    box-shadow: none;
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
        background: transparent;
    }
`;

export const Days = styled(C.Days)`
    gap: 4px;
`;

/** 칸 크기는 모든 상태에서 같다. 오늘과 선택한 날이 다르면 두 표시가 함께 남는다. */
export const Day = styled(C.Day)`
    && { position:relative; min-height:82px; gap:5px; padding:8px 0 7px; border:0; border-radius:0; background:${p => p.$selected ? withAlpha(p.theme.colors.primary, .06) : 'transparent'}; box-shadow:${p => p.$selected ? `inset 0 -2px 0 ${p.theme.colors.primary}` : 'none'}; color:${p => p.$weekend ? p.theme.colors.weekend : p.theme.colors.text}; }
    && .name { font-family:${p => p.theme.fonts.body}; font-size:.67rem; letter-spacing:0; opacity:1; color:${p => p.$selected || p.$today ? p.theme.colors.primary : p.theme.colors.textSecondary}; }
    && .num { position:relative; width:36px; height:32px; line-height:24px; border:0; border-radius:0; font-family:${p => p.theme.fonts.numeral}; font-size:1.1rem; font-weight:${p => p.$selected || p.$today ? 750 : 550}; color:${p => p.$selected || p.$today ? p.theme.colors.primary : 'inherit'}; }
    ${p => p.$today && css`&& .num { color:${p.theme.colors.primary}; font-weight:800; text-decoration:underline; text-decoration-thickness:1.5px; text-underline-offset:6px; text-decoration-skip-ink:none; }`}
    &&::before { display:none; }
    &&::after { display:none; }
    && .dots { gap:3px; min-height:6px; margin-top:2px; }
    && .dots i { width:5px; height:5px; border-radius:50%; transform:none; }
    && .dots em { font-size:.65rem; color:${p => p.theme.colors.textSecondary}; }
    &&:active { background:transparent; }
    ${focusRing}
`;
