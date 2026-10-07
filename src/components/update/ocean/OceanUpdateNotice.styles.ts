/**
 * 바다의 업데이트 알림(데스크톱 오른쪽 아래) — 금빛 테두리·빛무리·귀퉁이 사선(Celestial), 덩굴 귀 종이(Maple) 대신
 * **알림 토스트**: 떠 있는 흰 판(14px 모서리), 작은 옅은 머리 글씨 + 15px·600 판 번호, 고친 것들은 작은 점 목록,
 * 단추는 오른쪽 — "나중에" 글자 단추와 청록 "설치". 받는 중에는 가는 진행 막대. 살짝 떠오르며 나타난다(한 번).
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialUpdateNotice.styles";
import { EASE, ink, seaButton, surface, surfaceIn } from "@/styles/ocean/water";
import { ghostIcon } from "@/components/modal/baseModal/ocean/oceanLayer";

export * from "../celestial/CelestialUpdateNotice.styles";

export const Panel = styled(C.Panel)`
    ${surface("float")}
    position: fixed;
    width: 300px;
    padding: 14px 16px 16px;
    border-radius: 14px;
    font-family: ${(p) => p.theme.fonts.body};
    animation: ${surfaceIn} 0.4s ${EASE} both;
`;

/** 귀퉁이 사선은 그리지 않는다 */
export const Corner = styled(C.Corner)`
    display: none;
`;

export const Label = styled(C.Label)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0;
`;

export const CloseBtn = styled(C.CloseBtn)`
    ${ghostIcon("24px")}
    svg { width: 14px; height: 14px; }
`;

export const Version = styled(C.Version)`
    margin-top: 4px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
`;

/** 고친 것들 — 작은 점 목록 */
export const Notes = styled(C.Notes)`
    padding-left: 14px;
    font-size: 0.78rem;
    li::marker { color: ${(p) => ink(p.theme, 0.35)}; }
`;

export const Desc = styled(C.Desc)`
    font-size: 0.78rem;
`;

export const Row = styled(C.Row)`
    gap: 6px;
    margin-top: 14px;
`;

export const GhostBtn = styled(C.GhostBtn)`
    ${seaButton("ghost")}
    height: 30px;
    padding: 0 12px;
    font-size: 0.78rem;
    letter-spacing: 0;
    &:hover:not(:disabled) { border-color: transparent; }
`;

export const PrimaryBtn = styled(C.PrimaryBtn)`
    ${seaButton("primary")}
    height: 30px;
    padding: 0 12px;
    font-size: 0.78rem;
    letter-spacing: 0;
    svg { width: 14px; height: 14px; }
    &:hover:not(:disabled) { box-shadow: none; }
`;

/** 받는 중 — 가는 막대 */
export const Rail = styled(C.Rail)`
    height: 4px;
    margin-top: 12px;
    overflow: hidden;
    border-radius: 999px;
    background: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.12 : 0.08)};
`;

export const Fill = styled(C.Fill)`
    border-radius: inherit;
    background: ${(p) => p.theme.colors.primary};
    box-shadow: none;
    transition: width 0.3s ${EASE};
`;
