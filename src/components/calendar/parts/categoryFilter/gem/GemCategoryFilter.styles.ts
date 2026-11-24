import styled from "styled-components";
import { gemCalendarCompactIcon, gemCalendarNav } from "../../../gemCalendarStyles";
import { gemIconSize, gemPanel } from "@/features/gem/GemLive.styles";
import * as Base from "../celestial/CategoryFilter.styles";

export * from "../celestial/CategoryFilter.styles";

export const SetCategoryButton = styled(Base.SetCategoryButton)`
    ${gemCalendarNav}
    ${gemIconSize}
    svg { width: 16px; height: 16px; }
    &:hover svg { filter: none; }
    [data-widget] & { --gem-control-size: 27px; svg { width: 14px; height: 14px; } }
    :is([data-calendar-header], [data-day-date-heading]) && { ${gemCalendarCompactIcon} }
`;

export const SettingsPopover = styled(Base.SettingsPopover)`
    ${gemPanel}
    &::after { display: none; }
`;

export const MenuItem = styled(Base.MenuItem)`
    border-radius: var(--gem-radius);
    min-height: 44px;
`;
