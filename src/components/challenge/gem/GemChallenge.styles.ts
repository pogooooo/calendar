import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialChallenge.styles";
import { gemstoneAction, gemstoneHeading, gemstonePanel } from "@/features/gem/GemWorkspace.styles";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialChallenge.styles";

const section = css`
    ${gemstonePanel}
    overflow: hidden;
    &::before, &::after { display: none; }
    .timeline-header, .card-header {
        ${gemstoneHeading}
        flex-shrink: 0;
        border-block-end: 1px solid var(--gem-line);
        font-weight: 700;
        color: var(--gem-ink);
    }
`;

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper).attrs(({ className }) => ({ className, "data-theme-layout": "gem-challenge" }))``;
export const DateHeader = styled(C.DateHeader)`
    ${gemstonePanel}
    ${gemstoneHeading}
    padding: 12px clamp(12px, 2vw, 24px);
    font-size: clamp(1.15rem, 2vw, 1.65rem);
    font-weight: 700;
    letter-spacing: -.02em;
    > hr { border: 0; height: 1px; background: var(--gem-gold-edge); }
`;
export const TimelineSection = styled(C.TimelineSection)`
    ${section}
    .timeline-header { flex-wrap: wrap; gap: 8px; }
    .timeline-header .header-actions { flex-wrap: wrap; gap: 6px; }
    .timeline-header .add-header-btn {
        ${gemstoneAction}
        min-height: 42px;
        padding-inline: 12px;
        letter-spacing: 0;
        ${MOBILE} { min-height: 44px; }
    }
`;
export const StickerBoardCard = styled(C.StickerBoardCard)`
    ${section}
    .sticker-content .placeholder { color: var(--gem-muted); }
`;
export const TaskCard = styled(C.TaskCard)`
    ${section}
    overflow-y: auto;
`;
export const ChallengeRow = styled(C.ChallengeRow)`
    border-block-end: 1px solid var(--gem-line);
    box-shadow: ${p => p.$isSelected ? "inset 3px 0 var(--gem-gold)" : "none"};
    background: ${p => p.$isSelected ? "var(--gem-panel)" : "transparent"};
    &:hover { box-shadow: inset 3px 0 var(--gem-gold); }
    .challenge-info { min-width: 0; overflow-wrap: anywhere; }
    .challenge-info .title { font-weight: 700; }
    .challenge-info .title .star-icon { filter: none; }
    .challenge-progress .count {
        font-family: ${p => p.theme.fonts.body};
        font-variant-numeric: tabular-nums;
    }
    .challenge-progress { width: clamp(64px, 24%, 130px); flex-shrink: 0; }
    ${MOBILE} { gap: 8px; padding: 12px; }
`;
export const ProgressBar = styled(C.ProgressBar)`
    border-radius: var(--gem-radius);
    background-color: var(--gem-line);
    .fill { border-radius: inherit; }
`;
export const DetailArea = styled(C.DetailArea)`
    .placeholder { color: var(--gem-muted); }
    .detail-content { overflow-wrap: anywhere; }
    .detail-content .stats { border-block-color: var(--gem-line); }
`;
