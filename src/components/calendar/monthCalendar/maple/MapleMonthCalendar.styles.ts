/**
 * Maple 의 월간 — "가을 노트"의 한 쪽 (2026-10-15 다시 그림 — 사용자: "maple 테마가 안 예쁘다").
 * 뼈대는 Celestial 과 같으므로 그쪽 것을 통째로 가져오고, 달라지는 것만 덮어쓴다.
 * (여기서 이름을 새로 정의하면 그것이 위의 재수출보다 앞선다 — ES 모듈 규칙)
 *
 * 종이 위에 카드 한 장을 놓고 그 안을 옅은 모눈으로 나눈다. (Celestial: 금빛 실선 격자, Ocean: 칸 없는 유리 한 장)
 *   - 날짜는 칸의 오른쪽 위 구석 — 노트의 쪽 번호 자리. 일요일은 주말색
 *   - 오늘은 단풍 붉음으로 채운 작은 알약, 고른 날은 칸에 붉음이 옅게 든다
 *   - 일정 막대는 카테고리 색을 옅게 깐 둥근 막대에 왼쪽 색 띠, 글은 글자색
 *   - 요일 줄은 차분한 글씨 한 줄 — 예전의 수채 띠는 불길처럼 보였다
 * 예전의 먹 화살·말린 잎(today-marker)·마스킹테이프 같은 그림 파일은 걷었다.
 */
import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialMonthCalendar.styles";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { hair, leafChip, paperCard, stampButton } from "@/styles/maple/ink";

export * from "../celestial/CelestialMonthCalendar.styles";

type P = { theme: { mode: "light" | "dark"; colors: { primary: string; surface: string } } };
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
/** 채운 붉음 위의 글자색 (ink.ts 의 단추와 같은 값) */
const onPrimary = (p: { theme: { mode: string } }) => (dark(p) ? "#1A1512" : "#FFFFFF");
/** 카테고리 색을 카드에 옅게 섞은 면 — 불투명이라 여러 날 막대가 고른 칸(물든 칸)을 지나도 한 빛깔로 이어진다 */
const tint = (p: P, color: string | undefined, light: number, night: number) =>
    `color-mix(in srgb, ${color ?? p.theme.colors.primary} ${dark(p) ? night : light}%, ${p.theme.colors.surface})`;

/** 달 이름과 ‹ › — 이름은 화면 제목(명조), 화살은 lucide 꺾쇠를 그대로 쓰는 작은 네모 단추 */
export const DateRangeDisplay = styled(C.DateRangeDisplay)`
    font-family: ${(p) => p.theme.fonts.display};
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: 0;
    color: ${(p) => p.theme.colors.text};

    .nav-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 10px;
        color: ${(p) => p.theme.colors.textSecondary};
        transition: background-color 0.15s ease, color 0.15s ease;

        svg { width: 18px; height: 18px; }

        &:hover {
            transform: none;
            color: ${(p) => p.theme.colors.text};
            background-color: ${(p) => hair(p.theme, 0.06)};
        }

        &:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px ${(p) => withAlpha(p.theme.colors.primary, 0.28)};
        }
    }

    ${MOBILE} { font-size: 1.125rem; }

    /* 위젯 창은 좁다 — 제목을 본문 크기로 */
    [data-widget] & { font-size: 0.9rem; }
`;

/** 오늘로: 카드 같은 알약 단추 (금빛 테·빛무리 없음) */
export const TodayButton = styled(C.TodayButton)`
    ${stampButton("default")}
    height: 30px;
    margin-left: 6px;
    padding: 0 12px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.8125rem;
    letter-spacing: 0;

    &:hover:not(:disabled) { border-color: var(--stamp-ink); box-shadow: none; }
    &:disabled { opacity: 0.45; }

    ${MOBILE} {
        min-height: 30px;
        padding: 0 12px;
        font-size: 0.8125rem;
        &:active { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.1)}; }
    }
`;

/** 달력 판 = 카드 한 장. 달을 넘기는 몸짓(책장 넘김)은 이 카드 안에서 일어난다 */
export const CalendarWindow = styled(C.CalendarWindow)`
    ${paperCard()}
    overflow: hidden;

    /* 위젯은 껍데기가 이미 카드다 — 카드 안의 카드는 두지 않는다 */
    [data-widget] & {
        background-color: transparent;
        border: none;
        border-radius: 0;
        box-shadow: none;
    }
`;

/* 폰(600px 아래)의 가로 스크롤 상자가 카드 그림자를 잘랐다 — 넘침은 카드가 스스로 자르므로 열어 둔다 */
export const SliderWrapper = styled(C.SliderWrapper)`
    @media (max-width: 600px) { overflow: visible; }
`;

/** 요일 줄: 상자·수채 띠 없이 차분한 글씨 한 줄, 아래로 옅은 선 하나 */
export const Header = styled(C.Header)`
    font-family: ${(p) => p.theme.fonts.body};
    border: none;
    border-bottom: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.12 : 0.1)};

    &::after { content: none; }
`;

