/**
 * Maple 의 챌린지 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트: 판 셋(목록 · 스티커 판 · 자세히)이 종이 위의 카드로 서고, 목록 줄은 둥근 칸(고르면 단풍 붉음이 옅게),
 * 진행 막대는 둥근 알약, 스티커 판은 동그라미 격자(채우면 단풍잎 스티커 — MapleChallengeSticker).
 * 예전의 놋쇠 메달·표본 대지의 점선 칸과 번호·귀퉁이의 큰 수채 잎은 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialChallenge.styles";
import { withAlpha } from "@/styles/color";
import { crest, hair, paperCard, stampButton } from "@/styles/maple/ink";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialChallenge.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

/**
 * 카드 안의 굴림 막대 — 가는 것 하나 (앱 전체의 눈금자 막대는 카드 안에서 무겁다).
 * 마우스 화면에서만: 손가락 화면에 이 속성을 주면 겹쳐 뜨던 막대가 자리를 차지하는 막대로 바뀐다
 */
const thinScroll = css`
    @media (hover: hover) {
        scrollbar-width: thin;
        scrollbar-color: ${(p) => hair(p.theme, 0.22)} transparent;
    }
`;

/** 판 하나 — 종이 위의 카드. 머리글은 카드 제목(명조 굵게, 글자색) */
const panel = css`
    ${paperCard()}
    overflow: hidden;

    /* 귀퉁이 사선은 Celestial 만 */
    &::after { display: none; }

    .timeline-header,
    .card-header {
        min-height: 54px;
        padding: 12px 16px 8px;
        border-bottom: none;
        font-family: ${(p) => p.theme.fonts.display};
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0;
        line-height: 1.35;
        color: ${(p) => p.theme.colors.text};
    }

    .card-header {
        display: flex;
        align-items: center;
    }

    /* 새 챌린지 — 이 판의 할 일이라 단풍 붉음으로 채운 알약 */
    .timeline-header .add-header-btn {
        ${stampButton("primary")}
        height: 32px;
        padding: 0 13px 0 10px;
        gap: 4px;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 13px;
        letter-spacing: 0;

        ${MOBILE} { height: 36px; padding: 0 14px 0 11px; }
    }
`;

/** 화면 제목 — 작은 단풍잎 + 명조 굵게. 옆으로 긋던 긴 선은 걷는다 */
export const DateHeader = styled(C.DateHeader)`
    gap: 10px;
    margin-bottom: 18px;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.2;

    &::before {
        content: "";
        ${crest("16px")}
        flex-shrink: 0;
        color: ${(p) => p.theme.colors.primary};
    }

    & > hr { display: none; }

    ${MOBILE} {
        gap: 8px;
        margin-bottom: 14px;
        font-size: 22px;
    }
`;

export const TimelineSection = styled(C.TimelineSection)`${panel}`;
export const StickerBoardCard = styled(C.StickerBoardCard)`
    ${panel}

    .sticker-content {
        padding: 6px 16px 16px;
        ${thinScroll}

        .placeholder {
            font-size: 13.5px;
            line-height: 1.6;
            text-align: center;
            color: ${(p) => p.theme.colors.textSecondary};
        }
    }
`;
export const TaskCard = styled(C.TaskCard)`
    ${panel}
    ${thinScroll}
`;
export const BaseCard = styled(C.BaseCard)`${panel}`;

/** 목록 — 카드 안쪽으로 조금 들인 둥근 줄들. 묶음 이름(배치의 인라인 글)은 줄의 글과 같은 자리에 선다 */
export const TimelineScrollArea = styled(C.TimelineScrollArea)`
    padding: 0 8px 10px;
    ${thinScroll}

    /* 진행 중 · 종료 묶음 이름과 빈 목록 안내 — 금빛 윗줄·회색 글은 옅은 선·보조 글로 */
    & > div:not([role]) {
        color: ${(p) => p.theme.colors.textSecondary} !important;
        border-top-color: ${(p) => hair(p.theme, 0.08)} !important;
    }
`;

