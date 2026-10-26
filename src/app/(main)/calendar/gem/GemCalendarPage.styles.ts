import styled from 'styled-components';
import * as C from '../celestial/CelestialCalendarPage.styles';
import { gemControl } from '@/components/calendar/monthCalendar/gem/GemCalendarMaterial.styles';

export * from '../celestial/CelestialCalendarPage.styles';

export const PageWrapper = styled(C.PageWrapper)`
    padding:20px 22px 22px; background:transparent;
    @media(max-width:1250px) { padding:18px 20px; }
    @media(max-width:768px) { padding:0; }
`;
export const CalendarContainer = styled(C.CalendarContainer)`
    gap:${p => p.$collapsed ? '16px' : '28px'};
    @media(max-width:1250px) { gap:26px; }
`;
export const DaySection = styled(C.DaySection)`
    border-left-color:${p => p.$collapsed ? `${p.theme.colors.accent}70` : 'transparent'};
    @media(max-width:1250px) { padding-top:16px; margin-top:7px; }
`;
export const ToggleButton = styled(C.ToggleButton)`
    ${gemControl}
    left:${p => p.$collapsed ? '-23px' : '-27px'}; width:22px; height:25px;
    background:${p => p.theme.colors.background};
    @media(max-width:1250px) { left:auto; top:-20px; right:0; }
`;
export const CollapsedRail = styled(C.CollapsedRail)`
    .label { font-family:${p => p.theme.fonts.body}; font-size:.7rem; letter-spacing:.16em; }
    .star { color:${p => p.theme.colors.accent}; font-size:0; width:7px; height:10px; background:linear-gradient(135deg,${p => p.theme.colors.accent},${p => p.theme.colors.primary}); clip-path:polygon(25% 0,75% 0,100% 30%,50% 100%,0 30%); }
`;
export const Resizer = styled(C.Resizer)`
    background:linear-gradient(180deg,transparent,${p => p.theme.colors.accent}55 10%,${p => p.theme.colors.accent}55 90%,transparent);
    .grip { width:7px; height:15px; margin:-7px 0 0 -3px; transform:none; border-radius:3px; border-color:${p => p.theme.colors.accent}90; background:${p => p.theme.colors.background}; }
    .line { background:${p => p.theme.colors.primary}60; box-shadow:none; }
    &:hover .grip { background:${p => p.theme.gemColor ?? p.theme.colors.primary}55; box-shadow:0 0 10px ${p => p.theme.gemColor ?? p.theme.colors.primary}30; }
`;
export const MobileWrapper = styled(C.MobileWrapper)`gap:10px;`;
export const ViewSwitch = styled(C.ViewSwitch)`
    border:1px solid ${p => p.theme.colors.border}; border-radius:7px; background:transparent; padding:3px;
    &::before { border-radius:5px 2px; background:linear-gradient(130deg,${p => p.theme.colors.primary}1B,${p => p.theme.colors.primary}08); box-shadow:inset 0 0 0 1px ${p => p.theme.colors.primary}35,inset 0 1px 0 ${p => p.theme.colors.accent}60; }
`;
export const SwitchButton = styled(C.SwitchButton)`
    background:transparent; border:0; padding:10px 0; font-family:${p => p.theme.fonts.body}; font-size:.78rem; font-weight:${p => p.$on ? 600 : 400}; letter-spacing:.02em;
    color:${p => p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary};
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:-2px; border-radius:5px; }
`;
export const Fab = styled(C.Fab)`
    border-radius:14px 5px; border:1px solid ${p => p.theme.colors.accent};
    color:${p => p.theme.colors.text};
    background:conic-gradient(from 45deg,${p => p.theme.colors.primary}25,${p => p.theme.colors.surface},${p => p.theme.colors.primary}30,${p => p.theme.colors.surface},${p => p.theme.colors.primary}25);
    box-shadow:inset 0 0 0 3px ${p => p.theme.colors.surface},inset 0 0 0 4px ${p => p.theme.colors.accent}50,0 7px 20px ${p => p.theme.colors.primary}25;
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:4px; }
`;
