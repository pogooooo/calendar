/**
 * MapleMonthArch 의 모양 — 놋쇠 해시계(E3) 위에 먹으로 눈금·바늘을 얹는다.
 */
import styled from "styled-components";
import { withAlpha } from "@/styles/color";

/** 그림(1024×475) 위로 표식이 삐져나갈 자리를 60 만큼 더 둔다 */
export const OVERHANG = 60;

export const Dial = styled.div`
    position: relative;
    width: min(100%, 520px);
    margin: 0 auto;
    aspect-ratio: 1024 / ${475 + OVERHANG};

    @media (max-width: 768px) {
        width: min(100%, 400px);
    }

    .brass {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: auto;
        pointer-events: none;
        filter: ${(p) => p.theme.mode === "dark" ? "brightness(0.82) saturate(0.9)" : "none"};
    }

    .ink {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
    }

    /* 눈금·바늘은 먹, 오늘은 단풍 붉음 */
    .tick { stroke: ${(p) => p.theme.colors.text}; stroke-width: 5; stroke-linecap: round; }
    .major { stroke: ${(p) => withAlpha(p.theme.colors.text, 0.55)}; stroke-width: 3; }
    .mkline { stroke: ${(p) => withAlpha(p.theme.colors.text, 0.5)}; stroke-width: 3; }
    .mkanv { fill: ${(p) => p.theme.colors.primary}; }
    .mkdue { fill: ${(p) => p.theme.colors.background}; stroke: ${(p) => p.theme.colors.text}; stroke-width: 4; }
    .nray { stroke: ${(p) => p.theme.colors.primary}; stroke-width: 7; stroke-linecap: round; }
    .nshadow { stroke: ${withAlpha("#000000", 0.18)}; stroke-width: 9; stroke-linecap: round; }
    .pivot { fill: ${(p) => p.theme.colors.primary}; stroke: ${(p) => p.theme.colors.background}; stroke-width: 4; }
    .ncap { fill: ${(p) => p.theme.colors.primary}; }
`;
