/**
 * MapleCanopy 의 캔버스 — 둘레를 꽉 채우고 누르는 것은 받지 않는다. 다 그려지면 천천히 나타난다.
 */
import styled from "styled-components";
import { agedArt } from "@/styles/vintage";

export const Canvas = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.9s ease;

    &[data-ready] { opacity: 1; }
    html[data-theme-motion="off"] & { transition: none; }
    /* 빈티지 벌은 빛바랜 사진처럼 */
    ${agedArt}
`;
