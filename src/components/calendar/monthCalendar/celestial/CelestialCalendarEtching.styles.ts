import styled, { css, keyframes } from 'styled-components';

const twinkle = keyframes`
    0%, 67%, 100% { opacity: .62; }
    82% { opacity: 1; filter: drop-shadow(0 0 1px currentColor); }
`;
const progress = keyframes`to { stroke-dashoffset: -24; }`;
const ink = css`
    pointer-events: none;
    color: ${p => p.theme.mode === 'dark' ? p.theme.colors.accent : '#836929'};
    .hair, .line { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: .85; }
    .dash { stroke-dasharray: 1 5; }
    .fill { fill: currentColor; stroke: none; }
    html[data-theme-motion="full"]:not([data-page-hidden]) & [data-sky-star] { animation: ${twinkle} 8s ease-in-out infinite; }
    html[data-theme-motion="full"] & [data-sky-star]:nth-child(2n) { animation-delay: -3s; }
    [data-widget] & { display: none; }
`;
export const Etching = styled.div`
    ${ink}
    position: absolute; inset: 0; overflow: hidden; z-index: 0;
    .solar-seal { position: absolute; display: block; width: min(54%,400px); height: auto; right: -6%; bottom: -16%; opacity: ${p => p.theme.mode === "dark" ? .17 : .16}; }
    html[data-theme-motion="full"]:not([data-page-hidden]) & [data-sun-rim] { animation: ${progress} 10s linear infinite; }
    @container month-pane (max-width: 25rem) { .solar-seal { width: 75%; opacity:.10; } }
`;
export const Index = styled.div`
    ${ink}
    display: flex; flex: none; align-items: center; gap: 8px; height: 18px; padding: 0 9px;
    overflow: hidden; font: 500 .51rem/1 ${p => p.theme.fonts.display}; letter-spacing: .16em;
    opacity: .64;
    b { border-left: 1px solid currentColor; padding-left: 8px; }
    @media (max-height: 520px) { display: none; }
`;
