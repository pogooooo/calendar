import styled from 'styled-components';
import { gemPanel } from '@/styles/gem/material';

export const Page = styled.div`
    width: min(1220px, 100%); margin: 0 auto; min-height: 100%;
    color: ${({theme}) => theme.colors.text};
`;
export const Cabinet = styled.header`
    position: relative; padding: 8px 24px 0; margin-bottom: 22px;
    border-bottom: 1px solid ${({theme}) => theme.colors.accent}66;
    background: linear-gradient(110deg, ${({theme}) => theme.colors.primary}08, transparent 65%);
    & > :first-child { padding: 0; }
    @media(max-width:768px) { padding: 4px 8px 0; margin-bottom: 16px; }
`;
export const Grid = styled.div`
    display: grid; grid-template-columns: minmax(0,1fr) 285px; gap: 28px;
    @media(max-width:1050px) { grid-template-columns: 1fr; }
`;
export const Reading = styled.div`
    display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 28px; min-width: 0;
    & > * { min-width: 0; }
    @media(max-width:768px) { grid-template-columns: 1fr; gap: 22px; }
`;
export const Collection = styled.aside`
    display: flex; flex-direction: column; gap: 16px; min-width: 0;
    & > section { ${gemPanel} padding: 18px; min-width: 0; }
    .mt { margin-top: 0; }
    @media(min-width:769px) and (max-width:1050px) { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); }
`;
export const Arch = styled.svg`
    display:block; width:100%; height:110px; overflow:visible;
    color:${({theme})=>theme.colors.primary};
    .gold { color:${({theme})=>theme.colors.accent}; }
    text { fill:currentColor; font: 13px ${({theme})=>theme.fonts.numeral}; }
`;
