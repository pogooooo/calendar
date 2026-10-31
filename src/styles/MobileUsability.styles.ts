import { createGlobalStyle } from 'styled-components';
import { SAFE_B, SAFE_T } from './breakpoints';

/** App-only touch layout. Desktop widget windows deliberately never match these selectors. */
const MobileUsability = createGlobalStyle`
    html[data-presentation='mobile-app'] {
        &:has([data-app-shell]) { background-image:none !important; }
        [data-app-shell] {
            height:100dvh; padding-top:${SAFE_T}; padding-bottom:calc(58px + ${SAFE_B});
            background:${({theme})=>theme.colors.background} !important;
            -webkit-tap-highlight-color: transparent;
            &, button, input, select, textarea { font-family:${({theme})=>theme.fonts.body}; }
            * { scroll-behavior:auto !important; }
            [data-home-arch], [data-calendar-decoration], [data-ambient] { display:none !important; }
            [data-calendar-header] {
                display:flex; align-items:center; gap:4px; padding:0; min-height:48px; margin-bottom:8px;
                &::before, &::after { display:none; }
            }
            [data-calendar-navigation] {
                flex:1; min-width:0; font-family:inherit;
                .nav-btn { min-width:40px; min-height:44px; }
                & > button:last-child { min-height:44px; }
            }
            [data-main-content] { scroll-padding-block: 16px; }
            [data-main-content] { padding:12px 12px 16px; margin-bottom:0; }
            [data-day-calendar] {height:auto;min-height:0;overflow:visible;}
            [data-day-content] {overflow:visible;flex:none;}
            [data-day-todo-card] {max-height:none;overflow:visible;border:0;background:transparent;box-shadow:none;}
            [data-day-todo-list] {overflow:visible;max-height:none;padding:0;gap:0;}
            [data-day-date-heading] {margin-bottom:8px;}
            [data-week-strip] {border:0;border-bottom:1px solid ${({theme})=>theme.colors.border}66;padding:0 0 8px;box-shadow:none;background:transparent;}
            [data-week-strip] [role='tablist'] {gap:2px;}
            [data-week-strip] [role='tab'] {min-height:64px;padding:6px 0;}
            [data-calendar-add] {background:${({theme})=>theme.colors.surface};background-image:none;box-shadow:none;color:var(--control-ink);border:1px solid var(--control-ink);}
            [data-mobile-calendar] > :first-child {position:sticky;top:0;z-index:20;background:${({theme})=>theme.colors.background};padding-block:4px;}
            [data-desktop-sidebar] { display:none; }
            [data-mobile-nav] {
                display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;
                width:auto;height:calc(58px + ${SAFE_B});padding:0 4px ${SAFE_B};margin:0;border-radius:0;
                background:${({theme})=>theme.colors.background};border-top:1px solid ${({theme})=>theme.colors.border};z-index:60;
            }
            [data-mobile-nav] button[aria-current='page'] {color:var(--control-ink);font-weight:700;}
            [data-day-peek-head] {color:var(--control-ink);}
            html[data-keyboard] & {padding-bottom:0;}
            input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']),
            textarea, select { font-size: max(16px, 1em); }
            button, a { touch-action: manipulation; }

            [data-home-nav] {
                display: flex; flex-wrap: nowrap; gap: 4px; padding: 0;
                & > button { min-width: 40px; min-height: 44px; flex: none; }
                & > div { flex: 1; min-width: 0; }
                & > div button { min-height: 44px; width: 100%; font-size: .85rem; letter-spacing: 0; }
                & > button:last-child { flex-basis: auto; padding: 0 8px; font-size: .75rem; letter-spacing: 0; }
                & > button:last-child:disabled { display: none; }
            }
            [data-home-section-head] { min-height: 40px; margin-bottom: 8px; font-size: .88rem; letter-spacing: .025em; }
            [data-home-quick] { min-height: 48px; margin-bottom: 4px; gap: 6px; }
            [data-home-quick] button { min-width: 44px; min-height: 46px; }
            [data-home-row] {
                min-height: 56px; gap: 12px; font-size: .92rem; padding-block: 10px;
                .name { white-space: normal; line-height: 1.45; overflow-wrap: anywhere; }
                em { font-size: .75rem; letter-spacing: 0; }
                [data-motion-mark] { width: 16px; height: 16px; }
            }
            [data-home-empty] {
                display: flex; align-items: center; justify-content: flex-start; gap: 16px;
                min-height: 88px; padding: 16px 4px; font-size: .85rem; line-height: 1.5;
                & > * { flex: 0 0 64px; width: 64px; height: 64px; margin: 0; }
                svg { max-width: 64px; max-height: 64px; }
            }
            [data-mobile-nav] button span { font-size: .7rem; letter-spacing: 0; font-weight: 550; }
            [data-mobile-nav] button { min-height: 48px; }
            [data-mobile-more] {
                max-height: calc(100dvh - ${SAFE_T} - 24px);
                overflow-y: auto; overscroll-behavior: contain;
                padding-bottom: calc(20px + ${SAFE_B});
            }
            [data-mobile-more] [data-more-close] { width: 44px; height: 44px; align-items: center; justify-content: center; }
            [data-settings-heading] { padding:16px 4px; }
            [data-settings-tabs] .cnt { display:none; }
            [data-settings-tabs] [role='tab'] { min-height:44px; }
            [data-settings-tabs] .lbl { font-family:inherit; font-size:.85rem; letter-spacing:0; }
            [data-settings-heading] h1 { font-size:1.5rem; margin-bottom:8px; letter-spacing:.02em; }
            [data-theme-stage] { display:block; padding:12px; margin-bottom:14px; }
            [data-theme-stage-thumb], [data-theme-description] { display:none; }
            [data-theme-stage] h3 { font-size:1.1rem; letter-spacing:.025em; }
            [data-theme-stage] [role='radiogroup'] { width:100%; }
            [data-theme-stage] [role='radio'] { min-height:44px; flex:1; }
            [data-theme-foot] { padding:8px; gap:6px; }
            [data-theme-name] { font-family:inherit; font-size:.8rem; letter-spacing:0; }
            [data-theme-variants] { display:none; }
        }
        body:not(:has([data-widget])) [role='dialog'] {
            &, button, input, textarea, select {font-family:${({theme})=>theme.fonts.body};}
            button {min-height:44px;}
            button[type='submit'] {background:var(--control-ink);background-image:none;box-shadow:none;color:${({theme})=>theme.colors.background};}
            input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']), textarea, select { font-size: max(16px, 1em); }
        }
        [role='alertdialog'] {
            max-width:calc(100vw - 32px);padding:24px;border-color:${({theme})=>theme.colors.border};
            &,h1,h2,h3,p,button {font-family:${({theme})=>theme.fonts.body};letter-spacing:0;}
            h1,h2,h3 {font-size:1.1rem;line-height:1.5;color:${({theme})=>theme.colors.text};}
            .top,.head,.banner,.side,[data-dialog-decoration] {display:none;}
            &::before {display:none;}
            button {min-height:44px;min-width:64px;color:var(--control-ink);border-color:var(--control-ink);font-weight:600;}
        }
    }
`;

export default MobileUsability;
