import styled from "styled-components";
import * as O from "../ocean/OceanMobileTabBar.styles";
import { MOBILE } from "@/styles/breakpoints";
import { gemPanel, gemQuietButton } from "@/features/gem/GemLive.styles";

export * from "../ocean/OceanMobileTabBar.styles";

export const Bar = styled(O.Bar)`
    ${MOBILE} {
        background: var(--gem-panel);
        border: 1px solid var(--gem-line);
        backdrop-filter: none;
    }
`;

export const Tab = styled(O.Tab)`
    color: ${({ $on }) => $on ? "var(--gem-ink)" : "var(--gem-muted)"};
    border: 1px solid ${({ $on }) => $on ? "var(--gem-line)" : "transparent"};
    background: ${({ $on }) => $on ? "var(--gem-control)" : "transparent"};
    span { font-size: .66rem; }
`;

export const SheetBody = styled(O.SheetBody)`${gemPanel}`;
export const CloseBtn = styled(O.CloseBtn)`${gemQuietButton}`;
export const SheetRow = styled(O.SheetRow)`border-radius: var(--gem-radius);`;
