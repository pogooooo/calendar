/**
 * 바다의 "고른 날" 목록(폰, 월간 아래) — 마름모 머리글·마름모 줄(Celestial), 잎(Maple) 대신
 * 고정폭 날짜 꼬리표 · 머리카락 선 · 개수 · "일간 ›" 한 줄, 그 아래 44px 줄마다 카테고리 색 점 하나.
 * 줄 사이는 머리카락 선. 끝낸 일은 옅어지고 줄이 그어진다.
 */
import styled, { keyframes } from "styled-components";
import * as C from "../celestial/CelestialDayPeek.styles";
import { EASE, calm, focusRing, hairline, ink, label } from "@/styles/ocean/water";

export * from "../celestial/CelestialDayPeek.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/** 줄이 나타날 때 — 살짝 올라오며 (한 번만) */
const rowIn = keyframes`
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const Wrap = styled(C.Wrap)`
    margin-top: 14px;
    padding: 0 4px;
`;

/** 머리 — [점] 10. 7 · WED ─── 4  일간 › (통째로 눌러 일간으로) */
export const Head = styled(C.Head)`
    gap: 10px;
    min-height: 40px;
    ${label}
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    color: ${(p) => p.theme.colors.text};

    .hd {
        width: 6px;
        height: 6px;
        transform: none;
        border: none;
        border-radius: 50%;
        background: ${(p) => (p.$today ? p.theme.colors.primary : ink(p.theme, 0.3))};
    }

    .title { font-weight: 600; }

    .hr { height: 1px; background: ${(p) => hairline(p.theme)}; }

    b {
        font-family: inherit;
        font-size: 0.68rem;
        font-weight: 500;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    .open {
        gap: 2px;
        padding: 4px 6px 4px 8px;
        border-radius: 8px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0;
        text-transform: none;
        color: ${(p) => p.theme.colors.textSecondary};
        transition: background-color 0.15s ease, color 0.15s ease;
    }

    &:active .open { color: ${(p) => p.theme.colors.text}; background: ${(p) => ink(p.theme, dark(p) ? 0.1 : 0.06)}; }
    ${focusRing}
`;

export const List = styled(C.List)`
    scrollbar-width: none;
`;

/** 한 줄 — 44px, 카테고리 색 점 · 제목 · 시각, 아래로 머리카락 선 */
export const Row = styled(C.Row)`
    gap: 12px;
    min-height: 44px;
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.845rem;
    letter-spacing: -0.005em;
    transition: background-color 0.15s ease;

    @media (prefers-reduced-motion: no-preference) {
        animation: ${rowIn} 0.3s ${EASE} both;
        ${calm}
    }

    /* 점 — 인라인 테두리 색(카테고리)을 3px 굵기로 받아 6px 동그라미가 된다. 끝낸 일도 같은 점 */
    .mark {
        width: 0;
        height: 0;
        transform: none;
        border: 3px solid ${(p) => ink(p.theme, 0.3)};
        border-radius: 50%;
    }

    .name {
        opacity: ${(p) => (p.$done ? 0.55 : 1)};
        text-decoration-color: ${(p) => ink(p.theme, 0.4)};
    }

    em {
        font-size: 0.72rem;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    &:active { background: ${(p) => ink(p.theme, dark(p) ? 0.08 : 0.04)}; }
    ${focusRing}
`;

export const Empty = styled(C.Empty)`
    padding: 14px 0;
    font-size: 0.8rem;
    color: ${(p) => p.theme.colors.textSecondary};
`;
