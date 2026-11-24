import styled from "styled-components";
import { gemCalendarNav, gemTodayInlay } from "../../gemCalendarStyles";
import { gemIconSize } from "@/features/gem/GemLive.styles";
import { TOUCH } from "@/styles/breakpoints";
import * as Base from "../celestial/CelestialWeekStrip.styles";

export * from "../celestial/CelestialWeekStrip.styles";

export const Strip = styled(Base.Strip)`
    border: 1px solid var(--gem-line);
    border-radius: 11px;
    background: var(--gem-panel);
    color: var(--gem-ink);
`;

export const Head = styled(Base.Head)`
    .title {
        font: 650 .88rem/1.25 ${p => p.theme.fonts.body};
        font-variant-numeric: tabular-nums;
        letter-spacing: 0;
        animation: none;
    }
    button {
        ${gemCalendarNav}
        min-height: 32px;
        ${TOUCH} { min-height: 44px; }
    }
    button:not(.today) { ${gemIconSize} }
    .today { letter-spacing: 0; border-color: transparent; }
`;

export const Days = styled(Base.Days)`
    position: relative;
    --gem-frame-inset: 3px;
    --gem-frame-corner: 11px;
    grid-template-columns: repeat(7, minmax(0, 1fr));
`;

export const Day = styled(Base.Day)`
    ${gemTodayInlay}
    position: relative;
    min-height: 64px;
    border-radius: var(--gem-radius, 999px);
    border-color: transparent;
    background: ${p => p.$selected ? "var(--gem-calendar-selection)" : "transparent"};
    color: ${p => p.$weekend ? p.theme.colors.weekend : "var(--gem-ink)"};
    .name { font-family: ${p => p.theme.fonts.body}; letter-spacing: 0; font-size: .63rem; }
    .num { border: 0; color: inherit; position: relative; font-weight: 700; }
    .dots i { border-radius: 50%; transform: none; }
`;
