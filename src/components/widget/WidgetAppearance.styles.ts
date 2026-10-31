import styled from 'styled-components';
export const Surface=styled.section`
 position:relative;isolation:isolate;min-width:0;padding:16px;color:${p=>p.theme.colors.text};background:${p=>p.theme.colors.surface};border:1px solid ${p=>p.theme.colors.border};
 &::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;}
 header{margin-bottom:16px;} h3{font:600 .9rem/1.4 ${p=>p.theme.fonts.body};margin:0 0 4px;} p{font-size:.72rem;line-height:1.6;color:${p=>p.theme.colors.textSecondary};margin:4px 0 10px;}
 fieldset{border:0;border-top:1px solid ${p=>p.theme.colors.border}77;margin:14px 0 0;padding:10px 0 0;min-width:0;}
 legend{font-size:.74rem;font-weight:650;padding:0 6px 0 0;}
 .choices{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0;}
 button{font:600 .72rem/1.4 ${p=>p.theme.fonts.body};min-height:32px;border:1px solid ${p=>p.theme.colors.border};padding:5px 9px;color:inherit;background:${p=>p.theme.colors.surface};cursor:pointer;}
 button[aria-pressed=true]{border-color:var(--control-ink,${p=>p.theme.colors.primary});box-shadow:inset 0 -2px var(--control-ink,${p=>p.theme.colors.primary});background:${p=>p.theme.colors.primary}15;}
 button:disabled{opacity:.45;cursor:default;}button:focus-visible,input:focus-visible{outline:2px solid var(--control-ink,${p=>p.theme.colors.primary});outline-offset:2px;}
 button:hover:not(:disabled){border-color:var(--control-ink,${p=>p.theme.colors.primary});}button:active:not(:disabled){opacity:.75;}
 label{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:.74rem;margin:10px 0 6px;}
 input[type=range]{display:block;width:100%;height:28px;accent-color:var(--control-ink,${p=>p.theme.colors.primary});}
 input[type=color]{width:45px;height:32px;border:1px solid ${p=>p.theme.colors.border};background:transparent;}
 .sample{position:relative;isolation:isolate;overflow:hidden;padding:18px 14px;border:1px solid ${p=>p.theme.colors.border};background:repeating-conic-gradient(${p=>p.theme.colors.background} 0% 25%,${p=>p.theme.colors.surface} 0% 50%) 0 0/20px 20px;min-height:105px;}
 .sample>div:last-child{position:relative;z-index:1;}.sample strong{font-size:1rem}.sample span{display:block;font-size:.73rem;margin-top:10px;}
 .done{position:sticky;bottom:-1px;display:block;width:100%;margin-top:14px;min-height:36px;background:${p=>p.theme.colors.surface};z-index:2;}
 &[data-compact]{padding:10px;} &[data-compact] header{margin-bottom:8px;}
 @media(max-height:280px){&[data-compact] header p{display:none;} &[data-compact] header{margin-bottom:4px;} &[data-compact] h3{font-size:.76rem;} &[data-compact] fieldset{margin-top:8px;padding-top:6px;}}
`;
export const Overlay=styled.div`position:absolute;inset:30px 0 0;z-index:5;overflow:auto;overscroll-behavior:contain;background:${p=>p.theme.colors.surface};`;
export const MotionRules=styled.div`
 display:contents;
 [data-widget-motion=off] *,[data-widget-motion=off] *::before,[data-widget-motion=off] *::after{animation:none !important;transition:none !important;}
 [data-widget-motion=gentle] [data-widget-decoration] *,[data-widget-motion=gentle] [data-widget-decoration] *::before,[data-widget-motion=gentle] [data-widget-decoration] *::after{animation-duration:220ms !important;animation-iteration-count:1 !important;}
`;
