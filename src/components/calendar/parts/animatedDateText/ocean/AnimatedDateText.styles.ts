/**
 * 바다의 머리 날짜 글씨 — 바뀔 때의 몸짓은 공용(위아래로 짧게 미끄러지며 옅어졌다 나타남, 한 번)이고,
 * 여기서는 숫자 폭만 고정폭으로 맞춘다(달이 바뀌어도 글씨가 옆으로 흔들리지 않게).
 */
import styled from "styled-components";
import * as C from "../celestial/AnimatedDateText.styles";

export * from "../celestial/AnimatedDateText.styles";

export const DateTextContainer = styled(C.DateTextContainer)`
    font-variant-numeric: tabular-nums;
`;
