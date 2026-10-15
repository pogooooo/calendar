/**
 * MapleArrow 의 모양 — 부르는 쪽이 준 자리 가운데에 꺾쇠를 세운다.
 */
import styled from "styled-components";

export const Box = styled.span<{ $w: number; $h: number; $ink?: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${(p) => p.$w}px;
    height: ${(p) => p.$h}px;
    color: ${(p) => p.$ink ?? "currentColor"};
`;
