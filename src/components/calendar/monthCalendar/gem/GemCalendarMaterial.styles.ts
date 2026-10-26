import { css, keyframes } from 'styled-components';

/** A cut stone, with a gold setting rather than a circular date badge. */
export const gemstoneNumeral = css`
    position:relative; isolation:isolate; display:inline-flex; align-items:center; justify-content:center;
    width:32px; height:30px; padding:0; border:0; border-radius:0;
    color:${p => p.theme.colors.text}; font-weight:700; line-height:1; text-shadow:0 1px 1px ${p => p.theme.mode === 'dark' ? '#0008' : '#FFF8'};
    &::before, &::after { content:""; position:absolute; pointer-events:none; clip-path:polygon(24% 0,76% 0,100% 25%,100% 75%,76% 100%,24% 100%,0 75%,0 25%); }
    &::before { inset:0; z-index:-2; background:linear-gradient(135deg,#F1D99D 0%,#A98144 24%,#F9E5B2 48%,#926B37 72%,#E7CD8D 100%); }
    &::after {
        inset:2px; z-index:-1;
        background:
            conic-gradient(from 45deg at 50% 50%,transparent 0deg,${p => p.theme.gemColor ?? p.theme.colors.primary}44 45deg,transparent 90deg,${p => p.theme.gemColor ?? p.theme.colors.primary}55 135deg,transparent 180deg,${p => p.theme.gemColor ?? p.theme.colors.primary}33 225deg,transparent 270deg,${p => p.theme.gemColor ?? p.theme.colors.primary}66 315deg,transparent 360deg),
            linear-gradient(145deg,${p => p.theme.mode === 'dark' ? '#51455D' : '#FFF7F0'},${p => p.theme.colors.surface});
    }
    /* Today's stone is a painted surface, independent of a widget's translucent backdrop. */
    [data-widget] & {
        color:${p => p.theme.baseColors?.text ?? p.theme.colors.text};
        &::after {
            background-color:${p => p.theme.baseColors?.surface ?? p.theme.colors.surface};
        }
    }
`;

export const mineralSurface = css`
    background:linear-gradient(135deg,${p => p.theme.mode === 'dark' ? '#FFFFFF04' : '#FFFFFF24'},transparent 44%,${p => p.theme.gemColor ?? p.theme.colors.primary}06);
    border:1px solid ${p => p.theme.colors.border};
    box-shadow:inset 0 1px 0 ${p => p.theme.mode === 'dark' ? '#FFF08' : '#FFF6'},0 5px 18px -14px ${p => p.theme.colors.primary}28;
`;

export const gemControl = css`
    border:1px solid ${p => p.theme.colors.border}; border-radius:6px;
    background:linear-gradient(135deg,${p => p.theme.gemColor ?? p.theme.colors.primary}0D,transparent);
    color:${p => p.theme.colors.primary};
    :where(html:not([data-theme-motion="off"])) & { transition:background .22s ease,border-color .22s ease,box-shadow .22s ease,translate .22s ease; }
    &:hover:not(:disabled) { border-color:${p => p.theme.colors.primary}70; background-color:${p => p.theme.colors.primary}10; box-shadow:inset 0 1px 0 ${p => p.theme.colors.accent}30,0 3px 10px -5px ${p => p.theme.colors.primary}40; }
    &:active:not(:disabled) { translate:0 1px; }
    :where(html[data-theme-motion="gentle"],html[data-theme-motion="off"]) &:active:not(:disabled) { translate:none; }
    &:focus-visible { outline:2px solid ${p => p.theme.colors.primary}; outline-offset:3px; }
`;

export const facetArrival = keyframes`
    from { opacity:0; translate:0 5px; filter:brightness(1.16); }
    to { opacity:1; translate:0 0; filter:brightness(1); }
`;
