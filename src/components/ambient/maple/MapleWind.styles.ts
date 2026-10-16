/**
 * MapleWind 의 모양 — 바람 장면(windScene)의 캔버스. 둘레를 꽉 채우고 누르는 것은 받지 않는다.
 * 넘겨받는 장면에 곧바로 나타나고(같은 자리·같은 자세의 잎이라 티가 안 난다), 장면이 내려가면 곧바로 숨는다.
 */
import styled from "styled-components";
import { agedArt } from "@/styles/vintage";

export const Leaves = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;

    &[data-ready] { opacity: 1; }
    /* 빈티지 벌은 빛바랜 사진처럼 */
    ${agedArt}
`;
