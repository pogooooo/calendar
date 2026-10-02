import styled, { keyframes } from 'styled-components';
import { Charm as Base } from '../celestial/WidgetCharm.styles';
const tide = keyframes`0%,100% { translate:0 0; rotate:-5deg; } 50% { translate:0 -3px; rotate:2deg; }`;
export const Charm = styled(Base)`svg { animation:${tide} 13s ease-in-out infinite; }`;
export const Shape = styled.path.attrs({d:'M30 48 10 26Q3 19 10 15q-2-9 8-10 4-8 12-4 8-4 12 4 10 1 8 10 7 4 0 11ZM30 48 10 15m20 33L18 5m12 43V1m0 47L42 5m-12 43L50 15'})``;
