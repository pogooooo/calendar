/**
 * DayCellDecor 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";

export const appear = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

/* 단계별 프레임 (할 일 바와 같은 골드 라인아트) */
export const FrameWrap = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    color: ${(props) => props.theme.colors.primary};
    --mx: 50%;
    --my: 50%;
    --glow: 0;

    .fr-svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    .fr-line {
        stroke: currentColor;
        fill: none;
        vector-effect: non-scaling-stroke;
    }
    .f-out { stroke-width: 1; }
    .f-in { stroke-width: 0.8; opacity: 0.4; }
    .corner { stroke-width: 4; stroke-linecap: round; }

    .fr-base { animation: ${appear} 0.55s ease-out both; }

    /* 호버 시 커서 주변 프레임만 빛나는 레이어 */
    .fr-glow {
        opacity: var(--glow, 0);
        transition: opacity 0.18s ease;
        filter:
            drop-shadow(0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.95)})
            drop-shadow(0 0 7px ${(p) => withAlpha(p.theme.colors.primary, 0.55)});
        -webkit-mask: radial-gradient(
            circle 46px at var(--mx) var(--my),
            #000 0%, #000 20%, transparent 72%
        );
        mask: radial-gradient(
            circle 46px at var(--mx) var(--my),
            #000 0%, #000 20%, transparent 72%
        );
    }
    .fr-glow .fr-line { stroke-width: 1.6; opacity: 1; }
    .fr-glow .corner { stroke-width: 5; }

`;
