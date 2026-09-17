import styled from "styled-components";
import { SectionWrapper as CelestialSectionWrapper, SectionTitle as CelestialSectionTitle } from "@/components/project/celestial/section";
import { hair } from "@/styles/maple/ink";

/** 프로젝트 화면의 큰 칸 — Celestial 의 틀에서 금빛 선과 귀퉁이 사선만 먹으로 바꾼 것 */
export const SectionWrapper = styled(CelestialSectionWrapper)`
    border-color: ${(p) => hair(p.theme, 0.45)};

    &::after { display: none; }
`;

export const SectionTitle = styled(CelestialSectionTitle)`
    border-bottom-color: ${(p) => hair(p.theme, 0.45)};
    color: ${(p) => p.theme.colors.text};
    letter-spacing: 0.06em;
`;
