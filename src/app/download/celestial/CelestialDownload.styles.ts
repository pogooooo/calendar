/**
 * 내려받기·소개 화면의 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled, { css, keyframes } from "styled-components";
import { Loader2 } from "lucide-react";

/* ── 모양 ─────────────────────────────────────────────────────────── */

const twinkle = keyframes`
    0%, 100% { opacity: 0.12; transform: scale(0.8); }
    50%      { opacity: 0.85; transform: scale(1.1); }
`;

const starPulse = keyframes`
    0%, 100% { opacity: 0.55; text-shadow: none; }
    50%      { opacity: 1; text-shadow: 0 0 6px currentColor; }
`;

const riseIn = keyframes`
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: none; }
`;

const letterIn = keyframes`
    from { opacity: 0; letter-spacing: 26px; filter: blur(6px); }
    to   { opacity: 1; letter-spacing: 12px; filter: none; }
`;

const spin = keyframes`
    to { transform: rotate(360deg); }
`;

const sheen = keyframes`
    from { transform: translateX(-130%); }
    to   { transform: translateX(230%); }
`;

const motionOnly = (rule: ReturnType<typeof css>) => css`
    @media (prefers-reduced-motion: no-preference) {
        ${rule}
    }
`;

export const Page = styled.div`
    position: relative;
    /* 데스크톱 타이틀바 높이는 body 에서 이미 빠진다 */
    min-height: calc(100vh - var(--titlebar-h, 0px));
    background-color: ${p => p.theme.colors.background};
    color: ${p => p.theme.colors.text};
    overflow-x: hidden;
`;

export const ProgressBar = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    z-index: 50;
    background: ${p => p.theme.colors.primary};
    box-shadow: 0 0 8px ${p => p.theme.colors.primary}88;
    transform: scaleX(0);
    transform-origin: left;
`;

export const Sky = styled.div`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
`;

export const Star = styled.span<{ $layer: number }>`
    position: absolute;
    color: ${p => p.theme.colors.primary};
    font-size: 9px;
    line-height: 1;
    opacity: 0.3;
    transform: translate3d(
        calc(var(--mx, 0) * ${p => 6 + p.$layer * 7}px),
        calc(var(--my, 0) * ${p => 4 + p.$layer * 5}px),
        0
    );

    i {
        display: block;
        background: ${p => p.theme.colors.primary};
        border-radius: 50%;
    }

    ${motionOnly(css`
        i, &:not(:empty) { animation: ${twinkle} 5s ease-in-out infinite; animation-delay: inherit; }
    `)}
`;

export const Nav = styled.nav`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1080px;
    margin: 0 auto;
    padding: 20px 28px 0;
`;

export const NavBrand = styled.span`
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.9rem;
    letter-spacing: 5px;
`;

export const NavRight = styled.div`
    display: flex;
    align-items: center;
    gap: 18px;
`;

export const NavLink = styled.a`
    font-size: 0.78rem;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.textSecondary};
    text-decoration: none;
    transition: color 0.2s;

    &:hover { color: ${p => p.theme.colors.primary}; }
`;

export const NavCta = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    font-size: 0.76rem;
    font-family: inherit;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
    background: none;
    border: 1px solid ${p => p.theme.colors.primary}55;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
        border-color: ${p => p.theme.colors.primary};
        box-shadow: 0 0 8px ${p => p.theme.colors.primary}40;
    }
`;

export const Hero = styled.header`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 48px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 76px 28px 96px;

    @media (max-width: 900px) {
        padding: 56px 24px 72px;
    }
`;

