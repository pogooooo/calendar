/**
 * 바다의 시각 다이얼 — 놋쇠 문자판·로마 숫자·십자 바늘(Celestial), 먹 눈금·도장(Maple) 대신 **조용한 요즘 다이얼**:
 *   문자판은 옅은 면 위의 가는 고리 하나와 머리카락 눈금, 숫자는 0–23 (짝수 시만), 지금 시는 청록 굵은 글씨
 *   바늘은 끝이 동그란 청록 한 줄(분 바늘은 옅은 회색), 가운데 축은 작은 청록 점. 무늬·그림자 없음
 *   적는 칸은 10px 모서리의 흰 칸, 자주 쓰는 분은 8px 칩(고르면 청록 기운)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialTimeDial.styles";
import { ink, seaButton, seaChip, tideInput } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialTimeDial.styles";

/** 문자판 숫자는 0–23 아라비아 숫자 (짝수 시만 문자판에 적힌다) */
export const HOUR_NAMES: readonly string[] = Array.from({ length: 24 }, (_, h) => String(h));

/** 적는 칸 — "14 : 35" */
export const Entry = styled(C.Entry)`
    gap: 6px;
    margin-bottom: 10px;

    b {
        margin-top: 5px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 1.1rem;
        font-weight: 500;
        color: ${(p) => p.theme.colors.textSecondary};
        opacity: 1;
    }
`;

export const Field = styled(C.Field)`
    input {
        ${tideInput}
        width: 56px;
        padding: 4px 0;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 1.25rem;
        font-weight: 600;
        letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.text};
        caret-color: ${(p) => p.theme.colors.primary};
        &:hover { border-color: ${(p) => ink(p.theme, 0.2)}; }
    }

    /* 오르내림 — 작은 글자 단추 */
    .spin button {
        border-radius: 4px;
        color: ${(p) => p.theme.colors.textSecondary};
        transition: background-color 0.12s ease, color 0.12s ease;
        &:hover { color: ${(p) => p.theme.colors.text}; background-color: ${(p) => ink(p.theme, 0.06)}; }
    }

    em {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.6875rem;
        letter-spacing: 0;
    }
`;

/** 문자판 — 가는 고리와 머리카락 눈금, 청록 바늘 */
export const Dial = styled(C.Dial)`
    width: 184px;
    height: 184px;
    border-radius: 50%;
    background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.04 : 0.025)};

    .rim { stroke: ${(p) => p.theme.colors.text}; stroke-opacity: 0.14; stroke-width: 0.5; }
    .rim.inner { stroke-opacity: 0.1; stroke-width: 0.4; }

    .tick { stroke: ${(p) => p.theme.colors.text}; stroke-opacity: 0.16; stroke-width: 0.35; }
    .tick.long { stroke-opacity: 0.36; stroke-width: 0.5; }
    .tick.faint { stroke-opacity: 0.18; stroke-width: 0.35; }

    .stem { stroke: ${(p) => p.theme.colors.primary}; stroke-width: 0.9; stroke-linecap: round; }
    .stem.thin { stroke: ${(p) => p.theme.colors.text}; stroke-opacity: 0.35; stroke-width: 0.6; }
    .cross { display: none; }
    /* 바늘 끝과 축 — 마름모 대신 동그란 청록 점 (rx 를 모르는 Firefox 에서는 네모로 남는다) */
    .tip, .hub {
        rx: 2.6px;
        ry: 2.6px;
        fill: ${(p) => p.theme.colors.primary};
        stroke: none;
    }

    .num {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 4.6px;
        font-weight: 500;
        fill: ${(p) => p.theme.colors.textSecondary};
        opacity: 1;
        transition: fill 0.12s ease;
    }
    .num:hover { fill: ${(p) => p.theme.colors.text}; }
    .num.on {
        font-size: 5.4px;
        font-weight: 700;
        fill: ${(p) => p.theme.colors.primary};
    }
    .mnum {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 3.4px;
        fill: ${(p) => p.theme.colors.textSecondary};
        opacity: 0.7;
    }

    /* 잡은 고리만 청록으로 */
    &[data-grab="outer"] .rim:not(.inner) { stroke: ${(p) => p.theme.colors.primary}; stroke-opacity: 0.5; }
    &[data-grab="inner"] .rim.inner { stroke: ${(p) => p.theme.colors.primary}; stroke-opacity: 0.45; }
`;

/** 자주 쓰는 분 — 8px 칩, 고르면 청록 기운 */
export const Quick = styled(C.Quick)`
    gap: 4px;
    margin-top: 10px;

    button {
        ${seaChip(false)}
        padding: 5px 0;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.72rem;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        &:hover { border-color: ${(p) => ink(p.theme, 0.22)}; color: ${(p) => p.theme.colors.text}; background-color: transparent; }

        &[data-on="1"] {
            ${seaChip(true)}
            color: ${(p) => p.theme.colors.primary};
            font-weight: 600;
            border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.45)};
        }
    }

    ${MOBILE} { button { padding: 9px 0; font-size: 0.78rem; } }
`;

/* 다이얼 밑 단추 줄(시 ±1 · 분 ±5) — 지금 다이얼은 쓰지 않지만 이름은 남아 있다. 남는 동안에도 같은 결로 */
export const StepGroup = styled(C.StepGroup)`
    span { font-family: ${(p) => p.theme.fonts.body}; letter-spacing: 0; }
    button {
        ${seaButton("default")}
        font-family: ${(p) => p.theme.fonts.body};
        ${MOBILE} { width: 44px; height: 36px; }
    }
`;
