import { createGlobalStyle } from 'styled-components';

/** The custom RGB is kept intact for gemstones; text uses the palette's readable primary. */
const GemGround = createGlobalStyle`
    html {
        --gem-stone: ${p => p.theme.gemColor ?? p.theme.colors.primary};
        --gem-gold: ${p => p.theme.colors.accent};
        background-color: ${p => p.theme.colors.background} !important;
        background-image:
            radial-gradient(ellipse at 97% 5%, color-mix(in srgb, var(--gem-stone) ${p => p.theme.mode === 'dark' ? '20%' : '13%'}, transparent), transparent 44%),
            radial-gradient(ellipse at 2% 92%, color-mix(in srgb, var(--gem-stone) ${p => p.theme.mode === 'dark' ? '16%' : '10%'}, transparent), transparent 42%),
            linear-gradient(120deg, transparent 15%, color-mix(in srgb, var(--gem-gold) 4%, transparent) 53%, transparent 80%) !important;
        background-attachment: fixed !important;
    }
    body, [data-app-shell] { background: transparent !important; }
    ::selection { background: color-mix(in srgb, var(--gem-stone) 24%, transparent); }
`;

export default GemGround;
