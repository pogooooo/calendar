/**
 * Maple 의 프로젝트 보드 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 가을 노트: 보드 카드 안에 칸 셋이 옴폭한 종이 판(바탕색)으로 서고, 그 위에 할 일 카드가 떠 있다.
 * 칸 머리에는 상태의 빛깔 점(진행 전 호박빛 · 진행 중 단풍 붉음 · 완료 초록)과 개수 알약 — 타임라인 막대도 같은 빛깔을 쓴다.
 * 예전의 마스킹테이프 띠·황토 이름표 띠·상자 꼬리표는 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialProjectBoard.styles";
import { cardShadow, hair, stampButton } from "@/styles/maple/ink";
import { withAlpha } from "@/styles/color";
import { MOBILE } from "@/styles/breakpoints";

export * from "../celestial/CelestialProjectBoard.styles";
export { SectionWrapper, SectionTitle } from "@/components/project/maple/section";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";

export const BoardGrid = styled(C.BoardGrid)`
    gap: 12px;
    padding: 2px 14px 14px;

    ${MOBILE} { padding: 2px 10px 10px; }
`;

/**
 * 칸 하나 — 카드 안에 옴폭 들어간 판. 밝은 벌은 종이(바탕)색, 어두운 벌도 바탕 쪽으로 — 할 일 카드(surface)가 그 위에 떠 보인다.
 * 칸의 빛깔은 --col-dot 으로 머리글 점에 건넨다 (칸은 늘 진행 전 · 진행 중 · 완료 차례로 선다)
 */
export const BoardColumn = styled(C.BoardColumn)`
    border: none;
    border-radius: 10px;
    background-color: ${(p) => `color-mix(in srgb, ${p.theme.colors.background} ${dark(p) ? 72 : 82}%, ${p.theme.colors.surface})`};

    --col-dot: ${(p) => p.theme.colors.accent};
    &:nth-child(2) { --col-dot: ${(p) => p.theme.colors.primary}; }
    &:nth-child(3) { --col-dot: ${(p) => p.theme.colors.success}; }
`;

export const ColumnHeader = styled(C.ColumnHeader)`
    min-height: 46px;
    padding: 8px 8px 4px 14px;
    border-bottom: none;
    background: none;

    ${MOBILE} {
        min-height: 0;
        padding: 8px 8px 2px;
    }
`;

/** 칸 이름 — 앞에 상태 점, 뒤의 "(3)" 은 괄호를 감추고 개수 알약으로 */
export const ColumnTitle = styled(C.ColumnTitle)`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};

    &::before {
        content: "";
        width: 8px;
        height: 8px;
        flex-shrink: 0;
        border-radius: 50%;
        background-color: var(--col-dot);
    }

    .paren { display: none; }

    .count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 22px;
        height: 20px;
        padding: 0 7px;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.07)};
        color: ${(p) => p.theme.colors.textSecondary};
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }
`;

/** 칸 머리의 "추가" — 바탕 없는 알약, 붉은 글씨. 올리면 붉음이 옅게 */
export const AddTaskButton = styled(C.AddTaskButton)`
    ${stampButton("ghost")}
    padding: 5px 12px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 13px;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.primary};

    &:hover {
        border-color: transparent;
        background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.14 : 0.08)};
    }

    ${MOBILE} {
        padding: 6px 12px;
        min-height: 32px;
        font-size: 13px;
    }
`;

export const CardList = styled(C.CardList)`
    padding: 2px 8px 10px;
    gap: 8px;
    /* 카드 안의 굴림 막대는 가는 것 하나 — 앱 전체의 눈금자 막대는 칸 안에서 무겁다.
       마우스 화면에서만(손가락 화면에서는 겹쳐 뜨는 막대가 자리를 차지하는 막대로 바뀐다) */
    @media (hover: hover) {
        scrollbar-width: thin;
        scrollbar-color: ${(p) => hair(p.theme, 0.22)} transparent;
    }
`;

/** 폰의 칸 고르개 — 둥근 홈 안의 세 칸(고른 것만 카드처럼 떠오른다) */
export const ColumnPicker = styled(C.ColumnPicker)`
    ${MOBILE} {
        gap: 2px;
        margin: 0 10px 6px;
        padding: 3px;
        border-radius: 10px;
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.08 : 0.055)};
    }
`;

