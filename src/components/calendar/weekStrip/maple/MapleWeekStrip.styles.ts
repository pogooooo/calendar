/**
 * Maple 의 주간 띠(폰) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 카드 한 장 위에 일곱 날. 고른 날은 단풍 붉음으로 채운 동그라미(흰 숫자),
 * 오늘은 붉음이 옅게 든 동그라미에 붉은 숫자, 일정은 카테고리 색 단풍잎 점. 예전의 말린 잎 그림은 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialWeekStrip.styles";
import { withAlpha } from "@/styles/color";
import { hair, leafChip, paperCard, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialWeekStrip.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const Strip = styled(C.Strip)`
    ${paperCard()}
    padding: 6px 8px 8px;
`;

/** ‹ 2026년 10월 [오늘] › — 제목은 명조, 꺾쇠는 바탕 없는 둥근 네모 */
export const Head = styled(C.Head)`
    gap: 4px;
    min-height: 40px;

    .title {
        font-family: ${(p) => p.theme.fonts.display};
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0;
    }

    button {
        ${stampButton("ghost", { square: true })}
        min-width: 36px;
        min-height: 36px;
        padding: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    .today {
        ${stampButton("default")}
        min-height: 30px;
        height: 30px;
        padding: 0 12px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.8125rem;
        letter-spacing: 0;
    }
`;

export const Days = styled(C.Days)`
    gap: 0;
`;

export const Day = styled(C.Day)`
    gap: 4px;
    min-height: 64px;
    padding: 6px 0;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: ${(p) => p.theme.colors.text};
    transition: background-color 0.15s ease;

    /* 일요일만 주말색(요일 글씨까지) — 월간 달력과 같은 말 */
    &:first-child, &:first-child .name { color: ${(p) => p.theme.colors.weekend}; }

    /* "SUN" → "Sun" */
    .name {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0;
        text-transform: lowercase;

        &::first-letter { text-transform: uppercase; }
    }

    .num {
        width: 32px;
        height: 32px;
        line-height: 32px;
        border: none;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.9375rem;
        font-weight: 600;
        transition: background-color 0.15s ease, color 0.15s ease;

        ${(p) => p.$today && css`
            color: ${p.theme.colors.primary};
            background-color: ${withAlpha(p.theme.colors.primary, dark(p) ? 0.18 : 0.12)};
            font-weight: 700;
        `}

        ${(p) => p.$selected && css`
            color: ${dark(p) ? "#1A1512" : "#FFFFFF"};
            background-color: ${p.theme.colors.primary};
            font-weight: 700;
            box-shadow: 0 2px 6px -2px ${withAlpha(p.theme.colors.primary, 0.7)};
        `}
    }

    /* 일정 점 = 카테고리 색 단풍잎 (색은 JSX 의 인라인 background) */
    .dots {
        gap: 2px;
        min-height: 9px;

        i { ${leafChip(5, "9px")} }

        em {
            font-size: 0.66rem;
            font-weight: 600;
        }
    }

    &:active { background: ${(p) => hair(p.theme, 0.05)}; }
`;
