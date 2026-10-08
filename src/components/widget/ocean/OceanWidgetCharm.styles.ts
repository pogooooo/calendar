/**
 * OceanWidgetCharm 의 모양 — 머리 줄 빈자리 한가운데의 작은 물방울.
 *
 * 바다의 머리 줄(OceanWidgetShell 의 TopBar: 왼쪽 12px 에서 18px 막대 · 빈자리 · 오른쪽 6px 앞의 단추 묶음 76px)에서
 * 빈자리의 가운데는 창 가운데보다 26px 왼쪽이다. 높이는 줄 가운데(위에서 15px).
 * 머리 줄처럼 평소엔 옅고, 위젯에 커서가 오면 또렷해진다(움직이지는 않는다). 누름은 아래 줄로 통과 — 끌어 옮기기 그대로.
 */
import styled from "styled-components";

const SIZE = 18;

export const Jewel = styled.span`
    position: absolute;
    z-index: 4;
    top: ${15 - SIZE / 2}px;
    left: calc(50% - 26px - ${SIZE / 2}px);
    width: ${SIZE}px;
    height: ${SIZE}px;
    pointer-events: none;
    opacity: 0.7;
    transition: opacity 0.15s ease;

    [data-widget]:hover & { opacity: 1; }
    /* 아주 작은 위젯에서는 머리 줄이 비좁다 */
    @media (max-width: 220px) { display: none; }
`;
