/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialWidgetShell.styles';
import { gemPanel, gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialWidgetShell.styles';

export const Shell = styled(Base.Shell)`
    ${gemPanel}
`;

export const Control = styled(Base.Control)`
    ${gemControl}
`;

export const SettingsPanel = styled(Base.SettingsPanel)`
    ${gemPanel}
    /* Settings stay readable over every opacity and custom wallpaper setting. */
    background: ${({theme}) => theme.baseColors?.surface ?? theme.colors.surface};
`;

export const ModeChip = styled(Base.ModeChip)`
    ${gemControl}
`;
