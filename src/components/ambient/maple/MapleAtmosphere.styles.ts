import styled, { keyframes } from 'styled-components';

const fall = keyframes`0% { transform:translate3d(0,-70px,0); opacity:0; } 12% { opacity:.16; } 85% { opacity:.12; } 100% { transform:translate3d(-55px,105vh,0); opacity:0; }`;
const flutter = keyframes`0%,100% { transform:translateX(-14px) rotate(-22deg); } 50% { transform:translateX(18px) rotate(24deg); }`;
const sway = keyframes`0%,100% { transform:rotate(-2deg); opacity:.08; } 50% { transform:rotate(2deg); opacity:.13; }`;
const sunlight = keyframes`0%,100% { opacity:.03; transform:translateX(-10%); } 50% { opacity:.08; transform:translateX(10%); }`;

/** 3D 잎 캔버스 — 화면보다 작게 그린 것을 화면에 늘린다 (mapleLeafScene) */
export const Leaves = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
`;

/** .fall 잎 다섯 장은 WebGL 이 없을 때만 그려진다 (예전 모습 그대로) */
export const Garden = styled.div`
    position:fixed; inset:0; pointer-events:none; overflow:hidden; z-index:0; color:${p=>p.theme.colors.primary};
    .fall { position:absolute; top:0; right:3%; width:34px; animation:${fall} 34s linear infinite; opacity:0; }
    .leaf { width:100%; height:auto; fill:currentColor; animation:${flutter} 7s ease-in-out infinite; }
    .vein { fill:none; stroke:${p=>p.theme.colors.background}; stroke-width:.9; }
    .leaf-1 { right:11%; width:23px; animation-duration:43s; animation-delay:-18s; }
    .leaf-2 { left:2%; right:auto; width:25px; animation-duration:38s; animation-delay:-27s; }
    .leaf-3 { right:7%; width:30px; animation-duration:48s; animation-delay:-35s; }
    .leaf-4 { left:7%; right:auto; width:19px; animation-duration:52s; animation-delay:-9s; }
    .leaf-1 .leaf,.leaf-3 .leaf { animation-direction:reverse; animation-duration:9s; }
    .pressed { position:absolute; right:-20px; bottom:35px; width:200px; stroke:currentColor; stroke-width:.7; transform-origin:bottom right; opacity:.08; animation:${sway} 13s ease-in-out infinite; }
    .paper-light { position:absolute; inset:0; opacity:.03; background:linear-gradient(120deg,transparent 55%,currentColor 75%,transparent 90%); animation:${sunlight} 19s ease-in-out infinite; }
    html[data-theme-motion="gentle"] & { .fall { display:none; } .paper-light { animation-duration:32s; } }
    @media(max-width:768px) { .leaf-1,.leaf-2,.leaf-4,.paper-light { display:none; } .fall { width:22px; } .pressed { width:130px; } }
    @media(max-width:500px) and (max-height:350px) { display:none; }
    html[data-theme-motion="off"] & { .fall { display:none; } .pressed { animation:none; opacity:.08; } .paper-light { display:none; } }
`;
