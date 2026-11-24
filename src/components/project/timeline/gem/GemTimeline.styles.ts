import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialTimeline.styles";
import { SectionTitle as GemTitle } from "../../gem/section";
import { gemstonePill, gemstoneSlab } from "@/features/gem/GemWorkspace.styles";

export * from "../celestial/CelestialTimeline.styles";
export { SectionWrapper } from "../../gem/section";

export const SectionTitle = styled(GemTitle)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

export const TodayButton = styled(C.TodayButton)`
    ${gemstonePill}
    min-height: 36px;
`;

export const UndatedTasks = styled(C.UndatedTasks)`
    button { ${gemstonePill} }
`;

export const TimelineDateHeader = styled(C.TimelineDateHeader)`
    background: var(--gem-record);
    border-color: var(--gem-line);
`;

export const TimelineGridArea = styled(C.TimelineGridArea)`
    @supports not selector(::-webkit-scrollbar) {
        scrollbar-width: auto;
        scrollbar-color: var(--gem-line) var(--gem-surface);
    }
    &::-webkit-scrollbar { width: 11px; height: 11px; }
    &::-webkit-scrollbar-track, &::-webkit-scrollbar-corner { background: var(--gem-record); }
    &::-webkit-scrollbar-thumb {
        border: 3px solid var(--gem-surface);
        border-radius: 999px;
        background: var(--gem-line);
    }
    &::-webkit-scrollbar-thumb:hover { background: var(--gem-tint-ink); }
`;

export const TaskResizeHandle = styled(C.TaskResizeHandle)`
    width: 12px;
    background: transparent;
    opacity: 0;
    &::after {
        content: ""; position: absolute; width: 2px;
        right: 4px; top: 28%; bottom: 28%; border-radius: 2px;
        background: currentColor; opacity: .38;
    }
    &:hover { background: #d5b9dc18; &::after { opacity: .85; } }
    [data-project-task]:hover &, [data-project-task]:focus-within & { opacity: 1; }
`;

export const DateNumber = styled(C.DateNumber)`
    filter: none;
    ${p => p.$isToday && css`
        color: var(--gem-ink);
        &::after {
            content: "";
            display: inline-block;
            width: 5px;
            height: 5px;
            margin-inline-start: 4px;
            vertical-align: middle;
            border-radius: 50%;
            background: var(--gem-gold-edge);
        }
    `}
`;

export const TaskNode = styled(C.TaskNode)`
    &[data-has-connector] { padding-inline-end: 5px; }
    &[data-has-connector]:is(:hover, :focus-within, :has([aria-pressed="true"])) { padding-inline-end: 27px; }
    border-radius: var(--gem-radius);
    ${p => p.$status !== "done" && css`
        ${gemstoneSlab}
        box-shadow: inset 0 1px #f7d7f037;
        &:hover { ${gemstoneSlab} filter: brightness(1.1); }
    `}
`;

export const MobileConnector = styled(C.MobileConnector)`
    ${gemstonePill}
    &[aria-pressed="true"] { ${gemstoneSlab} }
`;

export const Connector = styled(C.Connector)`
    border: 1px solid #d0bad050;
    background: transparent;
    color: inherit;
    box-shadow: none;
    opacity: 0;
    pointer-events: none;
    [data-project-task]:is(:hover, :focus-within) &, &[aria-pressed="true"] { opacity: 1; pointer-events: auto; }
    &:hover, &[aria-pressed="true"] { background: #d0bad030; }
`;
