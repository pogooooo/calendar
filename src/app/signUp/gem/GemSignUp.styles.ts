/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialSignUp.styles';
import { gemPanel, gemHeading } from '@/styles/gem/material';
export * from '../celestial/CelestialSignUp.styles';

export const FormPanel = styled(Base.FormPanel)`
    ${gemPanel}
`;

export const FormTitle = styled(Base.FormTitle)`
    ${gemHeading}
`;
