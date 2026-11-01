import styled,{createGlobalStyle} from 'styled-components';
import {inkOnFill} from '@/styles/color';

/** Only this settings dialog gets the inspector layout; other app modals are unchanged. */
export const DialogLayout=createGlobalStyle`
 div:has(> [role=dialog] > [data-widget-appearance]:not([data-compact])){
    justify-content:center !important;align-items:center !important;padding:16px !important;
 }
 [role=dialog]:has(> [data-widget-appearance]:not([data-compact])){
    width:min(860px,calc(100vw - 32px)) !important;max-width:860px !important;
    height:min(680px,calc(100dvh - 100px));max-height:calc(100dvh - 80px);padding:0;overflow:hidden;
 }
 @media(max-height:520px){[role=dialog]:has(> [data-widget-appearance]:not([data-compact])){height:calc(100dvh - 20px);max-height:calc(100dvh - 16px);}}
`;

export const Surface=styled.section`
 position:relative;isolation:isolate;container:widget-appearance / inline-size;
 display:flex;flex-direction:column;width:100%;height:100%;min-height:0;min-width:0;box-sizing:border-box;overflow:hidden;
 color:${p=>p.theme.colors.text};background:${p=>p.theme.colors.surface};border:1px solid ${p=>p.theme.colors.border};
 font-family:${p=>p.theme.fonts.body};line-height:1.5;
 &::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;}
 *,*::before,*::after{box-sizing:border-box;}
 button,input{font:inherit;color:inherit;}
 button{border:1px solid ${p=>p.theme.colors.border};background:${p=>p.theme.colors.surface};cursor:pointer;min-height:var(--widget-button-height,38px);border-radius:var(--widget-control-radius,8px);padding:8px 12px;font-size:.78rem;line-height:1.4;}
 button:hover:not(:disabled){border-color:${p=>p.theme.colors.primary};background:${p=>p.theme.colors.primary}12;}
 button:active:not(:disabled){filter:brightness(.94);}
 button:disabled{opacity:.45;cursor:default;}
 button:focus-visible,input:focus-visible,[role=tabpanel]:focus-visible{outline:2px solid ${p=>p.theme.colors.primary};outline-offset:2px;}
 button[aria-pressed=true]{border-color:${p=>p.theme.colors.primary};background:${p=>p.theme.colors.primary}14;box-shadow:inset 0 -2px ${p=>p.theme.colors.primary}70;}
 p{font-size:.74rem;line-height:1.65;color:${p=>p.theme.colors.textSecondary};margin:4px 0 0;overflow-wrap:anywhere;}
 h4{font-size:.85rem;font-weight:600;line-height:1.65;margin:0 0 18px;}
 .settings-head{flex:none;display:flex;align-items:center;gap:12px;min-height:68px;padding:14px 20px;border-bottom:1px solid ${p=>p.theme.colors.border};}
 .settings-head>div{min-width:0;flex:1;}.eyebrow{display:block;font-size:.65rem;letter-spacing:.06em;color:${p=>p.theme.colors.textSecondary};}
 h3{margin:2px 0 0;font-size:1.05rem;font-weight:650;line-height:1.35;overflow-wrap:anywhere;}
 .scope{font-size:.66rem;white-space:nowrap;color:${p=>p.theme.colors.textSecondary};border:1px solid ${p=>p.theme.colors.border};padding:4px 7px;border-radius:var(--widget-badge-radius,20px);}
 .icon-button{display:grid;place-items:center;width:36px;min-height:36px;flex:none;padding:0;border-color:transparent;background:transparent;}
 .settings-workspace{display:flex;flex-direction:column;min-height:0;flex:1;}
 .settings-editor{display:flex;flex-direction:column;flex:1;min-width:0;min-height:0;}
 .section-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));flex:none;padding:0 14px;border-bottom:1px solid ${p=>p.theme.colors.border};gap:4px;}
 .section-tabs button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:58px;border:0;border-bottom:2px solid transparent;border-radius:0;background:transparent;color:${p=>p.theme.colors.textSecondary};font-weight:600;}
 .section-tabs small{font-size:.6rem;line-height:1.3;letter-spacing:0;font-weight:400;font-variant-numeric:tabular-nums;color:${p=>p.theme.colors.textSecondary};}
 .section-tabs button[aria-selected=true]{border-bottom-color:${p=>p.theme.colors.primary};color:${p=>p.theme.colors.text};background:${p=>p.theme.colors.primary}09;}
 .settings-controls{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding:20px;scrollbar-width:thin;scrollbar-color:${p=>p.theme.colors.primary}77 transparent;}
 .settings-controls::-webkit-scrollbar{width:6px;}.settings-controls::-webkit-scrollbar-thumb{background:${p=>p.theme.colors.primary}66;border-radius:6px;}
 fieldset{border:0;min-width:0;margin:0 0 20px;padding:0;}legend{font-size:.8rem;font-weight:600;margin:0 0 10px;padding:0;}
 .choices,.quick-looks{display:grid;gap:8px;min-width:0;}.three,.quick-looks{grid-template-columns:repeat(3,minmax(0,1fr));}.two{grid-template-columns:repeat(2,minmax(0,1fr));}
 .choices button{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;min-width:0;}
 .choices.three button{padding-left:24px;padding-right:24px;}.choice-label{display:block;text-align:center;}
 .selected-mark{position:absolute;left:7px;top:50%;transform:translateY(-50%);opacity:0;pointer-events:none;}button[aria-pressed=true] .selected-mark{opacity:1;}
 .quick-looks button,.option-cards button{display:flex;flex-direction:column;justify-content:center;gap:4px;text-align:left;align-items:flex-start;}
 .quick-looks button{padding:10px 8px;text-align:center;align-items:center;border-radius:var(--widget-card-radius,8px);}.quick-looks strong,.option-cards strong{font-size:.8rem;font-weight:600;}
 .quick-looks button[aria-pressed=true]{background:${p=>p.theme.colors.primary};color:${p=>inkOnFill(p.theme.colors.primary)};box-shadow:none;}.quick-looks button[aria-pressed=true] small{color:inherit;opacity:.8;}
 .quick-looks small,.option-cards small{font-size:.65rem;line-height:1.5;color:${p=>p.theme.colors.textSecondary};}
 .option-cards{margin-bottom:22px;}.option-cards button{padding:14px;min-height:80px;border-radius:var(--widget-card-radius,8px);align-items:center;text-align:center;}
 .field-help{margin:-9px 0 20px;font-size:.66rem;line-height:1.65;}
 .range-control{margin-bottom:20px;}.range-label{display:flex;align-items:center;justify-content:space-between;gap:10px;}
 label{font-size:.8rem;font-weight:550;line-height:1.5;overflow-wrap:anywhere;}
 .numeric-value{display:flex;align-items:center;gap:3px;border:1px solid ${p=>p.theme.colors.border};background:${p=>p.theme.colors.background};border-radius:var(--widget-field-radius,7px);padding:0 8px;flex:none;font-size:.74rem;}
 .numeric-value input{width:48px;min-height:34px;background:transparent;border:0;padding:3px 0;text-align:right;font-variant-numeric:tabular-nums;appearance:textfield;font-size:.8rem;}
 .numeric-value input::-webkit-inner-spin-button,.numeric-value input::-webkit-outer-spin-button{appearance:none;margin:0;}.numeric-value:focus-within{border-color:${p=>p.theme.colors.primary};}
 input[type=range]{display:block;width:100%;height:36px;margin:4px 0 0;padding:0;background:transparent;cursor:pointer;appearance:none;accent-color:${p=>p.theme.colors.primary};}
 input[type=range]::-webkit-slider-runnable-track{height:5px;border-radius:8px;background:linear-gradient(to right,${p=>p.theme.colors.primary} var(--range-fill),${p=>p.theme.mode==='dark'?'#FFFFFF24':'#16232C26'} var(--range-fill));}
 input[type=range]::-webkit-slider-thumb{appearance:none;width:17px;height:17px;border:2px solid ${p=>p.theme.colors.surface};border-radius:50%;margin-top:-6px;background:${p=>p.theme.colors.primary};box-shadow:0 0 0 1px ${p=>p.theme.colors.primary};}
 input[type=range]::-moz-range-track{height:5px;border-radius:8px;background:${p=>p.theme.colors.border};}input[type=range]::-moz-range-progress{height:5px;background:${p=>p.theme.colors.primary};}input[type=range]::-moz-range-thumb{width:15px;height:15px;border:2px solid ${p=>p.theme.colors.surface};border-radius:50%;background:${p=>p.theme.colors.primary};}
 .range-ends{display:flex;justify-content:space-between;color:${p=>p.theme.colors.textSecondary};font-size:.65rem;}.range-control[data-disabled]{opacity:.5;}.range-control[data-disabled] input{cursor:default;}
 .context-note{display:flex;gap:8px;align-items:flex-start;padding:11px 12px;background:${p=>p.theme.colors.primary}0A;border-left:2px solid ${p=>p.theme.colors.primary}66;margin:0 0 20px;font-size:.72rem;line-height:1.65;color:${p=>p.theme.colors.textSecondary};}
 .context-note svg{flex:none;margin-top:3px;}
 .switch-row{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:16px 0;border-top:1px solid ${p=>p.theme.colors.border}77;}.switch-row>div{min-width:0;}.switch-row p{font-size:.68rem;}
 button[role=switch]{display:flex;align-items:center;gap:7px;flex:none;white-space:nowrap;padding:7px 9px;font-size:.7rem;box-shadow:none;}
 button[role=switch]>span{display:block;position:relative;width:26px;height:16px;border-radius:var(--widget-switch-radius,10px);background:${p=>p.theme.colors.border};}
 button[role=switch]>span::after{content:'';position:absolute;top:3px;left:3px;width:10px;height:10px;border-radius:var(--widget-switch-radius,50%);background:${p=>p.theme.colors.textSecondary};}
 button[role=switch][aria-checked=true]>span{background:${p=>p.theme.colors.primary};}button[role=switch][aria-checked=true]>span::after{left:13px;background:${p=>inkOnFill(p.theme.colors.primary)};}
 .color-control{margin-bottom:20px;}.color-inputs{display:flex;gap:10px;margin-top:10px;}
 .color-inputs input[type=color]{width:46px;height:42px;padding:3px;background:${p=>p.theme.colors.background};border:1px solid ${p=>p.theme.colors.border};border-radius:var(--widget-field-radius,7px);flex:none;cursor:pointer;}
 .color-inputs input[type=text]{width:100%;min-width:0;min-height:42px;padding:8px 12px;border:1px solid ${p=>p.theme.colors.border};border-radius:var(--widget-field-radius,7px);background:${p=>p.theme.colors.background};font:500 .8rem/1.4 monospace;}
 .color-inputs input[aria-invalid=true]{border-color:${p=>p.theme.colors.error};}.error{color:${p=>p.theme.colors.error};font-size:.72rem;}
 .motion-summary{display:flex;justify-content:space-between;gap:12px;align-items:center;border-top:1px solid ${p=>p.theme.colors.border};padding:16px 0;font-size:.8rem;}.motion-summary span{color:${p=>p.theme.colors.textSecondary};}
 .settings-foot{flex:none;display:flex;align-items:center;gap:8px;min-height:62px;padding:12px 18px;border-top:1px solid ${p=>p.theme.colors.border};background:${p=>p.theme.colors.surface};}
 .save-status{display:flex;align-items:center;gap:6px;margin-right:auto;min-width:0;font-size:.68rem;color:${p=>p.theme.colors.textSecondary};}.save-status svg{flex:none;}.save-status[role=alert]{color:${p=>p.theme.colors.error};flex-wrap:wrap;}
 .settings-foot button{display:flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap;}.undo{background:transparent;}.settings-foot .done{min-width:70px;background:${p=>p.theme.colors.primary};color:${p=>inkOnFill(p.theme.colors.primary)};border-color:${p=>p.theme.colors.primary};font-weight:650;}
 .appearance-preview{flex:none;min-width:0;padding:16px 20px 12px;background:${p=>p.theme.colors.background}77;border-bottom:1px solid ${p=>p.theme.colors.border};}
 .preview-heading{display:flex;justify-content:space-between;gap:8px;font-size:.7rem;margin-bottom:10px;color:${p=>p.theme.colors.textSecondary};}.preview-heading strong{font-weight:600;color:${p=>p.theme.colors.text};}.preview-heading span{font-size:.62rem;}
 .sample{position:relative;isolation:isolate;overflow:hidden;height:105px;border:1px solid ${p=>p.theme.colors.border};border-radius:10px;background:repeating-conic-gradient(${p=>p.theme.mode==='dark'?'#28303D':'#DFE7E5'} 0% 25%,${p=>p.theme.mode==='dark'?'#2C3543':'#D7E1DF'} 0% 50%) 0 0/20px 20px;}
 .sample *,.sample *::before,.sample *::after{animation:none !important;transition:none !important;}
 .sample-content{position:relative;z-index:1;padding:15px;line-height:1.5;}.sample-content strong{display:block;font-size:1.04rem;font-weight:600;line-height:1.4;}.sample-row{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:.7rem;}.sample-row svg{flex:none;}.sample-time{font-variant-numeric:tabular-nums;opacity:.8;}.sample-content .sample-extra{display:none;}
 .sample-note{color:inherit;font-size:.73rem;margin:10px 0 0;}.sample-kicker{font-size:.65rem;}.sample-content .sample-count{display:inline;margin:0 10px;font-size:1.5rem;}
 .mini-calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));text-align:center;gap:2px 8px;margin-top:8px;font-size:.6rem;}.mini-calendar small{font-size:.55rem;opacity:.65;}.mini-calendar .sample-today{border-bottom:2px solid currentColor;font-weight:700;}
 .preview-caption{display:flex;justify-content:space-between;gap:10px;margin-top:7px;font-size:.65rem;font-variant-numeric:tabular-nums;color:${p=>p.theme.colors.textSecondary};}.preview-note{display:none;}
 .preview-scope{display:none;}
 .sample-progress{height:5px;margin-top:20px;background:currentColor;opacity:.6;border-radius:4px;}.sample-progress i{display:block;width:64%;height:100%;background:currentColor;}
 &[data-compact] .settings-head{padding:10px 12px;min-height:58px;gap:8px;}&[data-compact] h3{font-size:.95rem;}&[data-compact] .eyebrow{font-size:.6rem;}&[data-compact] .scope{font-size:.6rem;padding:3px 6px;}
 &[data-compact] .appearance-preview{padding:10px 14px 8px;}&[data-compact] .preview-heading{display:none;}&[data-compact] .sample{height:76px;}&[data-compact] .sample-content{padding:9px 12px;}&[data-compact] .sample-row{margin-top:6px;}
 &[data-compact] .sample-content:has(.mini-calendar){padding:6px 12px;}&[data-compact] .sample-content:has(.mini-calendar) strong{font-size:.9rem;line-height:1.25;}&[data-compact] .mini-calendar{margin-top:6px;gap:2px 8px;}&[data-compact] .mini-calendar span:nth-of-type(n+8){display:none;}
 &[data-compact] .settings-controls{padding:14px;}&[data-compact] .section-tabs{padding:0 8px;}&[data-compact] .section-tabs button{min-height:40px;}
 &[data-compact] .section-tabs small{display:none;}&[data-compact] .field-help{font-size:.63rem;}
 &[data-compact] .save-status span{max-width:6em;line-height:1.4;}
 &[data-compact] .quick-looks small{display:none;}&[data-compact] .quick-looks button{min-height:38px;padding:7px 5px;}&[data-compact] fieldset{margin-bottom:16px;}&[data-compact] legend{margin-bottom:8px;}
 &[data-compact] .settings-foot{padding:8px 10px;min-height:54px;gap:6px;}&[data-compact] .settings-foot button{padding:7px 9px;font-size:.72rem;}&[data-compact] .save-status{font-size:.62rem;}
 @container widget-appearance (min-width:680px){
    .settings-workspace{display:grid;grid-template-columns:minmax(260px,.9fr) minmax(330px,1.1fr);}
    .appearance-preview{display:flex;flex-direction:column;min-height:0;padding:26px 22px;border-right:1px solid ${p=>p.theme.colors.border};border-bottom:0;}
    .appearance-preview>.sample{flex:0 1 235px;min-height:130px;}.preview-heading,.preview-caption,.preview-scope,.preview-note{flex:none;}
    .preview-heading{margin-bottom:18px;}.sample{height:235px;}.sample-content{padding:24px 18px;}.sample-content strong{font-size:1.2rem;}.sample-row{margin-top:24px;font-size:.78rem;}.sample-content .sample-extra{display:flex;}.mini-calendar .sample-extra{display:block;}.mini-calendar{font-size:.78rem;gap:8px;margin-top:18px;}.mini-calendar small{font-size:.65rem;}.preview-caption{margin-top:14px;}.preview-scope{display:block;margin-top:24px;font-size:.76rem;line-height:1.8;color:${p=>p.theme.colors.text};}.preview-note{display:block;margin-top:10px;font-size:.68rem;line-height:1.8;}.sample-note{margin-top:20px;}
 }
 @container widget-appearance (max-width:340px){.scope{display:none;}.settings-foot{gap:5px;padding-left:8px;padding-right:8px;}.settings-foot button{padding-left:8px;padding-right:8px;}.undo svg{display:none;}.option-cards{gap:6px;}.option-cards button{padding:10px;}.choices button{padding-left:6px;padding-right:6px;}}
 @media(max-height:360px){&[data-compact] .appearance-preview{display:none;}&[data-compact] .settings-head{min-height:44px;padding-top:6px;padding-bottom:6px;}&[data-compact] .eyebrow{display:none;}&[data-compact] .settings-foot{min-height:46px;padding-top:5px;padding-bottom:5px;}}
`;

export const Overlay=styled.div`position:absolute;inset:30px 0 0;z-index:5;overflow:hidden;display:flex;flex-direction:column;overscroll-behavior:contain;background:${p=>p.theme.colors.surface};`;
export const MotionRules=styled.div`
 display:contents;
 [data-widget-motion=off] *,[data-widget-motion=off] *::before,[data-widget-motion=off] *::after{animation:none !important;transition:none !important;}
 [data-widget-motion=gentle] [data-widget-decoration] *,[data-widget-motion=gentle] [data-widget-decoration] *::before,[data-widget-motion=gentle] [data-widget-decoration] *::after{animation-duration:220ms !important;animation-iteration-count:1 !important;}
`;
