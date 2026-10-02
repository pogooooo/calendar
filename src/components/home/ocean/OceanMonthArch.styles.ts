import styled, { keyframes } from 'styled-components';
const wash = keyframes`0%,100% { translate:-5px 0; } 50% { translate:5px 3px; }`;
export const Shoreline = styled.svg`
    width:100%; height:auto; max-height:145px; display:block; color:${p=>p.theme.colors.primary}; fill:none;
    .wash { fill:currentColor; opacity:.07; animation:${wash} 13s ease-in-out infinite; }
    .foam { stroke:currentColor; stroke-width:.8; opacity:.3; animation:${wash} 13s ease-in-out infinite; }
    .day { stroke:currentColor; stroke-width:1.5; } .mark { fill:currentColor; opacity:.5; }
    .pointer { stroke:currentColor; stroke-width:1; } .pointer circle { fill:currentColor; }
`;
