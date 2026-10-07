/**
 * 바다의 챌린지 — 뼈대(왼쪽 목록 | 오른쪽 위 칸판·아래 자세히)는 Celestial 과 같고, 겉만 바꾼다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 귀퉁이 금빛 사선·점선 상자·빛무리 대신: 세 칸 모두 20px 모서리의 반투명 판, 줄은 머리카락 선,
 * 고른 줄은 옅은 청록 면에 왼쪽 청록 선, 진행은 가는 막대(카테고리 색), 칸판은 번호 동그라미(ChallengeStickers).
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialChallenge.styles";
import { R, hairline, ink, seaButton, surface } from "@/styles/ocean/water";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialChallenge.styles";

/** 판 머리 — 15px 굵은 글씨 */
const headText = css`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.94rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: ${(p) => p.theme.colors.text};
`;

/** 판 — 귀퉁이 사선은 뗀다 */
const panel = css`
    ${surface("panel")}
    border-radius: ${R.lg};
    &::after { display: none; }
`;

export const CelestialCalendarWrapper = styled(C.CelestialCalendarWrapper)`
    font-family: ${(p) => p.theme.fonts.body};
    color: ${(p) => p.theme.colors.text};
`;

/** 화면 제목 — 굵은 글씨 하나, 뒤따르는 실선 없음 */
export const DateHeader = styled(C.DateHeader)`
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
    & > hr { display: none; }
`;

/** 판 사이 손잡이 — 가는 막대, 올리면 청록 */
export const HResizer = styled(C.HResizer)`
    width: 16px;
    .handle { width: 4px; height: 32px; border-radius: ${R.pill}; background-color: ${(p) => ink(p.theme, 0.12)}; transition: background-color 0.15s ease; }
    &:hover .handle { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)}; }
`;

export const VResizer = styled(C.VResizer)`
    height: 16px;
    .handle { height: 4px; width: 32px; border-radius: ${R.pill}; background-color: ${(p) => ink(p.theme, 0.12)}; transition: background-color 0.15s ease; }
    &:hover .handle { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.6)}; }
`;

/** 왼쪽 — 나의 챌린지 */
export const TimelineSection = styled(C.TimelineSection)`
    ${panel}
    overflow: hidden;
    padding-bottom: 6px;

    .timeline-header {
        ${headText}
        padding: 14px 16px 12px 18px;
        border-bottom: 1px solid ${(p) => hairline(p.theme)};

        .header-actions { gap: 8px; }
        .add-header-btn {
            ${seaButton("primary")}
            height: 32px;
            padding: 0 12px;
            gap: 6px;
            font-size: 0.8rem;
            letter-spacing: 0;
            &:hover { box-shadow: none; }
            ${MOBILE} { height: 40px; padding: 0 14px; }
        }
    }
`;

/**
 * 목록 — "진행 중"·"완료" 구역 이름은 화면에 박힌 인라인 꾸밈(굵은 글씨·청록 실선)이라 !important 로 덮는다:
 * 작은 꼬리표 글씨에 머리카락 선. 챌린지가 없을 때의 문구(가운데 정렬)는 본문 글씨로.
 */
export const TimelineScrollArea = styled(C.TimelineScrollArea)`
    & > div:not([class]) {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.74rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.01em;
        color: ${(p) => p.theme.colors.textSecondary} !important;
        padding: 14px 18px 6px !important;
        border-top-color: ${(p) => hairline(p.theme)} !important;
    }
    & > div:not([class])[style*="center"] {
        font-weight: 400 !important;
        font-size: 0.84rem !important;
        padding: 28px 18px !important;
    }
`;

/** 줄 — 머리카락 선, 올리면 옅은 면, 고르면 청록 면과 왼쪽 청록 선 */
export const ChallengeRow = styled(C.ChallengeRow)`
    gap: 16px;
    padding: 13px 18px;
    border-bottom: 1px solid ${(p) => hairline(p.theme)};
    box-shadow: ${(p) => (p.$isSelected ? `inset 2px 0 0 ${p.theme.colors.primary}` : "none")};
    background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.12 : 0.07) : "transparent")};
    transition: background-color 0.15s ease;

    &:hover {
        box-shadow: ${(p) => (p.$isSelected ? `inset 2px 0 0 ${p.theme.colors.primary}` : "none")};
        background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? 0.14 : 0.09) : ink(p.theme, p.theme.mode === "dark" ? 0.05 : 0.03))};
    }

    .challenge-info {
        min-width: 0;
        .title { font-size: 0.9rem; font-weight: 600; letter-spacing: -0.01em; }
        .desc { font-size: 0.78rem; margin-top: 2px; }
        .meta { font-family: ${(p) => p.theme.fonts.body}; font-size: 0.74rem; margin-top: 5px; }
    }
    .challenge-progress {
        width: 120px;
        gap: 7px;
        .count {
            font-family: ${(p) => p.theme.fonts.body};
            font-size: 0.74rem;
            font-variant-numeric: tabular-nums;
            color: ${(p) => p.theme.colors.textSecondary};
        }
    }

    ${MOBILE} {
        padding: 12px 16px;
        .challenge-progress { width: 96px; }
    }
`;

/** 진행 — 가는 막대 하나 (채움은 그 챌린지의 카테고리 색) */
export const ProgressBar = styled(C.ProgressBar)`
    height: 4px;
    border-radius: ${R.pill};
    background-color: ${(p) => ink(p.theme, p.theme.mode === "dark" ? 0.12 : 0.08)};
    .fill { border-radius: inherit; transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
`;

export const BaseCard = styled(C.BaseCard)`
    ${panel}
    .card-header { ${headText} padding: 16px 18px 6px; }
`;

/** 오른쪽 위 — 칸판. 번호 동그라미가 고른 간격으로 늘어선다 */
export const StickerBoardCard = styled(C.StickerBoardCard)`
    ${panel}
    .card-header { ${headText} padding: 16px 18px 6px; }
    .sticker-content {
        padding: 10px 18px 18px;
        .placeholder { font-size: 0.84rem; color: ${(p) => p.theme.colors.textSecondary}; }
    }
`;

export const StickerGrid = styled(C.StickerGrid)`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(34px, 1fr));
    justify-items: center;
    gap: 10px 8px;
`;

export const StickerSlot = styled(C.StickerSlot)`
    width: 34px;
    height: 34px;
`;

/** 오른쪽 아래 — 자세히 */
export const TaskCard = styled(C.TaskCard)`
    ${panel}
    .card-header { ${headText} padding: 16px 18px 6px; }
`;

export const DetailArea = styled(C.DetailArea)`
    padding: 8px 18px 18px;

    .placeholder { font-size: 0.84rem; color: ${(p) => p.theme.colors.textSecondary}; text-align: center; }

    .detail-content {
        gap: 12px;
        h3 { font-size: 1.06rem; font-weight: 700; letter-spacing: -0.02em; }
        p { font-size: 0.84rem; line-height: 1.55; }

        /* 속성 — 점선 상자 대신 판 안의 작은 카드 */
        .stats {
            ${surface("card")}
            border-radius: ${R.md};
            padding: 12px 14px;
            gap: 7px;
            font-size: 0.84rem;
            font-variant-numeric: tabular-nums;
            strong { font-weight: 500; color: ${(p) => p.theme.colors.textSecondary}; margin-right: 4px; }
        }
        .actions { gap: 8px; .sub-actions { gap: 8px; } }
    }
`;