/** 줄 — 둥근 칸. 올리면 옅게, 고르면 단풍 붉음이 옅게 깔린다 (빛무리 없음) */
export const ChallengeRow = styled(C.ChallengeRow)`
    gap: 16px;
    padding: 12px 16px;
    border-bottom: none;
    border-radius: 10px;
    box-shadow: none;
    background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.16 : 0.08) : "transparent")};
    transition: background-color 0.15s ease;

    & + & { margin-top: 2px; }

    &:hover {
        box-shadow: none;
        background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.18 : 0.1) : hair(p.theme, dark(p) ? 0.06 : 0.04))};
    }

    &:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.4)};
    }

    .challenge-info {
        min-width: 0;

        .title {
            font-family: ${(p) => p.theme.fonts.display};
            font-size: 15px;
            font-weight: 700;
            line-height: 1.35;
            color: ${(p) => (p.$isSelected ? p.theme.colors.primary : p.theme.colors.text)};
        }

        .desc {
            margin-top: 3px;
            font-size: 13px;
            line-height: 1.5;
        }

        .meta {
            margin-top: 4px;
            font-family: ${(p) => p.theme.fonts.body};
            font-size: 12.5px;
            font-variant-numeric: tabular-nums;
        }
    }

    .challenge-progress {
        width: 120px;
        flex-shrink: 0;
        gap: 8px;

        .count {
            font-family: ${(p) => p.theme.fonts.body};
            font-size: 12.5px;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
            color: ${(p) => p.theme.colors.text};
        }
    }

    ${MOBILE} {
        .challenge-progress { width: 96px; }
    }
`;

/** 진행 막대 — 둥근 알약. 찬 부분은 카테고리 색 */
export const ProgressBar = styled(C.ProgressBar)`
    height: 6px;
    border-radius: 999px;
    background-color: ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.08)};

    .fill { border-radius: 999px; }
`;

/** 판 사이의 손잡이 — 옅은 알약(올리면 붉게) */
export const HResizer = styled(C.HResizer)`
    width: 16px;

    .handle {
        width: 4px;
        height: 40px;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.18 : 0.14)};
    }

    &:hover .handle { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.65)}; }
`;

export const VResizer = styled(C.VResizer)`
    height: 16px;

    .handle {
        width: 40px;
        height: 4px;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.18 : 0.14)};
    }

    &:hover .handle { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.65)}; }
`;

/**
 * 자세히 — 제목은 명조 굵게, 설명은 보조 글, 수치는 옴폭한 작은 칸들(이름 위, 값 아래 굵게)이 한 줄로 선다.
 * Celestial 의 장부 줄(이름 · 점선 · 값)은 걷었다 — 줄 넷이 쌓이면 판 아래의 단추가 밀려 가려졌다.
 */
export const DetailArea = styled(C.DetailArea)`
    padding: 4px 16px 16px;

    .placeholder {
        font-size: 13.5px;
        line-height: 1.6;
        text-align: center;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    .detail-content {
        gap: 14px;

        h3 {
            font-family: ${(p) => p.theme.fonts.display};
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0;
            line-height: 1.3;
        }

        p {
            font-size: 14px;
            line-height: 1.6;
            word-break: keep-all;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
            gap: 8px;
            padding: 0;
            border: none;
            background: none;
            font-size: 15px;
            font-weight: 700;

            & > div {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 3px;
                min-width: 0;
                padding: 10px 12px;
                border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.07)};
                border-radius: 10px;
                background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.background} ${dark(p) ? 60 : 70}%, ${p.theme.colors.surface})`};
                font-variant-numeric: tabular-nums;
            }

            & > div > strong {
                order: 0;
                font-family: inherit;
                font-size: 12px;
                font-weight: 500;
                color: ${(p) => p.theme.colors.textSecondary};
            }

            & > div::before { content: none; }

            ${MOBILE} { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        .actions { gap: 10px; }
    }
`;

/** 스티커 판 — 동그라미가 고른 칸으로 선다 (번호는 스티커 안에) */
export const StickerGrid = styled(C.StickerGrid)`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(42px, 1fr));
    gap: 10px 8px;
    justify-items: center;
    padding: 2px 0;
`;

export const StickerSlot = styled(C.StickerSlot)`
    width: 40px;
    height: 40px;
    border-radius: 50%;
`;
