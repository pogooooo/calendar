import styled, { keyframes } from 'styled-components';

const tide = keyframes`0%,100% { transform:translate3d(-65px,0,0); } 50% { transform:translate3d(65px,6px,0); }`;
const float = keyframes`0%,100% { transform:translateY(0) rotate(-12deg); } 50% { transform:translateY(-6px) rotate(-9deg); }`;
const pearl = keyframes`0%,100% { opacity:.12; transform:scale(.8); } 50% { opacity:.4; transform:scale(1); }`;
export const Shore = styled.div`
    position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; color:${p=>p.theme.colors.primary};
    .tide { position:absolute; bottom:-18px; left:-5%; width:110%; height:150px; opacity:.12; }
    .wave { fill:currentColor; animation:${tide} 19s ease-in-out infinite; }
    .back { opacity:.45; } .front { opacity:.35; animation-direction:reverse; animation-duration:27s; }
    .foam { stroke:currentColor; stroke-width:1; animation:${tide} 19s ease-in-out infinite; }
    .shell { position:absolute; right:-18px; bottom:55px; width:160px; opacity:.13; stroke:currentColor; stroke-width:.7; animation:${float} 14s ease-in-out infinite; }
    .pearl { position:absolute; right:6%; bottom:180px; width:5px; height:5px; background:currentColor; border-radius:50%; animation:${pearl} 7s ease-in-out infinite; }
    .pearl-1 { right:3%; bottom:220px; animation-delay:-3s; width:3px; height:3px; } .pearl-2 { right:9%; bottom:130px; animation-delay:-5s; }
    @media(max-width:768px) { .shell { width:110px; bottom:70px; } .tide { height:85px; bottom:0; } }
    @media(max-width:500px) and (max-height:350px) { display:none; }
    @media(prefers-reduced-motion:reduce) { * { animation:none; } }
`;
