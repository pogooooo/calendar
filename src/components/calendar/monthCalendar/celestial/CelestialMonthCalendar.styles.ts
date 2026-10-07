import styled, { css } from "styled-components";
import { NOT_WIDGET, MOBILE, TOUCH, SAFE_T, SAFE_B } from "@/styles/breakpoints";
import { motion } from "framer-motion";
import { hide_scrollbar } from "@/styles/shared";

export const MoveNotice = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 6px 12px;
    flex-shrink: 0;
    border-bottom: 1px solid ${(p) => p.theme.colors.primary}44;
    color: ${(p) => p.theme.colors.text};
    font-size: 0.76rem;
    span { flex: 1; }
    button { border: none; background: transparent; color: ${(p) => p.theme.colors.primary}; cursor: pointer; min-height: 32px; }
`;

export const CelestialCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;

`;

export const DateRangeDisplay = styled.div`
    font-family: ${(props) => props.theme.fonts.display};
    font-size: ${(props) => props.theme.fontSizes.caption};
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;

    [data-widget] & {
        gap: 8px;
        margin-bottom: 4px;
        font-size: 0.68rem;
    }

    @media (max-width: 768px) {
        gap: 8px;
        margin-bottom: 6px;
    }

    .nav-btn {
        background: transparent;
        border: none;
        color: ${(props) => props.theme.colors.primary};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        transition: transform 0.2s ease;
        ${MOBILE} { ${NOT_WIDGET} & { min-width: 44px; min-height: 44px; } }

        &:hover {
            transform: scale(1.1);
        }
    }

    & > hr {
        flex: 1;
        border: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        margin: 0;
    }

    & > span {
        white-space: nowrap;
    }

    ${MOBILE} {
        ${NOT_WIDGET} & {
            gap: 4px;
            flex-wrap: wrap;
            & > hr { display: none; }
        }
    }
`;

/**
 * 오늘로 되돌아가는 단추.
 * 화살표로 몇 달 넘긴 뒤 돌아오려면 같은 횟수만큼 되짚어야 한다 — 넓은 화면도 마찬가지다.
 * 위젯 창에만 자리가 없어 거기서 감춘다.
 */
export const TodayButton = styled.button`
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    padding: 5px 11px;
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary}66;
    color: ${(props) => props.theme.colors.primary};
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 0.68rem;
    letter-spacing: 1.5px;
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s;

    &:hover:not(:disabled) {
        border-color: ${(props) => props.theme.colors.primary};
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}44;
    }

    &:disabled {
        opacity: 0.35;
        cursor: default;
    }

    ${MOBILE} {
        padding: 6px 12px;
        min-height: 32px;
        font-size: 0.7rem;

        &:active { background-color: ${(props) => props.theme.colors.primary}1F; }
    }

    [data-widget] & { display: none; }
`;

export const SliderWrapper = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 10px;
    flex: 1;
    width: 100%;
    min-height: 0;

    @media (max-width: 600px) {
        overflow-x: auto;
        justify-content: flex-start;
    }
`;

export const CalendarWindow = styled.div`
    width: 100%;
    min-width: 0;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;

    height: 100%;

    [data-widget] & {
        padding: 0;
        margin: 0;
    }
`;

export const Header = styled.div`
    font-family: ${(props) => props.theme.fonts.display};
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid ${(props) => props.theme.colors.primary};
    position: relative;
    width: 100%;
    box-sizing: border-box;

    [data-widget] & {
        border-left: none;
        border-right: none;
        border-top: none;
    }

    &::after {
        content: "";
        width: 25px;
        height: 25px;
        background: linear-gradient(315deg, transparent 49%, ${(props) => props.theme.colors.primary} 50%, transparent 51%);
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }
`;

export const DayNameBox = styled.div<{ $isToday?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    position: relative;
    box-sizing: border-box;
    /* 안쪽 선은 옅게, 바깥 틀만 또렷하게 — 금빛 실선이 칸마다 같은 굵기면 격자가 무겁다 */
    border-right: 1px solid ${(props) => props.theme.colors.primary}40;

    &:last-child {
        border-right: none;
    }

    .day-name {
        font-size: 0.78rem;
        letter-spacing: 0.24em;
    }

    /* 요일 줄에 50px 를 내주면 그만큼 날짜 칸이 눌린다. */
    ${MOBILE} {
        height: 30px;

        .day-name {
            font-size: 0.62rem;
            letter-spacing: 0.5px;
        }
    }
`;

