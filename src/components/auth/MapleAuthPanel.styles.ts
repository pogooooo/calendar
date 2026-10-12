/**
 * MapleAuthPanel 의 모양 — 도감 한 장(E1·E2) 위로 잎이 떨어진다.
 */
import styled, { keyframes, css } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";

export const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
`;

/* 잎은 위에서 아래로, 좌우로 조금 흔들리며 돈다. 자리(--x)·크기·시간은 잎마다 */
export const drift = keyframes`
    0%   { transform: translate3d(0, -8%, 0) rotate(0deg); opacity: 0; }
    8%   { opacity: 1; }
    50%  { transform: translate3d(var(--sway), 48vh, 0) rotate(160deg); }
    92%  { opacity: 1; }
    100% { transform: translate3d(calc(var(--sway) * -0.6), 104vh, 0) rotate(330deg); opacity: 0; }
`;

export const BrandPanel = styled.div<{ $busy?: boolean }>`
    position: relative;
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    background-color: ${p => p.theme.colors.surface};
    border-right: 1px solid ${p => withAlpha(p.theme.colors.text, 0.3)};
    overflow: hidden;

    ${MOBILE} { display: none; }

    .plate {
        position: absolute;
        inset: -3%;
        width: 106%;
        height: 106%;
        object-fit: cover;
        object-position: 70% 0%;
        pointer-events: none;
        transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /* 종이 가장자리의 그늘 */
    &::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at 40% 45%, transparent 55%, ${p => withAlpha(p.theme.mode === "dark" ? "#000000" : "#3B2A20", p.theme.mode === "dark" ? 0.35 : 0.12)} 100%);
    }

    .leaf {
        position: absolute;
        top: 0;
        left: var(--x);
        width: var(--size);
        height: var(--size);
        object-fit: contain;
        pointer-events: none;
        opacity: 0;
        animation: ${drift} var(--dur) linear infinite;
        animation-delay: var(--delay);
        will-change: transform, opacity;
    }

    ${p => p.$busy && css`
        .leaf { animation-duration: calc(var(--dur) / 4); }
    `}

    :where(html[data-theme-motion="off"]) & {
        .leaf { display: none; }
    }
`;

export const BrandContent = styled.div`
    position: relative;
    z-index: 1;
    margin: 0 0 13% 11%;
    animation: ${fadeUp} 0.9s ease both;
`;

export const ServiceName = styled.h1`
    font-family: ${p => p.theme.fonts.display};
    font-size: 3rem;
    font-weight: 400;
    color: ${p => p.theme.colors.text};
    letter-spacing: 0.22em;
    margin: 0;
    line-height: 1;
`;

export const Tagline = styled.p`
    margin: 14px 0 0 2px;
    font-family: ${p => p.theme.fonts.numeral};
    font-size: 0.95rem;
    letter-spacing: 0.16em;
    color: ${p => p.theme.colors.textSecondary};
    text-transform: uppercase;
`;

/** 이름 밑의 짧은 먹선 */
export const Rule = styled.span`
    display: block;
    width: 200px;
    height: 46px;
    margin: 4px 0 0 -6px;
    background: ${p => p.theme.colors.text};
    opacity: 0.75;
    mask: url("/themes/maple/divider-short.webp") left center / contain no-repeat;
    -webkit-mask: url("/themes/maple/divider-short.webp") left center / contain no-repeat;
`;
