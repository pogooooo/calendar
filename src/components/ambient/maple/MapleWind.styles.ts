/**
 * MapleWind 의 모양 — 바람 장면(windScene)의 캔버스. 둘레를 꽉 채우고 누르는 것은 받지 않는다.
 * 첫 장을 그리면 천천히 나타나고, 장면이 내려가면 곧바로 숨는다(멈춘 가지와 겹쳐 보이지 않게).
 */
import styled from "styled-components";

export const Leaves = styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0;

    &[data-ready] { opacity: 1; transition: opacity 0.8s ease; }
`;
