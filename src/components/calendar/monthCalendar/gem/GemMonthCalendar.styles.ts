import styled, { css } from "styled-components";
import { MOBILE, NOT_WIDGET, TOUCH } from "@/styles/breakpoints";
import { gemCalendarCompactButton, gemCalendarCompactIcon, gemTodayInlay, gemEventTrack } from "../../gemCalendarStyles";
import * as Base from "../celestial/CelestialMonthCalendar.styles";

export * from "../celestial/CelestialMonthCalendar.styles";

export const HeaderFrame = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 7px 13px;
    width: 100%;
    padding: 9px 12px;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: 13px 13px 0 0;
    color: var(--gem-ink);
    /* Broad polished faces at the heading; finer quartz belongs to the calendar below. */
    background: var(--gem-heading-map) center / cover no-repeat padding-box,
        var(--gem-gold-edge) center / cover no-repeat border-box;
    [data-widget] & {
        padding: 3px 5px; border-radius: 6px 6px 0 0; gap: 3px;
        background: var(--gem-heading-map) center / cover no-repeat padding-box, var(--gem-gold-edge) center / cover no-repeat border-box;
    }
    @media (max-width: 580px) {
        padding: 5px 6px;
        gap: 4px;
    }
    html[data-presentation="mobile-app"] &&[data-calendar-header] {
        margin-bottom: 0;
        padding: 3px 4px;
    }
`;

export const DateRangeDisplay = styled(Base.DateRangeDisplay)`
    width: auto;
    gap: 6px;
    && { margin: 0; }
    color: var(--gem-ink);
    font: 700 clamp(1rem, 1.55vw, 1.45rem)/1.25 ${p => p.theme.fonts.body};
    font-variant-numeric: tabular-nums;
    letter-spacing: -.035em;
    & > button { transition: none; }
    && .nav-btn {
        ${gemCalendarCompactIcon}
        transition: none;
        &:hover { transform: none; }
    }
    [data-widget] & {
        gap: 3px; margin: 0; font-size: .9rem;
    }
    @media (max-width: 390px) {
        gap: 3px;
        ${NOT_WIDGET} & { flex: 1; flex-wrap: wrap; min-width: 0; }
    }
`;

export const TodayButton = styled(Base.TodayButton)`
    && { ${gemCalendarCompactButton} }
    padding: 0 8px;
    font: 650 .7rem/1.1 ${p => p.theme.fonts.body};
    letter-spacing: 0;
    &:disabled { opacity: .72; }
    ${TOUCH} { min-width: 44px; }
`;

export const CalendarWindow = styled(Base.CalendarWindow)`
    box-sizing: border-box;
    border: 1px solid var(--gem-frame-gold);
    border-top: 0;
    border-radius: 0 0 13px 13px;
    color: var(--gem-ink);
    background: var(--gem-calendar-quartz-glaze), var(--gem-calendar-quartz-map) center / cover no-repeat,
        var(--gem-calendar-quartz-base);
    background-blend-mode: normal, var(--gem-calendar-quartz-blend);
    [data-widget] & {
        border-radius: 0; border-inline: 0; border-block-end: 0;
        background: transparent;
        --gem-ink: ${p => p.theme.colors.text};
        --gem-muted: ${p => p.theme.colors.textSecondary};
        --gem-calendar-adjacent-ink: ${p => p.theme.colors.textSecondary};
    }
`;

export const Header = styled(Base.Header)`
    flex: none;
    border: 0;
    background: color-mix(in srgb, var(--gem-surface) 31%, transparent);
    &::after { display: none; }
`;

export const DayNameBox = styled(Base.DayNameBox)`
    height: 30px;
    border: 0;
    color: var(--gem-ink);
    .day-name { font: 650 .76rem/1.15 ${p => p.theme.fonts.body}; letter-spacing: 0; }
    &:first-child, &:last-child { color: ${p => p.theme.colors.weekend}; }
    [data-widget] & { height: 22px; .day-name { font-size: .62rem; } }
