/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialChallenge.styles';
import { gemPanel } from '@/styles/gem/material';
export * from '../celestial/CelestialChallenge.styles';

export const BaseCard = styled(Base.BaseCard)`
    ${gemPanel}
`;

export const StickerBoardCard = styled(Base.StickerBoardCard)`
    ${gemPanel}
`;

export const TaskCard = styled(Base.TaskCard)`
    ${gemPanel}
`;
