/**
 * OceanPageTransition 의 모양 — 새 화면이 0.3초 동안 8px 떠오르며 나타난다. 덮는 막·문양·빛 없음.
 *
 * 본문은 transform 대신 top 으로 올린다: transform(·filter)이 걸린 동안에는 안의 고정 단추(폰의 +)가
 * 화면이 아니라 본문을 기준으로 서 버린다(Maple 에서 겪은 일, BUGS.md). 움직임을 끄면 그대로(calm), 끝없는 움직임 없음.
 */
import styled, { css, keyframes } from "styled-components";
import { EASE, calm } from "@/styles/ocean/water";

const arrive = keyframes`
    from { opacity: 0; top: 8px; }
    to   { opacity: 1; top: 0; }
`;

export const Stage = styled.div`
    position: relative;
    height: 100%;
`;

export const Body = styled.div<{ $animate: boolean }>`
    position: relative;
    height: 100%;

    ${(p) => p.$animate && css`
        animation: ${arrive} 0.3s ${EASE} both;
        ${calm}
    `}
`;
