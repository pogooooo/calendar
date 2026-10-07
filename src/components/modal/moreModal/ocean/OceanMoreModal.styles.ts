/**
 * 바다의 "+N" 그날 목록 — 귀퉁이 금빛 사선·마름모 줄·밑줄 번지기(Celestial), 먹선 쪽지(Maple) 대신
 * 15px·600 날짜 제목 밑에 머리카락 선, 개수는 옆에 옅은 작은 글씨.
 * 한 줄은 상자 없는 32px 줄(앞에 카테고리 색 점) — 올리면 8px 모서리로 옅게 칠해진다.
 * 끝낸 일은 점이 빈 고리가 되고 글자는 옅게 지운다. 챌린지 체크는 동그라미(끝내면 청록으로 차고 흰 체크).
 * 데스크톱에서는 오른쪽 유리 시트(OceanBaseModal) — 목록이 시트 높이를 채우고 그 안에서 굴러간다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialMoreModal.styles";
import { bubbleCheck, ink } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { ghostIcon, headRule, menuRow, sheetFill, titleType } from "../../baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialMoreModal.styles";

/** 귀퉁이 사선은 뗀다. 시트에서는 높이를 다 채운다 */
export const ContentWrapper = styled(C.ContentWrapper)`
    &::after { display: none; }
    ${sheetFill}
`;

export const Header = styled(C.Header)`
    padding: 12px 12px 12px 20px;
    border-bottom: none;
    ${headRule}

    .title-text { ${titleType("0.9375rem")} }

    .close-btn {
        ${ghostIcon("28px")}
        border: none;
        @media (hover: none) { width: 44px; height: 44px; }
    }
`;

/** 개수 — 옅은 작은 글씨 */
export const CountLabel = styled(C.CountLabel)`
    padding: 12px 20px 4px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
`;

export const ScrollBody = styled(C.ScrollBody)`
    padding: 0 12px 12px;
`;

export const TodoList = styled(C.TodoList)`
    gap: 1px;
`;

/** 한 줄 — 상자 없이, 올리면 옅게 칠해진다 */
export const TodoItem = styled(C.TodoItem)`
    ${menuRow}
    min-height: 36px;
    padding: 0 8px;
    border-bottom: none;
    background-image: none;

    &:hover { background-size: auto; }
    &:focus-visible { outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.55)}; outline-offset: -2px; }
    @media (hover: none) {
        min-height: 44px;
        padding: 0 8px;
        &:active { background-color: ${(p) => ink(p.theme, 0.08)}; }
    }

    .color-bar {
        width: 8px;
        height: 8px;
        margin-right: 10px;
        border-radius: 50%;
        transform: none;
    }
    .todo-title { font-size: 0.8125rem; }

    ${(p) => p.$isDone && css`
        .color-bar { background-color: transparent; border: 1.5px solid ${p.$color || p.theme.colors.primary}; opacity: 0.6; }
        .todo-title { text-decoration-color: ${ink(p.theme, 0.35)}; }
    `}
`;

/** "챌린지" — 선 없이 작은 옅은 글씨 */
export const SectionLabel = styled(C.SectionLabel)`
    margin-top: 12px;
    padding: 0 8px 6px;
    border-bottom: none;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0;
`;

export const ChallengeList = styled(C.ChallengeList)`
    gap: 1px;
`;

/** 챌린지 한 줄 — 체크칸은 동그라미 */
export const ChallengeItem = styled(C.ChallengeItem)`
    gap: 10px;
    padding: 6px 8px;
    border-bottom: none;
    border-radius: 8px;
    transition: background-color 0.12s ease;
    &:hover { background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.08 : 0.05)}; }

    .check {
        ${(p) => bubbleCheck(p.$isDone, "18px")}
        padding: 0;
        &:hover { box-shadow: none; border-color: ${(p) => (p.$isDone ? p.theme.colors.primary : ink(p.theme, 0.5))}; }
        svg { width: 11px; height: 11px; }
        @media (hover: none) { width: 22px; height: 22px; }
    }

    .challenge-title { font-size: 0.8125rem; }
`;

export const EmptyText = styled(C.EmptyText)`
    padding: 28px 0;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    letter-spacing: 0;
`;
