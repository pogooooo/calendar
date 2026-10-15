/**
 * MapleTitleMark 의 모양 — 제목 줄 CRONOS 앞의 작은 붉은 잎. 줄 높이를 늘리지 않게 위아래를 비켜 앉는다.
 * 누르면 창 끌기(data-tauri-drag-region)가 그대로 먹는다.
 */
import styled from "styled-components";
import { crest } from "@/styles/maple/ink";

export const Mark = styled.span`
    ${crest("13px")}
    margin: -4px 8px -4px -2px;
    vertical-align: middle;
    color: ${(p) => p.theme.colors.primary};
    rotate: -12deg;
`;
