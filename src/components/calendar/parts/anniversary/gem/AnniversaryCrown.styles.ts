/** Gem finishes over the shared, behavior-compatible component structure. */
import styled from 'styled-components';
import * as Base from '../celestial/AnniversaryCrown.styles';
import { MOBILE, NOT_WIDGET } from '@/styles/breakpoints';
export * from '../celestial/AnniversaryCrown.styles';

export const Ring = styled(Base.Ring)`
    width:32px; height:30px;
    .ring, .ring2 { stroke: ${({theme})=>theme.colors.accent}; }
    .jewel { fill: ${({theme})=>theme.colors.primary}; }
    .dn { font-family: ${({theme})=>theme.fonts.numeral}; }
    &::after {
        content:""; position:absolute; top:-1px; right:0; z-index:3; width:5px; height:8px;
        background:linear-gradient(135deg,#EDD7A2,${p => p.theme.colors.accent},#B28C4A);
        clip-path:polygon(50% 0,100% 45%,50% 100%,0 45%); pointer-events:none;
    }
    ${MOBILE} { ${NOT_WIDGET} & { width:28px; height:28px; margin:0; } }
    @media(max-width:768px) and (max-height:700px) { ${NOT_WIDGET} & { width:24px; height:23px; } }
    [data-widget] & { width:26px; height:25px; }
    @media(max-height:380px) { [data-widget] & { width:24px; height:23px; } }
    @media(max-height:260px) { [data-widget] & { width:20px; height:17px; } }
    :where(html[data-theme-motion='gentle'],html[data-theme-motion='off']) &, [data-widget] & {
        .ring, .jewel, .sweep { animation:none !important; stroke-dashoffset:0; }
        .jewel { opacity:1; transform:none; }
        .bead { display:none; animation:none; }
    }
`;
export const Reveal = styled(Base.Reveal)`
    background: ${({theme})=>theme.colors.surface}; border-color: ${({theme})=>theme.colors.accent}70;
    border-radius: 2px 8px 2px 8px;
`;
