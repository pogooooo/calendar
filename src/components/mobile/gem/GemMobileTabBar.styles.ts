/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialMobileTabBar.styles';
import { gemControl, gemPanel } from '@/styles/gem/material';
export * from '../celestial/CelestialMobileTabBar.styles';

export const Tab = styled(Base.Tab)`
    ${gemControl}
    border-radius: 0;
    &::before { width:10px; height:10px; top:0; margin-left:-5px;
        transform: scale(${({$on})=>$on?1:0});
        clip-path:polygon(25% 0,75% 0,100% 30%,50% 100%,0 30%);
        background: conic-gradient(from 45deg,${({theme})=>theme.colors.primary},${({theme})=>theme.colors.accent},${({theme})=>theme.colors.primary});
    }
`;

export const Bar = styled(Base.Bar)`
    background: ${({theme})=>theme.colors.background}F5;
    border-top-color:${({theme})=>theme.colors.accent}75;
    box-shadow: 0 -4px 22px ${({theme})=>theme.colors.primary}08;
`;

export const SheetBody = styled(Base.SheetBody)`
    ${gemPanel}
`;

export const CloseBtn = styled(Base.CloseBtn)`
    ${gemControl}
`;
