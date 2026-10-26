/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialTitleBar.styles';
import { gemHeading, gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialTitleBar.styles';

export const Title = styled(Base.Title)`
    ${gemHeading}
`;

export const Btn = styled(Base.Btn)`
    ${gemControl}
`;

export const CloseBtn = styled(Base.CloseBtn)`
    ${gemControl}
`;
