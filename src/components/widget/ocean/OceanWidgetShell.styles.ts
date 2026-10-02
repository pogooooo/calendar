export * from '../celestial/CelestialWidgetShell.styles';
import styled from 'styled-components';
import * as C from '../celestial/CelestialWidgetShell.styles';
export const Shell = styled(C.Shell)`border-radius:12px; border-color:${p=>p.theme.colors.primary+'55'};`;
export const Gem = styled(C.Gem)`border-radius:50% 50% 30% 30%; transform:none; width:10px; height:9px;`;
