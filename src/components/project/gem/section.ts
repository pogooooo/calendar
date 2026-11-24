import styled from "styled-components";
import { SectionWrapper as BaseWrapper, SectionTitle as BaseTitle } from "../celestial/section";
import { gemstoneHeading, gemstonePanel } from "@/features/gem/GemWorkspace.styles";

export const SectionWrapper = styled(BaseWrapper)`
    ${gemstonePanel}
`;

export const SectionTitle = styled(BaseTitle)`
    ${gemstoneHeading}
    flex-shrink: 0;
    border-block-end: 1px solid var(--gem-line);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -.015em;
`;
