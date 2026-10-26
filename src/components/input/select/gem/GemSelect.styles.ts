/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialSelect.styles';
import { gemControl, gemPanel } from '@/styles/gem/material';
export * from '../celestial/CelestialSelect.styles';

export const Trigger = styled(Base.Trigger)`
    ${gemControl}
`;

export const Menu = styled(Base.Menu)`
    ${gemPanel}
`;
