/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CategoryFilter.styles';
import { gemControl } from '@/styles/gem/material';
export * from '../celestial/CategoryFilter.styles';

export const SetCategoryButton = styled(Base.SetCategoryButton)`
    ${gemControl}
`;
