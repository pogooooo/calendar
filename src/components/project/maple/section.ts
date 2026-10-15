import styled from "styled-components";
import { SectionWrapper as CelestialSectionWrapper, SectionTitle as CelestialSectionTitle } from "@/components/project/celestial/section";
import { paperCard } from "@/styles/maple/ink";

/**
 * 프로젝트 화면의 큰 칸(보드·타임라인) — 종이 위의 카드 한 장(둥근 14px·옅은 선·그림자).
 * 예전엔 Celestial 의 틀에 먹선만 바꿔 둘렀다. 이제 둘 다 같은 카드라 화면이 두 장으로 또렷하게 나뉜다.
 * 안의 것(타임라인 격자·칸)은 둥근 모서리에 맞춰 잘린다(overflow: hidden — 뼈대가 이미 준다).
 */
export const SectionWrapper = styled(CelestialSectionWrapper)`
    ${paperCard()}
`;

/** 칸의 이름 — 카드 제목처럼 명조 굵게, 글자색. 예전의 넓은 자간·옅은 글은 걷는다 */
export const SectionTitle = styled(CelestialSectionTitle)`
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.3;
    color: ${(p) => p.theme.colors.text};
    padding: 14px 16px 8px;
    border-bottom: none;
`;
