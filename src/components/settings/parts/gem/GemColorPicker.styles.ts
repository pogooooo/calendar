import styled, { keyframes } from 'styled-components';

const glint = keyframes`
    0%, 65%, 100% { opacity: .35; }
    76% { opacity: 1; }
`;

export const Mark = styled.svg`
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
    .gem-glint { animation: ${glint} 7s ease-in-out infinite; }
    html[data-theme-motion='off'] & .gem-glint { animation: none; }
    html[data-theme-motion='gentle'] & .gem-glint { animation-duration: 14s; }
    html[data-page-hidden] & .gem-glint { animation-play-state: paused; }
    @media (prefers-reduced-motion: reduce) { .gem-glint { animation: none; } }
`;

export const Panel = styled.section`
    position: relative;
    display: grid;
    gap: 22px;
    margin-top: 16px;
    padding: 22px;
    border: 1px solid ${({ theme }) => theme.colors.accent}55;
    border-radius: 14px;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => `linear-gradient(130deg, ${theme.colors.surface}E8, ${theme.colors.background}B8)`};
    box-shadow: inset 0 1px 0 ${({ theme }) => theme.colors.accent}24;
    transition: background .35s ease, border-color .35s ease;
    @media (max-width: 600px) { padding: 18px 15px; gap: 18px; }
    html[data-theme-motion='off'] &,
    html[data-theme-motion='off'] & * { animation: none !important; transition: none !important; }
    @media (prefers-reduced-motion: reduce) { &, & * { animation: none !important; transition: none !important; } }
`;

export const Heading = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    > svg { flex: none; width: 44px; height: 52px; }
    h3 { margin: 0 0 5px; font-family: ${({ theme }) => theme.fonts.display}; font-size: 19px; font-weight: 600; }
    p { margin: 0; max-width: 46em; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 12px; line-height: 1.65; }
`;

export const Controls = styled.div`
    display: grid;
    grid-template-columns: 108px minmax(0, 1fr);
    align-items: center;
    gap: 22px;
    @media (max-width: 460px) { grid-template-columns: 1fr; gap: 16px; }
`;

export const ColorWell = styled.label<{ $color: string }>`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 106px;
    border: 1px solid ${({ theme }) => theme.colors.accent}66;
    border-radius: 9px;
    background: ${({ theme, $color }) => `radial-gradient(ellipse at 50% 0%, ${$color}28, transparent 78%), ${theme.colors.background}`};
    cursor: pointer;
    transition: box-shadow .25s ease, transform .25s ease;
    &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px ${({ $color }) => $color}22; }
    &:focus-within { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 3px; }
    > svg { width: 48px; height: 56px; }
    > span { font-size: 11px; letter-spacing: .04em; font-variant-numeric: tabular-nums; }
    input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
    @media (max-width: 460px) { flex-direction: row; min-height: 64px; gap: 16px; > svg { width: 32px; height: 42px; } }
`;

export const Channels = styled.div`
    display: grid;
    gap: 10px;
`;

export const Channel = styled.div<{ $track: string }>`
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) 64px;
    align-items: center;
    gap: 12px;
    label { font-size: 12px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary}; }
    input[type='range'] {
        appearance: none;
        width: 100%; height: 6px; margin: 0;
        border-radius: 3px;
        background: ${({ $track }) => $track};
        cursor: pointer;
    }
    input[type='range']::-webkit-slider-thumb {
        appearance: none; width: 17px; height: 17px; border-radius: 50%;
        background: ${({ theme }) => theme.colors.surface};
        border: 2px solid ${({ theme }) => theme.colors.accent};
        box-shadow: 0 1px 4px #0003;
    }
    input[type='range']::-moz-range-thumb {
        width: 13px; height: 13px; border-radius: 50%;
        background: ${({ theme }) => theme.colors.surface};
        border: 2px solid ${({ theme }) => theme.colors.accent};
        box-shadow: 0 1px 4px #0003;
    }
    input[type='number'] {
        width: 64px; min-height: 36px; padding: 5px 3px 5px 8px;
        border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 6px;
        color: ${({ theme }) => theme.colors.text}; background: ${({ theme }) => theme.colors.background};
        font: inherit; font-size: 12px; font-variant-numeric: tabular-nums;
    }
    input:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 4px; }
`;

export const Presets = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 15px;
    border-top: 1px solid ${({ theme }) => theme.colors.accent}2B;
`;

export const Preset = styled.button<{ $color: string; $active: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 36px;
    padding: 7px 11px;
    border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : `${theme.colors.border}88`};
    border-radius: 6px;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme, $active }) => $active ? `${theme.colors.primary}12` : 'transparent'};
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    transition: transform .2s ease, border-color .2s ease, background .2s ease;
    &::before {
        content: ''; width: 12px; height: 15px;
        clip-path: polygon(25% 0, 75% 0, 100% 30%, 85% 77%, 50% 100%, 15% 77%, 0 30%);
        background: ${({ $color }) => `linear-gradient(135deg, #fff9, transparent 42%), conic-gradient(from 35deg, ${$color}, #fff8, ${$color}, #17111E80, ${$color})`};
    }
    &:hover { transform: translateY(-1px); border-color: ${({ theme }) => theme.colors.primary}; }
    &:active { transform: translateY(0); }
    &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 3px; }
`;

export const Reset = styled.button`
    margin-left: auto;
    min-height: 36px;
    padding: 6px 3px;
    border: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    background: none;
    font: inherit;
    font-size: 12px;
    text-decoration: underline;
    text-underline-offset: 4px;
    cursor: pointer;
    &:hover { color: ${({ theme }) => theme.colors.primary}; }
    &:focus-visible { outline: 2px solid ${({ theme }) => theme.colors.primary}; outline-offset: 3px; }
`;