export const HeroText = styled.div`
    flex: 1;
    min-width: 0;

    ${motionOnly(css`
        & > * { animation: ${riseIn} 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        & > *:nth-child(2) { animation-delay: 0.1s; }
        & > *:nth-child(3) { animation-delay: 0.2s; }
        & > *:nth-child(4) { animation-delay: 0.3s; }
        & > *:nth-child(5) { animation-delay: 0.4s; }
    `)}
`;

export const Brand = styled.h1`
    margin: 0;
    font-family: ${p => p.theme.fonts.display};
    font-size: 3.2rem;
    font-weight: 400;
    letter-spacing: 12px;

    ${motionOnly(css`
        animation: ${letterIn} 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
    `)}

    @media (max-width: 720px) {
        font-size: 2.2rem;
        letter-spacing: 7px;
    }
`;

export const Tagline = styled.p`
    margin: 12px 0 0;
    font-family: ${p => p.theme.fonts.display};
    font-size: 1rem;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.primary};
`;

export const Lead = styled.p`
    margin: 22px 0 0;
    max-width: 480px;
    font-size: 0.94rem;
    line-height: 1.75;
    color: ${p => p.theme.colors.textSecondary};
`;

export const DownloadNotice = styled.p`
    margin: 14px 0 0;
    padding: 10px 14px;
    border-left: 2px solid ${p => p.theme.colors.error};
    font-size: 0.82rem;
    color: ${p => p.theme.colors.error};
`;

export const CtaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 12px;
    margin-top: 34px;
`;

const ctaBase = css`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 13px 22px;
    font-size: 0.87rem;
    font-family: inherit;
    letter-spacing: 1px;
    color: ${p => p.theme.colors.text};
    background: none;
    cursor: pointer;
    overflow: hidden;
    transform: translate(var(--magx, 0px), var(--magy, 0px));
    transition: box-shadow 0.25s, border-color 0.25s, transform 0.25s ease-out;

    .arrow { transition: transform 0.25s; }
    &:hover:not(:disabled) .arrow { transform: translateX(4px); }
    &:disabled { cursor: default; opacity: 0.6; }
`;

export const PrimaryCta = styled.button`
    ${ctaBase}
    border: 1px solid ${p => p.theme.colors.primary};

    &::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        width: 42%;
        background: linear-gradient(100deg, transparent, ${p => p.theme.colors.primary}44, transparent);
        transform: translateX(-130%);
    }

    &:hover:not(:disabled) { box-shadow: 0 0 18px ${p => p.theme.colors.primary}55; }

    ${motionOnly(css`
        &:hover:not(:disabled)::after { animation: ${sheen} 0.9s ease-out; }
    `)}
`;

export const CtaMeta = styled.span`
    padding-left: 10px;
    border-left: 1px solid ${p => p.theme.colors.primary}55;
    font-size: 0.74rem;
    white-space: nowrap;
    color: ${p => p.theme.colors.textSecondary};
`;

export const GhostCta = styled.button`
    ${ctaBase}
    border: 1px solid ${p => p.theme.colors.primary}44;
    color: ${p => p.theme.colors.textSecondary};

    &:hover:not(:disabled) {
        border-color: ${p => p.theme.colors.primary};
        color: ${p => p.theme.colors.text};
    }
`;

export const HeroArt = styled.div`
    position: relative;
    flex: 0 0 auto;
    width: 340px;
    height: 340px;

    ${motionOnly(css`
        animation: ${riseIn} 1s cubic-bezier(0.22, 1, 0.36, 1) both;
    `)}

    @media (max-width: 1000px) { width: 250px; height: 250px; }
    @media (max-width: 860px) { display: none; }
`;

export const RevealBox = styled.div<{ $shown: boolean; $delay: number }>`
    height: 100%;

    @media (prefers-reduced-motion: no-preference) {
        opacity: ${p => (p.$shown ? 1 : 0)};
        transform: ${p => (p.$shown ? "none" : "translateY(18px)")};
        transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: ${p => p.$delay}ms;
    }
`;

export const Section = styled.section`
    position: relative;
    z-index: 1;
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 28px 88px;
    scroll-margin-top: 24px;
