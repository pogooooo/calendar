/**
 * 폰 탭바(MobileTabBar)의 Celestial 모양 — 금빛 마름모가 고른 탭 위에 뜬다.
 */
import styled, { keyframes } from "styled-components";
import { MOBILE_BREAKPOINT, TAB_BAR_HEIGHT, SAFE_B } from "@/styles/breakpoints";

export const Bar = styled.nav`
    display: none;

    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 60;
        height: calc(${TAB_BAR_HEIGHT}px + ${SAFE_B});
        padding-bottom: ${SAFE_B};
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        background: ${p => p.theme.colors.background};
        border-top: 1px solid ${p => p.theme.colors.primary}40;
    }

    /* 자판이 떠 있는 동안은 내린다 (안드로이드 앱이 html[data-keyboard] 를 단다) */
    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        html[data-keyboard] & { display: none; }
    }
`;

export const Tab = styled.button<{ $on: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-width: 0;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
    color: ${p => (p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary)};

    /* 손가락에는 hover 가 없다. 눌린 걸 알려 주는 건 :active 뿐이다. */
    &:active { background-color: ${p => p.theme.colors.primary}14; }

    span {
        font-size: 0.6rem;
        letter-spacing: 0.04em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        width: 6px;
        height: 6px;
        margin-left: -3px;
        transform: rotate(45deg) scale(${p => (p.$on ? 1 : 0)});
        background: ${p => p.theme.colors.primary};
        transition: transform 0.18s ease;
    }
`;

export const scrimIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

export const sheetUp = keyframes`
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
`;

export const Sheet = styled.div`
    position: fixed;
    inset: 0;
    z-index: 61;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;

    @media (prefers-reduced-motion: no-preference) {
        animation: ${scrimIn} 0.18s ease-out both;
    }
`;

export const SheetBody = styled.div`
    width: 100%;
    background: ${p => p.theme.colors.background};
    border-top: 1px solid ${p => p.theme.colors.primary};
    padding: 0 0 calc(${TAB_BAR_HEIGHT}px + ${SAFE_B});

    /* 아래에서 올라와야 탭바에서 자란 것으로 읽힌다 */
    @media (prefers-reduced-motion: no-preference) {
        animation: ${sheetUp} 0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
`;

export const SheetHead = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px 12px;
    border-bottom: 1px solid ${p => p.theme.colors.text}1A;
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    color: ${p => p.theme.colors.primary};

    i {
        width: 7px;
        height: 7px;
        transform: rotate(45deg);
        border: 1px solid ${p => p.theme.colors.primary};
    }
`;

export const CloseBtn = styled.button`
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: ${p => p.theme.colors.textSecondary};
    display: flex;
    padding: 4px;
`;

export const SheetRow = styled.button<{ $on: boolean }>`
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    min-height: 52px;
    padding: 0 18px;
    background: none;
    border: none;
    border-bottom: 1px solid ${p => p.theme.colors.text}12;
    cursor: pointer;
    font-size: 0.9rem;
    text-align: left;
    color: ${p => (p.$on ? p.theme.colors.primary : p.theme.colors.text)};

    &:active { background-color: ${p => p.theme.colors.primary}14; }
`;