export const GridContainer = styled.div`
    display: grid;
    grid-template-rows: repeat(6, minmax(80px, 1fr));
    min-height: 0;
    width: 100%;
    flex: 1;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-top: none;
    background-color: transparent;

    overflow-y: auto;
    ${hide_scrollbar}

    [data-widget] & {
        grid-template-rows: repeat(6, minmax(0, 1fr));
        border: none;
        overflow: hidden;
    }

    ${MOBILE} {
        ${NOT_WIDGET} & {
        display: grid;
        grid-template-rows: repeat(6, minmax(0, 1fr));
        overflow: hidden;
        /* 여섯 줄이 남은 높이를 다 나눠 가지면 칸이 세로로 두 배쯤 길어져 찌그러진다.
           칸 폭(화면 폭 − 좌우 여백 24px 을 7로 나눈 것)의 1.3배까지만 키운다. 남는 자리는 비워 둔다. */
        height: calc((100vw - 24px) / 7 * 1.3 * 6);
        /* 키 작은 폰(640)에서는 격자가 화면을 다 먹어 아래 고른 날 목록이 머리줄 하나만 남았다.
           격자 밖(탭바·전환 단추·달 머리·요일 줄)과 목록 두 줄 몫 320px 은 남긴다. */
        max-height: min(62dvh, calc(100dvh - 320px - ${SAFE_T} - ${SAFE_B}));
        flex: none;
        }
    }
`;

export const WeekRowContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    flex: 1;
    min-height: 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}40;

    [data-widget] & {
        min-height: 0;
        overflow: hidden;
    }

    ${MOBILE} {
        min-height: 0;
        overflow: hidden;
    }

    &:last-child {
        border-bottom: none;
    }
`;

export const DayCell = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean; $isSelected: boolean; $dropTarget?: boolean }>`
    ${(p) => p.$dropTarget && css`box-shadow: inset 0 0 0 2px ${p.theme.colors.primary}; background-image: linear-gradient(${p.theme.colors.primary}22, ${p.theme.colors.primary}22);`}
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
    border-right: 1px solid ${(props) => props.theme.colors.primary}40;
    opacity: ${(props) => props.$isCurrentMonth ? 1 : 0.4};

    [data-widget] & {
        overflow: hidden;
        min-height: 0;
    }
    /* 배경을 채우지 않는다 — 셀 내용(날짜·할 일 바)이 가려지지 않도록
       선택/호버는 테두리로만, 오늘은 모서리 브래킷으로 표시한다 */
    background-color: ${(props) => props.$isSelected ? `${props.theme.colors.primary}0F` : "transparent"};
    box-shadow: ${(props) => props.$dropTarget
        ? `inset 0 0 0 2px ${props.theme.colors.primary}`
        : props.$isSelected
        ? `inset 0 0 0 1px ${props.theme.colors.primary}99`
        : 'none'};
    cursor: pointer;
    transition: box-shadow 0.2s ease, background-color 0.2s ease;

    &:last-child {
        border-right: none;
    }

    &:hover {
        box-shadow: inset 0 0 0 1px ${(props) => props.theme.colors.primary}8C;
    }

    .day-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 6px 2px 6px;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
        z-index: 2;

        .day-number {
            font-size: 0.95rem;
            line-height: 18px;
            display: block;
            font-family: ${(props) => props.theme.fonts.display};
            font-weight: ${(props) => (props.$isToday || props.$isSelected) ? 'bold' : 'normal'};
            color: ${(props) => props.$isToday ? props.theme.colors.background : props.theme.colors.text};
            ${(props) => props.$isToday && css`
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                margin: -3px 0 -3px -3px;
                padding: 0 6px;
                border-radius: 12px;
                background-color: ${props.theme.colors.primary};
                box-shadow: 0 0 0 3px ${props.theme.colors.primary}26, 0 0 14px ${props.theme.colors.primary}55;
            `}
        }
    }

    &:hover .add-btn {
        opacity: 1;
    }

    /* 48px 짜리 칸이다. 숫자와 여백을 줄여 마름모가 들어갈 자리를 만든다. */
    ${MOBILE} {
        /* 눌렀다는 걸 알려 주지 않으면 일간으로 넘어가는 게 갑작스럽다. */
        &:active { background-color: ${(props) => props.theme.colors.primary}1A; }

        .day-header {
            padding: 3px 4px 0;

            .day-number {
                font-size: 0.78rem;
                line-height: 15px;
            }
        }
    }
