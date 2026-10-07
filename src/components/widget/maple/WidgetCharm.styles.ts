import styled from 'styled-components';
import { Charm as Base } from '../celestial/WidgetCharm.styles';
/** 기울기만 남기고 움직이지 않는다 (투명한 위젯 창이 쉬지 않고 다시 칠해지지 않게) */
export const Charm = styled(Base)`svg { rotate:-6deg; }`;
export const Shape = styled.path.attrs({d:'M30 8l4 12 10-5-3 13 11 3-13 8 1 13-10-6-10 6 1-13-13-8 11-3-3-13 10 5ZM30 20v36'})``;
