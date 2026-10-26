/**
 * Maple 의 일간 — 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 2026-10-15 다시 그림: 금빛 실선 상자·먹 하이라인·마스킹테이프 대신 종이 위의 깨끗한 카드들(할 일·시간표·챌린지·임시 작업·메모).
 * 카드 제목은 명조로 또렷하게, 접는 꺾쇠는 오른쪽 끝에. 시간표는 옅은 선 위에 붉은 막대가 눕는다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialDayCalendar.styles";
import { leafDate } from '@/styles/maple/calendarMarks';
import { MOBILE } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { crest, hair, inkCheckbox, inkInput, leafChip, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialDayCalendar.styles";

const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
/** 카드 사이의 틈 — 끌어 나누는 손잡이의 키도 같다 */
const GAP = "12px";

/** 노트의 종이는 페이지 바탕이 맡는다. 내용은 괘선과 여백으로만 나눈다. */
const notebookPanel = css`
    position: relative;
    background: transparent;
    border: 1px solid ${(p) => hair(p.theme, 0.16)};
    border-radius: 4px;
    box-shadow: none;
`;

export const DateStamp = styled(C.DateStamp)`
    ${leafDate}
    flex-direction:column;
    width:64px; height:70px; background:none; border:0; border-right:1px solid ${(p) => hair(p.theme, .2)};
    border-radius:0; color:${p => p.theme.colors.primary}; font-family:${p => p.theme.fonts.display}; font-size:2.2rem; font-weight:450;
    small { margin-top:1px; font-size:.55rem; }
    ${MOBILE} { width:54px; height:58px; font-size:2.2rem; }
`;

/** 날짜 머리 — 화면 제목(명조). 거르개는 오른쪽 끝으로, 예전의 실선은 걷는다 */
export const DateHeader = styled(C.DateHeader)`
    && { border-bottom:1px solid ${p => hair(p.theme,.2)}; padding-bottom:12px; font-size:1.02rem; }
    min-height: 40px;
    margin-bottom: 14px;
    gap: 8px;
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: 0;

    & > span {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    & > hr { display: none; }

    /* The full date remains visible on narrow screens. */
    ${MOBILE} {
        min-height: 0;
        margin-bottom: 8px;
        justify-content: flex-end;
    }
`;

/** 카드 사이를 끌어 나누는 손잡이 — 옅은 점 셋, 짚으면 붉게 */
export const ResizeHandle = styled(C.ResizeHandle)`
    height: ${GAP};

    span {
        width: 4px;
        height: 4px;
        background: ${(p) => hair(p.theme, 0.18)};
    }

    &:hover span {
        background: ${(p) => p.theme.colors.primary};
        transform: none;
    }
`;

/** 카드 머리(누르면 접힌다) — 명조 제목, 개수 알약, 오른쪽 끝의 꺾쇠. 밑줄 없음 */
export const SectionToggle = styled(C.SectionToggle)`
    min-height: 44px;
    gap: 8px;
    padding: 10px 12px 8px 14px;
    border-bottom: none;
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: 0;
    transition: background-color 0.15s ease;

    &:hover {
        color: ${(p) => p.theme.colors.text};
        background-color: ${(p) => hair(p.theme, dark(p) ? 0.04 : 0.025)};
    }

    &:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 2px ${(p) => withAlpha(p.theme.colors.primary, 0.3)};
    }

    .label { order: 0; }

    .count {
        order: 1;
        padding: 1px 8px;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, 0.06)};
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.textSecondary};
        opacity: 1;
    }

    .chev {
        order: 2;
        color: ${(p) => p.theme.colors.textSecondary};
    }
`;

/* ── 카드들 ─────────────────────────────────────────────── */

export const TodoCard = styled(C.TodoCard)`
    ${notebookPanel}
    border-top: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.65)};
    overflow: hidden;
    margin-bottom: ${GAP};
`;

/** 할 일 카드 머리 — 붉은 단풍잎 하나, 명조 제목, 개수 알약 */
export const TodoCardHead = styled(C.TodoCardHead)`
    min-height: 44px;
    gap: 8px;
    padding: 10px 14px 8px;
    border-bottom: none;
    font-size: 0.9375rem;
    font-weight: 700;

    i {
        ${crest("13px")}
        flex-shrink: 0;
        transform: none;
        border: none;
        color: ${(p) => p.theme.colors.primary};
    }

    .count {
        padding: 1px 8px;
        border-radius: 999px;
        background-color: ${(p) => hair(p.theme, 0.06)};
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0;
        font-variant-numeric: tabular-nums;
        color: ${(p) => p.theme.colors.textSecondary};
        opacity: 1;
    }
`;

export const TodoList = styled(C.TodoList)`
    padding: 0 6px 6px;
    gap: 0;
`;

