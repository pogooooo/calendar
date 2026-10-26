/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialTodoModal.styles';
import { gemPanel, gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialTodoModal.styles';

export const RepeatConditionBox = styled(Base.RepeatConditionBox)`
    ${gemPanel}
`;

export const DropdownHeader = styled(Base.DropdownHeader)`
    ${gemControl}
`;

export const DropdownList = styled(Base.DropdownList)`
    ${gemPanel}
`;
