/**
 * CelestialAuthPanel 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

/* ── keyframes ───────────────────────────────────────────────────────────── */
export const rotCW  = keyframes`from{transform:rotate(0deg)}  to{transform:rotate(360deg)}`;
export const rotCCW = keyframes`from{transform:rotate(0deg)}  to{transform:rotate(-360deg)}`;
export const breath = keyframes`0%,100%{opacity:.40} 50%{opacity:.72}`;

/* ── Animated Groups ─────────────────────────────────────────────────────── */
export const RotCW = styled.g<{ $dur: string }>`
    transform-origin: 260px 350px;
    animation: ${rotCW} ${p => p.$dur} linear infinite;
`;
export const RotCCW = styled.g<{ $dur: string }>`
    transform-origin: 260px 350px;
    animation: ${rotCCW} ${p => p.$dur} linear infinite;
`;
export const BreathCircle = styled.circle<{ $delay?: string }>`
    animation: ${breath} 5s ease-in-out infinite;
    animation-delay: ${p => p.$delay ?? "0s"};
`;

/* ── Panel ───────────────────────────────────────────────────────────────── */
export const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
`;
export const BrandPanel = styled.div`
    /* 별자리 그림 전체가 이 색을 쓴다. 테마가 바뀌면 그림도 따라 바뀐다.
       예전에는 SVG 안에 #D4AF37 이 스물두 번 박혀 있어 새 테마에서도 금색으로 남았다. */
    --auth-ink: ${p => p.theme.colors.primary};

    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${p => p.theme.colors.surface};
    border-right: 1px solid ${p => p.theme.colors.primary};
    overflow: hidden;

    /* 폰에서는 이 그림에 내줄 폭이 없다. 두면 460px 짜리 폼이 화면 밖으로
       밀려 언어 선택이 잘리고 입력칸이 오른쪽으로 치우친다. */
    ${MOBILE} { display: none; }
`;
export const BrandContent = styled.div`
    position: relative;
    z-index: 1;
    text-align: center;
    animation: ${fadeUp} 0.9s ease both;
`;
export const ServiceName = styled.h1`
    font-family: ${p => p.theme.fonts.display};
    font-size: 3rem;
    font-weight: 400;
    color: ${p => p.theme.colors.primary};
    letter-spacing: 0.32em;
    margin: 0;
    line-height: 1;
`;
