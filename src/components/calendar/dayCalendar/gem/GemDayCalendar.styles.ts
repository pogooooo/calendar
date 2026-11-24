import styled, { css } from "styled-components";
import { gemCalendarToday } from "../../gemCalendarStyles";
import { gemPanel } from "@/features/gem/GemLive.styles";
import * as Base from "../celestial/CelestialDayCalendar.styles";

export * from "../celestial/CelestialDayCalendar.styles";

const dayStoneSurface = css`
    background: var(--gem-day-material, var(--gem-pearl-map)) var(--gem-day-material-position, center) / cover no-repeat,
        var(--gem-surface);
`;

const detailPanel = css`
    ${gemPanel}
    --gem-frame: var(--gem-frame-silver);
    border-radius: 10px;
    ${dayStoneSurface}
    html[data-presentation="mobile-app"] &&[data-calendar-panel] {
        ${dayStoneSurface}
    }
`;

export const DateHeader = styled(Base.DateHeader)`
    box-sizing: border-box;
    justify-content: space-between;
    gap: 7px;
    margin: 0 0 8px;
    padding: 7px 12px;
    min-height: 54px;
    flex: none;
    border: 1px solid transparent;
    border-radius: 12px 12px 5px 5px;
    color: var(--gem-ink);
    background: var(--gem-heading-map) center / cover no-repeat padding-box,
        var(--gem-gold-edge) center / cover no-repeat border-box;
    font: 700 clamp(.95rem, 1.3vw, 1.16rem)/1.3 ${p => p.theme.fonts.body};
    font-variant-numeric: tabular-nums;
    letter-spacing: 0;
    & > span { flex: 1; min-width: 0; white-space: normal; overflow-wrap: anywhere; }
    & > hr { display: none; }
    [data-widget] & { min-height: 32px; padding: 3px 6px; }
`;

export const ContentLayout = styled(Base.ContentLayout)`
    gap: 12px;
    padding: 0 2px 4px 0;
    overflow-anchor: none;
    @supports not selector(::-webkit-scrollbar) {
        scrollbar-width: thin;
        scrollbar-color: var(--gem-frame-silver) transparent;
    }
`;

export const TodoCard = styled(Base.TodoCard)`
    ${detailPanel}
    --day-card-ink: var(--gem-ink);
    --day-card-line: color-mix(in srgb, var(--gem-frame-gold) 46%, transparent);
    margin-bottom: 0;
    color: var(--day-card-ink);
    border-color: var(--gem-frame-gold);
    max-height: none;
    flex: 0 0 auto;
    html[data-presentation="mobile-app"] &&[data-day-todo-card] {
        --day-card-ink: var(--gem-ink);
        --day-card-line: var(--gem-line);
        ${dayStoneSurface}
        border: 1px solid var(--gem-line);
    }
`;

export const TodoCardHead = styled(Base.TodoCardHead)`
    flex: none;
    min-height: 40px;
    background: var(--gem-heading);
    border-color: var(--day-card-line);
    color: var(--day-card-ink);
    font: 700 .88rem/1.3 ${p => p.theme.fonts.body};
    i { ${gemCalendarToday} transform: none; }
    .count { color: inherit; }
`;

export const TodoList = styled(Base.TodoList)`
    flex: 0 0 auto;
    &&[data-day-todo-list] { overflow: visible; max-height: none; }
    &:focus-visible { outline: 2px solid var(--day-card-ink); outline-offset: -2px; }
`;

export const TodoRow = styled(Base.TodoRow)`
    flex: none;
    color: var(--day-card-ink);
    border-color: var(--day-card-line);
    .dot { border-radius: 50%; transform: none; }
    && .title, && .time { color: var(--day-card-ink); opacity: 1; }
    && .title {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        white-space: normal;
        overflow-wrap: anywhere;
        font-weight: 650;
    }
    && .time { font: 600 .75rem/1.3 ${p => p.theme.fonts.body}; letter-spacing: 0; color: var(--gem-muted); }
    @media (hover: hover) {
        &:hover { background: var(--gem-hover-wash); box-shadow: inset 3px 0 var(--gem-hover-ring); }
    }
    &:focus-visible { outline: 2px solid var(--day-card-ink); outline-offset: -2px; }
`;

export const ChallengeEmpty = styled(Base.ChallengeEmpty)`
    color: var(--gem-muted);
    opacity: 1;
`;

export const TimelineSection = styled(Base.TimelineSection)`
    ${detailPanel}
    --gem-day-material: var(--gem-timeline-map);
    --gem-day-material-position: 58% 37%;
    min-height: ${p => p.$collapsed ? 0 : "228px"};
`;

export const TimeRow = styled(Base.TimeRow)`
    border-color: var(--day-card-line, var(--gem-line));
    .time-label {
        font: 650 .75rem/1.25 ${p => p.theme.fonts.body};
        font-variant-numeric: tabular-nums;
        color: var(--gem-ink);
        border-color: var(--gem-frame-silver);
        background: color-mix(in srgb, var(--gem-surface) 37%, transparent);
    }
    .time-slots { min-width: 0; padding-inline: 5px; }
`;

export const SlotTodoItem = styled(Base.SlotTodoItem)`
    background: var(--gem-event-track);
    color: var(--gem-slab-ink);
    border-radius: ${p => `${p.$isContinuingPrev ? 0 : 5}px ${p.$isContinuingNext ? 0 : 5}px ${p.$isContinuingNext ? 0 : 5}px ${p.$isContinuingPrev ? 0 : 5}px`};
    .todo-text, .time-drag-handle { color: inherit; }
    .todo-text { font-weight: 650; }
    .time-drag-handle { border-color: #f3d9ed5c; }
    &:focus-visible { outline-color: var(--gem-slab-ink); }
`;

export const SectionToggle = styled(Base.SectionToggle)`
    min-height: 40px;
    font: 700 .84rem/1.25 ${p => p.theme.fonts.body};
    letter-spacing: 0;
    border-bottom-color: var(--gem-frame-silver);
    color: var(--gem-ink);
    &:hover { background: color-mix(in srgb, var(--gem-ink) 5%, transparent); }
`;

export const TimeMoveNotice = styled(Base.TimeMoveNotice)`
    ${detailPanel}
    button { border-radius: var(--gem-radius, 999px); }
`;

export const TimeDragPreview = styled(Base.TimeDragPreview)`
    ${detailPanel}
`;

export const TaskCard = styled(Base.TaskCard)`
    ${detailPanel}
    --gem-day-material: var(--gem-quartz-map);
`;
export const ChallengeCard = styled(Base.ChallengeCard)`
    ${detailPanel}
    --gem-day-material: var(--gem-quartz-map);
    --gem-day-material-position: center 62%;
`;
export const MemoCard = styled(Base.MemoCard)`
    ${detailPanel}
    --gem-day-material: var(--gem-timeline-map);
    textarea { color: var(--gem-ink); }
`;

export const TaskForm = styled(Base.TaskForm)`
    gap: 5px;
    input {
        border: 1px solid transparent;
        border-radius: var(--gem-radius, 999px);
        background: var(--gem-field);
        color: var(--gem-ink);
    }
    input::placeholder { color: var(--gem-muted); }
    button { padding: 0; }
    button:not(:disabled) {
        border: 1px solid transparent;
        border-radius: var(--gem-radius, 999px);
        background: var(--gem-action);
        color: var(--gem-action-ink);
    }
`;
