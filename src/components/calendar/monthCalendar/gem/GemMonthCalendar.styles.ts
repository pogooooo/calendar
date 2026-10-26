import styled, { css } from 'styled-components';
import * as C from '../celestial/CelestialMonthCalendar.styles';
import { MOBILE, NOT_WIDGET, SAFE_T, SAFE_B } from '@/styles/breakpoints';
import { gemstoneNumeral, mineralSurface, gemControl, facetArrival } from './GemCalendarMaterial.styles';

export * from '../celestial/CelestialMonthCalendar.styles';

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    min-width:0;
`;
export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    font-size:1.3rem; font-weight:500; letter-spacing:-.025em; color:${p => p.theme.colors.text};
    .nav-btn { width:32px; height:32px; padding:0; border-radius:6px; color:${p => p.theme.colors.primary}; }
    .nav-btn:hover { transform:none; background:${p => p.theme.colors.primary}10; }
    .nav-btn:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:2px; }
    ${MOBILE} { font-size:1.05rem; }
`;
export const TodayButton = styled(C.TodayButton)`
    ${gemControl}
    min-height:28px; padding:4px 10px; font-family:${p => p.theme.fonts.body}; font-size:.69rem; letter-spacing:.04em;
    &:disabled { opacity:.42; }
`;
export const CalendarWindow = styled(C.CalendarWindow)`
    ${mineralSurface}
    position:relative; isolation:isolate; border-radius:10px; padding:8px;
    [data-widget] & { padding:3px; border-radius:6px; }
    ${MOBILE} { padding:5px; border-radius:9px; }
`;
export const Header = styled(C.Header)`
    border:0; border-bottom:1px solid ${p => p.theme.colors.accent}66;
    background:linear-gradient(90deg,transparent,${p => p.theme.colors.accent}0A,transparent);
    &::before,&::after { display:none; }
`;
export const DayNameBox = styled(C.DayNameBox)`
    height:38px; border-right:0; color:${p => p.theme.colors.textSecondary};
    .day-name { font-family:${p => p.theme.fonts.body}; font-size:.65rem; font-weight:600; letter-spacing:.18em; }
    &:first-child .day-name { color:${p => p.theme.colors.weekend}; }
    ${MOBILE} { height:30px; .day-name { font-size:.58rem; letter-spacing:.09em; } }
    [data-widget] & { height:25px; .day-name { font-size:.56rem; letter-spacing:.04em; } }
`;
export const GridContainer = styled(C.GridContainer)`
    border:0; border-radius:0 0 4px 4px;
    grid-template-rows:repeat(6,minmax(56px,1fr));
    ${MOBILE} { ${NOT_WIDGET} & {
        grid-template-rows:repeat(6,minmax(0,1fr));
        max-height:min(62dvh,max(210px,calc(100dvh - 400px - ${SAFE_T} - ${SAFE_B})));
    } }
    [data-widget] & { grid-template-rows:repeat(6,minmax(0,1fr)); }
`;
export const WeekRowContainer = styled(C.WeekRowContainer)`
    border-bottom:1px solid ${p => p.theme.colors.border};
    &:last-child { border-bottom:0; }
`;
export const DayCell = styled(C.DayCell)`
    border-right:1px solid ${p => p.theme.colors.border}; min-width:0; min-height:0;
    opacity:${p => p.$isCurrentMonth ? 1 : .43};
    background:${p => p.$isSelected ? `linear-gradient(135deg,${p.theme.colors.primary}13,${p.theme.colors.primary}04)` : 'transparent'};
    box-shadow:${p => p.$isSelected ? `inset 0 0 0 1px ${p.theme.colors.primary}44` : 'none'};
    :where(html:not([data-theme-motion="off"])) & { transition:background .22s ease,box-shadow .22s ease; }
    &:hover { background-color:${p => p.theme.colors.primary}08; box-shadow:inset 0 0 0 1px ${p => p.theme.colors.accent}66; }
    .day-header { position:relative; height:34px; min-height:34px; flex-shrink:0; padding:2px 6px; overflow:visible; }
    .day-header .day-number { position:relative; display:inline-flex; align-items:center; justify-content:center; width:32px; height:30px; font-family:${p => p.theme.fonts.numeral}; font-size:1.15rem; font-weight:500; letter-spacing:-.025em; line-height:1; }
    .today-label { display:none; }
    ${p => p.$isToday && css`
        .day-header .day-number { ${gemstoneNumeral} }
        .today-label { display:block; position:absolute; right:27px; top:14px; font-family:${p => p.theme.fonts.body}; font-size:.48rem; font-weight:600; color:${p => p.theme.colors.primary}; letter-spacing:.06em; }
    `}
    ${p => p.$dropTarget && css`&& { box-shadow:inset 0 0 0 2px ${p.theme.colors.primary}; background-color:${p.theme.colors.primary}16; }`}
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:-3px; }
    @media(max-width:1500px) { .today-label { display:none; } }
    ${MOBILE} {
        .day-header { height:34px; min-height:34px; padding:2px 1px; }
        .day-header .day-number { width:28px; height:28px; font-size:.87rem; }
    }
    [data-widget] & { .day-header { height:28px; min-height:28px; padding:1px 2px; } .day-header .day-number { width:26px; height:25px; font-size:.95rem; font-weight:600; } .today-label { display:none; } }
    @media(max-height:380px) { [data-widget] & { .day-header { height:24px; min-height:24px; padding:0 1px; } .day-header .day-number { height:23px; width:24px; font-size:.75rem; } } }
    @media(max-height:260px) { [data-widget] & { .day-header { height:18px; min-height:18px; } .day-header .day-number { height:17px; width:20px; font-size:.65rem; } } }
    @media(max-width:768px) and (max-height:700px) { ${NOT_WIDGET} & {
        .day-header { height:25px; min-height:25px; padding:1px; }
        .day-header .day-number { width:24px; height:23px; font-size:.78rem; }
    } }
`;
export const DayHeaderLeft = styled(C.DayHeaderLeft)`
    gap:3px; min-width:0;
`;
export const AddTodoButton = styled(C.AddTodoButton)`
    top:8px; right:5px; width:17px; height:17px; border:0; border-radius:4px;
    background:${p => p.theme.colors.primary}08; color:${p => p.theme.colors.primary};
    &:hover { background:${p => p.theme.colors.primary}18; box-shadow:none; }
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; opacity:1; }
    [data-widget] & { top:5px; right:3px; }
`;
export const TodoBarList = styled(C.TodoBarList)`
    /* Leave room for two lines, or a line and More, in a six-row 720px calendar. */
    margin:1px 0 2px; gap:2px; min-height:0;
    ${MOBILE} { margin:2px 0; gap:4px; }
    @media(max-width:768px) and (max-height:700px) { ${NOT_WIDGET} & { margin:0; padding:1px 2px; gap:3px; } }
`;
export const TodoBarItem = styled(C.TodoBarItem)`
    border-radius:${p => p.$isStart ? '3px' : '0'} ${p => p.$isEnd ? '3px 3px' : '0 0'} ${p => p.$isStart ? '3px' : '0'};
    border-top:1px solid ${p => p.$isDone ? 'transparent' : `${p.$color ?? p.theme.colors.primary}30`};
    background:${p => p.$isDone ? 'transparent' : `linear-gradient(100deg,color-mix(in srgb,${p.$color ?? p.theme.colors.primary} 18%,${p.theme.colors.background}),color-mix(in srgb,${p.$color ?? p.theme.colors.primary} 10%,${p.theme.colors.background}))`};
    color:${p => p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text};
    font-family:${p => p.theme.fonts.body}; font-size:.69rem; line-height:18px;
    box-shadow:${p => p.$isStart ? `inset 2px 0 0 ${p.$color ?? p.theme.colors.primary}` : 'none'};
    .todo-title { letter-spacing:.005em; }
    /* Filled event bars retain the app surface, even when widget text follows a custom backdrop. */
    [data-widget] & .todo-title {
        color:${p => p.$isDone ? p.theme.colors.textSecondary : (p.theme.baseColors?.text ?? p.theme.colors.text)};
    }
    :where(html:not([data-theme-motion="off"])) & { transition:filter .18s ease,box-shadow .18s ease,opacity .18s ease; }
    &:hover { filter:brightness(${p => p.theme.mode === 'dark' ? 1.18 : .97}); }
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:1px; }
    ${MOBILE} {
        ${NOT_WIDGET} & {
        border:0; border-radius:0; width:7px; height:8px; min-height:8px; padding:0; box-shadow:none;
        transform:none; clip-path:polygon(25% 0,75% 0,100% 30%,80% 85%,50% 100%,20% 85%,0 30%);
        background:${p => p.$color ?? p.theme.colors.primary}; opacity:${p => p.$isDone ? .38 : 1};
        }
    }
`;
export const MoreButton = styled(C.MoreButton)`
    color:${p => p.theme.colors.primary}; font-size:.61rem; letter-spacing:.01em;
    border:0; border-radius:2px; background:transparent;
    &:hover { background:${p => p.theme.colors.primary}0D; }
`;
export const ModalContainer = styled(C.ModalContainer)`
    background:${p => p.theme.colors.surface}; border:1px solid ${p => p.theme.colors.accent}75; border-radius:12px;
    box-shadow:inset 0 0 0 4px ${p => p.theme.colors.primary}07,0 22px 70px #0004;
`;
export const ModalHeader = styled(C.ModalHeader)`
    border-bottom-color:${p => p.theme.colors.border}; letter-spacing:.02em;
`;
export const CloseButton = styled(C.CloseButton)`
    ${gemControl}
`;
export const MoveNotice = styled(C.MoveNotice)`
    border-color:${p => p.theme.colors.border}; border-radius:6px;
    :where(html[data-theme-motion="full"]) & { animation:${facetArrival} .24s ease both; }
`;
