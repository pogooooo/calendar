import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialProjectBoard.styles";
import { gemstoneHeading, gemstonePanel, gemstonePill, gemstoneSlab } from "@/features/gem/GemWorkspace.styles";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialProjectBoard.styles";
export { SectionTitle, SectionWrapper } from "../../gem/section";

export const BoardColumn = styled(C.BoardColumn)`
    border-inline-end-color: var(--gem-line);
`;

export const ColumnHeader = styled(C.ColumnHeader)`
    ${gemstoneHeading}
    ${MOBILE} { background: transparent; }
`;

export const ColumnTitle = styled(C.ColumnTitle)`
    color: var(--gem-ink);
    font-size: .9rem;
    font-weight: 700;
`;

export const ColumnPick = styled(C.ColumnPick)`
    ${gemstonePill}
    ${p => p.$on && css`
        ${gemstoneSlab}
        font-weight: 700;
        &:hover:not(:disabled) { color: var(--gem-slab-ink); }
    `}
`;

export const CardBox = styled(C.CardBox)`
    ${gemstonePanel}
    background: var(--gem-record);
    border-radius: 9px;
    @media (hover: hover) {
        &:hover { border-color: var(--gem-hover-ring); box-shadow: var(--gem-hover-shadow), inset 3px 0 var(--gem-hover-ring); }
    }
`;

export const CardTitle = styled(C.CardTitle)`
    .title-text { overflow-wrap: anywhere; }
`;

export const AddTaskButton = styled(C.AddTaskButton)`
    ${gemstonePill}
    ${MOBILE} { min-height: 44px; }
`;

export const CardMoveButton = styled(C.CardMoveButton)`
    ${gemstonePill}
`;
