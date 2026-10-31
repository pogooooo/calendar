import styled from 'styled-components';

export const Etching = styled.div`
    position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0;
    color:${p => p.theme.colors.primary};
    .solar-seal { position:absolute; display:block; flex:none; aspect-ratio:1; width:min(54%,400px); height:auto; right:-6%; bottom:-16%; opacity:${p => p.theme.mode==='dark' ? .17 : .2}; }
    svg { fill:none; stroke:currentColor; stroke-linecap:round; stroke-linejoin:round; }
    .line { stroke-width:1.1; } .hair { stroke-width:.75; } .dash { stroke-dasharray:1 5; } .fill { fill:currentColor; stroke:none; }
    .plate-index { position:absolute; bottom:10px; left:12px; display:flex; gap:9px; align-items:center; font-family:${p => p.theme.fonts.display}; font-size:.56rem; letter-spacing:.16em; color:${p => p.theme.colors.textSecondary}; opacity:.7; }
    .plate-index span:last-child { border-left:1px solid currentColor; padding-left:9px; }
    @media(max-width:768px) { .solar-seal { width:100%; right:-20%; bottom:-7%; opacity:.3; } .plate-index { display:none; } }
    [data-widget] & { display:none; }
`;
