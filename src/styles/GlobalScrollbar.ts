import { createGlobalStyle } from "styled-components";

/** Use the same metal or ink on both axes. Native-only engines receive the theme colors. */
const GlobalScrollbar = createGlobalStyle`
    :root {
        --scroll-ink: ${p => p.theme.scrollbarUsesPrimary ? p.theme.colors.primary : p.theme.line ?? p.theme.colors.primary};
        --scroll-thumb: color-mix(in srgb, var(--scroll-ink) 56%, ${p => p.theme.colors.text});
        --scroll-mark: color-mix(in srgb, var(--scroll-ink) 40%, transparent);
        --scroll-track: color-mix(in srgb, var(--scroll-ink) 9%, transparent);
        --scroll-size: 12px;
        --scroll-inset: 3px;
    }
    @media (pointer: coarse) {
        :root { --scroll-size: 6px; --scroll-inset: 1px; }
    }
    @supports not selector(::-webkit-scrollbar) {
        * { scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) var(--scroll-track); }
    }
    *::-webkit-scrollbar { width: var(--scroll-size); height: var(--scroll-size); }
    *::-webkit-scrollbar-track { background-color: var(--scroll-track); }
    *::-webkit-scrollbar-track:vertical {
        background-image: repeating-linear-gradient(to bottom, var(--scroll-mark) 0 1px, transparent 1px 9px);
        background-position: right; background-size: 35% 100%; background-repeat: no-repeat;
    }
    *::-webkit-scrollbar-track:horizontal {
        background-image: repeating-linear-gradient(to right, var(--scroll-mark) 0 1px, transparent 1px 9px);
        background-position: bottom; background-size: 100% 35%; background-repeat: no-repeat;
    }
    *::-webkit-scrollbar-thumb {
        min-height: 26px; min-width: 26px;
        border: var(--scroll-inset) solid transparent; border-radius: 99px;
        background: var(--scroll-thumb) padding-box;
    }
    *::-webkit-scrollbar-thumb:hover, *::-webkit-scrollbar-thumb:active {
        background-color: ${p => p.theme.colors.text};
    }
    *::-webkit-scrollbar-corner { background: var(--scroll-track); }
    *::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
`;

export default GlobalScrollbar;
