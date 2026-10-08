/**
 * CelestialHeroScene 의 모양 — three.js 가 그린 canvas 를 칸에 꽉 채운다.
 */
import styled from "styled-components";

export const Mount = styled.div`
    width: 100%;
    height: 100%;

    canvas {
        width: 100% !important;
        height: 100% !important;
    }
`;
