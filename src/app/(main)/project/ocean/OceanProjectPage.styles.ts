/**
 * 바다의 프로젝트 화면 틀 — 위아래로 나눠 손잡이로 비율을 끄는 판(Celestial: 보드 위·타임라인 아래,
 * Maple: 타임라인 위·보드 아래) 대신 **판 넷을 맞물린 격자(bento)**.
 *
 *   ┌ 진행 전 ┐┌──── 타임라인 ──────────┐
 *   │ (키 큰  │└────────────────────────┘
 *   │   판)   │┌ 진행 중 ┐┌── 완료 ──┐
 *   └─────────┘└─────────┘└──────────┘
 *
 * 보드와 그 칸 묶음은 상자를 벗고(display: contents — OceanProjectBoard.styles) 칸 셋이 이 격자에 바로 앉는다.
 * 타임라인은 내용만큼 키가 자라다 판의 56% 에서 멈추고, 나머지를 아래 두 판이 나눈다. 끄는 손잡이는 없다.
 * 1100px 이하에서는 타임라인을 위에 넓게, 칸 셋을 아래 한 줄로. 폰은 보드 판 → 타임라인 판을 세로로.
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialProjectPage.styles";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialProjectPage.styles";

export const PageContainer = styled(C.PageContainer)`
    padding: 0 4px;

    ${MOBILE} { padding: 0 0 16px; }
`;

export const ContentLayout = styled(C.ContentLayout)`
    display: grid;
    grid-template-columns: minmax(280px, 0.82fr) minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: fit-content(56%) minmax(0, 1fr);
    grid-template-areas:
        "todo sea   sea"
        "todo doing done";
    gap: 12px;

    @media (max-width: 1100px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: fit-content(50%) minmax(0, 1fr);
        grid-template-areas:
            "sea  sea   sea"
            "todo doing done";
    }

    ${MOBILE} {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
`;

/** 끄는 손잡이는 바다에 없다 — 자리가 정해진 격자라 */
export const Resizer = styled(C.Resizer)`
    display: none;
`;

/** 프로젝트가 하나도 없을 때 */
export const Empty = styled(C.Empty)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.875rem;
    color: ${(p) => p.theme.colors.textSecondary};
`;
