/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/SingleInput.styles';
import { gemField } from '@/styles/gem/material';
export * from '../celestial/SingleInput.styles';

export const CelestialInput = styled(Base.CelestialInput)`
    ${gemField}
`;
