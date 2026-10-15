/**
 * Maple 의 "더보기" 창(그날의 일정 모두) — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 머리는 고운바탕 굵은 날짜와 옅은 "N개". 일정은 달력의 막대와 같은 말 — 둥근 5px, 카테고리색을 옅게 깐 바탕에
 * 왼쪽 3px 카테고리색 띠, 글은 본문색. 끝낸 일은 띠만 남고 글이 옅어지며 그어진다. 챌린지는 둥근 체크 칸(inkCheckbox).
 * 귀퉁이의 사선 장식과 점선 줄은 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialMoreModal.styles";
import { MOBILE } from "@/styles/breakpoints";
import { hair, inkCheckbox } from "@/styles/maple/ink";
import { roundIcon, titleType, wash } from "../../baseModal/maple/mapleLayer";

export * from "../celestial/CelestialMoreModal.styles";

/** 귀퉁이의 사선은 그리지 않는다 */
export const ContentWrapper = styled(C.ContentWrapper)`
    &::after { content: none; }
`;

export const Header = styled(C.Header)`
    gap: 8px;
    padding: 18px 12px 2px 22px;
    border-bottom: none;

    .title-text {
        ${titleType("1.125rem")}
    }

    .close-btn {
        ${roundIcon("36px")}
        border: none;
        &:hover:not(:disabled) { border-color: transparent; }
    }

    ${MOBILE} {
        padding: 16px 10px 2px 20px;
        .close-btn { width: 40px; height: 40px; }
    }
`;

export const CountLabel = styled(C.CountLabel)`
    padding: 0 22px 12px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.textSecondary};
    border-bottom: 1px solid ${(p) => hair(p.theme, 0.08)};

    ${MOBILE} { padding: 0 20px 12px; }
`;

export const ScrollBody = styled(C.ScrollBody)`
    padding: 12px 16px 18px;

    ${MOBILE} { padding: 12px 14px 16px; }
`;

export const TodoList = styled(C.TodoList)`
    gap: 6px;
`;

export const EmptyText = styled(C.EmptyText)`
    padding: 28px 0 20px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    letter-spacing: 0;
`;

export const SectionLabel = styled(C.SectionLabel)`
    margin-top: 18px;
    padding: 0 4px 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};
    border-bottom: none;
`;

/** 일정 한 줄 — 달력의 막대와 같은 모양(카테고리색 옅은 바탕 + 왼쪽 띠) */
export const TodoItem = styled(C.TodoItem)`
    --cat: ${(p) => p.$color || p.theme.colors.primary};
    min-height: 44px;
    padding: 0 12px 0 0;
    border: none;
    border-radius: 5px;
    background-color: color-mix(in srgb, var(--cat) ${(p) => (p.theme.mode === "dark" ? "24%" : "18%")}, transparent);
    background-image: none;
    overflow: hidden;
    transition: background-color 0.15s ease, transform 0.08s ease;

    &:last-child { border-bottom: none; }

    .color-bar {
        align-self: stretch;
        width: 3px;
        height: auto;
        margin-right: 11px;
        border: none;
        border-radius: 0;
        transform: none;
        background-color: var(--cat);
    }

    .todo-title {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.875rem;
        font-weight: 500;
        color: ${(p) => p.theme.colors.text};
    }

    &:hover { background-color: color-mix(in srgb, var(--cat) ${(p) => (p.theme.mode === "dark" ? "32%" : "26%")}, transparent); }
    &:active { transform: scale(0.99); }
    &:focus-visible { outline-offset: 2px; }

    @media (hover: none) {
        min-height: 48px;
        padding: 0 12px 0 0;
        &:active { background-color: color-mix(in srgb, var(--cat) 30%, transparent); }
    }

    ${(p) => p.$isDone && css`
        background-color: color-mix(in srgb, var(--cat) ${p.theme.mode === "dark" ? "10%" : "8%"}, transparent);
        .color-bar { background-color: var(--cat); border: none; opacity: 0.5; }
        .todo-title { color: ${p.theme.colors.textSecondary}; text-decoration: line-through; }
    `}
`;

/** 챌린지 한 줄 — 둥근 체크 칸 + 이름. 올리면 옅게 칠해진다 */
export const ChallengeItem = styled(C.ChallengeItem)`
    gap: 12px;
    min-height: 44px;
    padding: 6px 8px;
    border-bottom: none;
    border-radius: 10px;
    transition: background-color 0.15s ease;

    &:hover { background-color: ${(p) => wash(p.theme)}; }

    .check {
        position: relative;
        width: 22px;
        height: 22px;
        ${(p) => inkCheckbox(p.$isDone)}

        /* 손가락이 닿는 자리는 칸보다 넓게 */
        &::before {
            content: "";
            position: absolute;
            inset: -10px;
        }
        /* 뼈대의 금빛 번짐은 걷는다 — 올리면 테가 붉어지는 것(inkCheckbox)으로 충분하다 */
        &:hover { box-shadow: none; }
        &:focus-visible { outline: none; box-shadow: 0 0 0 3px ${(p) => hair(p.theme, 0.16)}; }
    }

    .challenge-title {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.875rem;
        font-weight: 500;
        color: ${(p) => (p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text)};
        opacity: 1;
    }
`;
