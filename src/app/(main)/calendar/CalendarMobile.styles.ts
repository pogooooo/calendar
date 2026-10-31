import styled from 'styled-components';

/** Phone geometry is shared; each theme still paints its own paper, water and metal. */
export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 100%;
    min-width: 0;
    padding-bottom: 12px;

    && [data-month-grid] {
        height: clamp(336px, 22rem, 420px);
        max-height: none;
        grid-template-rows: repeat(6, minmax(0, 1fr));
        overflow: hidden;
    }
    && [data-month-cell] {
        overflow: hidden;
        .day-header { height: 25px; min-height: 25px; flex-basis: 25px; padding: 0 3px; }
        .day-number { font-family:${({theme}) => theme.fonts.body}; font-size: .875rem; font-weight:550; font-variant-numeric:tabular-nums; line-height: 24px; height: 25px; }
    }
    && [data-month-bars] {
        display: flex; flex-direction: column; flex-wrap: nowrap;
        gap: 1px; margin: 0; padding: 0 2px 1px; overflow: hidden;
    }
    && [data-month-bar] {
        display: flex; align-items: center; width: 100%; height: .95rem; min-height: .95rem;
        margin: 0; padding: 0; transform: none; clip-path: none; border: 0; border-radius: 2px;
        background: color-mix(in srgb, var(--event-color) 18%, ${({theme}) => theme.colors.background});
        box-shadow: inset 2px 0 var(--event-color);
        font-size: .66rem; line-height: .95rem; touch-action: pan-y;
        &::before, &::after { display: none; }
        .todo-title { display: block; padding: 0 3px 0 5px; font-family:${({theme}) => theme.fonts.body}; color: ${({theme}) => theme.colors.text}; }
        & > :not(.todo-title) { display: none; }
        &[data-done] { opacity: .55; background: transparent; }
    }
    && [data-month-more] { min-height: 13px; height: 13px; line-height: 13px; font-size: 9px; margin: 0; }
    && button[aria-haspopup] { min-width:44px; min-height:44px; }
    && [data-day-peek] { flex: none; min-height: 144px; margin-top: 2px; }
    && [data-day-peek-head] { padding-right: 0; min-height: 48px; gap: 8px; font-size: .85rem; letter-spacing: .025em; }
    && [data-day-peek-list] { overflow: visible; padding-bottom: 12px; }
    && [data-day-peek-row] {
        min-height: 56px; padding: 9px 2px; gap: 10px; font-size: .9rem;
        .name { white-space: normal; overflow-wrap: anywhere; line-height: 1.45; }
        em { font-family:${({theme}) => theme.fonts.body}; font-size:12px; font-weight:500; letter-spacing: 0; }
    }
    && [data-day-todo-row] {
        min-height:56px; padding:10px; gap:10px;
        .title { font-size:.9rem; white-space:normal; overflow-wrap:anywhere; line-height:1.45; }
        .time { font-family:${({theme}) => theme.fonts.body}; font-size:.75rem; }
    }
    && [data-calendar-panel] > button { min-height:44px; font-size:.85rem; letter-spacing:.02em; }
    && [data-calendar-panel='timeline']:has(> button[aria-expanded='true']) { height:264px; }
    && [data-calendar-panel='task'] { height:auto; min-height:0; }
    && [data-calendar-panel='task'] form { min-height:60px; }
    && [data-calendar-panel='task'] form button { width:44px; min-height:44px; }
    && [data-calendar-panel='memo'] textarea { font-size:16px; }
`;

export const Toolbar = styled.div`
    display: flex; align-items: stretch; gap: 10px; flex: none;
    & > [role='tablist'] { flex: 1; min-width: 0; }
    && [role='tab'] { min-height: 44px; padding: 8px 2px; font-size: .8rem; letter-spacing: 0; }
    && [data-calendar-add] {
        position: relative; inset: auto; z-index: auto; flex: 0 0 auto;
        width: auto; min-width: 98px; height: 48px; padding: 0 12px; gap: 5px;
        border-radius: 10px; font-family: inherit; font-size: .8rem; font-weight: 600;
        animation: none;
        svg { width: 18px; height: 18px; }
    }
`;

export const Pane = styled.div<{ $day: boolean }>`
    display: flex; flex-direction: column; min-width: 0;
    flex: ${({$day}) => $day ? '1 0 auto' : 'none'};
    min-height: ${({$day}) => $day ? '65dvh' : '0'};
`;

export const MonthArea = styled.div`
    display: flex; flex-direction: column; min-width: 0; flex: none;
`;
