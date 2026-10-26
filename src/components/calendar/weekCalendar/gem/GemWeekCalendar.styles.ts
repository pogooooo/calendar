import styled, { css } from 'styled-components';
import * as C from '../celestial/CelestialWeekCalendar.styles';
import { gemstoneNumeral, mineralSurface, gemControl } from '../../monthCalendar/gem/GemCalendarMaterial.styles';

export * from '../celestial/CelestialWeekCalendar.styles';

export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    min-height:38px; gap:10px; font-size:.83rem; letter-spacing:.015em; margin-bottom:12px;
    [data-widget] & { font-size:.85rem; font-weight:600; }
`;
export const DateLine = styled(C.DateLine)`
    background:linear-gradient(90deg,${p => p.theme.colors.accent}80,${p => p.theme.colors.accent}18);
    &::before,&::after { display:none; }
`;
export const ArrowWrapper = styled(C.ArrowWrapper)`
    color:${p => p.theme.colors.primary}; svg { max-width:50px; }
`;
export const CalendarWindow = styled(C.CalendarWindow)`
    ${mineralSurface}
    width:100%; margin:0; padding:5px; border-radius:8px;
    [data-widget] & { height:100%; }
`;
export const Header = styled(C.Header)`
    border:0; border-bottom:1px solid ${p => p.theme.colors.accent}70;
    background:linear-gradient(90deg,transparent,${p => p.theme.colors.accent}08,transparent);
    &::before,&::after { display:none; }
`;
export const DayNameBox = styled(C.DayNameBox)`
    height:48px; border-right:1px solid ${p => p.theme.colors.border};
    .day-name { font-family:${p => p.theme.fonts.body}; font-size:.7rem; font-weight:600; letter-spacing:.08em; }
    &::before,&::after { display:none; }
    .day-mark { background:${p => p.theme.colors.accent}; height:2px; border:0; border-radius:1px; }
    ${p => p.$isToday && css`.day-name { ${gemstoneNumeral} font-size:.67rem; width:34px; height:32px; letter-spacing:0; }`}
    [data-widget] & { height:39px; }
`;
export const BarContainer = styled(C.BarContainer)`
    border:0; height:148px;
    &::before,&::after { display:none; }
`;
export const DaySlot = styled(C.DaySlot)`
    height:148px; border-right-color:${p => p.theme.colors.border};
    background:${p => p.$isToday ? `${p.theme.colors.primary}05` : 'transparent'};
    &:hover { background:${p => p.theme.colors.primary}09; }
`;
export const TodoBarList = styled(C.TodoBarList)`gap:5px; margin-top:12px;`;
export const TodoBarItem = styled(C.TodoBarItem)`
    border:0; border-top:1px solid ${p => p.$isDone ? 'transparent' : `${p.$color ?? p.theme.colors.primary}35`};
    height:25px; min-height:25px; flex-shrink:0; align-items:center;
    margin-left:${p => p.$isStart ? '4px' : 0}; margin-right:${p => p.$isEnd ? '4px' : 0};
    background:${p => p.$isDone ? 'transparent' : `color-mix(in srgb,${p.$color ?? p.theme.colors.primary} 16%,${p.theme.colors.background})`};
    color:${p => p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text};
    font-family:${p => p.theme.fonts.body}; font-size:.7rem;
    box-shadow:${p => p.$isStart ? `inset 2px 0 0 ${p.$color ?? p.theme.colors.primary}` : 'none'};
    clip-path:none;
    &:hover { filter:brightness(${p => p.theme.mode === 'dark' ? 1.12 : .97}); }
    .todo-title { opacity:1; }
    /* The filled event surface needs its original ink; completed transparent rows use widget ink. */
    [data-widget] & {
        color:${p => p.$isDone ? p.theme.colors.textSecondary : (p.theme.baseColors?.text ?? p.theme.colors.text)};
    }
`;
export const AddTodoButton = styled(C.AddTodoButton)`
    ${gemControl}
    width:22px; height:22px; top:3px; left:auto; right:3px; z-index:3;
    &:hover { transform:none; }
    @media(hover:none) { opacity:.55; }
`;
export const TodayIndicator = styled(C.TodayIndicator)`
    left:10px; right:10px; bottom:3px; height:1px; pointer-events:none;
    background:linear-gradient(90deg,transparent,${p => p.theme.colors.accent}88,transparent);
`;
export const MoreButton = styled(C.MoreButton)`
    font-family:${p => p.theme.fonts.body}; font-size:.65rem; color:${p => p.theme.colors.primary};
    &:hover { text-shadow:none; background:${p => p.theme.colors.primary}08; }
`;
export const ModalContainer = styled(C.ModalContainer)`
    border:1px solid ${p => p.theme.colors.accent}75; border-radius:12px; background:${p => p.theme.colors.surface};
`;
export const ModalHeader = styled(C.ModalHeader)`border-bottom-color:${p => p.theme.colors.border}; letter-spacing:0;`;
export const CloseButton = styled(C.CloseButton)`${gemControl}`;
