import styled from 'styled-components';
import {Surface as Base} from '../WidgetAppearance.styles';
export const Surface=styled(Base)`
 border-radius:3px 16px 3px 16px;border-color:${p=>p.theme.colors.primary}66;
 .settings-head{background:linear-gradient(120deg,${p=>p.theme.colors.primary}12,transparent 70%);}
 .appearance-preview{background:linear-gradient(135deg,${p=>p.theme.colors.primary}0D,transparent 55%,${p=>p.theme.colors.accent}0A),${p=>p.theme.colors.background}77;}
 .sample{border-radius:3px 12px 3px 12px;}
`;
