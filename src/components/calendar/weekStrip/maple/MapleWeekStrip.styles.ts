/**
 * Maple 의 주간 띠(폰) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 페이지의 종이 바탕 위에 일곱 날. 오늘 숫자에 붉은 밑선을 긋고, 선택한 칸은 아래 괘선으로 구분한다.
 * 노트의 왼쪽 여백선과 일정 색 표식은 그대로 유지한다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialWeekStrip.styles";
import { withAlpha } from "@/styles/color";
import { hair, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialWeekStrip.styles";

export const Strip = styled(C.Strip)`
    && { position:relative; background:transparent; border:0; border-bottom:1px solid ${p => hair(p.theme,.18)}; border-radius:0; padding:10px 10px 14px 20px; box-shadow:none; }
    &::before { content:""; position:absolute; left:11px; top:12px; bottom:12px; width:1px; background:${p => p.theme.colors.primary}35; pointer-events:none; }
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
    && { min-height:78px; border-radius:3px; background-color:${(p) => p.$selected ? withAlpha(p.theme.colors.primary, .08) : 'transparent'}; box-shadow:${(p) => p.$selected ? `inset 0 -3px 0 ${p.theme.colors.primary}` : 'none'}; }
    && .num { font-family:${p => p.theme.fonts.body}; font-size:1rem; font-variant-numeric:tabular-nums; border-radius:0; }
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
        background: transparent;
        box-shadow: none;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.9375rem;
        font-weight: 600;
        transition: background-color 0.15s ease, color 0.15s ease;

        ${(p) => p.$today && css`
            color: ${p.theme.colors.primary};
            font-weight: 700;
            text-decoration: underline;
            text-decoration-thickness: 1.5px;
            text-underline-offset: 6px;
            text-decoration-skip-ink: none;
        `}

        ${(p) => p.$selected && css`
            color: ${p.theme.colors.primary};
            font-weight: 700;
        `}
    }

    /* 일정 점 = 카테고리 색 단풍잎 (색은 JSX 의 인라인 background) */
    .dots {
        gap: 2px;
        min-height: 9px;

        i { width:11px; height:3px; border-radius:1px; mask:none; -webkit-mask:none; transform:none; }

        em {
            font-size: 0.66rem;
            font-weight: 600;
        }
    }

    &:active { background: ${(p) => hair(p.theme, 0.05)}; }
`;