`;

export const GridContainer = styled(Base.GridContainer)`
    position: relative;
    --gem-frame-inset: 3px;
    border: 0;
    isolation: isolate;
    grid-template-rows: repeat(6, minmax(56px, 1fr));
    ${MOBILE} { --gem-frame-inset: 2px; --gem-frame-corner: 10px; }
    [data-widget] & { --gem-frame-inset: 2px; --gem-frame-corner: 10px; }
    html[data-presentation="mobile-app"] &&[data-month-grid] {
        background: color-mix(in srgb, var(--gem-surface) 13%, transparent);
    }
`;

export const WeekRowContainer = styled(Base.WeekRowContainer)`
    grid-template-columns: repeat(7, minmax(0, 1fr));
    border: 0;
    container-type: inline-size;
`;

export const DayCell = styled(Base.DayCell)`
    ${gemTodayInlay}
    opacity: 1;
    transition: none;
    border: 0;
    background-color: ${p => p.$isCurrentMonth ? "transparent" : "var(--gem-adjacent-cell)"};
    &, &:hover { box-shadow: none; }
    html[data-presentation] &&[data-selected] {
        box-shadow: none;
    }
    &&[data-selected] { background-image: linear-gradient(var(--gem-calendar-selection), var(--gem-calendar-selection)); }
    &::before {
        content: "";
        position: absolute;
        inset: 2px 3px 4px;
        z-index: 0;
        pointer-events: none;
        border-radius: 8px;
        border: 1px solid var(--gem-frame-silver);
        background: var(--gem-calendar-lift);
        box-shadow: var(--gem-calendar-lift-shadow);
        opacity: 0;
        transition: opacity .14s ease-out;
    }
    @media (any-hover: hover) { &:hover::before { opacity: 1; } }
    ${p => p.$dropTarget && css`
        && { outline: 2px solid var(--gem-ink); outline-offset: -2px; }
    `}
    &:focus-visible { outline: 2px solid var(--gem-ink); outline-offset: -2px; z-index: 2; }
    .day-header {
        min-height: 30px;
        padding: 1px 6px 3px;
        justify-content: flex-start;
        gap: 5px;
        align-content: center;
    }
    .day-header .day-number {
        box-sizing: border-box;
        display: inline-flex;
        justify-content: center;
        min-width: 28px;
        color: ${p => p.$isCurrentMonth || p.$isSelected ? "var(--gem-ink)" : "var(--gem-calendar-adjacent-ink)"};
        font: 650 .9rem/1.2 ${p => p.theme.fonts.body};
        font-variant-numeric: lining-nums tabular-nums;
    }
    &&[aria-current="date"] .day-number { font-weight: 800; }
    [data-gem-month] { font: 650 .625rem/1.12 ${p => p.theme.fonts.body}; color: var(--gem-calendar-adjacent-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    [data-gem-month] { margin-inline-end: auto; }
    && .add-btn { opacity: 0; pointer-events: none; }
    @media (any-hover: hover) {
        &&:hover .add-btn { opacity: 1; pointer-events: auto; }
    }
    && .add-btn:focus-visible { opacity: 1; pointer-events: auto; }
    ${MOBILE} {
        .day-header { min-height: 30px; gap: 3px; padding: 1px 3px 3px; }
        .day-header .day-number { font-size: .8rem; }
    }
    @media (max-width: 360px) {
        ${NOT_WIDGET} &&:has([data-gem-month]) .day-header {
            flex-wrap: wrap; align-content: start; gap: 2px;
            min-height: 33px; flex-basis: 33px; height: auto;
        }
    }
    [data-widget] & .day-header { min-height: 25px; gap: 3px; padding: 1px 3px 2px; }
    [data-widget] & .day-header .day-number { font-size: .76rem; min-width: 20px; }
    [data-widget] & [data-gem-month] { font-size: .55rem; }
    @container (max-width: 320px) {
        [data-widget] & .day-header { gap: 1px; padding-inline: 1px; }
        [data-widget] & .day-header .day-number { font-size: .7rem; }
        [data-widget] & [data-gem-month] { display: none; }
    }
    @media (max-height: 420px) {
        [data-widget] & .day-header > :first-child { flex: 0 1 auto; }
    }
`;

export const DayHeaderLeft = styled(Base.DayHeaderLeft)`
    flex: 0 1 auto;
    &[data-date-select] {
        flex: 1 1 auto;
        align-self: stretch;
        padding: 0;
        border: 0;
        border-radius: 5px;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        min-width: 0;
    }
    &[data-date-select]:focus-visible { outline-offset: -1px; }
`;

export const AddTodoButton = styled(Base.AddTodoButton)`
    position: static;
    flex: 0 0 auto;
    margin-inline-start: auto;
    padding: 0;
    border-radius: 50%;
    border-color: var(--gem-frame-silver);
    background: var(--gem-control);
    color: var(--gem-ink);
    transition: none;
    &:hover { transform: none; border-color: var(--gem-frame-gold); }
    svg { width: 12px; height: 12px; }
    [data-widget] & { width: 14px; height: 14px; svg { width: 10px; height: 10px; } }
    @container (max-width: 320px) {
        [data-widget] & { width: 12px; height: 12px; }
    }
`;

export const TodoBarList = styled(Base.TodoBarList)`
    margin-block: 2px;
    overflow: visible;
    z-index: auto;
    [data-widget] & { overflow: hidden; }
`;

export const TodoBarItem = styled(Base.TodoBarItem)`
    /* Sample one continuous cut across the week instead of restarting the texture in each cell. */
    --gem-track-position: calc(-100cqw * var(--col, 0) / 7 - ${p => p.$isStart ? "4px" : "0px"}) 58%;
    --gem-track-size: max(320px, 100cqw) auto;
    ${gemEventTrack}
    height: 21px;
    margin-inline-end: ${p => p.$isEnd ? "4px" : "0"};
    font: 650 .73rem/1.1 ${p => p.theme.fonts.body};
    & .todo-title { padding-inline: 7px 4px; }
    ${NOT_WIDGET} &[data-gem-title-span] > .todo-title {
        position: absolute;
        z-index: 2;
        inset-inline-start: 0;
        box-sizing: border-box;
        width: calc(var(--gem-title-span) * (100cqw / 7) - 11px);
        pointer-events: none;
    }
    &[data-dragging] { opacity: .55; }
    ${MOBILE} {
        ${NOT_WIDGET} && {
            ${gemEventTrack}
            width: 100%; height: 16px; margin: 0; transform: none; overflow: hidden; touch-action: pan-y;
            & .todo-title { display: block; padding-inline: 4px; font-size: .64rem; }
            & > :not(.todo-title) { display: none; }
            &[data-gem-title-span] { overflow: visible; }
        }
    }
`;

export const TodoBarSpacer = styled(Base.TodoBarSpacer)`height: 21px;`;

export const RangeHandle = styled(Base.RangeHandle)`
    color: #fff3ee;
    border-radius: var(--gem-radius, 999px);
    opacity: 0;
    [data-month-bar]:hover &, &:focus-visible { opacity: .85; }
`;

export const MoreButton = styled(Base.MoreButton)`
    border-radius: var(--gem-radius, 999px);
    color: var(--gem-ink);
    font-weight: 650;
    &:hover { background: color-mix(in srgb, var(--gem-line) 26%, transparent); }
    &:focus-visible { outline: 2px solid var(--gem-ink); outline-offset: -1px; }
`;

export const CompactTaskCount = styled(Base.CompactTaskCount)`
    ${MOBILE} {
        ${NOT_WIDGET} && {
            display: grid;
            place-items: center;
            position: static;
            align-self: flex-start;
            margin: 0 3px 2px;
            min-width: 21px;
            height: 16px;
            padding-inline: 4px;
            border: 1px solid var(--gem-frame-silver);
            border-radius: var(--gem-radius);
            background: var(--gem-action);
            color: var(--gem-action-ink);
            font: 650 .65rem/1 ${p => p.theme.fonts.body};
        }
    }
    @media (max-height: 420px) {
        [data-widget] & {
            top: auto;
            bottom: 2px;
            border-radius: var(--gem-radius);
            background: var(--gem-record);
        }
    }
`;
