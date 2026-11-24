import { chartControl, optionRow } from "@/styles/celestial/controls";
import { celestialOnly } from "@/styles/celestial/ornaments";
import styled, { css } from "styled-components";

export const DateActions = styled.div`
    display: flex;
    flex: 0 1 auto;
    min-width: 0;
    align-items: stretch;
    gap: 8px;
    margin-inline-start: auto;

    > div > button[aria-expanded] { height: auto; align-self: stretch; }
    @media (pointer: coarse) { > div > button[aria-expanded] { min-width: 44px; } }
    @container day-pane (max-width: 32rem) { gap: 6px; }
`;

export const FocusPicker = styled.label`
    flex: 0 1 auto;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    white-space: nowrap;
    font: 500 .8rem/1.4 ${p => p.theme.fonts.body};
    color: ${p => p.theme.colors.textSecondary};
    select {
        max-width: 100%;
        min-width: 0;
        align-self: stretch;
        field-sizing: content;
        min-height: 34px;
        padding: 3px 8px;
        font: inherit;
        color: ${p => p.theme.colors.text};
        background: transparent;
        border: 0;
        border-radius: 6px;
    }
    @container day-pane (max-width: 32rem) {
        > span { display: none; }
        max-width: 11em;
    }
    @media (pointer: coarse) { select { min-height: 44px; } }
    ${celestialOnly(css`
        select { ${chartControl} }
        @supports (appearance: base-select) {
            select, select::picker(select) { appearance: base-select; }
            select { align-items: center; gap: 8px; }
            select::picker-icon { padding-inline-start: 2px; color: var(--ce-brass); }
            select::picker(select) {
                margin-block: 3px; padding: 4px;
                background: var(--ce-paper); border: 1px solid var(--ce-brass); border-radius: 3px;
                box-shadow: inset 0 0 0 2px var(--ce-paper), inset 0 0 0 3px var(--ce-line);
            }
            option {
                ${optionRow} padding: 6px 8px;
                &:checked { background: var(--ce-night); color: var(--ce-star); }
                @media (pointer: coarse) { min-height: 44px; }
            }
        }
    `)}
`;

export const focusedDay = css`
    &&[data-day-focus] {
        [data-focus-hidden] { display: none !important; }
        [data-day-content], [data-day-side] {
            display: flex;
            flex-flow: column;
            flex: 1 1 0 !important;
            min-height: 0;
            overflow: hidden;
            margin: 0;
            padding: 0;
        }
        [data-day-todo-card], [data-calendar-panel] {
            flex: 1 1 0 !important;
            min-height: 0;
            max-height: none;
            height: auto;
            margin: 0;
            padding-inline: 0;
            border-right: 0;
        }
        [data-calendar-panel] > button:first-child { display: none; }
        [data-day-todo-list], [data-day-challenge-list] {
            flex: 1 1 0;
            max-height: none;
            overflow-y: auto;
        }
        [data-day-todo-row] { flex-shrink: 0; }
        [data-day-todo-row] .title { display: block; white-space: normal; overflow-wrap: anywhere; }
    }
`;
