import styled from "styled-components";

export const Split = styled.div`
    display: grid;
    width: 100%;
    height: 100%;
    min-height: 0;
    min-width: 0;
    margin-inline: auto;
    max-width: 1600px;
    grid-template-columns: minmax(0, var(--first)) 18px minmax(0, var(--last));
    grid-template-rows: minmax(0, 1fr);
    grid-template-areas: "month divider day";
    &[data-day-first] { grid-template-areas: "day divider month"; }
    > [data-calendar-region="month"] { grid-area: month; }
    > [data-calendar-region="day"] { grid-area: day; }
    > [role="separator"] { grid-area: divider; }
    &[data-stack] {
        grid-template-areas: "month" "divider" "day";
        &[data-day-first] { grid-template-areas: "day" "divider" "month"; }
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, var(--first)) 18px minmax(0, var(--last));
    }
    & > [data-calendar-region] { min-width: 0; min-height: 0; overflow: auto; }
    &&:has([data-day-focus]) {
        grid-template: "day" minmax(0, 1fr) / minmax(0, 1fr);
        > [data-calendar-region="month"], > [role="separator"] { display: none; }
    }
`;

export const Divider = styled.div`
    position: relative;
    display: grid;
    place-items: center;
    cursor: col-resize;
    touch-action: none;
    user-select: none;
    color: ${p=>p.theme.colors.textSecondary};
    &::before, &::after { content: ""; grid-area: 1 / 1; background: currentColor; border-radius: 4px; }
    &::before { width: 1px; height: 100%; opacity: .25; }
    &::after { width: 4px; height: 36px; }
    &[aria-orientation="horizontal"] {
        cursor: row-resize;
        &::before { width: 100%; height: 1px; }
        &::after { width: 36px; height: 4px; }
    }
    &:hover, &:focus-visible, &:active { color: ${p=>p.theme.colors.primary}; }
    &:focus-visible { outline-offset: -2px; }
`;