`;

/**
 * 오늘 표시 — 셀 한가운데 눈금 원반.
 * 모든 내용 뒤(z-index 0)에 깔려 날짜·할 일 바를 가리지 않고,
 * 모서리를 비워 챌린지 단계 장식과 자리가 겹치지 않는다.
 */
export const TodayDisc = styled.svg`
    opacity: 0.55;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    margin: -30px 0 0 -30px;

    /* 칸보다 큰 원반은 옆 칸까지 넘어가 오늘이 어디인지 되레 흐려진다. */
    ${MOBILE} {
        width: 38px;
        height: 38px;
        margin: -19px 0 0 -19px;
    }
    z-index: 0;
    pointer-events: none;
    overflow: visible;
    fill: none;

    .ring {
        stroke: ${(props) => props.theme.colors.primary};
        stroke-width: 1;
        opacity: 0.38;
        vector-effect: non-scaling-stroke;
    }

    .ring.dash {
        stroke-dasharray: 2 3;
        opacity: 0.24;
    }

    .tick {
        stroke: ${(props) => props.theme.colors.primary};
        stroke-width: 1;
        opacity: 0.45;
        vector-effect: non-scaling-stroke;
    }

    .core {
        fill: ${(props) => props.theme.colors.primary};
        stroke: none;
        opacity: 0.8;
    }
`;

export const DayHeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    /* 기념일 이름이 펼쳐질 때 셀 밖으로 잘려나가지 않고 말줄임되도록 */
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
`;


export const AddTodoButton = styled.button`
    position: absolute;
    top: 5px;
    /* 셀 오른쪽 끝에 붙인다 */
    left: auto;
    right: 6px;
    width: 18px;
    height: 18px;
    border-radius: 20%;
    background-color: transparent;
    color: ${(props) => props.theme.colors.primary};
    border: 1px solid ${(props) => props.theme.colors.primary};
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.1s ease;
    z-index: 10;

    &:hover {
        transform: scale(1.1);
    }

    /* 손가락에는 hover 가 없다. 숨겨두면 영영 못 누른다. */
    ${TOUCH} { opacity: 0.6; }

    /* 폰에서는 칸이 48px 밖에 안 돼 이게 날짜를 덮는다. 대신 화면 오른쪽
       아래 떠 있는 + 단추(캘린더 페이지의 Fab)로 일정을 만든다. */
    ${MOBILE} {
        display: none;
        /* 위젯 창은 폭이 좁아도 마우스로 쓰는 데스크톱이다. 그대로 둔다. */
        [data-widget] & { display: flex; }
    }
`;

export const TodoBarList = styled.div`

    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    margin-top: 5px;
    margin-bottom: 5px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    ${hide_scrollbar}

    [data-widget] & {
        overflow: hidden;
        margin-top: 2px;
        margin-bottom: 2px;
    }

    @media (max-height: 420px) {
        [data-widget] & { display: none; }
    }

    /* 폰에서는 바 대신 마름모를 가로로 늘어놓는다.
       위젯 창은 폭이 좁아도 마우스로 쓰는 데스크톱이라 바를 그대로 둔다.
       마름모는 네모를 45° 돌린 것이라 제 상자 밖으로 귀퉁이가 1~2px 나간다 —
       overflow: hidden 이면 그 귀퉁이가 잘려 납작해 보였다. 상자에 여유를 주고 잘라내지 않는다. */
    ${MOBILE} {
        ${NOT_WIDGET} & {
            flex-direction: row;
            flex-wrap: wrap;
            align-content: flex-start;
            justify-content: center;
            gap: 4px 5px;
            margin: 3px 0 0;
            padding: 2px 3px 3px;
            overflow: visible;
        }
    }
`;

/** Short widget windows expose the full day list through a compact count. */
export const CompactTaskCount = styled.button`
    display: none;
    @media (max-height: 420px) {
        [data-widget] & {
            display: flex;
            position: absolute;
            right: 2px;
            top: 3px;
            align-items: center;
            justify-content: center;
            min-width: 14px;
            height: 14px;
            padding: 0 2px;
            border-radius: 4px;
            border: 1px solid ${(p) => p.theme.colors.primary}99;
            color: ${(p) => p.theme.colors.text};
            background: transparent;
            font-size: 0.58rem;
            line-height: 1;
            cursor: pointer;
            z-index: 12;
        }
    }
`;

export const TodoBarSpacer = styled.div`
    height: 20px;
    width: 100%;

    /* 폰에서는 할 일이 가로로 늘어선 마름모라 층을 맞출 자리표가 필요 없다.
       그대로 두면 width:100% 라서 줄바꿈만 만들고 20px 를 잡아먹는다. */
    ${MOBILE} { display: none; }
`;

