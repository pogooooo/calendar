import styled, { keyframes } from 'styled-components';

const revolve = keyframes`to { transform:rotate(360deg); }`;
const shimmer = keyframes`0%,100% { opacity:.65; } 50% { opacity:1; }`;
const lunar = keyframes`0%,100% { opacity:.35; transform:translateY(0); } 50% { opacity:.62; transform:translateY(-2px); }`;
const trace = keyframes`from { stroke-dashoffset:160; opacity:0; } to { stroke-dashoffset:0; opacity:.5; }`;
export const Seal = styled.svg<{ $fill?: boolean }>`
    display:block; width:${p=>p.$fill ? '100%' : '140px'}; height:auto; pointer-events:none; overflow:visible;
    color:${p=>p.theme.colors.primary}; fill:none; stroke:currentColor; stroke-width:.7;
    .engraving { opacity:.3; } .orbit { opacity:.6; transform-origin:90px 94px; animation:${revolve} 100s linear infinite; }
    .moon { fill:currentColor; stroke:none; opacity:.45; animation:${lunar} 8s ease-in-out infinite; }
    .star { fill:currentColor; stroke:none; animation:${shimmer} 6s ease-in-out infinite; }
    .constellation { opacity:.5; } .constellation path { stroke-dasharray:160; animation:${trace} 1.6s ease-out both; } .constellation circle { fill:currentColor; animation:${shimmer} 7s ease-in-out infinite; }
    text { fill:currentColor; stroke:none; font-family:${p=>p.theme.fonts.display}; font-size:8px; letter-spacing:3px; opacity:.6; }
    @media(prefers-reduced-motion:reduce) { * { animation:none; } }
`;

/** 표지와 3D 달을 겹쳐 두는 틀 — 크기는 예전 표지 그대로(부모가 덮어쓰면 그 폭) */
export const Frame = styled.div`
    position:relative; width:140px; pointer-events:none;
`;

/**
 * 새긴 초승달 자리(보기 상자 180×200 의 (90, 94), 반지름 22)에 맞춘 달 칸 — 공이 칸의 83% 를 채운다.
 * $scale 만큼 키워도 가운데는 그대로: 가로는 폭의 50%, 세로는 높이(= 폭 × 200/180)의 47%.
 * (left·width 의 % 는 폭, top 의 % 는 높이 기준 — 칸 반쪽 14.7%(폭)는 높이로 13.23%)
 */
export const Moon = styled.div<{ $scale?: number }>`
    position:absolute; aspect-ratio:1;
    width:${p=>(29.4 * (p.$scale ?? 1)).toFixed(2)}%;
    left:${p=>(50 - 14.7 * (p.$scale ?? 1)).toFixed(2)}%;
    top:${p=>(47 - 13.23 * (p.$scale ?? 1)).toFixed(2)}%;
    opacity:${p=>p.theme.mode === 'dark' ? .92 : .88};
`;
