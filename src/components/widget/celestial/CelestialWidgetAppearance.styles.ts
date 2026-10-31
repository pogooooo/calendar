import styled from 'styled-components';
import {Surface as Base} from '../WidgetAppearance.styles';
export const Surface=styled(Base)`border:1px solid ${p=>p.theme.colors.primary}88;box-shadow:inset 0 0 0 4px ${p=>p.theme.colors.surface},inset 0 0 0 5px ${p=>p.theme.colors.primary}33; &::before{background:radial-gradient(ellipse at 100% 0,${p=>p.theme.colors.primary}19,transparent 55%);} header{border-bottom:1px solid ${p=>p.theme.colors.primary}44;padding-bottom:10px;} h3::before{content:'✦';color:var(--control-ink);margin-right:8px;}`;