export const TodoBarItem = styled.div<{ $isStart: boolean; $isEnd: boolean; $color?: string; $isDone?: boolean; $dragging?: boolean; $movable?: boolean }>`
    position: relative;
    opacity: ${(p) => p.$dragging ? 0.5 : 1};
    touch-action: ${(p) => p.$movable ? 'none' : 'auto'};
    cursor: ${(p) => p.$dragging ? 'grabbing' : p.$movable ? 'grab' : 'pointer'};
    transition: opacity 0.18s ease, box-shadow 0.18s ease;

    /* 금빛 테두리만 있던 빈 상자는 읽기 어려웠다 — 카테고리 색을 바탕에 옅게 섞은 면(불투명이라 오늘 원반이 비치지 않는다)과
       시작 칸 앞쪽의 색 띠 하나로 */
    background-color: ${(props) => `color-mix(in srgb, ${props.$color ?? props.theme.colors.primary} ${props.theme.mode === "dark" ? "24%" : "16%"}, ${props.theme.colors.background})`};
    border: none;
    box-shadow: ${(props) => props.$isStart ? `inset 2px 0 0 ${props.$color ?? props.theme.colors.primary}` : "none"};

    height: 20px;
    display: flex;
    align-items: center;
    font-size: ${(props) => props.theme.fontSizes.label};
    font-weight: 500;

    margin-left: ${(props) => props.$isStart ? '4px' : '0'};
    margin-right: ${(props) => props.$isEnd ? '4px' : '0'};
    border-top-left-radius: ${(props) => props.$isStart ? '2px' : '0'};
    border-bottom-left-radius: ${(props) => props.$isStart ? '2px' : '0'};
    border-top-right-radius: ${(props) => props.$isEnd ? '2px' : '0'};
    border-bottom-right-radius: ${(props) => props.$isEnd ? '2px' : '0'};
    cursor: ${(p) => p.$dragging ? 'grabbing' : p.$movable ? 'grab' : 'pointer'};
    transition: background-color 0.2s ease, opacity 0.2s ease, box-shadow 0.18s ease;

    .todo-title {
        padding: 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${(props) => props.theme.colors.text};
        z-index: 1;
        transition: color 0.2s ease;
    }

    &:hover {
        background-color: ${(props) => `color-mix(in srgb, ${props.$color ?? props.theme.colors.primary} 30%, ${props.theme.colors.background})`};
    }

    ${(props) => props.$isDone && css`
        opacity: 0.4;
        background-color: transparent;

        .todo-title {
            text-decoration: line-through;
            color: ${(props) => props.theme.colors.textSecondary};
        }
    `}

    ${MOBILE} {
        ${NOT_WIDGET} & {
            width: 7px;
            height: 7px;
            min-width: 0;
            margin: 0;
            padding: 0;
            border: 1px solid ${(props) => props.$color || props.theme.colors.primary};
            border-radius: 0;
            transform: rotate(45deg);
            background-color: ${(props) => props.$isDone ? (props.$color || props.theme.colors.primary) : "transparent"};
            overflow: visible;
            opacity: 1;

            & > * { display: none; }
        }
    }
`;

export const RangeHandle = styled.button<{ $edge: 'start' | 'end' }>`
    position:absolute; top:0; bottom:0;
    ${p=>p.$edge === 'start' ? 'left:0;' : 'right:0;'}
    width:10px; padding:0; border:none; background:transparent; cursor:ew-resize;
    color:${p=>p.theme.colors.primary}; opacity:.5; z-index:3; touch-action:none;
    &::after { content:''; display:block; width:2px; height:10px; margin:auto; background:currentColor; border-radius:2px; }
    &:hover,&:focus-visible { opacity:1; background:${p=>p.theme.colors.primary}22; }
    @media(max-height:420px) { [data-widget] & { display:none; } }
`;

export const MoreButton = styled.button.attrs({ type: 'button' })`
    border: none;
    background: transparent;
    font-family: inherit;
    min-height: 18px;
    font-size: 0.75rem;
    color: ${(props) => props.theme.colors.textSecondary};
    font-weight: 500;
    text-align: center;
    padding: 2px 0;
    margin: 2px 4px 0 4px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;

    .short { display: none; }

    /* 48px 짜리 칸에 "+1 더보기" 는 너무 길다. 숫자만 남긴다. */
    ${MOBILE} {
        font-size: 0.62rem;
        margin: 1px 0 0;
        padding: 0;
        width: 100%;

        .full { display: none; }
        .short { display: inline; }
    }

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}1A;
        color: ${(props) => props.theme.colors.text};
    }
`;

export const ModalOverlay = styled(motion.div)`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContainer = styled(motion.div)`
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary}80;
    width: 320px;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15), 0 0 20px ${(props) => props.theme.colors.primary}22;
    position: relative;
`;

export const ModalHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.display};
    font-size: 1.1rem;
    color: ${(props) => props.theme.colors.text};
    padding: 15px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${(props) => props.theme.colors.primary}0D;
`;

export const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.2s ease;
    
    &:hover {
        color: ${(props) => props.theme.colors.text};
        background-color: ${(props) => props.theme.colors.primary}22;
    }
`;

export const ModalBody = styled.div`
    padding: 15px 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;

`;
