import styled, { keyframes } from 'styled-components';

const lightBreath = keyframes`
    0%, 100% { opacity: .25; transform: translate3d(0, 0, 0); }
    50% { opacity: .6; transform: translate3d(-2%, 1%, 0); }
`;
const prismDrift = keyframes`
    0%, 100% { transform: translate3d(-2%, -2%, 0) rotate(-12deg); opacity: .3; }
    50% { transform: translate3d(3%, 3%, 0) rotate(-8deg); opacity: .65; }
`;

export const Atelier = styled.div`
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
    .mineral { position: absolute; inset: 0; width: 100%; height: 100%; }
    .scintillation { position: absolute; inset: 0; width: 100%; height: 100%; }
    .prism {
        position: absolute; inset: -15%; opacity: .35;
        background: conic-gradient(from 182deg at 98% 14%, transparent 0deg 7deg, ${p => p.theme.colors.accent}13 9deg, transparent 12deg 19deg, ${p => p.theme.gemColor ?? p.theme.colors.primary}18 21deg, transparent 25deg),
            conic-gradient(from 8deg at 0% 86%, transparent 0deg 8deg, ${p => p.theme.gemColor ?? p.theme.colors.primary}14 11deg, transparent 15deg);
    }
    html[data-theme-motion="full"] & .prism { animation: ${prismDrift} 22s ease-in-out infinite; }
    html[data-page-hidden] & .light, html[data-page-hidden] & .prism { animation-play-state: paused; }
    .light {
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at 94% 24%, color-mix(in srgb, ${p => p.theme.colors.accent} 12%, transparent), transparent 23%),
            radial-gradient(ellipse at 1% 76%, color-mix(in srgb, ${p => p.theme.gemColor ?? p.theme.colors.primary} 9%, transparent), transparent 28%);
        opacity: .4;
    }
    html[data-theme-motion="full"] & .light { animation: ${lightBreath} 18s ease-in-out infinite; }
    html[data-theme-motion="gentle"] & .light { animation: none; opacity: .3; }
    .jewel {
        position: absolute; right: -8px; bottom: 6px; width: 196px; height: 264px;
        opacity: ${p => p.theme.mode === 'dark' ? .9 : .82};
    }
    .jewel canvas { width: 100%; height: 100%; }
    .fallback {
        position: absolute; width: 72%; height: 82%; left: 14%; top: 9%;
        color: ${p => p.theme.gemColor ?? p.theme.colors.primary}; opacity: .55;
        filter: drop-shadow(0 8px 20px color-mix(in srgb, currentColor 22%, transparent));
    }
    @media (max-width: 1100px) { .jewel { right: -9px; bottom: 2%; width: 170px; height: 232px; opacity: ${p => p.theme.mode === 'dark' ? .48 : .4}; } }
    @media (max-width: 768px) {
        .jewel { width: 116px; height: 164px; right: -25px; bottom: 12%; opacity: ${p => p.theme.mode === 'dark' ? .58 : .48}; }
    }
    @media (max-height: 420px) { .jewel { display: none; } }
`;
