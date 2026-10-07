/**
 * OceanAuthPanel 의 모양 — 서식 판 위 가운데의 상표와 한 줄 소개.
 * 큰 라틴 상표만 기울인 세리프(SERIF), 소개는 본문 글꼴의 옅은 글자. 그림·광택·그라데이션 없음.
 * 기다리는 동안(data-busy)에는 살짝 옅어진다.
 */
import styled from "styled-components";
import { EASE, SERIF, surfaceIn } from "@/styles/ocean/water";

export const Panel = styled.div`
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    color: ${(p) => p.theme.colors.text};
    transition: opacity 0.2s ease;
    animation: ${surfaceIn} 0.5s ${EASE} both;

    &[data-busy="true"] { opacity: 0.55; }
`;

export const Wordmark = styled.h1`
    margin: 0;
    font-family: ${SERIF};
    font-style: italic;
    font-weight: 400;
    font-size: 3.4rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: ${(p) => p.theme.colors.text};

    @media (max-width: 768px) { font-size: 2.9rem; }
`;

export const Tagline = styled.p`
    margin: 0;
    font-size: 0.86rem;
    letter-spacing: -0.005em;
    color: ${(p) => p.theme.colors.textSecondary};
`;
