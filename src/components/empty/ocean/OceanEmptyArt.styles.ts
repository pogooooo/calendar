/**
 * OceanEmptyArt 의 모양 — 글 위 가운데의 작은 칸 하나(오브제). 글보다 앞서지 않게 작게.
 * WebGL 이 없을 때의 예전 그림(가는 선 조개, 옅게)도 여기.
 */
import styled from "styled-components";
import { shell } from "@/styles/ocean/water";

export const Art = styled.span`
    display: grid;
    place-items: center;
    width: 92px;
    height: 92px;
    margin: 0 auto 6px;

    @media (max-width: 768px) {
        width: 80px;
        height: 80px;
    }
`;

/** 예전 그림 — 가는 선으로 그린 조개 하나 */
export const Shell = styled.span`
    display: block;
    ${shell("34px")}
    opacity: 0.45;
    pointer-events: none;
`;
