/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialDropdown.styles';
import { gemControl, gemPanel } from '@/styles/gem/material';
export * from '../celestial/CelestialDropdown.styles';

export const DropdownHeader = styled(Base.DropdownHeader)`
    ${gemControl}
`;

export const DropdownList = styled(Base.DropdownList)`
    ${gemPanel}
`;
