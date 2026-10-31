import { css } from 'styled-components';
import { withAlpha } from '@/styles/color';

/** Shared metal and mineral finishes. Layout and interaction semantics stay with each view. */
export const gemPanel = css`
    background:
        linear-gradient(115deg, transparent 14%, ${({theme}) => theme.mode === 'dark' ? '#FFFFFF0B' : '#FFFFFF66'} 26%, transparent 38%),
        linear-gradient(135deg, ${({theme}) => withAlpha(theme.baseColors?.surface ?? theme.colors.surface, .95)}, ${({theme}) => withAlpha(theme.colors.background, .91)});
    border: 1px solid ${({theme}) => theme.colors.accent}52;
    border-radius: 3px 16px 3px 16px;
    box-shadow: inset 0 1px 0 ${({theme}) => theme.mode === 'dark' ? '#FFFFFF0B' : '#FFFFFF9C'},
        inset 0 0 0 3px ${({theme}) => theme.colors.accent}08,
        0 8px 28px ${({theme}) => theme.colors.text}07;
`;

export const gemFocus = css`
    &:focus-visible {
        outline: 2px solid ${({theme}) => theme.colors.primary};
        outline-offset: 3px;
    }
`;

export const gemControl = css`
    border-radius: 3px 9px 3px 9px;
    transition: background-color .22s ease, border-color .22s ease, color .22s ease,
        box-shadow .28s ease, transform .28s cubic-bezier(.2,.8,.2,1);
    ${gemFocus}
    &:hover:not(:disabled) {
        border-color: ${({theme}) => theme.colors.accent};
        background-image: linear-gradient(115deg, transparent 12%, ${({theme}) => theme.mode === 'dark' ? '#FFFFFF18' : '#FFFFFF80'} 35%, transparent 62%);
        box-shadow: inset 0 1px 0 ${({theme}) => theme.colors.accent}70, 0 3px 16px ${({theme}) => theme.colors.primary}22;
    }
    &:active:not(:disabled) { transform: translateY(1px); }
    html[data-theme-motion='off'] &, html[data-theme-motion='gentle'] & {
        transition-duration: 0s;
        &:active { transform: none; }
    }
`;

export const gemField = css`
    background: ${({theme}) => theme.colors.background}B8;
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: 3px 9px 3px 9px;
    color: ${({theme}) => theme.colors.text};
    box-shadow: inset 0 2px 7px ${({theme}) => theme.colors.text}05;
    transition: border-color .2s ease, box-shadow .2s ease;
    &:focus {
        border-color: ${({theme}) => theme.colors.primary};
        box-shadow: 0 0 0 3px ${({theme}) => theme.colors.primary}12;
        outline: none;
    }
`;

export const gemHeading = css`
    font-family: ${({theme}) => theme.fonts.display};
    letter-spacing: .035em;
    color: ${({theme}) => theme.colors.primary};
    text-shadow: none;
`;
