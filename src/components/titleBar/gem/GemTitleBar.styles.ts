import styled from "styled-components";
import * as C from "../celestial/CelestialTitleBar.styles";

export * from "../celestial/CelestialTitleBar.styles";

export const Bar = styled(C.Bar)`
    background: var(--gem-heading);
    border-block-end: 1px solid var(--gem-line);
`;
export const Title = styled(C.Title)`
    font-family: ${({ theme }) => theme.fonts.display};
    color: var(--gem-ink);
    &::before {
        content: "";
        width: 12px;
        height: 12px;
        border: 1px solid var(--gem-gold);
        border-radius: 50%;
        background: var(--gem-action-map) 62% center / 60px auto no-repeat;
    }
`;
export const Btn = styled(C.Btn)`border-radius: var(--gem-radius);`;
export const CloseBtn = styled(C.CloseBtn)`border-radius: var(--gem-radius);`;
