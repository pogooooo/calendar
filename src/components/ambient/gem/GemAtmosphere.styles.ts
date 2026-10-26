import styled, { keyframes } from 'styled-components';

const lightBreath = keyframes`
    0%, 100% { opacity: .25; transform: translate3d(0, 0, 0); }
    50% { opacity: .6; transform: translate3d(-2%, 1%, 0); }
`;

export const Atelier = styled.div`
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
    .mineral { position: absolute; inset: 0; width: 100%; height: 100%; }
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
        opacity: ${p => p.theme.mode === 'dark' ? .75 : .7};
    }
    .jewel canvas { width: 100%; height: 100%; }
    .fallback {
        position: absolute; width: 72%; height: 82%; left: 14%; top: 9%;
        color: ${p => p.theme.gemColor ?? p.theme.colors.primary}; opacity: .55;
        filter: drop-shadow(0 8px 20px color-mix(in srgb, currentColor 22%, transparent));
    }
    @media (max-width: 1100px) { .jewel { right: -9px; bottom: 2%; width: 170px; height: 232px; opacity: ${p => p.theme.mode === 'dark' ? .48 : .4}; } }
    @media (max-width: 768px) {
        .jewel { width: 132px; height: 182px; right: -11px; bottom: 11%; opacity: ${p => p.theme.mode === 'dark' ? .36 : .29}; }
    }
    @media (max-height: 420px) { .jewel { display: none; } }
`;
