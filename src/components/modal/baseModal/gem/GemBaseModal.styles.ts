/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialBaseModal.styles';
import { gemPanel } from '@/styles/gem/material';
export * from '../celestial/CelestialBaseModal.styles';

export const Container = styled(Base.Container)`
    ${gemPanel}
`;