export const DayNameBox = styled(C.DayNameBox)`
    height: 36px;
    border-right: none;
    /* 날짜 숫자와 같은 오른쪽 줄에 선다 */
    justify-content: flex-end;
    padding: 0 10px;
    color: ${(p) => p.theme.colors.textSecondary};

    /* "SUN" → "Sun" — 작은 대문자에 넓은 자간은 흐렸다 */
    .day-name {
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        text-transform: lowercase;

        &::first-letter { text-transform: uppercase; }
    }

    &:first-child { color: ${(p) => p.theme.colors.weekend}; }

    ${MOBILE} {
        height: 30px;
        justify-content: center;
        padding: 0;

        .day-name { font-size: 0.72rem; letter-spacing: 0; }
    }
`;

export const GridContainer = styled(C.GridContainer)`
    border: none;
`;

/** 주 사이의 옅은 선 — 노트의 모눈 */
export const WeekRowContainer = styled(C.WeekRowContainer)`
    border-bottom: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.08)};
`;

/**
 * 칸 — 옅은 모눈 한 칸. 날짜는 오른쪽 위 구석(Celestial·Ocean 은 왼쪽 위).
 * 고른 날은 칸에 붉음이 옅게 들고 숫자가 붉어진다. 오늘은 숫자가 붉은 알약이 된다.
 */
export const DayCell = styled(C.DayCell)`
    border-right: 1px solid ${(p) => hair(p.theme, dark(p) ? 0.1 : 0.08)};
    opacity: ${(p) => (p.$isCurrentMonth ? 1 : 0.42)};
    background-color: ${(p) => (p.$isSelected ? withAlpha(p.theme.colors.primary, dark(p) ? 0.13 : 0.065) : "transparent")};
    box-shadow: ${(p) => (p.$dropTarget ? `inset 0 0 0 2px ${p.theme.colors.primary}` : "none")};
    transition: background-color 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        box-shadow: ${(p) => (p.$dropTarget ? `inset 0 0 0 2px ${p.theme.colors.primary}` : "none")};
        ${(p) => !p.$isSelected && css`background-color: ${hair(p.theme, dark(p) ? 0.04 : 0.025)};`}
    }

    /*
     * 날짜 줄은 24px — 오늘 알약(24px)과 기념일 고리가 그 안에 꼭 들어간다. 머리 줄(.day-header)과 그 안 칸이 넘침을 자르므로
     * 음수 여백으로 밖에 걸치면 알약 끝이 잘렸다. 숫자의 오른쪽 끝은 칸 끝에서 10px — 요일 글씨와 한 줄에 선다.
     */
    .day-header {
        padding: 4px ${(p) => (p.$isToday ? 4 : 8)}px 2px 8px;

        /* 날짜는 오른쪽 구석에 */
        & > div:first-child { justify-content: flex-end; }

        .day-number {
            padding: 0 2px;
            font-family: ${(p) => p.theme.fonts.body};
            font-size: 0.8125rem;
            line-height: 24px;
            font-weight: ${(p) => (p.$isSelected ? 700 : 500)};
            font-variant-numeric: tabular-nums;
            letter-spacing: 0;
            color: ${(p) => (p.$isSelected ? p.theme.colors.primary : p.theme.colors.text)};
        }
    }

    /* 일요일 숫자는 주말색 — 오늘·고른 날은 제 색을 지킨다 */
    ${(p) => !p.$isToday && !p.$isSelected && css`
        &:first-child .day-header .day-number { color: ${p.theme.colors.weekend}; }
    `}

    /* 오늘: 단풍 붉음 알약에 흰 숫자 (금빛 알약·빛무리 대신) */
    ${(p) => p.$isToday && css`
        .day-header .day-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
            height: 24px;
            margin: 0;
            padding: 0 6px;
            border-radius: 12px;
            background: ${p.theme.colors.primary};
            color: ${onPrimary(p)};
            font-weight: 700;
            box-shadow: none;
        }
    `}

    ${MOBILE} {
        &:active { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.1)}; }

        .day-header {
            padding: 4px ${(p) => (p.$isToday ? 2 : 4)}px 0 4px;

            .day-number { font-size: 0.75rem; line-height: 20px; }
        }

        ${(p) => p.$isToday && css`
            .day-header .day-number {
                min-width: 20px;
                height: 20px;
                padding: 0 5px;
                border-radius: 10px;
            }
        `}
    }
`;

/** 오늘 원반(별 시계·말린 잎)은 없다 — 숫자 자체가 붉은 알약이 된다 */
export const TodayDisc = styled(C.TodayDisc)`
    display: none;
`;

/** 칸 위의 + — 날짜가 오른쪽에 있으니 왼쪽 위에, 옅은 둥근 네모로 */
export const AddTodoButton = styled(C.AddTodoButton)`
    top: 6px;
    left: 6px;
    right: auto;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 7px;
    background-color: ${(p) => hair(p.theme, 0.06)};
    color: ${(p) => p.theme.colors.textSecondary};
    transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;

    svg { width: 14px; height: 14px; }

    &:hover {
        transform: none;
        background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.12)};
        color: ${(p) => p.theme.colors.primary};
    }
`;

