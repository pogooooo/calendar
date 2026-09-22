/**
 * 로그인 화면의 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled, { keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

/* ── 모양 ─────────────────────────────────────────────────────────── */

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const PageWrapper = styled.div`
    display: flex;
    width: 100vw;
    /* 데스크톱 타이틀바 높이만큼 줄인다 (웹에서는 0) */
    height: calc(100vh - var(--titlebar-h, 0px));
    background-color: ${p => p.theme.colors.surface};
    overflow: hidden;

    /* 폰에서는 화면 위쪽이 상태 표시줄 자리다. 비켜 주지 않으면 언어 고르개가 시계에 깔린다. */
    ${MOBILE} {
        height: 100dvh;
        padding-top: env(safe-area-inset-top, 0px);
    }
`;

export const FormPanel = styled.div`
    width: 460px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${p => p.theme.colors.surface};
    position: relative;

    /* 폰에서는 배경 그림 패널이 숨으므로 폼이 화면 전체를 쓴다. */
    ${MOBILE} {
        width: 100%;
        padding: 0 20px;
    }
`;

export const LangToggle = styled.div`
    position: absolute;
    top: 24px;
    right: 24px;
`;

export const FormInner = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 300px;
    animation: ${fadeUp} 0.6s ease 0.15s both;

    /* 폰에서는 폭을 고정하지 않는다. 300px 로 못 박으면 좁은 화면에서 치우친다. */
    ${MOBILE} {
        width: 100%;
        max-width: 340px;

        /* 제출 단추만 넓힌다. form button 으로 잡으면 입력칸 안의 눈 아이콘까지 늘어난다. */
        form > button, & > button { width: 100%; }
    }
`;

export const FormTitle = styled.h2`
    font-family: ${p => p.theme.fonts.display};
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 3px;
    color: ${p => p.theme.colors.text};
    margin: 0 0 2px;
    align-self: flex-start;
`;

export const FormSubtitle = styled.p`
    font-size: 0.78rem;
    color: ${p => p.theme.colors.textSecondary};
    margin: 0 0 8px;
    align-self: flex-start;
`;

export const Separator = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    color: ${p => p.theme.colors.textSecondary};
    font-size: 0.75rem;
    letter-spacing: 1px;

    &::before, &::after {
        content: "";
        flex: 1;
        border-bottom: 1px solid ${p => p.theme.colors.primary};
        opacity: 0.3;
    }
    &::before { margin-right: 10px; }
    &::after  { margin-left:  10px; }
`;

/* 마름모 체크 — 앱 곳곳의 ◇/◆ 와 같은 말 */
export const RememberRow = styled.div`
    width: 100%;
    margin: 2px 0 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        color: ${p => p.theme.colors.text};
        cursor: pointer;
        user-select: none;
    }

    input { position: absolute; opacity: 0; width: 0; height: 0; }

    /* 표식: Celestial 은 마름모, Maple 은 잎(윤곽 → 채운 잎) */
    .box {
        width: 10px; height: 10px;
        border: 1px solid ${p => p.theme.colors.primary};
        transform: rotate(45deg);
        transition: background 0.15s;
    }
    input:checked + .box { background: ${p => p.theme.colors.primary}; }
    input:focus-visible + .box { box-shadow: 0 0 0 3px ${p => p.theme.colors.primary}44; }

    small {
        font-size: 0.7rem;
        color: ${p => p.theme.colors.textSecondary};
        padding-left: 18px;
    }
`;

export const SwitchLink = styled.p`
    font-size: 0.82rem;
    text-align: center;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 4px;
`;