/** 그날 일정 한 줄 — 카테고리 색 단풍잎, 제목, 시각. 줄 사이 선 없이 둥근 칸(마우스를 올리면 옅게 든다) */
export const TodoRow = styled(C.TodoRow)`
    min-height: 40px;
    padding: 8px 8px;
    border-radius: 8px;
    border-bottom: none;
    transition: background-color 0.15s ease;

    &:hover { background-color: ${(p) => hair(p.theme, dark(p) ? 0.05 : 0.035)}; }
    &:active { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.08)}; }

    /* 색은 JSX 가 인라인 background-color 로 준다 — 잎 마스크에 그대로 물든다 */
    .dot {
        ${leafChip(5, "12px")}
        background-color: ${(p) => p.theme.colors.primary};
        opacity: ${(p) => (p.$isDone ? 0.4 : 1)};
    }

    .title {
        font-size: 0.875rem;
        color: ${(p) => (p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text)};
        opacity: 1;
    }

    .time {
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        letter-spacing: 0;
    }
`;

/** 시간표 카드 */
export const TimelineSection = styled(C.TimelineSection)`
    ${notebookPanel}
    overflow: hidden;

    /* 폰에는 끌어 나누는 손잡이가 없다 — 그 자리만큼 틈을 둔다 */
    ${MOBILE} { margin-bottom: ${GAP}; }
`;

/**
 * 시간표 한 줄 — 시각은 왼쪽에 작은 숫자, 줄은 옅은 머리카락 선. 칸의 테두리·겹줄·세 시각마다의 굵은 줄은 걷었다.
 * 마우스가 올라간 줄에만 10분 칸의 점선이 옅게 비친다(뼈대의 --slot-rule).
 */
export const TimeRow = styled(C.TimeRow)`
    && { min-height: 40px; }
    && .time-label { width: 56px; border-right: 1px solid ${(p) => withAlpha(p.theme.colors.primary, 0.22)}; font-family: ${(p) => p.theme.fonts.numeral}; font-size: 0.95rem; }
    && .time-slots { padding-left: 8px; }
    min-height: 38px;
    border-bottom: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.08 : 0.07)};

    &:last-child { border-bottom: none; }
    &:hover { --slot-rule: ${(p) => hair(p.theme, 0.1)}; }

    .time-label {
        width: 52px;
        justify-content: flex-end;
        padding-right: 10px;
        border-right: none;
        font-family: ${(p) => p.theme.fonts.body};
        font-size: 0.75rem;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        letter-spacing: 0;
        color: ${(p) => p.theme.colors.textSecondary};
    }

    .time-slots {
        padding: 6px 10px 6px 2px;

        .slot-bar-container { border: none; border-radius: 6px; }

        .slot-box:hover { background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.1 : 0.06)}; }
    }
`;

/**
 * 시간표의 일정 — 옅은 붉음 막대, 시작에 붉은 띠, 글은 글자색. 끝낸 일은 바랜 막대.
 * 10분 칸마다 한 조각이고 이웃 조각과 2px 겹친다 — 반투명이면 겹친 자리가 진한 세로줄로 보여 카드 색에 섞어 불투명으로
 */
export const SlotTodoItem = styled(C.SlotTodoItem)`
    background-color: ${(p) => `color-mix(in srgb, ${p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.primary} ${p.$isDone ? (dark(p) ? 12 : 10) : (dark(p) ? 30 : 17)}%, ${p.theme.colors.surface})`};
    border-radius: ${(p) => `${p.$isContinuingPrev ? 0 : 5}px ${p.$isContinuingNext ? 0 : 5}px ${p.$isContinuingNext ? 0 : 5}px ${p.$isContinuingPrev ? 0 : 5}px`};
    box-shadow: ${(p) => (p.$isContinuingPrev ? "none" : `inset 3px 0 0 ${p.$isDone ? hair(p.theme, 0.25) : p.theme.colors.primary}`)};

    .todo-text {
        left: 9px;
        font-size: 0.75rem;
        font-weight: 600;
        color: ${(p) => (p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text)};
    }
`;

/** 아래 묶음 — 챌린지·임시 작업·메모. 접혀도 카드끼리 붙지 않게 늘 틈을 둔다 */
export const ChallengeCard = styled(C.ChallengeCard)`
    ${notebookPanel}
    overflow: hidden;
    margin-bottom: ${GAP};
`;

/* 폰: 뼈대는 이 카드를 200px 로 못 박아, 할 일이 없으면 빈 종이만 컸다 — 내용만큼 자라고 길면 안에서 굴린다 */
export const TaskCard = styled(C.TaskCard)`
    ${notebookPanel}
    overflow: hidden;

    ${MOBILE} {
        height: auto;
        margin-bottom: ${GAP};
    }
`;

