/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialResetPassword.styles';
import { gemPanel, gemHeading } from '@/styles/gem/material';
export * from '../celestial/CelestialResetPassword.styles';

export const FormPanel = styled(Base.FormPanel)`
    ${gemPanel}
`;

export const FormTitle = styled(Base.FormTitle)`
    ${gemHeading}
`;
