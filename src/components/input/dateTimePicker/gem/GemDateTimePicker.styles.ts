import styled, { css } from "styled-components";
import * as O from "../ocean/OceanDateTimePicker.styles";
import { gemField, gemPanel } from "@/features/gem/GemLive.styles";
import { gemSelectedCell, gemTodayInlay } from "@/components/calendar/gemCalendarStyles";

export * from "../ocean/OceanDateTimePicker.styles";

export const Trigger = styled(O.Trigger)`${gemField} padding-inline: 14px;`;
export const Popover = styled(O.Popover)`${gemPanel} backdrop-filter: none;`;
export const Grid = styled(O.Grid)`
    position: relative;
    --gem-frame-inset: 2px;
    --gem-frame-corner: 8px;
`;
export const Day = styled(O.Day)`
    ${gemTodayInlay}
    border-radius: 6px;
    opacity: ${p => p.$out ? .75 : 1};
    &&::after { content: none; }
    && span::after { content: none; }
    && span { color: var(--gem-ink); }
    &&:focus-visible { outline: 2px solid var(--gem-ink); outline-offset: -2px; }
    ${p => p.$selected && css`
        background: var(--gem-control);
        &&[data-gem-static-frame] { ${gemSelectedCell} --gem-selection-corner: 8px; --gem-selection-inset: 2px; }
        &&:hover::after { background: none; }
    `}
    ${p => p.$today && css`
        && span { font-weight: 800; }
    `}
`;
