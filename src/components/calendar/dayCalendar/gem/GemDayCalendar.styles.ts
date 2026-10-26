import styled, { css } from 'styled-components';
import * as C from '../celestial/CelestialDayCalendar.styles';
import { mineralSurface, gemControl, facetArrival } from '../../monthCalendar/gem/GemCalendarMaterial.styles';

export * from '../celestial/CelestialDayCalendar.styles';

const panel = css`
    ${mineralSurface}
    border-radius:7px; position:relative;
    border-top-color:${p => p.theme.colors.accent}75;
`;
const cutMark = css`
    transform:none; border-radius:0;
    clip-path:polygon(25% 0,75% 0,100% 30%,80% 85%,50% 100%,20% 85%,0 30%);
`;

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    min-width:0;
`;
export const DateHeader = styled(C.DateHeader)`
    min-height:48px; gap:10px; margin-bottom:13px; font-size:.79rem; letter-spacing:0;
    & > span { min-width:0; overflow:hidden; text-overflow:ellipsis; }
    & > hr { border-top-color:${p => p.theme.colors.accent}66; }
    @media(max-width:768px) { min-height:42px; margin-bottom:10px; & > span { font-size:.78rem; } }
`;
export const DateStamp = styled(C.DateStamp)`
    display:flex; flex-direction:column; flex:none; align-items:center; justify-content:center; gap:1px;
    width:40px; min-height:44px; padding:4px 3px; position:relative;
    font-family:${p => p.theme.fonts.numeral}; font-size:1.55rem; line-height:1; letter-spacing:-.05em; color:${p => p.theme.colors.primary};
    background:linear-gradient(145deg,${p => p.theme.gemColor ?? p.theme.colors.primary}18,transparent 72%);
    border:1px solid ${p => p.theme.colors.accent}66; border-radius:9px 3px;
    small { font-family:${p => p.theme.fonts.body}; font-size:.49rem; line-height:1.15; text-transform:uppercase; letter-spacing:.12em; color:${p => p.theme.colors.textSecondary}; }
    [data-widget] & { display:none; }
`;
export const ContentLayout = styled(C.ContentLayout)`
    padding:0 1px 2px;
`;
export const TimelineSection = styled(C.TimelineSection)`${panel}`;
export const TaskCard = styled(C.TaskCard)`${panel}`;
export const ChallengeCard = styled(C.ChallengeCard)`${panel}`;
export const TodoCard = styled(C.TodoCard)`${panel}`;
export const MemoCard = styled(C.MemoCard)`
    ${panel}
    textarea { line-height:1.75; background:transparent; caret-color:${p => p.theme.colors.primary}; }
    textarea:focus { box-shadow:inset 2px 0 0 ${p => p.theme.colors.primary}55; }
`;
export const SectionToggle = styled(C.SectionToggle)`
    padding:10px 12px; font-family:${p => p.theme.fonts.body}; font-size:.78rem; font-weight:600;
    border-bottom-color:${p => p.theme.colors.border}; letter-spacing:.01em;
    background:linear-gradient(90deg,${p => p.theme.colors.accent}07,transparent 65%);
    .chev { color:${p => p.theme.colors.primary}; }
    .count { font-family:${p => p.theme.fonts.numeral}; color:${p => p.theme.colors.textSecondary}; }
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:-3px; }
`;
export const TodoCardHead = styled(C.TodoCardHead)`
    padding:10px 12px; border-color:${p => p.theme.colors.border}; font-family:${p => p.theme.fonts.body}; font-size:.78rem; font-weight:600;
    background:linear-gradient(90deg,${p => p.theme.colors.accent}07,transparent 65%);
    i { ${cutMark} width:9px; height:11px; border:0; background:linear-gradient(135deg,${p => p.theme.colors.accent},${p => p.theme.colors.primary}); }
`;
export const TimeRow = styled(C.TimeRow)`
    border-bottom-color:${p => p.theme.colors.border};
    .time-label { width:46px; font-family:${p => p.theme.fonts.body}; font-variant-numeric:tabular-nums; font-size:max(11px,.72rem); font-weight:500; letter-spacing:-.02em; color:${p => p.theme.colors.textSecondary}; border-right-color:${p => p.theme.colors.border}; }
    .time-slots { padding:6px 10px; }
    .slot-box:hover { background:${p => p.theme.colors.primary}12; }
`;
export const SlotTodoItem = styled(C.SlotTodoItem)`
    box-shadow:none; font-family:${p => p.theme.fonts.body};
    border-radius:${p => p.$isContinuingPrev ? 0 : '3px'} ${p => p.$isContinuingNext ? 0 : '3px'} ${p => p.$isContinuingNext ? 0 : '3px'} ${p => p.$isContinuingPrev ? 0 : '3px'};
    opacity:${p => p.$isDone ? .7 : 1};
`;
export const ResizeHandle = styled(C.ResizeHandle)`
    height:12px; gap:4px;
    span { width:3px; height:3px; border-radius:0; rotate:45deg; background:${p => p.theme.colors.accent}70; }
`;
export const TodoRow = styled(C.TodoRow)`
    border-bottom-color:${p => p.theme.colors.border}; border-radius:4px; padding:8px;
    .dot { ${cutMark} width:8px; height:10px; }
    .title { font-size:.8rem; opacity:1; color:${p => p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text}; }
    .time { font-family:${p => p.theme.fonts.numeral}; font-size:.68rem; letter-spacing:0; }
    &:hover { background:${p => p.theme.colors.primary}08; }
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:-2px; }
    :where(html[data-theme-motion="full"]) & { animation:${facetArrival} .28s ease both; transition:background .2s ease; }
`;
export const ChallengeItem = styled(C.ChallengeItem)`
    .box { border-radius:4px 1px; border-color:${p => p.theme.colors.primary}85; box-shadow:${p => p.$isDone ? `0 2px 8px ${p.theme.colors.primary}20` : 'none'}; }
    .title { font-size:.8rem; opacity:1; color:${p => p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text}; }
`;
export const TaskItem = styled(C.TaskItem)`
    .check-btn { border-radius:4px 1px; border-color:${p => p.theme.colors.primary}85; }
    .task-text { font-size:.8rem; }
    &:hover { background:${p => p.theme.colors.primary}09; }
    :where(html[data-theme-motion="full"]) & { animation:${facetArrival} .25s ease both; }
`;
export const TaskForm = styled(C.TaskForm)`
    border-top-color:${p => p.theme.colors.border};
    input { min-width:0; border-color:${p => p.theme.colors.border}; border-radius:5px; background:${p => p.theme.colors.primary}03; }
    input:focus { box-shadow:0 0 0 2px ${p => p.theme.colors.primary}13; }
    button { ${gemControl} }
`;
export const ChallengeEmpty = styled(C.ChallengeEmpty)`
    padding:15px 12px; font-family:${p => p.theme.fonts.body}; font-size:.73rem; line-height:1.6; letter-spacing:0;
`;
