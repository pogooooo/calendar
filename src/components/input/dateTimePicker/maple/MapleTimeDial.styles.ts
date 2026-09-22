/**
 * Maple 의 시간 다이얼 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 문자판은 놋쇠 눈금 대신 먹 눈금, 시·분 단추는 도장 단추.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialTimeDial.styles";
import { hair, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialTimeDial.styles";

/** 적는 칸: 먹선 아래, 숫자는 Cormorant */
export const Entry = styled(C.Entry)`
    input {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 1.3rem;
        letter-spacing: 0.04em;
        border-bottom-color: ${(p) => hair(p.theme, 0.5)};

        &:hover { border-bottom-color: ${(p) => hair(p.theme, 0.8)}; }
        &:focus { border-bottom-color: ${(p) => p.theme.colors.primary}; box-shadow: none; }
    }

    b {
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 1.2rem;
        color: ${(p) => p.theme.colors.text};
        opacity: 0.55;
    }
`;

export const Dial = styled(C.Dial)`
    .rim, .tick, .stem, .cross { stroke: ${(p) => p.theme.colors.text}; }
    .rim { stroke-opacity: 0.45; }
    .rim.inner { stroke-opacity: 0.3; }
    .tick { stroke-opacity: 0.3; }
    .tick.long { stroke-opacity: 0.6; }
    .num, .mnum { font-family: ${(p) => p.theme.fonts.numeral}; }
    .num { font-size: 5.6px; }
    .num.on { font-size: 6.8px; }
    .tip, .hub { fill: ${(p) => p.theme.colors.background}; stroke: ${(p) => p.theme.colors.primary}; }
    &[data-grab="outer"] .rim:not(.inner) { stroke-opacity: 0.8; stroke: ${(p) => p.theme.colors.primary}; }
    &[data-grab="inner"] .rim.inner { stroke-opacity: 0.8; stroke: ${(p) => p.theme.colors.primary}; }
`;

export const StepGroup = styled(C.StepGroup)`
    span { font-family: ${(p) => p.theme.fonts.numeral}; font-size: 0.74rem; letter-spacing: 0.1em; }

    button {
        ${stampButton("default")}
        border-radius: 2px;
        color: ${(p) => p.theme.colors.primary};
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 1rem;
    }
`;
