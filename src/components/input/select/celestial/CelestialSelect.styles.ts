import styled, { css, keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

const drop = keyframes`
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: none; }
`;

export const Wrapper = styled.div`
    position: relative;
    display: inline-block;
    min-width: 0;
    width: 100%;
`;

export const Trigger = styled.button<{ $size: "sm" | "md" }>`
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    background: none;
    color: ${p => p.theme.colors.text};
    font-family: inherit;
    font-size: ${p => (p.$size === "sm" ? "0.78rem" : "0.86rem")};
    padding: ${p => (p.$size === "sm" ? "6px 10px" : "8px 12px")};

    ${MOBILE} { min-height: 46px; }
    cursor: pointer;
    text-align: left;
    border: 1px solid ${p => p.theme.colors.primary}57;
    transition: border-color 0.15s;

    &:hover:not(:disabled) { border-color: ${p => p.theme.colors.primary}; }
    &:focus-visible {
        outline: 2px solid ${p => p.theme.colors.primary};
        outline-offset: 2px;
    }
    &:disabled { opacity: 0.5; cursor: default; }
`;

export const Value = styled.span<{ $placeholder?: boolean }>`
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    ${p => p.$placeholder && css`color: ${p.theme.colors.textSecondary};`}
`;

export const Chev = styled.span<{ $open: boolean }>`
    flex-shrink: 0;
    color: ${p => p.theme.colors.primary};
    font-size: 0.66rem;
    transition: transform 0.18s;
    ${p => p.$open && css`transform: rotate(180deg);`}
`;

/** 다른 화면과 같은 배경색을 쓴다 — 별도 종이색을 두지 않는다 */
export const Menu = styled.div`
    position: fixed;
    z-index: 1300;
    max-height: 232px;
    overflow-y: auto;
    background-color: ${p => p.theme.colors.surface};
    border: 1px solid ${p => p.theme.colors.primary}57;
    box-shadow: 0 10px 26px -12px rgba(0, 0, 0, 0.34);
    padding: 4px 0;
    animation: ${drop} 0.16s ease-out both;
    scrollbar-width: thin;

    @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const Item = styled.button<{ $on: boolean }>`
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    background: none;
    border: 0;
    cursor: pointer;
    color: ${p => (p.$on ? p.theme.colors.primary : p.theme.colors.text)};
    font-family: inherit;
    font-size: 0.84rem;
    padding: 8px 12px;

    ${MOBILE} { min-height: 48px; }
    text-align: left;

    &:hover { background-color: ${p => p.theme.colors.primary}1F; }
    &:focus-visible {
        outline: 2px solid ${p => p.theme.colors.primary};
        outline-offset: -2px;
    }
`;

export const Diamond = styled.span<{ $on: boolean }>`
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    transform: rotate(45deg);
    border: 1px solid ${p => (p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary)};
    background-color: ${p => (p.$on ? p.theme.colors.primary : "transparent")};
`;

export const Dot = styled.span<{ $color: string }>`
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background-color: ${p => p.$color};
`;

export const Tick = styled.span`
    margin-left: auto;
    flex-shrink: 0;
    color: ${p => p.theme.colors.primary};
    font-size: 0.74rem;
`;
