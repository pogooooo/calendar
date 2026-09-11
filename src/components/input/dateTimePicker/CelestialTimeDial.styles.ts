/**
 * CelestialTimeDial 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled from "styled-components";

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

    @media (prefers-reduced-motion: reduce) {
        .hand, .mhand { transition: none; }
    }
`;
