/**
 * 비밀번호 찾기 화면의 모양.
 *
 * 집 규칙: 화면은 갈래 공용 JSX 하나, 모양은 갈래마다 *.styles.ts (scripts/check-theme-styles.mjs).
 */
import styled, { keyframes } from "styled-components";
import { MOBILE, SAFE_T } from "@/styles/breakpoints";

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
        padding-top: ${SAFE_T};
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
    letter-spacing: 0.08em;
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

export const SentNotice = styled.p`
    width: 100%;
    font-size: 0.82rem;
    line-height: 1.6;
    color: ${p => p.theme.colors.textSecondary};
    margin: 0;
`;

export const SwitchLink = styled.p`
    font-size: 0.82rem;
    text-align: center;
    color: ${p => p.theme.colors.textSecondary};
    margin-top: 4px;
`;

