import styled from 'styled-components';
import {Surface as Base} from '../WidgetAppearance.styles';
export const Surface=styled(Base)`border-radius:3px 12px 12px 3px;box-shadow:inset 4px 0 ${p=>p.theme.colors.primary}44; &::before{background:repeating-linear-gradient(0deg,transparent 0 27px,${p=>p.theme.colors.border}15 28px 29px),radial-gradient(ellipse at 100% 0,${p=>p.theme.colors.primary}15,transparent 55%);} header{padding-left:8px;border-left:2px solid ${p=>p.theme.colors.primary}77;}`;
