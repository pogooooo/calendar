/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialHome.styles';
import { gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialHome.styles';

export const SectionHead = styled(Base.SectionHead)`
    font-family: ${({theme})=>theme.fonts.body}; font-size:.8rem; letter-spacing:.035em;
`;
export const PillarHead = styled(Base.PillarHead)`
    font-family: ${({theme})=>theme.fonts.body}; font-size:.8rem; letter-spacing:.035em;
`;

export const NavButton = styled(Base.NavButton)`
    ${gemControl}
`;

export const TodayButton = styled(Base.TodayButton)`
    ${gemControl}
`;
