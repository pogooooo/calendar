import styled from 'styled-components';
import type { ComponentType } from 'react';
import { Charm as Base } from '../celestial/WidgetCharm.styles';

/**
 * 바다의 위젯에는 모퉁이 장식을 두지 않는다 — 판과 글만 (Celestial 은 나침 문양, Maple 은 잎).
 * 화면(WidgetCharm)이 그리는 자리는 남기되 보이지 않게, 움직이지도 않는다.
 */
export const Charm = styled(Base)`display: none;`;
export const Shape = styled.path.attrs({ d: 'M0 0' })`` as ComponentType;
