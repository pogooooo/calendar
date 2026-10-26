/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/TertiaryButton.styles';
import { gemControl } from '@/styles/gem/material';
export * from '../celestial/TertiaryButton.styles';

export const TertiaryButton = styled(Base.TertiaryButton)`
    ${gemControl}
`;
