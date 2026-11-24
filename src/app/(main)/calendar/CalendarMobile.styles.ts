import styled from 'styled-components';

/** Phone geometry is shared; each theme still paints its own paper, water and metal. */
export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 100%;
    min-width: 0;
    padding-bottom: 12px;

    @media (any-hover: hover) {
        html[data-presentation="desktop-app"] &:not(:hover) [data-calendar-add]:not(:focus-visible) { opacity: 0; pointer-events: none; }
    }

    && [data-week-strip] { padding-block: 0 4px; }
    && [data-week-navigation] button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; min-width: 44px; padding-block: 0; }
    && [data-week-strip] [role='tablist'] { grid-template-columns: repeat(7, minmax(0, 1fr)); }
    && [data-week-strip] [role='tab'] {
        box-sizing: border-box; min-width: 0; min-height: 60px; padding: 5px 0;
        display: grid; grid-template-rows: auto auto .75rem;
        place-items: center; align-content: center; gap: 2px; line-height: 1;
        .name { line-height: 1.1; white-space: nowrap; }
        .num { display: inline-grid; place-items: center; padding: 0; margin: 0; height: 1.4em; line-height: 1; }
        .dots { display: flex; align-items: center; justify-content: center; min-height: 0; max-width: 100%; margin: 0; gap: 2px; line-height: 1; white-space: nowrap; }
        .dots i { max-width: .35rem; }
        .dots em { font-size: .6rem; line-height: 1; }
    }

    && [data-month-grid] {
        height: max(336px, calc(6 * (var(--month-date-size, 25px) + 1.05rem + 18px)));
        max-height: none;
        grid-template-rows: repeat(6, minmax(0, 1fr));
        overflow: hidden;
    }
    && [data-month-cell] {
        overflow: hidden;
        .day-header { height: var(--month-date-size, 25px); min-height: var(--month-date-size, 25px); flex-basis: var(--month-date-size, 25px); padding: 0 3px; }
        .day-number { font-family:${({theme}) => theme.fonts.body}; font-size: .875rem; font-weight:550; font-variant-numeric:tabular-nums; line-height: 24px; height: 25px; }
    }
    && [data-month-bars] {
        display: flex; flex-direction: column; flex-wrap: nowrap;
        gap: 1px; margin: 0; padding: 0 2px 1px; overflow: hidden;
    }
    && [data-month-bars]:has([data-lunar-track]) { padding-inline: 0; }
    && [data-month-bar] {
        display: flex; align-items: center; width: 100%; height: .95rem; min-height: .95rem;
        margin: 0; padding: 0; transform: none; clip-path: none; border: 0; border-radius: 2px;
        background: color-mix(in srgb, var(--event-color) 18%, ${({theme}) => theme.colors.background});
        box-shadow: inset 2px 0 var(--event-color);
        font-size: .66rem; line-height: .95rem; touch-action: pan-y;
        &::before, &::after { display: none; }
        .todo-title { display: block; padding: 0 3px 0 5px; font-family:${({theme}) => theme.fonts.body}; color: ${({theme}) => theme.colors.text}; }
        & > :not(.todo-title, .lunar-viewport) { display: none; }
        &[data-lunar-track] { height: 1.05rem; }
        &[data-done] { opacity: .55; background: transparent; }
    }
    && [data-month-more] { min-height: 13px; height: 13px; line-height: 13px; font-size: 9px; margin: 0; }
    && button[aria-haspopup] { min-width:44px; min-height:44px; }
    && [data-day-peek] { flex: none; min-height: 144px; margin-top: 2px; }
    && [data-day-peek-head] { padding-right: 0; min-height: 44px; gap: 8px; font-size: .85rem; letter-spacing: .025em; }
    && [data-day-peek-list] { overflow: visible; padding-bottom: 12px; }
    && [data-day-peek-row] {
        min-height: 52px; padding: 8px 2px; align-items: center; gap: 10px; font-size: .9rem;
        .name { white-space: normal; overflow-wrap: anywhere; line-height: 1.45; }
        em { font-family:${({theme}) => theme.fonts.body}; font-size:12px; font-weight:500; letter-spacing: 0; }
    }
    && [data-day-todo-row] {
        min-height:52px; padding:8px 10px; align-items:center; gap:10px;
        .title { font-size:.9rem; white-space:normal; overflow-wrap:anywhere; line-height:1.45; }
        .time { font-family:${({theme}) => theme.fonts.body}; font-size:.75rem; }
    }
    && [data-calendar-panel] > button { min-height:44px; font-size:.85rem; letter-spacing:.02em; }
    && [data-calendar-panel='timeline']:has(> button[aria-expanded='true']) { height:264px; }
    &&& [data-day-calendar][data-day-focus] {
        height: max(300px, calc(100dvh - 15rem - var(--native-inset-top, 0px) - var(--native-inset-bottom, 0px)));
    }
    &&& [data-day-focus] [data-calendar-panel] { height: auto; }
    && [data-calendar-panel='task'] { height:auto; min-height:0; }
    && [data-calendar-panel='task'] form { min-height:48px; padding-block:2px; align-items:center; }
    && [data-calendar-panel='task'] form button { width:44px; min-height:44px; }
    && [data-calendar-panel='memo'] textarea { font-size:16px; }

    :where(html[data-theme-family='gem']) && [data-month-cell] .day-number {
        height: auto;
        line-height: 1.1;
    }
    :where(html[data-theme-family='gem']) && [data-month-grid] { height: clamp(258px, 39dvh, 300px); }
    :where(html[data-theme-family='gem']) && [data-month-bars] { display: none; }
    :where(html[data-theme-family='gem']) && [data-month-cell] .add-btn { display: none; }
    :where(html[data-theme-family='gem']) && [data-month-cell] .day-number { min-width: 16px; }
    :where(html[data-theme-family='gem']) && [data-month-cell][aria-current='date'] .day-number { text-decoration: none; }
    :where(html[data-theme-family='gem']) && [data-gem-month] { font-size: .58rem; flex: 0 0 auto; }
`;

export const Toolbar = styled.div`
    display: flex; align-items: stretch; gap: 10px; flex: none;
    & > [role='tablist'] { flex: 1; min-width: 0; padding-block: 3px; }
    && [role='tab'] { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-height: 44px; padding: 6px 2px; line-height: 1.2; font-size: .8rem; letter-spacing: 0; }
    && [data-calendar-add] {
        position: relative; inset: auto; z-index: auto; flex: 0 0 auto;
        display: inline-flex; align-items: center; justify-content: center; line-height: 1.2;
        width: auto; min-width: 98px; min-height: 44px; height: auto; padding: 0 12px; gap: 5px;
        border-radius: 10px; font-family: inherit; font-size: .8rem; font-weight: 600;
        animation: none;
        svg { width: 18px; height: 18px; }
    }
`;

export const Pane = styled.div<{ $day: boolean }>`
    display: flex; flex-direction: column; min-width: 0;
    flex: ${({$day}) => $day ? '1 0 auto' : 'none'};
    min-height: 0;
`;

export const MonthArea = styled.div`
    display: flex; flex-direction: column; min-width: 0; flex: none;
`;
