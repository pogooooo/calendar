import styled, { css } from "styled-components";
import { gemQuietButton } from "@/features/gem/GemLive.styles";
import { TOUCH } from "@/styles/breakpoints";
import selectionFrame from "@/assets/gem/selection-cell-frame.svg";

export const gemCalendarNav = css`
    ${gemQuietButton}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-block: 0;
    svg { display: block; flex: none; }
    box-shadow: inset 0 1px #d6b9dc40;
    &:focus-visible { outline: 2px solid var(--gem-ink); outline-offset: 2px; }
    &:active { box-shadow: inset 0 0 0 1px var(--gem-gold); }
`;

export const gemCalendarCompactButton = css`
    ${gemCalendarNav}
    --calendar-control-face: 26px;
    --calendar-control-target: var(--calendar-control-face);
    position: relative;
    isolation: isolate;
    box-sizing: border-box;
    min-height: var(--calendar-control-target);
    border: 0;
    background: none;
    box-shadow: none;

    &::before {
        content: "";
        position: absolute;
        inset: calc((100% - var(--calendar-control-face)) / 2) var(--calendar-control-inline-inset, 0px);
        z-index: -1;
        pointer-events: none;
        border: 2px solid transparent;
        border-radius: inherit;
        background: var(--gem-control);
    }
    &::before { background-blend-mode: normal; }
    &:is(:hover, :active) { box-shadow: none; }
    &:is(:hover, :active):not(:disabled)::before { box-shadow: var(--gem-hover-shadow); }
    ${TOUCH} { --calendar-control-target: 44px; }
`;

export const gemCalendarCompactIcon = css`
    ${gemCalendarCompactButton}
    --calendar-control-inline-inset: calc((100% - var(--calendar-control-face)) / 2);
    flex: 0 0 auto;
    width: var(--calendar-control-target);
    height: var(--calendar-control-target);
    min-width: var(--calendar-control-target);
    padding: 0;
    svg { width: 14px; height: 14px; }
`;

export const gemCalendarSelected = css`
    display: inline-block;
    flex: 0 0 auto;
    width: 15px;
    height: 13px;
    box-sizing: border-box;
    border: 5px solid transparent;
    border-image: url("${selectionFrame.src}") 24 / 5px;
    border-radius: 4px;
    outline: 1px solid var(--gem-frame-gold);
    outline-offset: -1px;
    background: none;
    mask: none;
`;

export const GemFrameOverlay = styled.span`
    display: none;
    position: absolute;
    inset: 0 auto auto 0;
    z-index: 4;
    box-sizing: border-box;
    pointer-events: none;
    border: var(--gem-frame-corner, 16px) solid transparent;
    border-image: url("${selectionFrame.src}") 24 / var(--gem-frame-corner, 16px);
    border-radius: 7px;
    outline: 1px solid color-mix(in srgb, var(--gem-frame-gold) 64%, transparent);
    outline-offset: -1px;
`;

/** Date picker range endpoints retain individual frames. */
export const gemSelectedCell = css`
    position: relative;
    &::after {
        content: "";
        display: block;
        position: absolute;
        inset: var(--gem-selection-inset, 3px);
        width: auto;
        height: auto;
        margin: 0;
        transform: none;
        z-index: 1;
        box-sizing: border-box;
        pointer-events: none;
        border: var(--gem-selection-corner, 16px) solid transparent;
        border-image: url("${selectionFrame.src}") 24 / var(--gem-selection-corner, 16px);
        background: none;
        box-shadow: none;
        mask: none;
    }
    [data-widget] & { --gem-selection-corner: 10px; --gem-selection-inset: 2px; }
`;

/** Today is an inlaid metal tab on the top edge; it can coexist with the selection frame. */
export const gemCalendarToday = css`
    display: inline-block;
    flex: none;
    width: 17px;
    height: 4px;
    border: 0;
    border-radius: 999px;
    background: var(--gem-gold-edge) center / cover;
    box-shadow: 0 1px 0 #53355270, 0 -1px 0 var(--gem-frame-silver);
    mask: none;
`;

export const gemTodayInlay = css`
    > .gem-today-inlay {
        ${gemCalendarToday}
        position: absolute;
        z-index: 3;
        top: 3px;
        left: 50%;
        width: clamp(12px, 28%, 28px);
        height: 3px;
        transform: translateX(-50%);
        pointer-events: none;
    }
`;

export const gemEventTrack = css<{ $isStart: boolean; $isEnd: boolean; $color?: string; $isDone?: boolean }>`
    box-sizing: border-box;
    position: relative;
    min-width: 0;
    border: none;
    --calendar-event-radius: ${p => `${p.$isStart ? 7 : 0}px ${p.$isEnd ? 7 : 0}px ${p.$isEnd ? 7 : 0}px ${p.$isStart ? 7 : 0}px`};
    border-radius: var(--calendar-event-radius);
    --calendar-event-background: ${p => p.$isDone
        ? "var(--gem-event-done)"
        : "var(--gem-event-track)"};
    --calendar-event-ink: ${p => p.$isDone ? "var(--gem-event-done-ink)" : "var(--gem-event-ink)"};
    background: var(--calendar-event-background);
    background-position: 0 0, var(--gem-track-position, ${p => p.$isDone ? "left 50%" : "left 46%"});
    background-size: auto, var(--gem-track-size, auto 44px);
    box-shadow: ${p => p.$isStart && p.$color ? `inset 3px 0 ${p.$color}` : "none"};
    color: var(--calendar-event-ink);
    opacity: 1;
    & .todo-title { color: inherit; font-weight: 650; }
    &::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border: 1px solid ${p => p.$isDone ? "#81648270" : "#c5a9ca70"};
        border-inline-start-width: ${p => p.$isStart ? "1px" : "0"};
        border-inline-end-width: ${p => p.$isEnd ? "1px" : "0"};
        border-radius: inherit;
    }
    &:is(:hover, :active, :focus-within, [data-track-hover]) {
        background-color: ${p => p.$isDone ? "var(--gem-event-done-base, #c6adc8)" : "var(--gem-slab)"};
        &::after { border-color: ${p => p.$isDone ? "#69476d" : "#edd1a5"}; }
    }
    &:focus-visible {
        outline: 2px solid ${p => p.$isDone ? "#513255" : "#fff0cd"};
        outline-offset: -2px;
    }
`;
