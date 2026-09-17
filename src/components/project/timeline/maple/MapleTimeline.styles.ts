/**
 * Maple 의 프로젝트 타임라인 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled from "styled-components";
import * as C from "../celestial/CelestialTimeline.styles";
import { hair, tape } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialTimeline.styles";
export { SectionWrapper, SectionTitle } from "@/components/project/maple/section";

export const TimelineDateHeader = styled(C.TimelineDateHeader)`
    border-color: ${(p) => hair(p.theme, 0.3)};
`;

export const TimelineVerticalLine = styled(C.TimelineVerticalLine)`
    border-color: ${(p) => (p.$isToday ? p.theme.colors.primary : hair(p.theme, 0.18))};
`;

export const DateCell = styled(C.DateCell)`
    border-color: ${(p) => hair(p.theme, 0.18)};
`;

export const DateNumber = styled(C.DateNumber)`
    font-family: ${(p) => p.theme.fonts.numeral};
    font-size: 0.9rem;
`;

/**
 * 작업 막대 = 마스킹테이프. 끝난 일은 바랜 테이프.
 * 글은 막대 밖으로 흘러나올 수 있어(Celestial 과 같이) 테이프 결은 ::before 한 겹에만 씌운다.
 */
export const TaskNode = styled(C.TaskNode)`
    border: none;
    border-radius: 0;
    background: transparent;
    color: ${(p) => (p.$status === "done" ? p.theme.colors.textSecondary : p.theme.colors.text)};

    &::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: -1;
        ${tape}
        background: ${(p) => p.$status === "done"
            ? withAlpha(p.theme.colors.text, 0.1)
            : `color-mix(in srgb, ${p.theme.colors.accent} ${p.theme.mode === "dark" ? "50%" : "58%"}, ${p.theme.colors.background})`};
        transition: background 0.2s;
    }

    &:hover {
        background: transparent;
        color: ${(p) => p.theme.colors.text};

        &::before { background: ${(p) => `color-mix(in srgb, ${p.theme.colors.accent} 78%, ${p.theme.colors.background})`}; }
    }
`;

export const TaskResizeHandle = styled(C.TaskResizeHandle)`
    &:hover { background-color: ${(p) => withAlpha(p.theme.colors.text, 0.18)}; }
`;
