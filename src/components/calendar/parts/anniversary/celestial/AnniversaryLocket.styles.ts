/**
 * AnniversaryLocket 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { css, keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";

export const ROW = 13;        // 이름 한 줄 높이 (스크롤 스냅 단위)
export const MAX_PIPS = 2;    // 로켓 아래 매다는 마름모 최대 개수 (그 이상은 인덱스로 알림)

export const swing = keyframes`
    0%, 100% { transform: rotate(-1.5deg); }
    50% { transform: rotate(1.5deg); }
`;

/* 호버: 건드린 것처럼 한 번 크게 흔들리고 잦아든다 */
export const nudge = keyframes`
    0%   { transform: rotate(0deg); }
    18%  { transform: rotate(6.5deg); }
    42%  { transform: rotate(-4.5deg); }
    64%  { transform: rotate(2.6deg); }
    82%  { transform: rotate(-1.2deg); }
    100% { transform: rotate(0deg); }
`;

/* 호버: 빛이 체인을 타고 내려와 로켓에 닿는다 */
export const drip = keyframes`
    0%   { offset-distance: 0%; opacity: 0; }
    15%  { opacity: 1; }
    75%  { offset-distance: 100%; opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
`;

export const todayGlow = keyframes`
    0%, 100% { filter: drop-shadow(0 0 1px var(--locket-glow-soft)); }
    50%      { filter: drop-shadow(0 0 5px var(--locket-glow-strong)); }
`;

export const motionSafe = (rule: ReturnType<typeof css>) => css`
    :where(html:not([data-theme-motion="off"])) & {
        ${rule}
    }
`;

export const Root = styled.span<{ $today: boolean }>`
    /* keyframes 는 props 를 못 읽는다. 빛무리 색은 여기서 내려보낸다. */
    --locket-glow-soft: ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
    --locket-glow-strong: ${(p) => withAlpha(p.theme.colors.primary, 0.85)};

    position: absolute;
    top: -1px;
    right: 8px;
    width: 26px;
    height: 56px;
    z-index: 4;
    color: ${(p) => p.theme.colors.primary};
    transform-origin: 50% 0;
    transition: filter 0.3s ease;

    ${motionSafe(css`animation: ${swing} 6s ease-in-out infinite;`)}

    .art {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        stroke: currentColor;
        fill: none;
    }

    .chain {
        stroke-width: 0.85;
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
    }

    .ring {
        stroke-width: 1;
        vector-effect: non-scaling-stroke;
    }

    .jw {
        stroke-width: 1;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
    }

    .drop {
        stroke-width: 0.9;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
    }

    /* 매달린 마름모 — 현재 항목이면 금색으로 채워진다 */
    .pip {
        stroke-width: 0.9;
        fill: transparent;
        vector-effect: non-scaling-stroke;
        transition: fill 0.25s ease, filter 0.25s ease;
    }

    .pip.on {
        fill: currentColor;
        filter: drop-shadow(0 0 4px currentColor);
    }

    .spark {
        fill: currentColor;
        stroke: none;
        opacity: 0;
        filter: drop-shadow(0 0 3px currentColor);
        offset-path: path("M13 0 V13");
    }

    /* 로켓 안 아이콘 */
    .ic {
        position: absolute;
        top: 15.5px;
        left: 50%;
        margin-left: -6px;
        width: 12px;
        height: 12px;
        display: flex;
        transform-origin: 50% 50%;
        transition: transform 0.3s ease, filter 0.3s ease;
    }

    /* 오늘이 기념일이면 로켓이 숨쉰다 */
    ${(p) => p.$today && motionSafe(css`
        .ring, .ic { animation: ${todayGlow} 2.8s ease-in-out infinite; }
    `)}

    &:hover {
        filter: drop-shadow(0 0 6px ${(p) => p.theme.colors.primary}cc);

        ${motionSafe(css`animation: ${nudge} 1.5s cubic-bezier(0.25, 0.8, 0.3, 1);`)}

        .ic {
            transform: scale(1.14);
            filter: drop-shadow(0 0 4px ${(p) => p.theme.colors.primary}e6);
        }

        .spark {
            ${motionSafe(css`animation: ${drip} 1.1s ease-in 0.1s;`)}
        }
    }
`;

export const Plaque = styled.span<{ $multi: boolean }>`
    position: absolute;
    top: 54px;
    right: -4px;
    width: 112px;
    z-index: 8;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 6px;
    box-sizing: border-box;
    background: ${(p) => p.theme.colors.surface};
    border: 1px solid ${(p) => p.theme.colors.primary}99;
    font-size: 0.56rem;
    color: ${(p) => p.theme.colors.primary};
    white-space: nowrap;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition: opacity 0.22s ease, transform 0.3s cubic-bezier(0.2, 1.1, 0.3, 1);

    ${Root}:hover & {
        opacity: 1;
        transform: none;
    }

    .reel {
        flex: 1 1 auto;
        min-width: 0;
        height: ${ROW}px;
        overflow-y: auto;
        overscroll-behavior: contain;
        scroll-snap-type: y mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none;
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
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .idx {
        flex: 0 0 auto;
        font-size: 0.47rem;
        opacity: 0.6;
    }
`;
