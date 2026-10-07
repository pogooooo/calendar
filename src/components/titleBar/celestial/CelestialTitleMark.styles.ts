/**
 * CelestialTitleMark 의 모양 — 제목 줄 CRONOS 앞의 작은 칸. 줄 높이를 늘리지 않게 위아래를 비켜 앉는다.
 * 칸은 커서만 받고(올리면 돈다), 누르면 창 끌기(data-tauri-drag-region)가 그대로 먹는다.
 */
import styled from "styled-components";

export const Mark = styled.span`
    display: inline-block;
    width: 22px;
    height: 22px;
    margin: -8px 9px -8px -3px;
    vertical-align: middle;
    pointer-events: auto;
`;
