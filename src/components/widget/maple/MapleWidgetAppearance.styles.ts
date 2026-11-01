import styled from 'styled-components';
import {Surface as Base} from '../WidgetAppearance.styles';
import {hair,stampButton} from '@/styles/maple/ink';
import {inkOnFill} from '@/styles/color';
export const Surface=styled(Base)`
 --widget-control-radius:999px;
 --widget-card-radius:3px 10px 10px 3px;
 --widget-field-radius:4px;
 --widget-button-height:40px;
 border-radius:3px 12px 12px 3px;
 .settings-head>div{border-left:2px solid ${p=>p.theme.colors.primary}88;padding-left:12px;}
 .settings-head::before{content:'';width:30px;height:34px;flex:none;background:url('/themes/maple/leaf-orange.webp') center/contain no-repeat;}
 .appearance-preview{background:repeating-linear-gradient(0deg,transparent 0 27px,${p=>p.theme.colors.border}0C 28px 29px),${p=>p.theme.colors.background}88;}
 .sample{border-radius:3px 10px 10px 3px;}
 .preview-caption{padding:10px 0;border-bottom:1px solid ${p=>hair(p.theme,.15)};}
 .preview-scope{padding-left:12px;border-left:2px solid ${p=>p.theme.colors.primary}55;}
 &&[data-compact] .settings-head::before{display:none;}
 && .choices.three button,&& .settings-foot .undo{${stampButton('default')}}
 && .settings-foot .done{${stampButton('primary')}}
 && .quick-looks button,&& .option-cards button{position:relative;border-color:${p=>hair(p.theme,.18)};border-left:3px solid ${p=>hair(p.theme,.2)};background:${p=>p.theme.colors.surface};box-shadow:0 2px 0 ${p=>hair(p.theme,.05)};}
 && .quick-looks button:hover:not(:disabled):not([aria-pressed=true]),&& .option-cards button:hover:not(:disabled){border-left-color:${p=>p.theme.colors.primary};background:${p=>p.theme.colors.primary}08;}
 && .quick-looks button[aria-pressed=true]{background:${p=>p.theme.colors.primary};color:${p=>inkOnFill(p.theme.colors.primary)};border-color:${p=>p.theme.colors.primary};box-shadow:0 2px 0 ${p=>hair(p.theme,.12)};}
 && .option-cards button[aria-pressed=true]{background:${p=>p.theme.colors.primary}0C;border-left-color:${p=>p.theme.colors.primary};box-shadow:0 2px 0 ${p=>hair(p.theme,.08)};}
 && .choices.three button[aria-pressed=true]{background:${p=>p.theme.colors.primary}12;border-color:${p=>p.theme.colors.primary}66;box-shadow:none;}
 && .section-tabs{gap:12px;border-bottom-color:${p=>hair(p.theme,.15)};}
 && .section-tabs button{border-bottom:3px solid transparent;padding-left:4px;padding-right:4px;}
 && .section-tabs button[aria-selected=true]{background:transparent;border-bottom-color:${p=>p.theme.colors.primary};color:${p=>p.theme.colors.primary};}
 && .numeric-value{background:${p=>p.theme.colors.background};border-color:${p=>hair(p.theme,.17)};border-bottom:2px solid ${p=>p.theme.colors.primary}88;}
 && input[type=range]::-webkit-slider-thumb{border-radius:4px;}
 && input[type=range]::-moz-range-thumb{border-radius:4px;}
 && .context-note{border-radius:0 6px 6px 0;background:${p=>p.theme.colors.primary}07;}
 && .icon-button{border-radius:50%;}
`;
