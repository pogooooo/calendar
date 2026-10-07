/**
 * CelestialAuthPanel 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 *
 * 고리 그림(SVG)은 520×700 판을 패널에 꽉 차게(slice) 늘린다 — 판 1 단위 = max(100cqw/520, 100cqh/700).
 * 혼천의와 CRONOS 는 그 단위로 자리를 잡아 고리와 함께 커지고 작아진다.
 */
import styled, { css, keyframes } from "styled-components";
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

/** 판 단위 n 칸 (CSS 길이) — 고리 그림과 같은 비율로 */
const plate = (n: number) => `max(${((n * 100) / 520).toFixed(3)}cqw, ${((n * 100) / 700).toFixed(3)}cqh)`;

/* ── Panel ───────────────────────────────────────────────────────────────── */
export const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
`;
const settle = keyframes`
    from { opacity: 0; transform: translate(-50%, calc(-50% + 10px)) scale(0.96); }
    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
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
    container-type: size;

    /* 폰에서는 이 그림에 내줄 폭이 없다. 두면 460px 짜리 폼이 화면 밖으로
       밀려 언어 선택이 잘리고 입력칸이 오른쪽으로 치우친다. */
    ${MOBILE} { display: none; }
`;

/** 혼천의 칸 — 지평환이 r2 고리 안쪽에 숨 쉴 틈을 두고 앉게 (판 226 칸 너비) */
export const Hero = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    width: ${plate(226)};
    height: ${plate(226)};
    margin: calc(${plate(226)} / -2) 0 0 calc(${plate(226)} / -2);
`;

/** 혼천의가 있으면 CRONOS 는 r2·r3 고리 사이 띠(판 145 칸 아래)로 내려가 앉는다 */
export const BrandContent = styled.div<{ $below?: boolean }>`
    position: relative;
    z-index: 1;
    text-align: center;
    animation: ${fadeUp} 0.9s ease both;

    ${p => p.$below && css`
        position: absolute;
        left: 50%;
        top: calc(50% + ${plate(147)});
        transform: translate(-50%, -50%);
        animation: ${settle} 0.9s ease both;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 10px 28px;
        /* 고리·방사선이 글자 뒤를 지나가지 않게 판 색으로 살짝 걷어 낸다 */
        background: radial-gradient(closest-side, ${p.theme.colors.surface} 62%, transparent);
    `}
`;
export const ServiceName = styled.h1`
    font-family: ${p => p.theme.fonts.display};
    font-size: 3rem;
    font-weight: 400;
    color: ${p => p.theme.colors.primary};
    letter-spacing: 0.32em;
    margin: 0 -0.32em 0 0;
    line-height: 1;
`;
/** 올해 — 로마 숫자, 작고 성기게 */
export const Year = styled.div`
    font-family: ${p => p.theme.fonts.display};
    font-size: 0.72rem;
    letter-spacing: 0.6em;
    margin-right: -0.6em;
    color: ${p => p.theme.colors.primary};
    opacity: 0.75;
`;
