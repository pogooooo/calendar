/**
 * 오브제 칸의 모양 — 2D 캔버스 한 장. 크기는 부른 쪽이 정하고(width·height), 나머지는 비켜 선다.
 * 누름은 무대(stage)가 오브제마다 켜고 끈다(받지 않는 오브제는 뒤로 통과).
 */
import styled from "styled-components";

export const Canvas = styled.canvas`
    display: block;
    flex: none;
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
`;