`;

export const SectionTitle = styled.h2`
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 0 0 26px;
    font-family: ${p => p.theme.fonts.display};
    font-size: 1.05rem;
    font-weight: 400;
    letter-spacing: 5px;

    &::after {
        content: "";
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, ${p => p.theme.colors.primary}88, transparent);
    }
`;

export const Char = styled.span<{ $shown: boolean }>`
    display: inline-block;

    @media (prefers-reduced-motion: no-preference) {
        opacity: ${p => (p.$shown ? 1 : 0)};
        transform: ${p => (p.$shown ? "none" : "translateY(10px)")};
        filter: ${p => (p.$shown ? "none" : "blur(4px)")};
        transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s;
    }
`;

export const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 14px;
`;

export const Feature = styled.article`
    position: relative;
    height: 100%;
    padding: 20px;
    border: 1px solid ${p => p.theme.colors.primary}33;
    outline: none;
    transform: perspective(700px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--lift, 0px));
    transition: border-color 0.3s, transform 0.18s ease-out, box-shadow 0.3s;

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 14px;
        height: 14px;
        background: linear-gradient(315deg, transparent 48%, ${p => p.theme.colors.primary} 50%, transparent 52%);
        transition: width 0.3s, height 0.3s;
    }

    &:hover, &:focus-visible {
        --lift: -4px;
        border-color: ${p => p.theme.colors.primary}99;
        box-shadow: 0 10px 28px ${p => p.theme.colors.primary}1f;
    }

    &:hover::after, &:focus-visible::after { width: 24px; height: 24px; }
`;

export const FeatureVisual = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 92px;
    margin-bottom: 16px;
    border-bottom: 1px dashed ${p => p.theme.colors.primary}33;
`;

export const MiniCalendar = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: repeat(7, 14px);
    gap: 3px;

    .cell {
        height: 10px;
        border: 1px solid ${p => p.theme.colors.primary}40;
    }

    .cell.dot::after {
        content: "";
        display: block;
        width: 3px;
        height: 3px;
        margin: 2px auto 0;
        background: ${p => p.theme.colors.primary};
        border-radius: 50%;
    }

    .bar {
        position: absolute;
        left: 17px;
        top: 28px;
        width: 84px;
        height: 2px;
        background: ${p => p.theme.colors.primary};
        transform-origin: left;
        transform: scaleX(0.35);
        transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        box-shadow: 0 0 6px ${p => p.theme.colors.primary}66;
    }

    ${Feature}:hover &, ${Feature}:focus-visible & {
        .bar { transform: scaleX(1); }
    }
`;

export const MiniBoard = styled.div`
    display: flex;
    gap: 6px;

    .col {
        display: flex;
        flex-direction: column;
        gap: 5px;
        width: 34px;
        padding: 5px 4px;
        border: 1px solid ${p => p.theme.colors.primary}40;
        min-height: 62px;
    }

    .col i {
        display: block;
        height: 3px;
        background: ${p => p.theme.colors.primary}99;
        transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s;
    }

    ${Feature}:hover .col .mover, ${Feature}:focus-visible .col .mover {
        transform: translateX(40px);
        box-shadow: 0 0 6px ${p => p.theme.colors.primary}88;
    }
`;

export const MiniChallenge = styled.div`
    display: flex;
    gap: 7px;

    .day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border: 1px solid ${p => p.theme.colors.primary}66;
        font-size: 10px;
        color: ${p => p.theme.colors.primary};
        opacity: 0.3;
        transition: opacity 0.35s, text-shadow 0.35s, border-color 0.35s;
    }

    .day.on {
        opacity: 1;
        border-color: ${p => p.theme.colors.primary};
        text-shadow: 0 0 5px ${p => p.theme.colors.primary}99;
    }

    ${motionOnly(css`
        .day.on { animation: ${starPulse} 3.2s ease-in-out infinite; }
    `)}

    ${Feature}:hover .day, ${Feature}:focus-visible .day {
        opacity: 1;
        border-color: ${p => p.theme.colors.primary};
        text-shadow: 0 0 5px ${p => p.theme.colors.primary}99;
    }
`;

