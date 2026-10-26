import styled from 'styled-components';

export const Etching = styled.div`
    position:absolute; inset:0; z-index:3; pointer-events:none; overflow:hidden; border-radius:inherit;
    svg { position:absolute; width:42px; height:42px; }
    .nw { top:0; left:0; }
    .ne { top:0; right:0; rotate:90deg; }
    .sw { bottom:0; left:0; rotate:-90deg; }
    .se { bottom:0; right:0; rotate:180deg; }
    .metal,.scroll { fill:none; stroke:${p => p.theme.colors.accent}; stroke-width:.8; opacity:.68; }
    .scroll { stroke-width:.65; opacity:.5; }
    .gem { fill:${p => p.theme.gemColor ?? p.theme.colors.primary}35; stroke:${p => p.theme.colors.accent}; stroke-width:.7; }
    .facet { fill:none; stroke:${p => p.theme.colors.accent}; stroke-width:.5; opacity:.7; }
    @media(max-width:768px) { svg { width:28px; height:28px; opacity:.7; } }
    [data-widget] & { svg { width:22px; height:22px; opacity:.65; } }
`;
