/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialGoogleSignInButton.styles';
import { gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialGoogleSignInButton.styles';

export const Btn = styled(Base.Btn)`
    ${gemControl}
`;
