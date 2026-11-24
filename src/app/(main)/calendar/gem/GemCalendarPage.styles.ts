import styled from "styled-components";
import { gemCalendarNav } from "@/components/calendar/gemCalendarStyles";
import * as Base from "../celestial/CelestialCalendarPage.styles";

export * from "../celestial/CelestialCalendarPage.styles";

export const PageWrapper = styled(Base.PageWrapper)`
    padding: 0 20px 14px;
    @media (max-width: 1250px) { padding: 0 14px 14px; min-height: auto; }
`;

export const CalendarContainer = styled(Base.CalendarContainer)`
    align-items: stretch;
    gap: ${p => p.$collapsed ? "12px" : "20px"};
    @media (min-width: 1251px) and (max-height: 810px) { min-height: 565px; }
    @media (max-width: 1250px) { gap: 14px; }
`;

export const MonthSection = styled(Base.MonthSection)`
    @media (max-width: 1250px) { height: clamp(455px, 69dvh, 620px); }
`;

export const DaySection = styled(Base.DaySection)`
    min-width: ${p => p.$collapsed ? "40px" : "350px"};
    @media (max-width: 1250px) { min-width: 0; padding: 0; margin: 0; border: 0; }
`;

export const ToggleButton = styled(Base.ToggleButton)`
    ${gemCalendarNav}
    left: -26px;
    top: 13px;
    z-index: 4;
    @media (max-width: 1250px) { display: none; }
`;

export const DayBody = styled(Base.DayBody)`
    @media (max-width: 1250px) { opacity: 1; transform: none; pointer-events: auto; }
`;

export const Resizer = styled(Base.Resizer)`
    background: var(--gem-gold-edge);
    .line { background: var(--gem-gold-edge); box-shadow: none; }
    .grip { border-radius: 50%; transform: none; border-color: var(--gem-gold); background: var(--gem-surface); }
    &:hover .grip { background: var(--gem-surface); box-shadow: inset 0 0 0 2px var(--gem-gold); }
`;

export const ViewSwitch = styled(Base.ViewSwitch)`
    border-radius: var(--gem-radius, 999px);
    border-color: var(--gem-line);
    background: var(--gem-panel);
    &::before { border-radius: inherit; background: var(--gem-slab); }
`;

export const SwitchButton = styled(Base.SwitchButton)`
    border: 0;
    border-radius: var(--gem-radius, 999px);
    background: transparent;
    color: ${p => p.$on ? "var(--gem-slab-ink)" : "var(--gem-ink)"};
    font-family: ${p => p.theme.fonts.body};
    &:active { background: transparent; }
`;

export const Fab = styled(Base.Fab)`
    &&&[data-calendar-add] {
        border: 2px solid transparent;
        border-radius: var(--gem-radius, 999px);
        background: var(--gem-action);
        color: var(--gem-action-ink);
        box-shadow: inset 0 1px #fff8f7a8, 0 2px 5px #40294333;
    }
`;
