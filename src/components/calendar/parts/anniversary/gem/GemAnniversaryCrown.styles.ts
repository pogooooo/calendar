import styled from "styled-components";
import * as Base from "../celestial/AnniversaryCrown.styles";

export * from "../celestial/AnniversaryCrown.styles";

export const Root = styled(Base.Root)`
    color: var(--gem-ink);
`;

export const Ring = styled(Base.Ring)`
    display: inline-flex;
    align-items: center;
    width: auto;
    height: auto;
    margin: 0;
    gap: 4px;

    &::after {
        content: "";
        width: 3px;
        height: 8px;
        border-radius: 1px;
        background: var(--gem-frame-silver);
    }

    @container (max-width: 360px) {
        &::after { display: none; }
    }
`;

export const Reveal = styled(Base.Reveal)`
    transition: none;
    .rule { display: none; }
`;
