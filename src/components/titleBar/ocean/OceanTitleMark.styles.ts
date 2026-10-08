/**
 * OceanTitleMark 의 모양 — 제목 줄 Cronos 앞의 작은 칸. 글자 흐름 밖(절대 위치)에 두고 제목이 그만큼 비켜 준다
 * (OceanTitleBar.styles 의 Title 이 :has() 로 왼쪽을 띄운다). 칸은 커서만 받고, 누르면 창 끌기가 그대로 먹는다.
 */
import styled from "styled-components";

export const Mark = styled.span`
    position: absolute;
    left: -26px;
    top: 50%;
    width: 20px;
    height: 20px;
    margin-top: -10px;
    pointer-events: auto;
`;
