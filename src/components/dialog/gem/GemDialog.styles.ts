/** Gem finishes over the shared, behavior-compatible component structure. */
import styled, { css } from 'styled-components';
import * as Base from '../celestial/CelestialDialog.styles';
import { gemPanel, gemHeading, gemControl } from '@/styles/gem/material';
import { inkOnFill } from '@/styles/color';
import type { DialogKind } from '../arcana';
export * from '../celestial/CelestialDialog.styles';

const gemDialog = css<{ $kind: DialogKind }>`
    ${gemPanel}
    border-color: ${({ theme, $kind }) => $kind === 'danger' ? `${theme.colors.error}88` : `${theme.colors.accent}70`};
    box-shadow: 0 20px 64px #00000038, inset 0 1px 0 ${({ theme }) => theme.colors.accent}24;
    &::before { border-color: ${({ theme }) => theme.colors.accent}20; border-radius: 1px 10px 1px 10px; }
`;

export const Pip = styled(Base.Pip)`display: none;`;

export const Card = styled(Base.Card)`
    ${gemDialog}
`;

export const Title = styled(Base.Title)`
    ${gemHeading}
`;

export const ActionButton = styled(Base.ActionButton)`
    ${gemControl}
    border-color: ${({ theme, $tone }) => $tone === 'danger' ? theme.colors.error : $tone === 'go' ? theme.colors.primary : theme.colors.border};
    background: ${({ theme, $tone }) => $tone === 'go' ? theme.colors.primary : 'transparent'};
    color: ${({ theme, $tone }) => $tone === 'go' ? inkOnFill(theme.colors.primary) : $tone === 'danger' ? theme.colors.error : theme.colors.text};
    &:hover:not(:disabled) {
        border-color: ${({ theme, $tone }) => $tone === 'danger' ? theme.colors.error : theme.colors.primary};
        background: ${({ theme, $tone }) => $tone === 'danger' ? theme.colors.error : $tone === 'go' ? theme.colors.primary : `${theme.colors.primary}10`};
        color: ${({ theme, $tone }) => $tone === 'danger' ? inkOnFill(theme.colors.error) : $tone === 'go' ? inkOnFill(theme.colors.primary) : theme.colors.text};
        box-shadow: 0 3px 12px ${({ theme, $tone }) => $tone === 'danger' ? theme.colors.error : theme.colors.primary}20;
    }
`;

export const FullCard = styled(Base.FullCard)`
    ${gemDialog}
`;

export const PlainCard = styled(Base.PlainCard)`
    ${gemDialog}
`;

export const BandCard = styled(Base.BandCard)`
    ${gemDialog}
    .banner { color: ${({ theme, $kind }) => inkOnFill($kind === 'danger' ? theme.colors.error : $kind === 'ok' ? theme.colors.success : theme.colors.primary)}; }
`;

export const LandCard = styled(Base.LandCard)`
    ${gemDialog}
`;
