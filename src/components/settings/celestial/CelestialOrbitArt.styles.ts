/**
 * CelestialOrbitArt 의 모양 — '모양' 판 머리 오른쪽 위의 칸(예전 궤도 그림 자리). 3D 는 잘리면 어색해 판 안에 온전히 둔다.
 * 글이 없는 자리이고, 바탕 하늘은 이 칸 둘레를 비워 둔다(캔버스는 하늘이 비키는 자리로 읽힌다).
 */
import styled from "styled-components";
import { MOBILE } from "@/styles/breakpoints";

export const Slot = styled.div`
    position: absolute;
    right: 4px;
    top: -40px;
    width: 212px;
    height: 212px;
    pointer-events: auto;

    ${MOBILE} { display: none; }
`;
