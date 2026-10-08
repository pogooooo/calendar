/**
 * MapleWidgetCharm 의 모양 — 손잡이 줄(먹 하이라인) 한가운데에 얹힌 작은 단풍잎, 그리고 모서리의 옅은 선화 잎(WidgetCharm.styles).
 *
 * 손잡이 줄(WidgetShell 의 TopBar: 잎 · 선 · 단추 셋)의 선은 왼쪽에서 오른쪽 단추 묶음(98px) 앞까지라
 * 선의 가운데는 창 가운데보다 35.5px 왼쪽이다(Celestial 과 같은 뼈대). 높이는 선(위에서 15px)에 중심을 맞춘다.
 * 손잡이 줄처럼 평소엔 옅고, 위젯에 커서가 오면 또렷해진다(움직이지는 않는다). 누름은 아래 줄로 통과 — 끌어 옮기기 그대로.
 */
import styled from "styled-components";

export { Charm, Shape } from "./WidgetCharm.styles";

const SIZE = 20;

export const Jewel = styled.span`
    position: absolute;
    z-index: 4;
    top: ${15 - SIZE / 2}px;
    left: calc(50% - 35.5px - ${SIZE / 2}px);
    width: ${SIZE}px;
    height: ${SIZE}px;
    pointer-events: none;
    opacity: 0.7;
    transition: opacity 0.14s ease;

    [data-widget]:hover & { opacity: 1; }
    /* 아주 작은 위젯에서는 선이 짧아 비좁다 */
    @media (max-width: 220px) { display: none; }
`;
