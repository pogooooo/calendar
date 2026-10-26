/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialModal.styles';
import { gemField, gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialModal.styles';

export const TitleInput = styled(Base.TitleInput)`
    ${gemField}
`;

export const CloseButton = styled(Base.CloseButton)`
    ${gemControl}
`;

export const FieldInput = styled(Base.FieldInput)`
    ${gemField}
`;

export const MemoTextArea = styled(Base.MemoTextArea)`
    ${gemField}
`;
