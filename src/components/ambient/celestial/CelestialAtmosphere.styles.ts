import styled, { keyframes } from 'styled-components';
import { withAlpha } from '@/styles/color';

const turn = keyframes`to { transform:rotate(360deg); }`;
const glimmer = keyframes`0%,100% { opacity:.16; transform:scale(.65); } 50% { opacity:.55; transform:scale(1.15); }`;
const lunar = keyframes`0%,100% { opacity:.24; transform:translateY(0); } 50% { opacity:.48; transform:translateY(-3px); }`;
const shooting = keyframes`0%,82% { opacity:0; transform:translate3d(0,0,0) rotate(-30deg) scaleX(.3); } 85% { opacity:.5; } 91%,100% { opacity:0; transform:translate3d(-230px,130px,0) rotate(-30deg) scaleX(1); }`;

export const Sky = styled.div`
    position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden;
    color:${p=>p.theme.colors.primary};
    .chart { position:absolute; right:-100px; top:5%; width:390px; height:390px; stroke:currentColor; stroke-width:.6; opacity:.13; }
    .wheel { transform-origin:160px 160px; animation:${turn} 160s linear infinite; }
    .constellation { opacity:.7; } .constellation circle,.moon { fill:currentColor; }
    .moon { transform-origin:center; animation:${lunar} 9s ease-in-out infinite; }
    .glint { position:absolute; width:3px; height:3px; border-radius:50%; background:currentColor; opacity:.16; animation:${glimmer} 7s ease-in-out infinite; }
    .glint:nth-of-type(4n) { border-radius:0; width:5px; height:5px; clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%); }
    .comet { position:absolute; right:6%; top:7%; width:100px; height:1px; background:linear-gradient(90deg,transparent,${p=>withAlpha(p.theme.colors.primary,.7)}); opacity:0; animation:${shooting} 27s linear infinite; }
    .comet-1 { right:34%; top:2%; animation-delay:-14s; animation-duration:39s; }
    html[data-theme-motion="gentle"] & { .comet { display:none; } .wheel { animation-duration:240s; } }
    @media(max-width:768px) { .chart { width:220px; height:220px; right:-100px; opacity:.09; } .comet,.glint:nth-of-type(n+11) { display:none; } }
    @media(max-width:500px) and (max-height:350px) { display:none; }
    @media(prefers-reduced-motion:reduce) { .comet { display:none; } * { animation:none; } }
`;
