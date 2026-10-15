/**
 * MapleHeroScene 의 모양 — 큰 그림 자리(HeroArt) 가운데에 노트 그림. 자리가 좁아지면 그림도 작아진다(--nb).
 */
import styled from "styled-components";

export const Scene = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    --nb: 10.4px;

    @media (max-width: 1000px) { --nb: 7.6px; }
`;
