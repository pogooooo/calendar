import styled, { keyframes } from 'styled-components';
import { Charm as Base } from '../celestial/WidgetCharm.styles';
const sway = keyframes`0%,100% { rotate:-10deg; translate:0 0; } 50% { rotate:4deg; translate:0 -3px; }`;
export const Charm = styled(Base)`svg { animation:${sway} 11s ease-in-out infinite; }`;
export const Shape = styled.path.attrs({d:'M30 8l4 12 10-5-3 13 11 3-13 8 1 13-10-6-10 6 1-13-13-8 11-3-3-13 10 5ZM30 20v36'})``;
