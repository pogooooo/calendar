/**
 * TimeDial 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const Wrap = styled.div`
    padding: 4px 0 2px;
`;

export const Dial = styled.svg`
    display: block;
    width: 184px;
    height: 184px;
    margin: 0 auto;
    touch-action: none;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;

    text { user-select: none; -webkit-user-select: none; }

    &:active { cursor: grabbing; }

    .rim {
        fill: none;
        stroke: ${p => p.theme.colors.primary};
        stroke-opacity: 0.24;
        stroke-width: 0.5;
    }
    .rim.inner { stroke-opacity: 0.18; stroke-width: 0.45; }

    .tick { stroke: ${p => p.theme.colors.primary}; stroke-opacity: 0.16; stroke-width: 0.3; }
    .tick.long { stroke-opacity: 0.42; stroke-width: 0.6; }
    .tick.faint { stroke-opacity: 0.28; stroke-width: 0.35; }

    .stem { stroke: ${p => p.theme.colors.primary}; stroke-width: 0.55; }
    .stem.thin { stroke-width: 0.4; stroke-opacity: 0.6; }
    .cross { stroke: ${p => p.theme.colors.primary}; stroke-width: 0.7; }
    .cross.thin { stroke-width: 0.5; stroke-opacity: 0.7; }
    .cross.faintCross { stroke-width: 0.55; stroke-opacity: 0.7; }

    .tip, .hub {
        fill: ${p => p.theme.colors.surface};
        stroke: ${p => p.theme.colors.primary};
        stroke-width: 0.7;
    }

    .num {
        font-family: ${p => p.theme.fonts.display};
        font-size: 5px;
        fill: ${p => p.theme.colors.text};
        opacity: 0.7;
    }
    .num.on {
        font-size: 6.3px;
        fill: ${p => p.theme.colors.primary};
        opacity: 1;
    }
    .mnum {
        font-family: ${p => p.theme.fonts.display};
        font-size: 3.9px;
        fill: ${p => p.theme.colors.textSecondary};
        opacity: 0.65;
    }

    .hand, .mhand {
        transform-box: view-box;
        transform-origin: 50px 50px;
        transition: transform 0.44s cubic-bezier(0.34, 1.14, 0.38, 1);
    }
    .mhand { transition-duration: 0.54s; }

    /* 돌리는 동안은 바늘이 손가락을 바로 따라와야 한다 */
    &.dragging .hand, &.dragging .mhand { transition: none; }

    /* 잡은 고리만 살짝 진해진다 — 잡았다는 느낌만, 놓으면 원래대로 */
    &[data-grab="outer"] .rim:not(.inner) { stroke-opacity: 0.5; }
    &[data-grab="inner"] .rim.inner { stroke-opacity: 0.45; }

    @media (prefers-reduced-motion: reduce) {
        .hand, .mhand { transition: none; }
    }
`;

/* 다이얼 밑 단추 줄: 시 ±1 · 분 ±5. 앱의 유령 단추와 같은 결 */
export const Steps = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 6px;
`;

export const StepGroup = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    span {
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.62rem;
        letter-spacing: 0.2em;
        color: ${p => p.theme.colors.textSecondary};
        min-width: 2.2em;
        text-align: center;
    }

    button {
        font-family: ${p => p.theme.fonts.display};
        font-size: 0.9rem;
        width: 36px;
        height: 30px;
        background: none;
        border: 1px solid ${p => p.theme.colors.primary}55;
        border-radius: 6px;
        color: ${p => p.theme.colors.primary};
        cursor: pointer;
        transition: border-color 0.15s;

        &:hover, &:active { border-color: ${p => p.theme.colors.primary}; }
        &:focus-visible { outline: 2px solid ${p => p.theme.colors.primary}; outline-offset: 1px; }

        /* 폰에서는 손가락만큼 */
        ${MOBILE} { width: 44px; height: 36px; }
    }
`;
