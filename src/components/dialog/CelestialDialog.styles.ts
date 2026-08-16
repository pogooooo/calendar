import styled, { css, keyframes } from "styled-components";
import type { DialogKind } from "./arcana";

const fade = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

const deal = keyframes`
    from { opacity: 0; transform: translateY(16px) rotate(-1.6deg) scale(0.975); }
    to   { opacity: 1; transform: none; }
`;

const draw = keyframes`
    from { stroke-dashoffset: 100; }
    to   { stroke-dashoffset: 0; }
`;

export const Veil = styled.div`
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
    animation: ${fade} 0.18s ease-out both;
`;

/* 카드가 배경에서 떠 보이도록 표면색에 금색을 아주 옅게 섞는다 */
export const Card = styled.div<{ $kind: DialogKind }>`
    position: relative;
    background-color: color-mix(in srgb, ${p => p.theme.colors.primary} 4%, ${p => p.theme.colors.surface});
    color: ${p => p.theme.colors.text};
    border: 1px solid ${p => p.theme.colors.primary};
    box-shadow: 0 22px 50px -20px rgba(0, 0, 0, 0.55);
    animation: ${deal} 0.42s cubic-bezier(0.2, 0.85, 0.3, 1) both;

    &::before {
        content: "";
        position: absolute;
        inset: 6px;
        border: 1px solid ${p => p.theme.colors.primary}33;
        pointer-events: none;
    }

    .stroke {
        stroke-dasharray: 100;
        animation: ${draw} 0.8s cubic-bezier(0.4, 0, 0.3, 1) 0.16s both;
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        .stroke { animation: none; }
    }
`;

export const Pip = styled.i`
    position: absolute;
    width: 6px;
    height: 6px;
    border: 1px solid ${p => p.theme.colors.primary};
    background-color: ${p => p.theme.colors.surface};
    transform: rotate(45deg);
    pointer-events: none;

    &:nth-of-type(1) { top: -3.5px; left: -3.5px; }
    &:nth-of-type(2) { top: -3.5px; right: -3.5px; }
    &:nth-of-type(3) { bottom: -3.5px; left: -3.5px; }
    &:nth-of-type(4) { bottom: -3.5px; right: -3.5px; }
`;

export const Numeral = styled.div`
    font-family: ${p => p.theme.fonts.celestial};
    font-size: 0.78rem;
    letter-spacing: 0.34em;
    color: ${p => p.theme.colors.primary};
    font-variant-numeric: tabular-nums;
`;

export const ArcanaName = styled.div`
    font-size: 0.6rem;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: ${p => p.theme.colors.textSecondary};
`;

export const Title = styled.h2`
    font-family: ${p => p.theme.fonts.celestial};
    font-weight: 400;
    letter-spacing: 0.05em;
    margin: 0;
    text-wrap: balance;
`;

export const Message = styled.p`
    margin: 0;
    color: ${p => p.theme.colors.textSecondary};
    font-size: 0.85rem;
    line-height: 1.62;
    white-space: pre-line;
`;

export const Actions = styled.div`
    display: flex;
    gap: 8px;
`;

export const ActionButton = styled.button<{ $tone: "plain" | "go" | "danger" }>`
    font-family: inherit;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    padding: 8px 16px;
    cursor: pointer;
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}2E;
    color: ${p => p.theme.colors.text};
    transition: border-color 0.15s, background-color 0.15s, color 0.15s;

    &:hover { border-color: ${p => p.theme.colors.primary}; }

    &:focus-visible {
        outline: 2px solid ${p => p.theme.colors.primary};
        outline-offset: 2px;
    }

    ${p => p.$tone === "go" && css`
        border-color: ${p.theme.colors.primary};
        color: ${p.theme.colors.primary};
        &:hover { background-color: ${p.theme.colors.primary}; color: ${p.theme.colors.surface}; }
    `}

    ${p => p.$tone === "danger" && css`
        border-color: ${p.theme.colors.error};
        color: ${p.theme.colors.error};
        &:hover { background-color: ${p.theme.colors.error}; color: #ffffff; }
    `}
`;

/* ── 정통 ─────────────────────────────────────────────────────────── */
export const FullCard = styled(Card)`
    width: 286px;
    max-width: 100%;
    padding: 22px 24px 20px;
    text-align: center;

    .head { display: flex; flex-direction: column; gap: 3px; margin-bottom: 14px; }
    svg { margin: 0 auto 15px; }
    ${Title} { font-size: 1.06rem; margin-bottom: 9px; }
    ${Message} { margin-bottom: 18px; }
    .rule { height: 1px; background-color: ${p => p.theme.colors.primary}33; margin: 0 -24px 16px; }
    ${Actions} { justify-content: center; }
`;

/* ── 간결 ─────────────────────────────────────────────────────────── */
export const PlainCard = styled(Card)`
    width: 300px;
    max-width: 100%;
    padding: 20px 22px 18px;

    .top { display: flex; align-items: center; gap: 11px; margin-bottom: 13px; }
    ${Numeral} { font-size: 0.68rem; letter-spacing: 0.28em; }
    ${Title} { font-size: 0.99rem; margin-bottom: 7px; }
    ${Message} { margin-bottom: 16px; }
    ${Actions} { justify-content: flex-end; }
`;

/* ── 띠 ───────────────────────────────────────────────────────────── */
export const BandCard = styled(Card)<{ $kind: DialogKind }>`
    width: 300px;
    max-width: 100%;
    padding: 0;
    overflow: hidden;

    .banner {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 22px;
        background-color: ${p =>
            p.$kind === "danger" ? p.theme.colors.error
                : p.$kind === "ok" ? p.theme.colors.success
                    : p.theme.colors.primary};
        color: ${p => (p.$kind === "info" || p.$kind === "confirm") ? p.theme.colors.surface : "#ffffff"};
    }
    .banner ${Numeral} { color: inherit; font-size: 0.72rem; }
    .banner ${ArcanaName} { color: inherit; opacity: 0.8; }

    .inner { padding: 20px 22px 18px; text-align: center; }
    .inner svg { margin: 0 auto 13px; }
    ${Title} { font-size: 1.02rem; margin-bottom: 8px; }
    ${Message} { margin-bottom: 17px; }
    ${Actions} { justify-content: center; }
`;

/* ── 가로 ─────────────────────────────────────────────────────────── */
export const LandCard = styled(Card)`
    width: 380px;
    max-width: 100%;
    padding: 18px 20px;
    display: flex;
    gap: 16px;

    .side {
        flex-shrink: 0;
        width: 62px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
        padding-right: 15px;
        border-right: 1px solid ${p => p.theme.colors.primary}33;
    }
    .side ${Numeral} { font-size: 0.64rem; letter-spacing: 0.22em; }
    .body { flex: 1; min-width: 0; }
    ${Title} { font-size: 0.98rem; margin-bottom: 6px; }
    ${Actions} { justify-content: flex-end; margin-top: 15px; }
`;
