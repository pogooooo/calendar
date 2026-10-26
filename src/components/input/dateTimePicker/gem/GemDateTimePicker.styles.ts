/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialDateTimePicker.styles';
import { gemControl, gemPanel } from '@/styles/gem/material';
export * from '../celestial/CelestialDateTimePicker.styles';

export const Trigger = styled(Base.Trigger)`
    ${gemControl}
`;

export const Popover = styled(Base.Popover)`
    ${gemPanel}
`;
