"use client";
import { createGlobalStyle, useTheme } from 'styled-components';
import { usePickTheme } from '@/styles/themed';
import { controlInk } from './celestial/presentation';
import type { DefaultTheme } from 'styled-components';

const primaryInk=(theme:DefaultTheme)=>theme.mode==='dark'?theme.colors.accent:theme.colors.primary;
export default function PresentationDetails(){
    const theme=useTheme();
    const ink=usePickTheme({celestial:controlInk,maple:primaryInk,ocean:primaryInk,gem:primaryInk});
    return <Details $controlInk={ink(theme)}/>;
}

/** Shared interaction semantics; decorative surfaces stay owned by each theme. */
const Details=createGlobalStyle<{ $controlInk:string }>`
    :root {
        --control-ink: ${({$controlInk}) => $controlInk};
        --reading-surface: ${({theme}) => theme.colors.surface};
    }
    :where(button, a, input, textarea, select, [tabindex='0']):focus-visible {
        outline:2px solid var(--control-ink); outline-offset:3px;
    }
    :where(button, a, [role='button']) { touch-action:manipulation; }
    button:disabled { cursor:default; }
    [data-calendar-navigation] .nav-btn, [data-calendar-navigation] > button { color:var(--control-ink); }
    [data-calendar-navigation] .nav-btn { min-width:36px; min-height:36px; }
    [data-calendar-navigation] > button:disabled { opacity:.65; }
    html[data-presentation] [data-month-cell][data-selected] { box-shadow:inset 0 0 0 1px var(--control-ink); }
    [data-month-cell][aria-current='date'] .day-number { font-weight:750; text-decoration:underline; text-underline-offset:5px; }
    [data-month-cell][data-selected] .day-number { font-weight:750; }
    [data-day-todo-row], [data-home-row] { color:${({theme})=>theme.colors.text}; }
    [data-day-todo-row] .title {white-space:normal;overflow-wrap:anywhere;line-height:1.45;}
    [data-day-todo-row] .time, [data-home-row] em { color:${({theme})=>theme.colors.textSecondary}; font-variant-numeric:tabular-nums; }
    [data-day-todo-row][data-done] .title { text-decoration:line-through; }
    [data-calendar-panel] > button { color:var(--control-ink); }
    [data-calendar-panel] > button:focus-visible { outline-offset:-3px; }
    [data-month-cell]:focus-visible {outline:2px solid ${({theme})=>theme.colors.primary};outline-offset:-3px;z-index:2;}
    [data-calendar-region='month'] [data-month-cell] .day-header {height:30px;flex-basis:30px;min-height:30px;}
    [data-calendar-region='month'] [data-month-more] {height:16px;min-height:16px;line-height:16px;font-size:.66rem;}
    [data-calendar-region='month'] [data-month-cell] .day-header {height:28px !important;flex-basis:28px !important;min-height:28px !important;}
    [data-calendar-region='month'] [data-month-bars] {margin-block:2px !important;}
    [data-day-date-heading] > span {white-space:normal;line-height:1.5;overflow:visible;text-overflow:clip;}
    [role='dialog'] { max-height:calc(100dvh - 24px); }
    [role='dialog'] :where(input,textarea,select):focus-visible { outline-offset:1px; }
    [data-widget] [data-calendar-navigation] .nav-btn { min-height:26px; min-width:26px; }
    html[data-theme-motion='off'] *, html[data-theme-motion='off'] *::before, html[data-theme-motion='off'] *::after {
        animation:none !important; transition:none !important; scroll-behavior:auto !important;
    }
    html[data-page-hidden] [data-ambient] * { animation-play-state:paused !important; }
    html[data-presentation='mobile-app'] {
        [data-ambient], [data-calendar-decoration] { display:none !important; }
        [data-app-shell] { --app-top-clearance:0px; --app-dock-clearance:0px; }
        [data-home-arch] { display:none; }
        [data-calendar-panel] { box-shadow:none; background:${({theme})=>theme.colors.surface}; }
        [data-day-todo-row] { background:transparent; border-bottom:1px solid ${({theme})=>theme.colors.border}55; }
        [data-day-todo-row] .time { font-size:.8rem; }
        [data-month-cell][data-selected] { background:${({theme})=>theme.colors.primary}18; }
        [data-month-grid] { background:${({theme})=>theme.colors.surface}66; }
        [role='dialog'] { backdrop-filter:none; }
    }
`;
