/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialQuickNavigation.styles';
import { gemField } from '@/styles/gem/material';
export * from '../celestial/CelestialQuickNavigation.styles';

export const Input = styled(Base.Input)`
    ${gemField}
`;
