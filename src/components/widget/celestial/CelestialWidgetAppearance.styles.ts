import styled from 'styled-components';
import {Surface as Base} from '../WidgetAppearance.styles';
import {inkOnFill} from '@/styles/color';
import {star8Mark} from '@/styles/celestial/ornaments';
export const Surface=styled(Base)`
 --widget-control-radius:2px;
 --widget-card-radius:2px;
 --widget-field-radius:1px;
 --widget-badge-radius:1px;
 --widget-switch-radius:1px;
 --widget-button-height:40px;
 border-color:${p=>p.theme.colors.primary}66;
 .settings-head{background:${p=>p.theme.colors.primary}08;border-bottom-color:${p=>p.theme.colors.primary}33;}
 .settings-head::before{content:'';${star8Mark('28px')};color:${p=>p.theme.colors.primary};flex:none;}
 .settings-head h3{font-family:${p=>p.theme.fonts.display};letter-spacing:.035em;}
 .appearance-preview{background:radial-gradient(ellipse at 100% 0,${p=>p.theme.colors.primary}0D,transparent 70%),${p=>p.theme.colors.background}88;}
 .sample{border-radius:3px;border-color:${p=>p.theme.colors.primary}55;}
 .settings-foot{border-top-color:${p=>p.theme.colors.primary}33;}
 .preview-caption{border-top:1px solid ${p=>p.theme.colors.primary}33;border-bottom:1px solid ${p=>p.theme.colors.primary}22;padding:10px 0;}
 .preview-heading{letter-spacing:.06em;}
 && .numeric-value input{font-family:${p=>p.theme.fonts.body};}
 &&[data-compact] .settings-head::before{display:none;}
 && button{background-image:none;letter-spacing:.025em;}
 && .quick-looks button,&& .option-cards button{position:relative;border-color:${p=>p.theme.colors.primary}55;background:${p=>p.theme.colors.background}66;}
 && .quick-looks button::after,&& .option-cards button::after{content:'';position:absolute;inset:4px;border:1px solid ${p=>p.theme.colors.primary}22;pointer-events:none;}
 && .quick-looks button:hover:not(:disabled):not([aria-pressed=true]),&& .option-cards button:hover:not(:disabled){border-color:${p=>p.theme.colors.primary};background:${p=>p.theme.colors.primary}0D;}
 && .quick-looks button[aria-pressed=true],&& .settings-foot .done{background:${p=>p.theme.colors.primary};color:${p=>inkOnFill(p.theme.colors.primary)};border-color:${p=>p.theme.colors.primary};box-shadow:none;}
 && .quick-looks button[aria-pressed=true]::after{border-color:${p=>inkOnFill(p.theme.colors.primary)}55;}
 && .option-cards button[aria-pressed=true]{background:${p=>p.theme.colors.primary}12;box-shadow:inset 0 0 0 1px ${p=>p.theme.colors.primary};}
 && .section-tabs{gap:0;padding:0 14px;border-bottom-color:${p=>p.theme.colors.primary}44;}
 && .section-tabs button{border-right:1px solid ${p=>p.theme.colors.primary}16;letter-spacing:.08em;}
 && .section-tabs button:last-child{border-right:0;}
 && .section-tabs button[aria-selected=true]{background:${p=>p.theme.colors.primary}09;box-shadow:inset 0 1px ${p=>p.theme.colors.primary}66;}
 && .choices.three button[aria-pressed=true]{background:${p=>p.theme.colors.primary}14;box-shadow:inset 0 0 0 1px ${p=>p.theme.colors.primary}77;}
 && .numeric-value{border-color:${p=>p.theme.colors.primary}55;border-bottom-color:${p=>p.theme.colors.primary};font-family:${p=>p.theme.fonts.display};}
 && input[type=range]::-webkit-slider-thumb{width:9px;height:19px;margin-top:-7px;border-radius:1px;}
 && input[type=range]::-moz-range-thumb{width:7px;height:17px;border-radius:1px;}
 && .settings-foot .done:hover:not(:disabled){background:${p=>p.theme.colors.primary};box-shadow:inset 0 0 0 2px ${p=>inkOnFill(p.theme.colors.primary)}33;}
`;
