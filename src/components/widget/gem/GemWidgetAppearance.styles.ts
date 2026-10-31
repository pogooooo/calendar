import styled from 'styled-components';
import {Surface as Base} from '../WidgetAppearance.styles';
export const Surface=styled(Base)`border-radius:12px;border-color:${p=>p.theme.colors.primary}77; &::before{background:linear-gradient(135deg,${p=>p.theme.colors.primary}18,transparent 35%,${p=>p.theme.colors.accent}14 75%,transparent);} header{border-bottom:1px solid ${p=>p.theme.colors.primary}44;padding-bottom:10px;}`;
