/**
 * Maple 의 시간 다이얼 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 로마 숫자·놋쇠 눈금·도장 단추를 걷고 깨끗한 시계로.
 *   위의 적는 칸은 "17 : 57" 두 개의 둥근 칸(초점이면 붉은 테), 문자판은 옅게 칠한 원판에 아라비아 숫자,
 *   고른 시는 붉은 굵은 숫자, 바늘은 붉음. 자주 쓰는 분은 칩(고른 것은 옅은 붉음).
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialTimeDial.styles";
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { hair, inkChip } from "@/styles/maple/ink";
import { field } from "@/components/modal/baseModal/maple/mapleLayer";

export * from "../celestial/CelestialTimeDial.styles";

/** 문자판의 시 이름 — 로마 숫자는 Celestial 의 말이다. Maple 은 그냥 숫자 */
export const HOUR_NAMES: readonly string[] = Array.from({ length: 24 }, (_, h) => String(h));

/** 적는 칸 — "17 : 57" */
export const Entry = styled(C.Entry)`
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 10px;

    b {
        margin-top: 7px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 1.375rem;
        font-weight: 600;
        color: ${(p) => p.theme.colors.textSecondary};
        opacity: 1;
    }
`;

/** 시(또는 분) 한 칸 — 둥근 칸 안의 큰 숫자, 옆의 작은 오르내림, 밑의 단위 */
export const Field = styled(C.Field)`
    grid-template-columns: auto 14px;
    column-gap: 4px;

    input {
        ${field}
        width: 60px;
        height: 44px;
        padding: 0;
        text-align: center;
        font-size: 1.5rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        cursor: text;
    }

    .spin button {
        width: 14px;
        height: 14px;
        font-size: 8px;
        border-radius: 4px;
        color: ${(p) => p.theme.colors.textSecondary};

        &:hover { color: ${(p) => p.theme.colors.primary}; background-color: ${(p) => hair(p.theme, 0.06)}; }
    }

    em {
        margin-top: 4px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }
`;

/** 문자판 — 옅게 칠한 원판, 옅은 눈금, 숫자는 본문 글꼴. 고른 시와 바늘만 붉다 */
export const Dial = styled(C.Dial)`
    .rim {
        fill: ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.04 : 0.03)};
        stroke: ${(p) => p.theme.colors.text};
        stroke-opacity: 0.12;
        stroke-width: 0.5;
    }
    .rim.inner { fill: none; stroke-opacity: 0.1; stroke-width: 0.4; }

    .tick { stroke: ${(p) => p.theme.colors.text}; stroke-opacity: 0.18; stroke-width: 0.35; }
    .tick.long { stroke-opacity: 0.4; stroke-width: 0.6; }
    .tick.faint { stroke-opacity: 0.22; }

    /* 바늘 — 곧은 선 둘(시는 굵게, 분은 가늘게). 칼자루 같은 가로대와 끝의 고리는 Celestial 의 말이라 뗀다 */
    .stem { stroke: ${(p) => p.theme.colors.primary}; stroke-linecap: round; stroke-width: 0.9; }
    .stem.thin { stroke-width: 0.6; stroke-opacity: 0.55; }
    .cross, .tip { display: none; }

    /* 축 — 마름모 대신 둥근 못 (rx 는 Chromium·WebKit 만 안다 — Firefox 에서는 마름모로 남는다) */
    .hub {
        fill: ${(p) => p.theme.colors.primary};
        stroke: ${(p) => p.theme.colors.primary};
        stroke-width: 0.8;
        rx: 2.6px;
        ry: 2.6px;
    }

    .num {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 5.6px;
        font-weight: 500;
        fill: ${(p) => p.theme.colors.textSecondary};
        opacity: 1;
    }
    .num:hover { fill: ${(p) => p.theme.colors.primary}; }
    /* 고른 시 — 붉은 굵은 숫자가 바늘 끝이 된다. 숫자 둘레를 판 색으로 둘러 밑을 지나는 바늘을 끊는다 */
    .num.on {
        font-size: 6.6px;
        font-weight: 700;
        fill: ${(p) => p.theme.colors.primary};
        stroke: ${(p) => p.theme.colors.surface};
        stroke-width: 2.4px;
        stroke-linejoin: round;
        paint-order: stroke;
    }
    .mnum {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 4px;
        fill: ${(p) => p.theme.colors.textSecondary};
        opacity: 0.7;
    }

    /* 잡은 고리만 살짝 붉게 — 잡았다는 느낌만, 놓으면 원래대로 */
    &[data-grab="outer"] .rim:not(.inner) { stroke: ${(p) => p.theme.colors.primary}; stroke-opacity: 0.45; }
    &[data-grab="inner"] .rim.inner { stroke: ${(p) => p.theme.colors.primary}; stroke-opacity: 0.45; }
`;

/** 자주 쓰는 분 — 칩. 고른 것은 옅은 붉음에 붉은 글씨 */
export const Quick = styled(C.Quick)`
    gap: 6px;
    margin-top: 12px;

    button {
        ${inkChip(false)}
        padding: 6px 0;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.8125rem;
        font-weight: 500;
        transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

        &:hover { color: ${(p) => p.theme.colors.text}; border-color: ${(p) => hair(p.theme, 0.26)}; }

        &[data-on="1"], &[data-on="1"]:hover {
            ${inkChip(true)}
            font-weight: 600;
            border-color: ${(p) => withAlpha(p.theme.colors.primary, 0.35)};
        }
    }

    ${MOBILE} {
        button { padding: 10px 0; font-size: 0.875rem; }
    }
`;
