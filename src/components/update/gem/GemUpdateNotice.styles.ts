/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialUpdateNotice.styles';
import { gemPanel, gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialUpdateNotice.styles';

export const Panel = styled(Base.Panel)`
    ${gemPanel}
`;

export const CloseBtn = styled(Base.CloseBtn)`
    ${gemControl}
`;

export const GhostBtn = styled(Base.GhostBtn)`
    ${gemControl}
`;

export const PrimaryBtn = styled(Base.PrimaryBtn)`
    ${gemControl}
`;
