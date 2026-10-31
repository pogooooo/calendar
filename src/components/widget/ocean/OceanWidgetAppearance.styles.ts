import styled from 'styled-components';
import {Surface as Base} from '../WidgetAppearance.styles';
export const Surface=styled(Base)`border-radius:18px;background:linear-gradient(125deg,${p=>p.theme.colors.surface} 45%,${p=>p.theme.colors.background});box-shadow:inset 0 1px 0 ${p=>p.theme.colors.accent}44; &::before{border-radius:inherit;background:radial-gradient(ellipse at 100% 0,${p=>p.theme.colors.accent}22,transparent 60%);} header{border-bottom:1px solid ${p=>p.theme.colors.border}88;padding-bottom:10px;}`;
