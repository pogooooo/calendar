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
import styled, { css, keyframes } from "styled-components";
import * as C from "../celestial/CelestialMonthCalendar.styles";
import { MOBILE, NOT_WIDGET } from "@/styles/breakpoints";
import { withAlpha } from "@/styles/color";
import { hair, leafChip, paperCard, stampButton, vintage } from "@/styles/maple/ink";

export * from "../celestial/CelestialMonthCalendar.styles";

type P = { theme: { mode: "light" | "dark"; variant?: string; colors: { primary: string; surface: string } } };
const dark = (p: { theme: { mode: string } }) => p.theme.mode === "dark";
/**
 * 찢은 테이프의 끝 — 시작 칸은 왼쪽 가장자리, 끝 칸은 오른쪽 가장자리를 들쭉날쭉하게 오린다(clip-path).
 * 여러 날이면 중간 칸은 반듯하게 이어진다.
 */
const torn = (start: boolean, end: boolean) => {
    const left = start ? ["2px 0", "0 22%", "3px 42%", "0.5px 62%", "2.5px 82%", "0.5px 100%"] : ["0 0", "0 100%"];
    const right = end ? ["calc(100% - 1px) 100%", "calc(100% - 3px) 78%", "100% 58%", "calc(100% - 2.5px) 38%", "calc(100% - 0.5px) 18%", "calc(100% - 2px) 0"] : ["100% 100%", "100% 0"];
    return `polygon(${[...left, ...right].join(", ")})`;
};

/** 채운 붉음 위의 글자색 (ink.ts 의 단추와 같은 값) */
const onPrimary = (p: { theme: { mode: string } }) => (dark(p) ? "#1A1512" : "#FFFFFF");
/**
 * 카테고리 색을 카드에 옅게 섞은 면 — 불투명이라 여러 날 막대가 고른 칸(물든 칸)을 지나도 한 빛깔로 이어진다.
 * 빈티지 벌은 테이프도 누렇게 바랜다(잿빛 카테고리가 바랜 종이 위에서 차갑게 떴다)
 */
const tint = (p: P, color: string | undefined, light: number, night: number) => {
    const mixed = `color-mix(in srgb, ${color ?? p.theme.colors.primary} ${dark(p) ? night : light}%, ${p.theme.colors.surface})`;
    return vintage(p) ? `color-mix(in srgb, ${mixed} 86%, #A67C45)` : mixed;
};

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

/** 넘어가는 장의 그늘 — 들리며 빛을 등지는 만큼 짙어진다 */
const turnShade = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;
/** 넘어오는 장이 내려앉으며 밝아진다 */
const landShade = keyframes`
    from { opacity: 1; }
    to   { opacity: 0; }
`;

/**
 * 달력 판 = 카드 한 장. 달을 넘기는 몸짓(책장 넘김, paperMotion)은 이 카드 안에서 일어난다.
 * 넘기는 장(SwapLayer)은 그동안 카드와 같은 종이로 칠한다 — 투명하면 밑의 새 장 글씨가 비쳐 두 달이 겹쳐 보였다.
 * 들리는 장은 밑의 장에 그림자를 드리우고, 책등에서 멀어질수록(오른쪽) 그늘이 진다.
 */
export const CalendarWindow = styled(C.CalendarWindow)`
    ${paperCard()}
    overflow: hidden;

    ${NOT_WIDGET} & {
        & > [data-leaving][data-dir="next"],
        & > [data-swapping][data-dir="prev"] {
            background-color: ${(p) => p.theme.colors.surface};
            border-radius: 13px;
            backface-visibility: hidden;
            box-shadow: 6px 0 22px -8px ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.7)" : "rgba(86, 54, 32, 0.32)")};
        }
        & > [data-leaving][data-dir="next"]::after,
        & > [data-swapping][data-dir="prev"]::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 20;
            border-radius: inherit;
            pointer-events: none;
            background: linear-gradient(90deg,
                ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.05)" : "rgba(86, 54, 32, 0.02)")},
                ${(p) => (dark(p) ? "rgba(0, 0, 0, 0.42)" : "rgba(86, 54, 32, 0.2)")});
        }
        & > [data-leaving][data-dir="next"]::after { animation: ${turnShade} 0.64s cubic-bezier(0.55, 0.05, 0.35, 1) both; }
        & > [data-swapping][data-dir="prev"]::after { animation: ${landShade} 0.62s cubic-bezier(0.25, 0.8, 0.3, 1) both; }
    }

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
    /* 줄 공책 — 아주 옅은 가로줄 (위젯·폰은 칸이 작아 빼고) */
    @media (min-width: 769px) {
        ${NOT_WIDGET} & {
            background-image: repeating-linear-gradient(to bottom, transparent 0 21px, ${(p) => hair(p.theme, dark(p) ? 0.05 : 0.045)} 21px 22px);
            background-position: 0 9px;
        }
    }
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
 * 일정 막대 — 찢어 붙인 종이테이프: 카테고리 색을 옅게 물들인 반투명 띠, 윗가장자리의 윤과 가는 섬유 결, 시작·끝은 손으로 찢은 듯
 * 들쭉날쭉(torn). 여러 날이면 칸을 건너 한 장으로 이어진다. 글은 글자색. (2026-10-16 — 둥근 막대는 다른 갈래와 같아 보였다)
 * 폰에서는 막대 대신 카테고리 색 단풍잎을 가로로 늘어놓는다 (끝낸 일은 옅게).
 */
export const TodoBarItem = styled(C.TodoBarItem)`
    height: 20px;
    font-family: ${(p) => p.theme.fonts.body};
    font-size: 0.75rem;
    font-weight: 500;
    background-color: ${(p) => tint(p, p.$color, 26, 34)};
    background-image:
        linear-gradient(180deg, ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.4)")}, rgba(255, 255, 255, 0) 55%),
        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0) 0 5px, ${(p) => (dark(p) ? "rgba(255, 255, 255, 0.035)" : "rgba(255, 255, 255, 0.22)")} 5px 6px);
    border-radius: 0;
    clip-path: ${(p) => torn(p.$isStart, p.$isEnd)};
    margin-left: ${(p) => (p.$isStart ? "5px" : "0")};
    margin-right: ${(p) => (p.$isEnd ? "5px" : "0")};
    box-shadow: none;

    .todo-title {
        padding: 0 6px 0 ${(p) => (p.$isStart ? 9 : 6)}px;
        color: ${(p) => p.theme.colors.text};
    }

    &:hover { background-color: ${(p) => tint(p, p.$color, 36, 44)}; }

    ${(p) => p.$isDone && css`
        opacity: 0.75;
        background-color: ${hair(p.theme, dark(p) ? 0.07 : 0.05)};

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
            clip-path: none;
            background-image: none;
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