export const MiniWidgets = styled.div`
    position: relative;
    width: 74px;
    height: 58px;

    .pane {
        position: absolute;
        inset: 0;
        border: 1px solid ${p => p.theme.colors.primary}55;
        transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        background: ${p => p.theme.colors.background};
    }

    .p2 { transform: translate(6px, 6px); }
    .p3 { transform: translate(12px, 12px); }

    ${Feature}:hover &, ${Feature}:focus-visible & {
        .p1 { transform: translate(-8px, -4px) rotate(-3deg); }
        .p2 { transform: translate(10px, 2px) rotate(2deg); }
        .p3 { transform: translate(2px, 14px); }
    }
`;

export const FeatureTitle = styled.h3`
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.5px;
`;

export const FeatureDesc = styled.p`
    margin: 8px 0 0;
    font-size: 0.8rem;
    line-height: 1.65;
    color: ${p => p.theme.colors.textSecondary};
`;

export const PlatformList = styled.div`
    display: flex;
    flex-direction: column;
    border-top: 1px solid ${p => p.theme.colors.primary}44;
`;

export const PlatformRow = styled.button<{ $mine: boolean }>`
    display: grid;
    grid-template-columns: auto 1fr auto 40px;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 16px 6px;
    font-family: inherit;
    text-align: left;
    color: inherit;
    background: none;
    border: none;
    border-bottom: 1px solid ${p => p.theme.colors.primary}33;
    cursor: pointer;
    transition: box-shadow 0.25s;

    .arrow { transition: transform 0.25s; }

    &:hover:not(:disabled) {
        box-shadow: inset 0 -1px 0 ${p => p.theme.colors.primary}, 0 6px 16px -8px ${p => p.theme.colors.primary}44;

        .arrow { transform: translateY(3px); }
    }

    &:disabled { cursor: default; opacity: 0.55; }

    @media (max-width: 620px) {
        grid-template-columns: auto 1fr 32px;

        & > :nth-child(2) { display: none; }
    }
`;

export const RowName = styled.span`
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 150px;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.98rem;
    letter-spacing: 2px;
    white-space: nowrap;

    @media (max-width: 620px) {
        min-width: 0;
    }
`;

export const RowMine = styled.span`
    padding: 2px 7px;
    border: 1px solid ${p => p.theme.colors.primary}66;
    font-size: 0.6rem;
    letter-spacing: 1px;
    white-space: nowrap;
    color: ${p => p.theme.colors.primary};
`;

export const RowNote = styled.span`
    font-size: 0.76rem;
    color: ${p => p.theme.colors.textSecondary};
`;

export const RowMeta = styled.span`
    font-size: 0.76rem;
    letter-spacing: 0.5px;
    white-space: nowrap;
    text-align: right;
    color: ${p => p.theme.colors.primary};
`;

export const RowAction = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid ${p => p.theme.colors.primary}55;
    color: ${p => p.theme.colors.primary};

    &[data-busy="0"] .on-busy,
    &[data-busy="1"] .on-idle { display: none; }
`;

export const IconSwap = styled.span`
    display: contents;

    &[data-busy="0"] .on-busy,
    &[data-busy="1"] .on-idle { display: none; }
`;

export const Spinner = styled(Loader2)`
    ${motionOnly(css`
        animation: ${spin} 0.9s linear infinite;
    `)}
`;

export const Foot = styled.footer`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 20px 28px 36px;
    border-top: 1px solid ${p => p.theme.colors.primary}33;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.74rem;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.textSecondary};
`;

export const FootLinks = styled.div`
    display: flex;
    gap: 18px;

    a {
        color: ${p => p.theme.colors.textSecondary};
        text-decoration: none;
        letter-spacing: 1px;
        transition: color 0.2s;

        &:hover { color: ${p => p.theme.colors.primary}; }
    }
`;
