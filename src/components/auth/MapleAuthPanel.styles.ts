/**
 * MapleAuthPanel 의 모양 — 종이 바탕(옅은 빛 두 군데) 가운데에 노트 그림, 왼쪽 아래에 상표.
 * 상표는 붉은 벡터 단풍잎 하나와 명조 CRONOS, 그 밑에 본문 글꼴의 한 줄 소개.
 */
import styled, { keyframes } from "styled-components";
import { MOBILE } from "@/styles/breakpoints";
import { hair, watercolorLeaf } from "@/styles/maple/ink";

export const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const BrandPanel = styled.div`
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    overflow: hidden;
    background-color: ${(p) => p.theme.colors.background};
    background-image: ${(p) => (p.theme.mode === "dark"
        ? `radial-gradient(ellipse at 85% 10%, ${p.theme.colors.primary}1F, transparent 55%)`
        : `radial-gradient(ellipse at 85% 8%, ${p.theme.colors.accent}38, transparent 55%),
           radial-gradient(ellipse at 10% 95%, ${p.theme.colors.primary}14, transparent 50%)`)};
    border-right: 1px solid ${(p) => hair(p.theme, p.theme.mode === "dark" ? 0.1 : 0.08)};

    ${MOBILE} { display: none; }
`;

/** 노트 그림 — 판 가운데보다 조금 위. 판이 작으면 그림도 작아진다 */
export const Art = styled.div`
    position: absolute;
    left: 50%;
    top: 44%;
    --nb: clamp(8px, 1.05vw, 12.5px);
    transform: translate(-50%, -50%);
`;

export const BrandContent = styled.div`
    position: relative;
    z-index: 1;
    margin: 0 0 9% 10%;
    animation: ${fadeUp} 0.9s ease both;
`;

export const ServiceName = styled.h1`
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0;
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 2.6rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    line-height: 1.1;
    color: ${(p) => p.theme.colors.text};

    &::before {
        content: "";
        ${watercolorLeaf("red", "1em")}
        flex: none;
        rotate: -14deg;
    }
`;

export const Tagline = styled.p`
    margin: 12px 0 0 2px;
    font-size: 1rem;
    color: ${(p) => p.theme.colors.textSecondary};
`;
