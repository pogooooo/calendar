/**
 * CelestialSidebarDesign 의 모양.
 *
 * 집 규칙: 테마 갈래 컴포넌트는 JSX 만 들고, styled-components 는 형제 *.styles.ts 에 둔다.
 * 새 테마 폴더를 만들 때 어떤 파일을 만들어야 하는지가 파일 이름만으로 드러난다.
 */
import styled, { keyframes, css } from "styled-components";
import { withAlpha } from "@/styles/color";

export const orbit = keyframes`
    from { offset-distance: 0%; }
    to { offset-distance: 100%; }
`;

export const breathe = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
`;

export const starPulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
`;

export const miniTwinkle = keyframes`
    0%, 100% { opacity: 0.9; }
    50% { opacity: 0.15; }
`;

export const beadFlow = keyframes`
    0% { offset-distance: 0%; opacity: 0; }
    10% { opacity: 0.9; }
    90% { opacity: 0.9; }
    100% { offset-distance: 100%; opacity: 0; }
`;

/** 세로선 그림과 혼천의 칸을 겹쳐 두는 틀 — 그림 크기 그대로라 사이드바 짜임은 예전과 같다 */
export const Frame = styled.div`
    position: relative;
    width: 160px;
    height: 954px;

    & > svg { display: block; }
`;

/** 혼천의 자리 — 칸 자체는 누름을 받지 않고(옆선의 폭 조절 그대로), 캔버스만 끌기를 받는다 */
export const Emblem = styled.span`
    position: absolute;
    display: block;
    pointer-events: none;
`;

export const AnimatedSvg = styled.svg<{ $hovered?: boolean }>`
    /* 그림 전체가 이 색을 쓴다(SVG 는 currentColor). 테마가 바뀌면 그림도 따라 바뀐다. */
    color: ${(props) => props.theme.colors.primary};
    filter: none;
    transition: filter 0.35s ease;

    ${(props) => props.$hovered && css`
        filter: drop-shadow(0 0 3px ${withAlpha(props.theme.colors.primary, 0.75)});
    `}

    .spark {
        animation: ${breathe} 4.5s ease-in-out infinite;
    }

    .s-b { animation-duration: 5.4s; animation-delay: 1.2s; }

    .bigstar {
        transform-box: fill-box;
        transform-origin: center;
        animation: ${starPulse} 6s ease-in-out infinite;
    }

    .b-b { animation-duration: 7.5s; animation-delay: 1.8s; }

    .dotstar {
        animation: ${breathe} 5s ease-in-out infinite;
    }

    .d3 { animation-duration: 4.4s; animation-delay: 1.7s; }
    .d5 { animation-duration: 4.8s; animation-delay: 0.4s; }
    .d6 { animation-duration: 6.4s; animation-delay: 3.1s; }

    .mini {
        animation: ${miniTwinkle} 3.4s ease-in-out infinite;
    }

    .m2 { animation-duration: 4.3s; animation-delay: 0.8s; }
    .m3 { animation-duration: 2.8s; animation-delay: 1.5s; }
    .m4 { animation-duration: 3.9s; animation-delay: 2.1s; }
    .m5 { animation-duration: 4.6s; animation-delay: 0.4s; }
    .m6 { animation-duration: 3.1s; animation-delay: 2.6s; }
    .m7 { animation-duration: 4s; animation-delay: 1.1s; }
    .m8 { animation-duration: 3.5s; animation-delay: 1.8s; }
    .m9 { animation-duration: 4.4s; animation-delay: 0.2s; }

    .bead {
        offset-path: path("M102.384 395V954");
        animation: ${beadFlow} 16s linear infinite;
    }

    .bead-top {
        offset-path: path("M102.384 0V106");
        animation: ${beadFlow} 9s linear infinite;
        animation-delay: 4s;
    }
`;

/** WebGL 이 없을 때의 예전 그림 — 초승달과 기운 궤도, 궤도를 도는 작은 별 */
export const OldEmblem = styled.svg`
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    color: ${(props) => props.theme.colors.primary};

    .satellite {
        offset-path: path("M85.5856 226.264C100.47 219.702 114.627 215.354 125.478 213.621C130.907 212.753 135.479 212.546 138.889 213.028C142.331 213.515 144.426 214.677 145.179 216.385C145.932 218.092 145.376 220.423 143.414 223.292C141.47 226.135 138.232 229.37 133.93 232.793C125.332 239.634 112.572 247.153 97.6875 253.715C82.8035 260.276 68.6456 264.625 57.7954 266.358C52.3665 267.225 47.7943 267.432 44.384 266.95C40.9424 266.464 38.847 265.302 38.0942 263.594C37.3414 261.886 37.897 259.556 39.8592 256.687C41.8036 253.844 45.0408 250.608 49.343 247.185C57.9413 240.344 70.7015 232.826 85.5856 226.264Z");
        animation: ${orbit} 14s linear infinite;
    }
`;
