import styled, { keyframes } from 'styled-components';
import type { Dir } from '@/styles/motion';

const prismPass = keyframes`
    0% { transform: translateX(calc(var(--gem-dir) * -130%)) skewX(-16deg); opacity: 0; }
    20% { opacity: .55; }
    75% { opacity: .32; }
    100% { transform: translateX(calc(var(--gem-dir) * 190%)) skewX(-16deg); opacity: 0; }
`;
const goldPass = keyframes`
    0% { transform: scaleX(.05); opacity: 0; }
    28% { opacity: .55; }
    100% { transform: scaleX(1); opacity: 0; }
`;

export const Stage = styled.div`
    position: relative; height: 100%;
`;
export const Body = styled.div`
    height: 100%;
`;
export const Overlay = styled.div<{ $dir: Dir }>`
    --gem-dir: ${p => p.$dir};
    position: absolute; inset: 0; overflow: hidden; z-index: 45; pointer-events: none;
    .refraction {
        position: absolute; top: 0; left: 0; width: 60%; height: 100%;
        background: linear-gradient(90deg, transparent 10%, color-mix(in srgb, ${p => p.theme.gemColor ?? p.theme.colors.primary} 7%, transparent) 44%,
            color-mix(in srgb, ${p => p.theme.colors.accent} 12%, transparent) 51%, transparent 60%);
        animation: ${prismPass} .78s cubic-bezier(.22, .65, .22, 1) both;
    }
    .gold-edge {
        position: absolute; top: 1px; left: 12%; right: 12%; height: 1px;
        background: linear-gradient(90deg, transparent, ${p => p.theme.colors.accent}, transparent);
        transform-origin: ${p => p.$dir > 0 ? 'left' : 'right'} center;
        animation: ${goldPass} .7s ease-out both;
    }
    html[data-theme-motion="off"] &, html[data-theme-motion="gentle"] & { display: none; }
`;
