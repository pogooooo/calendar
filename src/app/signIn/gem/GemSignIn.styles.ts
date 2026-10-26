/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialSignIn.styles';
import { gemPanel, gemHeading } from '@/styles/gem/material';
export * from '../celestial/CelestialSignIn.styles';

export const FormPanel = styled(Base.FormPanel)`
    ${gemPanel}
`;

export const FormTitle = styled(Base.FormTitle)`
    ${gemHeading}
`;
