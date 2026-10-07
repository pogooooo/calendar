/**
 * CelestialEmptyArt 의 모양 — 글 위 가운데의 작은 칸 하나. 글보다 앞서지 않게 작게(Maple 선화 128px 보다 한참 작게).
 */
import styled from "styled-components";

export const Art = styled.span`
    display: block;
    width: 96px;
    height: 96px;
    margin: 0 auto 6px;

    @media (max-width: 768px) {
        width: 84px;
        height: 84px;
    }
`;
