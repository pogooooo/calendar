/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialTimeDial.styles';
import { gemField } from '@/styles/gem/material';
export * from '../celestial/CelestialTimeDial.styles';

export const Field = styled(Base.Field)`
    ${gemField}
`;
