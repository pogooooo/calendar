/**
 * MapleHeroScene 의 모양 — 도감 한 장(H2)을 종이에 붙인 듯 놓고, 그 위로 잎 넷이 천천히 지난다.
 * 움직임을 줄여 달라고 한 기기에서는 잎이 멈춘다.
 */
import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";
import { hair, tape } from "@/styles/maple/ink";

export const fall = keyframes`
    from { transform: translate3d(0, -12%, 0) rotate(-10deg); opacity: 0; }
    12%  { opacity: 0.85; }
    88%  { opacity: 0.85; }
    to   { transform: translate3d(var(--drift, 20px), 112%, 0) rotate(140deg); opacity: 0; }
`;

export const Scene = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

/** 붙여 놓은 한 장 — 살짝 기울고, 먹 하이라인 테두리에 위쪽 두 귀에는 종이 테이프 */
export const Plate = styled.span`
    position: relative;
    display: inline-block;
    max-width: 86%;
    transform: rotate(-1.2deg);

    img {
        display: block;
        max-width: 100%;
        max-height: 100%;
        border: 1px solid ${(p) => hair(p.theme, 0.35)};
        box-shadow: 0 10px 24px ${(p) => withAlpha("#000000", p.theme.mode === "dark" ? 0.45 : 0.12)};
        opacity: ${(p) => (p.theme.mode === "dark" ? 0.88 : 1)};
    }

    &::before, &::after {
        content: "";
        position: absolute;
        top: -11px;
        width: 74px;
        height: 22px;
        ${tape}
        background-color: ${(p) => withAlpha(p.theme.colors.accent, p.theme.mode === "dark" ? 0.4 : 0.8)};
        pointer-events: none;
    }

    &::before { left: -18px; transform: rotate(-8deg); }
    &::after { right: -18px; transform: rotate(7deg); }
`;

export const Leaf = styled.img`
    position: absolute;
    top: 0;
    width: 42px;
    height: auto;
    pointer-events: none;
    opacity: 0;

    :where(html:not([data-theme-motion="off"])) & {
        animation: ${fall} linear infinite;
    }
`;
