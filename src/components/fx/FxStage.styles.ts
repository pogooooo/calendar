import styled from "styled-components";

/** 맨 위(창·대화상자보다 위)에 깔리되 누르는 것은 아래로 그대로 지나간다 */
export const Canvas = styled.canvas`
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 5000;
    pointer-events: none;
`;
