/**
 * Maple 의 챌린지 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialChallenge.styles";
import { withAlpha } from "@/styles/color";
import { ASSET, hair, paperCard, stampButton } from "@/styles/maple/ink";

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
        ${stampButton("default")}
        color: ${(p) => p.theme.colors.primary};
        letter-spacing: 0.06em;
        &:hover { box-shadow: none; }
    }
`;

export const DateHeader = styled(C.DateHeader)`
    & > hr { border-top-color: ${(p) => hair(p.theme, 0.45)}; }
`;

/** 화면 귀퉁이에 갈색 잎(B5) 한 장 — 카테고리·기념일 화면과 같은 손 */
export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    position: relative;

    &::after {
        content: "";
        position: absolute;
        left: -70px;
        bottom: -60px;
        width: 220px;
        height: 220px;
        background: url("${ASSET}/leaf-brown.webp") center / contain no-repeat;
        opacity: ${(p) => (p.theme.mode === "dark" ? 0.08 : 0.1)};
        transform: rotate(160deg);
        pointer-events: none;
    }
`;

export const TimelineSection = styled(C.TimelineSection)`${inkPanel}`;
export const StickerBoardCard = styled(C.StickerBoardCard)`${inkPanel}`;
export const TaskCard = styled(C.TaskCard)`${inkPanel}`;
export const BaseCard = styled(C.BaseCard)`${inkPanel}`;

/** 줄: 고르면 황토 물. 빛무리 없음 */
export const ChallengeRow = styled(C.ChallengeRow)`
    border-bottom-color: ${(p) => hair(p.theme, 0.16)};
    box-shadow: none;
    ${(p) => p.$isSelected && css`background-color: ${withAlpha(p.theme.colors.accent, 0.16)};`}
    &:hover { box-shadow: none; background-color: ${(p) => withAlpha(p.theme.colors.accent, 0.12)}; }

    .challenge-info .title { font-family: ${(p) => p.theme.fonts.display}; }
    .challenge-info .title .star-icon {
        filter: none;
        color: ${(p) => p.theme.colors.primary};
    }
    .challenge-info .meta { font-family: ${(p) => p.theme.fonts.numeral}; font-size: 0.82rem; }
    .challenge-progress .count { font-family: ${(p) => p.theme.fonts.numeral}; font-size: 0.86rem; }
`;

/** 진행 막대 + 놋쇠 메달(F2): 시작 전은 빈 메달, 가는 중은 반, 다 채우면 온 메달 */
export const ProgressBar = styled(C.ProgressBar)`
    position: relative;
    overflow: visible;
    height: 3px;
    background-color: ${(p) => hair(p.theme, 0.18)};

    &::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 9px;
        width: 22px;
        height: 22px;
        background: url("${ASSET}/${(p) => (p.$progress >= 100 ? "medal-full" : p.$progress > 0 ? "medal-half" : "medal-empty")}.webp") center / contain no-repeat;
        filter: ${(p) => (p.theme.mode === "dark" ? "brightness(0.9)" : "none")};
    }
`;

export const DetailArea = styled(C.DetailArea)`
    border-color: ${(p) => hair(p.theme, 0.45)};

    .detail-content h3 { font-family: ${(p) => p.theme.fonts.display}; letter-spacing: 0.02em; }

    .detail-content .stats {
        ${paperCard("3px")}
        border-style: solid;
        border-color: ${(p) => hair(p.theme, 0.3)};
        strong { font-family: ${(p) => p.theme.fonts.display}; font-weight: 500; }
        /* 장부 줄(이름 · 점선 · 값)은 Celestial 만 */
        & > div { display: block; }
        & > div > strong { order: 0; font-size: inherit; color: inherit; }
        & > div::before { content: none; }
    }
`;

/**
 * 스티커 판의 짜임이 다르다 — Celestial 은 스티커를 줄줄이 흘려 붙이지만,
 * Maple 은 표본 대지다. 칸이 자로 잰 격자로 서고, 빈 자리에도 네모난 자국이 남으며,
 * 칸마다 아래에 번호가 붙는다 (표본 번호).
 */
export const StickerGrid = styled(C.StickerGrid)`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
    gap: 22px 10px;
    counter-reset: specimen;
    padding: 4px 2px 6px;
`;

export const StickerSlot = styled(C.StickerSlot)`
    width: 100%;
    max-width: 62px;
    margin: 0 auto;
    height: 56px;
    border-radius: 0;
    counter-increment: specimen;

    /* 대지에 그어 둔 자리 — 표본을 붙일 네모 */
    &::before {
        content: "";
        position: absolute;
        inset: 0;
        border: 1px dashed ${(p) => hair(p.theme, 0.22)};
        pointer-events: none;
    }

    /* 표본 번호 */
    &::after {
        content: counter(specimen);
        position: absolute;
        left: 0;
        right: 0;
        bottom: -15px;
        text-align: center;
        font-family: ${(p) => p.theme.fonts.numeral};
        font-size: 0.7rem;
        line-height: 1;
        color: ${(p) => p.theme.colors.textSecondary};
        opacity: 0.6;
    }
`;