/**
 * 일정 막대 — 카테고리 색을 옅게 깐 둥근 막대, 시작 칸 앞에 3px 색 띠, 글은 글자색. 찢은 결·테이프 없음.
 * 폰에서는 막대 대신 카테고리 색 단풍잎을 가로로 늘어놓는다 (끝낸 일은 옅게).
 */
export const TodoBarItem = styled(C.TodoBarItem)`
    height: 20px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 500;
    background-color: ${(p) => tint(p, p.$color, 19, 26)};
    border-radius: ${(p) => `${p.$isStart ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isEnd ? 5 : 0}px ${p.$isStart ? 5 : 0}px`};
    margin-left: ${(p) => (p.$isStart ? "5px" : "0")};
    margin-right: ${(p) => (p.$isEnd ? "5px" : "0")};
    box-shadow: ${(p) => (p.$isStart ? `inset 3px 0 0 ${p.$color ?? p.theme.colors.primary}` : "none")};

    .todo-title {
        padding: 0 6px 0 8px;
        color: ${(p) => p.theme.colors.text};
    }

    &:hover { background-color: ${(p) => tint(p, p.$color, 30, 38)}; }

    ${(p) => p.$isDone && css`
        opacity: 0.75;
        background-color: ${hair(p.theme, dark(p) ? 0.07 : 0.05)};
        box-shadow: ${p.$isStart ? `inset 3px 0 0 ${withAlpha(p.$color ?? p.theme.colors.primary, 0.45)}` : "none"};

        .todo-title {
            text-decoration: line-through;
            color: ${p.theme.colors.textSecondary};
        }
    `}

    ${MOBILE} {
        ${NOT_WIDGET} & {
            ${leafChip(5, "10px")}
            min-width: 0;
            margin: 0;
            padding: 0;
            border-radius: 0;
            box-shadow: none;
            background-color: ${(p) => p.$color ?? p.theme.colors.primary};
            opacity: ${(p) => (p.$isDone ? 0.35 : 1)};
        }
    }
`;

/** 막대 끝의 늘이기 손잡이 — 늘 보이면 막대마다 세로줄이 붙어 어수선했다. 막대에 마우스가 올 때만 */
export const RangeHandle = styled(C.RangeHandle)`
    color: ${(p) => p.theme.colors.text};
    opacity: 0;
    border-radius: 4px;

    ${TodoBarItem}:hover & { opacity: 0.4; }

    &:hover, &:focus-visible {
        opacity: 0.8;
        background: ${(p) => hair(p.theme, 0.08)};
    }
`;

/** "+N 더보기" — 막대 줄 아래 작은 글씨, 누르면 옅은 붉음 */
export const MoreButton = styled(C.MoreButton)`
    align-self: flex-start;
    margin: 1px 5px 0;
    padding: 1px 5px;
    border-radius: 6px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 500;
    text-align: left;
    color: ${(p) => p.theme.colors.textSecondary};

    &:hover {
        background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.08)};
        color: ${(p) => p.theme.colors.primary};
    }

    /* 폰: 잎 두 줄 아래 남은 자리에 띄운다 — 흐름 속에 두면 셋째 줄이 되어 칸 밑에서 잘렸다 */
    ${MOBILE} {
        width: auto;

        ${NOT_WIDGET} & {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            min-height: 0;
            margin: 0;
            padding: 0;
            border-radius: 0;
            font-size: 0.66rem;
            line-height: 12px;
            text-align: center;
        }
    }
`;

/** 낮은 위젯 창의 개수 표 — 날짜가 오른쪽 위에 있으니 왼쪽 위에. + 단추가 뜰 때(칸에 마우스)는 비켜 준다 */
export const CompactTaskCount = styled(C.CompactTaskCount)`
    @media (max-height: 420px) {
        [data-widget] & {
            /* 날짜 줄(위 4px + 24px)의 가운데에 */
            top: 9px;
            left: 4px;
            right: auto;
            border: none;
            border-radius: 6px;
            background-color: ${(p) => hair(p.theme, 0.08)};
            font-variant-numeric: tabular-nums;
            transition: opacity 0.15s ease;
        }

        [data-widget] ${DayCell}:hover & { opacity: 0; }
    }
`;

/** 옮긴 뒤의 알림 줄 — 옅은 붉음이 든 둥근 띠 */
export const MoveNotice = styled(C.MoveNotice)`
    margin-bottom: 8px;
    padding: 4px 6px 4px 12px;
    border: none;
    border-radius: 10px;
    background-color: ${(p) => withAlpha(p.theme.colors.primary, dark(p) ? 0.14 : 0.07)};
    font-size: 0.8125rem;

    button {
        padding: 0 10px;
        border-radius: 8px;
        font-weight: 600;

        &:hover { background-color: ${(p) => withAlpha(p.theme.colors.primary, 0.1)}; }
    }
`;
