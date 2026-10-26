/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/CelestialSettings.layout';
import { gemPanel, gemControl } from '@/styles/gem/material';
export * from '../celestial/CelestialSettings.layout';

export const Shell = styled(Base.Shell)`
    background: transparent;
`;

export const TabButton = styled(Base.TabButton)`
    ${gemControl}
    width: auto; height: 46px; padding: 0 16px;
    border: 1px solid ${({theme,$active})=>$active ? theme.colors.accent+'80' : 'transparent'};
    background: ${({theme,$active})=>$active ? theme.colors.primary+'0E' : 'transparent'};
    .lbl { letter-spacing: .02em; text-shadow: none; font-family: ${({theme})=>theme.fonts.body}; }
    .cnt { display: none; }
    @media(max-width:768px) { flex:1; padding:0 8px; height:42px; .lbl {font-size:.76rem;} }
`;

export const Frame = styled(Base.Frame)`display: block;`;
export const Constellation = styled(Base.Constellation)`
    position: relative; border-right: 0; border-bottom: 1px solid ${({theme})=>theme.colors.accent}50;
    padding: 0 0 12px; margin-bottom: 10px;
`;
export const TabList = styled(Base.TabList)`
    display: flex; gap: 8px; padding-top: 0;
    @media(max-width:768px) { gap: 2px; }
`;
export const ConstellationArt = styled(Base.ConstellationArt)`display:none;`;
export const Mark = styled(Base.Mark)`display:none;`;
export const Orbit = styled(Base.Orbit)`display:none;`;
export const PaneHeader = styled(Base.PaneHeader)`
    padding: 26px 6px 22px;
    background: linear-gradient(100deg, ${({theme})=>theme.colors.primary}07,transparent 60%);
    border-bottom-color: ${({theme})=>theme.colors.accent}40;
    @media(max-width:768px) {padding: 20px 4px;}
`;
export const PaneTitle = styled(Base.PaneTitle)`letter-spacing:.02em; font-size:2.1rem;`;
export const PaneBody = styled(Base.PaneBody)`
    padding: 25px 6px 50px;
    @media(max-width:768px) {padding: 20px 0 32px;}
`;
export const FontCard = styled(Base.FontCard)`
    ${gemPanel}
    border-color: ${({theme,$selected})=>$selected ? theme.colors.primary : theme.colors.accent+'52'};
    box-shadow: ${({theme,$selected})=>$selected ? `inset 0 0 0 2px ${theme.colors.primary}24` : 'none'};
    &::after { display:none; }
`;
export const WidgetCard = styled(Base.WidgetCard)`${gemPanel}`;
export const FontPreview = styled(Base.FontPreview)`&::after {content: none;}`;
