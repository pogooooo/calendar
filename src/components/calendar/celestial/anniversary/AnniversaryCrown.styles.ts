/**
 * AnniversaryCrown 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { css, keyframes } from "styled-components";

export const ROW = 14; // 이름 한 줄 높이 (스크롤 스냅 단위)

export const draw = keyframes`
    to { stroke-dashoffset: 0; }
`;

export const bloom = keyframes`
    from { opacity: 0; transform: scaleY(0.2); }
    to { opacity: 1; transform: none; }
`;

/* ── 궤도를 도는 빛 ───────────────────────────────────── */
export const orbit = keyframes`
    to { offset-distance: 100%; }
`;

export const beadIn = keyframes`
    to { opacity: 0.95; }
`;

/* ── 오늘 ─────────────────────────────────────────────── */
export const breathe = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
`;

export const sweep = keyframes`
    from { stroke-dashoffset: 85; }
    to { stroke-dashoffset: 0; }
`;

export const motionSafe = (rule: ReturnType<typeof css>) => css`
    @media (prefers-reduced-motion: no-preference) {
        ${rule}
    }
`;

export const Root = styled.span<{ $multi: boolean; $today: boolean; $flip: boolean }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-direction: ${(p) => (p.$flip ? "row-reverse" : "row")};
    gap: 4px;
    min-width: 0;
    max-width: 100%;
    color: ${(p) => p.theme.colors.primary};

    svg { transition: filter 0.25s ease; }

    &:hover svg {
        filter: drop-shadow(0 0 4px ${(p) => p.theme.colors.primary}bf);
    }

    /* 오늘 기념일: 링이 숨쉰다 */
    ${(p) => p.$today && motionSafe(css`
        .ring { animation: ${draw} 0.85s ease-out 0.1s forwards, ${breathe} 2.8s ease-in-out 1s infinite; }
    `)}

    /* 오늘 기념일: 호버하면 빛이 링을 한 바퀴 */
    ${(p) => p.$today && css`
        &:hover .sweep {
            opacity: 1;
            ${motionSafe(css`animation: ${sweep} 0.9s ease-in-out;`)}
        }
    `}
`;

export const Ring = styled.span`
    position: relative;
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    flex: 0 0 auto;

    svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        fill: none;
        stroke: currentColor;
    }

    /* 링: 그려지며 등장 (둘레 ≈ 85) */
    .ring {
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
        stroke-dasharray: 85;
        stroke-dashoffset: 85;
        ${motionSafe(css`animation: ${draw} 0.85s ease-out 0.1s forwards;`)}

        @media (prefers-reduced-motion: reduce) {
            stroke-dashoffset: 0;
        }
    }

    /* 기념일이 2개 이상이면 바깥에 점선 링 */
    .ring2 {
        stroke-width: 0.8;
        opacity: 0.4;
        stroke-dasharray: 2 3;
        vector-effect: non-scaling-stroke;
    }

    /* 별: 아래에서 피어남 */
    .jewel {
        stroke-width: 1.1;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
        transform-box: fill-box;
        transform-origin: 50% 100%;
        ${motionSafe(css`
            opacity: 0;
            animation: ${bloom} 0.5s cubic-bezier(0.2, 1.4, 0.4, 1) 0.55s forwards;
        `)}
    }

    /* 링 궤도를 도는 빛 구슬 */
    .bead {
        fill: currentColor;
        stroke: none;
        offset-path: path("M17,3.5 a13.5,13.5 0 1,1 0,27 a13.5,13.5 0 1,1 0,-27");
        offset-distance: 0%;
        opacity: 0;
        filter: drop-shadow(0 0 3px currentColor);
        ${motionSafe(css`
            animation: ${orbit} 7s linear 1s infinite, ${beadIn} 0.4s ease 1s forwards;
        `)}
    }

    /* 오늘: 호버 시 링을 훑는 빛 */
    .sweep {
        stroke-width: 1.6;
        stroke-linecap: round;
        stroke-dasharray: 14 71;
        stroke-dashoffset: 85;
        opacity: 0;
        vector-effect: non-scaling-stroke;
        filter: drop-shadow(0 0 4px currentColor);
    }

    /* 링 안에 들어가므로 평소 날짜보다 조금 작게 (셀의 .day-number 크기를 덮어쓴다) */
    .dn {
        position: relative;
        font-weight: 400;
        line-height: 1;
        font-size: 0.78rem;

        > * {
            font-size: inherit;
            line-height: inherit;
        }
    }
`;

export const Reveal = styled.span<{ $multi: boolean; $flip: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: ${(p) => (p.$flip ? "row-reverse" : "row")};
    gap: 4px;
    min-width: 0;
    max-width: 0;
    opacity: 0;
    transform: translateX(-4px);
    transition: max-width 0.3s ease, opacity 0.25s ease, transform 0.3s ease;

    ${Root}:hover & {
        max-width: 108px;
        opacity: 1;
        transform: none;
    }

    /* 이름 릴 — 한 줄 높이, 휠로 넘기고 스냅으로 딱 떨어진다.
       남는 폭을 차지하되 좁으면 말줄임(…)으로 접힌다 */
    .reel {
        flex: 1 1 auto;
        min-width: 0;
        height: ${ROW}px;
        overflow-y: auto;
        overscroll-behavior: contain;
        scroll-snap-type: y mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none;

        ${(p) => p.$multi && css`
            -webkit-mask: linear-gradient(to bottom, transparent 0, #000 4px, #000 10px, transparent ${ROW}px);
            mask: linear-gradient(to bottom, transparent 0, #000 4px, #000 10px, transparent ${ROW}px);
        `}
    }

    .reel::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
    }

    .nm {
        display: block;
        height: ${ROW}px;
        line-height: ${ROW}px;
        scroll-snap-align: start;
        font-size: 0.6rem;
        letter-spacing: 0.3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: ${(p) => (p.$multi ? 0.35 : 1)};
        transform: ${(p) => (p.$multi ? "translateX(3px)" : "none")};
        transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .nm.on {
        opacity: 1;
        transform: none;
    }

    /* 호버 시 좌→우로 그려지는 밑줄 */
    .rule {
        position: absolute;
        ${(p) => (p.$flip ? "right: 0;" : "left: 0;")}
        bottom: -1px;
        height: 1px;
        width: 0;
        background: linear-gradient(
            ${(p) => (p.$flip ? "to left" : "to right")},
            currentColor,
            transparent
        );
        transition: width 0.45s ease 0.12s;
    }

    ${Root}:hover & .rule {
        width: 100%;
    }

    .idx {
        flex: 0 0 auto;
        font-size: 0.47rem;
        letter-spacing: 0.5px;
        opacity: 0.6;
    }
`;
