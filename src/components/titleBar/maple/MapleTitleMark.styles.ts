/**
 * MapleTitleMark 의 모양 — 제목 줄 CRONOS 앞의 작은 수채 단풍잎. 줄 높이를 늘리지 않게 위아래를 비켜 앉는다.
 * 누르면 창 끌기(data-tauri-drag-region)가 그대로 먹는다.
 */
import styled from "styled-components";
import { watercolorLeaf } from "@/styles/maple/ink";

export const Mark = styled.span`
    ${watercolorLeaf("red", "16px")}
    margin: -5px 7px -5px -3px;
    vertical-align: middle;
    rotate: -14deg;
`;
