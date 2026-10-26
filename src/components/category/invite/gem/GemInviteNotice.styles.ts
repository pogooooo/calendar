/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialInviteNotice.styles';
import { gemPanel } from '@/styles/gem/material';
export * from '../celestial/CelestialInviteNotice.styles';

export const Panel = styled(Base.Panel)`
    ${gemPanel}
`;
