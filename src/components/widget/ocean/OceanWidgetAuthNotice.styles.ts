/**
 * 바다의 위젯 안내('로그인해 주세요'·불러오는 중) — 뼈대는 Celestial 과 같으므로 그쪽 것을 가져오고 글씨만 바꾼다.
 * 그림 없이 글과 간격으로: 위는 본문 글씨(굵게), 아래는 옅은 작은 글씨.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialWidgetAuthNotice.styles";

export * from "../celestial/CelestialWidgetAuthNotice.styles";

export const Center = styled(C.Center)`
    gap: 4px;
    padding: 0 16px;
    font-size: 0.86rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
`;

export const Sub = styled(C.Sub)`
    font-size: 0.76rem;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0;
    opacity: 1;
    color: ${(p) => p.theme.colors.textSecondary};
`;