export const MemoCard = styled(C.MemoCard)`
    && textarea {
        background-image: repeating-linear-gradient(to bottom, transparent 0 27px, ${(p) => hair(p.theme, 0.1)} 27px 28px);
        background-position: 0 3px;
        line-height: 28px;
        padding-top: 3px;
        color: ${(p) => p.theme.colors.text};
    }
    ${notebookPanel}
    overflow: hidden;

    textarea {
        padding: 2px 14px 12px;
        font-size: 0.875rem;
        line-height: 1.6;

        &::placeholder { color: ${(p) => withAlpha(p.theme.colors.textSecondary, 0.85)}; }
    }
`;

export const SideSection = styled(C.SideSection)`
    ${MOBILE} { margin-top: 0; }
`;

export const ChallengeList = styled(C.ChallengeList)`
    gap: 2px;
    padding: 0 8px 8px;
`;

/** 챌린지 한 줄 — 둥근 네모 체크(채우면 단풍 붉음) */
export const ChallengeItem = styled(C.ChallengeItem)`
    gap: 10px;
    padding: 7px 8px;
    border-radius: 8px;
    transition: background-color 0.15s ease;

    &:hover { background-color: ${(p) => hair(p.theme, dark(p) ? 0.05 : 0.035)}; }

    .box {
        width: 18px;
        height: 18px;
        ${(p) => inkCheckbox(p.$isDone)}
    }

    input:focus-visible + .box {
        outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.4)};
        outline-offset: 2px;
    }

    .title {
        font-size: 0.875rem;
        opacity: 1;
        color: ${(p) => (p.$isDone ? p.theme.colors.textSecondary : p.theme.colors.text)};
    }
`;

export const ChallengeEmpty = styled(C.ChallengeEmpty)`
    padding: 6px 14px 16px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    letter-spacing: 0;
`;

export const TaskList = styled(C.TaskList)`
    gap: 2px;
    padding: 0 8px 6px;

    ${MOBILE} { max-height: 240px; }
    &:empty { padding: 0; }
`;

/** 임시 작업 한 줄 — 둥근 네모 체크, 지우기는 마우스가 올 때 */
export const TaskItem = styled(C.TaskItem)`
    gap: 10px;
    padding: 6px 8px;
    border-radius: 8px;
    transition: background-color 0.15s ease;

    &:hover { background-color: ${(p) => hair(p.theme, dark(p) ? 0.05 : 0.035)}; }

    .check-btn {
        width: 18px;
        height: 18px;
        ${(p) => inkCheckbox(p.$isDone)}

        &:focus-visible {
            outline: 2px solid ${(p) => withAlpha(p.theme.colors.primary, 0.4)};
            outline-offset: 2px;
        }
    }

    .task-text { font-size: 0.875rem; }

    .delete-btn {
        border-radius: 6px;
        transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;

        &:hover {
            color: ${(p) => p.theme.colors.error};
            background-color: ${(p) => withAlpha(p.theme.colors.error, 0.1)};
        }

        &:focus-visible { opacity: 1; }
    }
`;

/** 임시 작업 더하기 — 둥근 입력칸과 둥근 네모 + 단추 */
export const TaskForm = styled(C.TaskForm)`
    gap: 6px;
    padding: 8px 10px 10px;
    border-top: 1px solid ${(p) => hair(p.theme, 0.07)};

    input {
        ${inkInput}
        padding: 7px 12px;
        font-size: 0.875rem;
    }

    button {
        ${stampButton("default", { square: true })}
        width: 34px;
        flex-shrink: 0;
        color: ${(p) => p.theme.colors.primary};
    }
`;

/** 메모를 못 남겼을 때 — 테마의 오류색으로 (예전엔 #e05b5b 가 박혀 있었다) */
export const MemoError = styled(C.MemoError)`
    border-top-color: ${(p) => withAlpha(p.theme.colors.error, 0.3)};
    font-size: 0.75rem;
    color: ${(p) => p.theme.colors.error};

    button {
        border-color: ${(p) => withAlpha(p.theme.colors.error, 0.4)};
        border-radius: 8px;
        color: ${(p) => p.theme.colors.error};

        &:hover { border-color: ${(p) => p.theme.colors.error}; }
    }
`;

/**
 * 카드들이 굴러가는 판 — 마지막 카드의 그림자가 잘리지 않게 아래를 조금 비운다.
 * 카드 사이의 틈은 끌어 나누는 손잡이(12px)가 맡는데, 위 카드를 접으면 손잡이가 빠져 두 카드가 맞붙었다 — 그때만 틈을 준다.
 * (폰은 손잡이를 감추므로 카드가 제 아래 틈을 갖는다)
 */
export const ContentLayout = styled(C.ContentLayout)`
    padding-bottom: 12px;

    @media (min-width: 769px) {
        & > ${TimelineSection} + ${SideSection} { margin-top: ${GAP}; }
        ${TaskCard} + ${MemoCard} { margin-top: ${GAP}; }
    }
`;
