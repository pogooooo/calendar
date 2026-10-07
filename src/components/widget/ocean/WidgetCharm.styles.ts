import styled from 'styled-components';
import { Charm as Base } from '../celestial/WidgetCharm.styles';
/** 기울기만 남기고 움직이지 않는다 (투명한 위젯 창이 쉬지 않고 다시 칠해지지 않게) */
export const Charm = styled(Base)`svg { rotate:-3deg; }`;
export const Shape = styled.path.attrs({d:'M30 48 10 26Q3 19 10 15q-2-9 8-10 4-8 12-4 8-4 12 4 10 1 8 10 7 4 0 11ZM30 48 10 15m20 33L18 5m12 43V1m0 47L42 5m-12 43L50 15'})``;
