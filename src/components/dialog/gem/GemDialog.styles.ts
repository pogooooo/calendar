import styled from "styled-components";
import * as O from "../ocean/OceanDialog.styles";
import { gemButton, gemPanel, gemQuietButton } from "@/features/gem/GemLive.styles";

export * from "../ocean/OceanDialog.styles";

export const FullCard = styled(O.FullCard)`${gemPanel} border-color: var(--gem-gold);`;
export const PlainCard = styled(O.PlainCard)`${gemPanel} border-color: var(--gem-gold);`;
export const BandCard = styled(O.BandCard)`${gemPanel} border-color: var(--gem-gold);`;
export const LandCard = styled(O.LandCard)`${gemPanel} border-color: var(--gem-gold);`;
export const ActionButton = styled(O.ActionButton)`
    ${({ $tone }) => $tone === "go" ? gemButton : gemQuietButton}
    ${({ $tone, theme }) => $tone === "danger" ? `color: ${theme.colors.error}; border-color: currentColor;` : ""}
    min-height: 44px;
`;
