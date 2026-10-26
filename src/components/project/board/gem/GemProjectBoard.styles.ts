/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialProjectBoard.styles';
import { gemControl, gemPanel, gemHeading } from '@/styles/gem/material';
export * from '../celestial/CelestialProjectBoard.styles';

export const ColumnPick = styled(Base.ColumnPick)`
    ${gemControl}
`;

export const BoardColumn = styled(Base.BoardColumn)`
    ${gemPanel}
`;

export const AddTaskButton = styled(Base.AddTaskButton)`
    ${gemControl}
`;

export const CardBox = styled(Base.CardBox)`
    ${gemPanel}
`;

export const CardTitle = styled(Base.CardTitle)`
    ${gemHeading}
    color: ${({ theme, $isDone }) => $isDone ? theme.colors.textSecondary : theme.colors.text};
`;

export const CardMoveButton = styled(Base.CardMoveButton)`
    ${gemControl}
`;
