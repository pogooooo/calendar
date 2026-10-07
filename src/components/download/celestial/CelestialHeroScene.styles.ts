/**
 * CelestialHeroScene 의 모양 — 칸(340px)보다 사방 22% 넓게 그리고, 가장자리는 둥글게 옅어진다.
 * (혼천의는 카메라를 물려 예전 크기 그대로, 넓어진 자리는 둘레의 별이 쓴다)
 */
import styled from "styled-components";

export const Mount = styled.div`
    position: absolute;
    inset: -22%;

    canvas {
        width: 100% !important;
        height: 100% !important;
        -webkit-mask-image: radial-gradient(closest-side, #000 66%, transparent 100%);
        mask-image: radial-gradient(closest-side, #000 66%, transparent 100%);
    }
`;

/** WebGL 이 없을 때 — 예전 표지를 칸 가운데에 */
export const Flat = styled.div`
    position: absolute;
    inset: 22%;
    display: flex;
    align-items: center;
    justify-content: center;
`;