export const ColumnPick = styled(C.ColumnPick)`
    min-height: 34px;
    border: none;
    border-radius: 8px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 13px;
    font-weight: ${(p) => (p.$on ? 700 : 500)};
    letter-spacing: 0;
    color: ${(p) => (p.$on ? p.theme.colors.text : p.theme.colors.textSecondary)};
    background: ${(p) => (!p.$on ? "transparent" : dark(p) ? `color-mix(in srgb, ${p.theme.colors.text} 12%, ${p.theme.colors.surface})` : p.theme.colors.surface)};
    box-shadow: ${(p) => (!p.$on ? "none" : dark(p) ? "0 1px 2px rgba(0, 0, 0, 0.4)" : "0 1px 2px rgba(86, 54, 32, 0.14)")};
    transition: background-color 0.15s ease, color 0.15s ease;

    em {
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        color: ${(p) => (p.$on ? p.theme.colors.primary : p.theme.colors.textSecondary)};
        opacity: 1;
    }
`;

/** 빈 칸 — 옅은 점선 자리에 한 줄 */
export const ColumnEmpty = styled(C.ColumnEmpty)`
    padding: 18px 12px;
    border: 1px dashed ${(p) => hair(p.theme, dark(p) ? 0.16 : 0.14)};
    border-radius: 10px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 13px;
    color: ${(p) => p.theme.colors.textSecondary};
    opacity: 1;
`;

/** 할 일 카드 — 칸 위에 뜬 깨끗한 카드(둥근 10px). 올리면 선이 조금 짙어지고 그림자가 커진다 */
export const CardBox = styled(C.CardBox)`
    gap: 8px;
    padding: 11px 12px 10px;
    border: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.08)};
    border-radius: 10px;
    background-color: ${(p) => p.theme.colors.surface};
    box-shadow: ${(p) => (dark(p) ? "0 1px 2px rgba(0, 0, 0, 0.3)" : "0 1px 2px rgba(86, 54, 32, 0.06)")};
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &::before { content: none; }

    &:hover {
        border-color: ${(p) => hair(p.theme, dark(p) ? 0.2 : 0.16)};
        box-shadow: ${cardShadow};
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.28)};
    }
`;

/** 제목 — 본문 굵게. 끝낸 일의 줄 긋기는 제목 글에만(꼬리표 알약까지 그어지지 않게) */
export const CardTitle = styled(C.CardTitle)`
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    text-decoration: none;

    .title-text {
        min-width: 0;
        text-decoration: ${(p) => (p.$isDone ? "line-through" : "none")};
        text-decoration-color: ${(p) => hair(p.theme, 0.45)};
    }
`;

const priorityTone = css<{ $priority: string }>`
    color: ${(p) => (p.$priority === "high"
        ? p.theme.colors.error
        : p.$priority === "low"
            ? p.theme.colors.textSecondary
            : dark(p) ? p.theme.colors.accent : `color-mix(in srgb, ${p.theme.colors.accent} 45%, ${p.theme.colors.text})`)};
    background-color: ${(p) => (p.$priority === "high"
        ? withAlpha(p.theme.colors.error, dark(p) ? 0.2 : 0.1)
        : p.$priority === "low"
            ? hair(p.theme, dark(p) ? 0.1 : 0.06)
            : withAlpha(p.theme.colors.accent, dark(p) ? 0.18 : 0.22))};
`;

/** 우선순위 — 알약. 높음은 붉음, 보통은 호박빛, 낮음은 옅은 밤색 */
export const PriorityTag = styled(C.PriorityTag)`
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border: none;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    ${priorityTone}

    /* 마름모·둥근 점은 Celestial 만 */
    &::before { content: none; }
`;

/** 대기(선행 조건이 안 끝남) — 점선 알약 */
export const LockedTag = styled(C.LockedTag)`
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border: 1px dashed ${(p) => hair(p.theme, 0.3)};
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
`;

export const CardMeta = styled(C.CardMeta)`
    gap: 8px;
`;

export const CardDate = styled(C.CardDate)`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
`;

export const CardAssignees = styled(C.CardAssignees)`
    font-size: 12px;
    border-left-color: ${(p) => hair(p.theme, 0.14)};
`;

/** 옮기기 단추 — 작은 카드 알약 */
export const CardMoveButton = styled(C.CardMoveButton)`
    ${stampButton("default")}
    padding: 3px 10px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 12px;
    line-height: 1.4;

    ${MOBILE} {
        padding: 6px 12px;
        min-height: 32px;
        font-size: 12.5px;
    }
`;
