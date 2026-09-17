/**
 * Maple 의 챌린지 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialChallenge.styles";
import { hair } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";

export * from "../celestial/CelestialChallenge.styles";

/** 판의 틀: 먹 하이라인, 귀퉁이 금빛 사선은 뗀다 */
const inkPanel = css`
    border-color: ${(p) => hair(p.theme, 0.45)};

    &::after { display: none; }

    .timeline-header,
    .card-header {
        border-bottom-color: ${(p) => hair(p.theme, 0.45)};
        color: ${(p) => p.theme.colors.text};
        letter-spacing: 0.04em;
    }

    .timeline-header .add-header-btn {
        border-color: ${(p) => hair(p.theme, 0.5)};
        color: ${(p) => p.theme.colors.primary};
        letter-spacing: 0.06em;

        &:hover { box-shadow: none; border-color: ${(p) => p.theme.colors.primary}; }
    }
`;

export const DateHeader = styled(C.DateHeader)`
    & > hr { border-top-color: ${(p) => hair(p.theme, 0.45)}; }
`;

export const TimelineSection = styled(C.TimelineSection)`${inkPanel}`;
export const StickerBoardCard = styled(C.StickerBoardCard)`${inkPanel}`;
export const TaskCard = styled(C.TaskCard)`${inkPanel}`;
export const BaseCard = styled(C.BaseCard)`${inkPanel}`;

export const ChallengeRow = styled(C.ChallengeRow)`
    border-bottom-color: ${(p) => hair(p.theme, 0.16)};
    ${(p) => p.$isSelected && css`background-color: ${withAlpha(p.theme.colors.accent, 0.16)};`}
`;

export const DetailArea = styled(C.DetailArea)`
    border-color: ${(p) => hair(p.theme, 0.45)};
`;

/** 스티커 칸을 조금 키운다 — 잎 스티커는 톱니 테두리까지 보여야 한다 */
export const StickerSlot = styled(C.StickerSlot)`
    width: 52px;
    height: 52px;
`;
