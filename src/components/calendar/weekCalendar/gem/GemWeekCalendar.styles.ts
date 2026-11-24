import styled from "styled-components";
import { gemCalendarNav, gemTodayInlay, gemEventTrack } from "../../gemCalendarStyles";
import { gemIconSize } from "@/features/gem/GemLive.styles";
import * as Base from "../celestial/CelestialWeekCalendar.styles";

export * from "../celestial/CelestialWeekCalendar.styles";

export const DateRangeDisplay = styled(Base.DateRangeDisplay)`
    min-height: 35px;
    gap: 5px;
    margin-bottom: 6px;
    letter-spacing: 0;
    font: 650 .95rem/1.1 ${p => p.theme.fonts.body};
    font-variant-numeric: tabular-nums;
    color: var(--gem-ink);
    [data-widget] & { font-size: .8rem; color: ${p => p.theme.colors.text}; }
`;

export const ArrowWrapper = styled(Base.ArrowWrapper)`
    ${gemCalendarNav}
    ${gemIconSize}
    &:hover { filter: none; }
    [data-widget] & { --gem-control-size: 27px; }
`;

export const DateLine = styled(Base.DateLine)`
    min-width: 0;
    background: var(--gem-gold-edge);
    &::before, &::after { display: none; }
`;

export const CalendarWindow = styled(Base.CalendarWindow)`
    width: 100%;
    margin: 0;
    padding: 0;
    background: var(--gem-panel);
    border-radius: 9px;
    [data-widget] & {
        height: 100%;
        background: transparent;
        --gem-ink: ${p => p.theme.colors.text};
    }
`;

export const Header = styled(Base.Header)`
    position: relative;
    --gem-frame-inset: 2px;
    --gem-frame-corner: 10px;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    border-color: var(--gem-line);
    &::before, &::after { display: none; }
`;

export const DayNameBox = styled(Base.DayNameBox)`
    ${gemTodayInlay}
    gap: 4px;
    height: 33px;
    border-color: var(--gem-line);
    .day-name { color: var(--gem-ink); font: 650 .74rem/1.15 ${p => p.theme.fonts.body}; }
    .day-mark.done { box-shadow: none; }
    &::before { display: none; }
    &[aria-current="date"] .day-name { font-weight: 800; }
    [data-widget] & { height: 24px; }
`;

export const BarContainer = styled(Base.BarContainer)`
    grid-template-columns: repeat(7, minmax(0, 1fr));
    border-color: var(--gem-line);
    &::before, &::after { display: none; }
`;

export const DaySlot = styled(Base.DaySlot)`
    border-color: var(--gem-line);
    border-left: 0;
    @media (any-hover: hover) {
        &&:hover .add-btn { opacity: 1; pointer-events: auto; }
    }
    && .add-btn:focus-visible { opacity: 1; pointer-events: auto; }
`;

export const AddTodoButton = styled(Base.AddTodoButton)`
    position: static;
    flex: none;
    align-self: flex-end;
    margin: 3px 3px 0;
    width: 18px;
    height: 18px;
    padding: 0;
    border-radius: 50%;
    border-color: var(--gem-frame-silver);
    background: var(--gem-control);
    color: var(--gem-ink);
    pointer-events: none;
    transition: none;
    &:hover { transform: none; }
    svg { width: 12px; height: 12px; }
`;

export const TodoBarList = styled(Base.TodoBarList)`
    margin-top: 3px;
    gap: 3px;
`;

export const TodoBarItem = styled(Base.TodoBarItem)`
    ${gemEventTrack}
    align-items: center;
    clip-path: none;
    height: 22px;
    margin-inline: ${p => p.$isStart ? "3px" : "0"} ${p => p.$isEnd ? "3px" : "-1px"};
    font-family: ${p => p.theme.fonts.body};
    .todo-title { opacity: 1; }
`;

export const TodoBarSpacer = styled(Base.TodoBarSpacer)`height: 22px;`;
