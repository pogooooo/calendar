/**
 * OceanEmptyArt 의 모양 — 글 위 가운데의 작은 아이콘 하나. 물빛 한 빛깔로 옅게 — 글보다 앞서지 않게.
 */
import styled from "styled-components";

export const Art = styled.span`
    display: block;
    width: 40px;
    height: 40px;
    margin: 4px auto 10px;
    color: ${(p) => p.theme.colors.primary};
    opacity: ${(p) => (p.theme.mode === "dark" ? 0.55 : 0.5)};

    svg { display: block; width: 100%; height: 100%; }

    @media (max-width: 768px) {
        width: 34px;
        height: 34px;
    }
`;
