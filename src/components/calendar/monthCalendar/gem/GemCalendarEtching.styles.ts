import styled, { keyframes } from 'styled-components';

const scintillate = keyframes`
    0%, 38%, 68%, 100% { opacity: .08; scale: .45; }
    52% { opacity: .95; scale: 1; }
`;

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
    .glint { fill:${p => p.theme.mode === 'dark' ? '#fff3d4' : '#fffdf3'}; opacity:.45; transform-origin:19px 17px; }
    html[data-theme-motion='full'] & .glint { animation:${scintillate} 8s ease-in-out infinite; }
    .ne .glint { animation-delay:-2s; } .sw .glint { animation-delay:-4s; } .se .glint { animation-delay:-6s; }
    html[data-page-hidden] & .glint { animation-play-state:paused; }
    @media(max-width:768px) { svg { width:28px; height:28px; opacity:.7; } }
    [data-widget] & { svg { width:22px; height:22px; opacity:.65; } }
    [data-widget] & .glint { animation:none; opacity:.25; }
`;
