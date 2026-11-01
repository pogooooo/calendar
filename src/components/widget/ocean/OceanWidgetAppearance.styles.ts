import styled from 'styled-components';
import {Surface as Base} from '../WidgetAppearance.styles';
import {seaButton,tideInput} from '@/styles/ocean/water';
import {inkOnFill} from '@/styles/color';
export const Surface=styled(Base)`
 --widget-control-radius:10px;
 --widget-card-radius:14px;
 --widget-field-radius:10px;
 --widget-button-height:42px;
 border-radius:18px;
 .settings-head{background:linear-gradient(120deg,${p=>p.theme.colors.accent}12,transparent 75%);}
 .appearance-preview{background:radial-gradient(ellipse at 100% 0,${p=>p.theme.colors.accent}12,transparent 70%),${p=>p.theme.colors.background}77;}
 .sample{border-radius:14px;}
 .preview-caption{padding:10px 12px;border:1px solid ${p=>p.theme.colors.border};border-radius:10px;background:${p=>p.theme.colors.surface}AA;}
 .preview-scope{padding:12px 14px;background:${p=>p.theme.colors.primary}07;border-radius:10px;}
 && .quick-looks button,&& .option-cards button,&& .choices.three button,&& .settings-foot .undo{${seaButton('default')}}
 && .quick-looks button,&& .option-cards button{border-radius:14px;}
 && .quick-looks button[aria-pressed=true],&& .settings-foot .done{${seaButton('primary')}color:${p=>inkOnFill(p.theme.colors.primary)};}
 && .quick-looks button[aria-pressed=true]{border-radius:14px;}
 && .option-cards button[aria-pressed=true],&& .choices.three button[aria-pressed=true]{background:${p=>p.theme.colors.primary}14;border-color:${p=>p.theme.colors.primary}99;box-shadow:inset 0 1px 0 #FFFFFF22,0 0 0 1px ${p=>p.theme.colors.primary}22;}
 && .section-tabs{margin:12px 14px 0;padding:4px;gap:4px;border:1px solid ${p=>p.theme.colors.border};border-radius:12px;background:${p=>p.theme.colors.background}88;}
 && .section-tabs button{min-height:36px;border:0;border-radius:8px;}
 && .section-tabs button[aria-selected=true]{color:${p=>p.theme.colors.text};background:${p=>p.theme.colors.surface};box-shadow:0 1px 4px ${p=>p.theme.colors.primary}20,inset 0 1px 0 #FFFFFF22;}
 && .numeric-value,&& .color-inputs input[type=text]{${tideInput}}
 && .numeric-value{border-color:${p=>p.theme.colors.border};}
 && .context-note{border:1px solid ${p=>p.theme.colors.primary}20;border-radius:10px;background:${p=>p.theme.colors.primary}06;}
 && button[role=switch]{border-color:transparent;background:${p=>p.theme.colors.primary}08;}
 && .motion-summary{border-top:0;border-radius:10px;padding:12px 14px;margin-bottom:12px;background:${p=>p.theme.colors.primary}08;}
 &&[data-compact] .section-tabs{margin:8px 10px 0;padding:3px;}
 &&[data-compact] .section-tabs button{min-height:34px;}
`;
