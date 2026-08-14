import styled, { css } from "styled-components";
import { motion } from "framer-motion";
import { celestial_hide_scrollbar } from "@/styles/celestial_theme";

export const CelestialCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;

`;

export const DateRangeDisplay = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: ${(props) => props.theme.fontSizes.caption};
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;

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

    padding-top: 15px;
    padding-bottom: 15px;
    margin-top: -15px;
    margin-bottom: -15px;
    height: 100%;
`;

export const Header = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid ${(props) => props.theme.colors.primary};
    position: relative;
    width: 100%;
    box-sizing: border-box;

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
    height: 50px;
    position: relative;
    box-sizing: border-box;
    border-right: 1px solid ${(props) => props.theme.colors.primary};

    &:last-child {
        border-right: none;
    }

    .day-name {
        font-size: ${(props) => props.theme.fontSizes.h4};
    }
`;

export const GridContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-top: none;
    background-color: transparent;

    overflow-y: auto;
    ${celestial_hide_scrollbar}
`;

export const WeekRowContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    flex: 1;
    min-height: 120px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary};

    &:last-child {
        border-bottom: none;
    }
`;

export const DayCell = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean; $isSelected: boolean }>`
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
    border-right: 1px solid ${(props) => props.theme.colors.primary};
    opacity: ${(props) => props.$isCurrentMonth ? 1 : 0.4};
    /* 배경을 채우지 않는다 — 셀 내용(날짜·할 일 바)이 가려지지 않도록
       선택/호버는 테두리로만, 오늘은 모서리 브래킷으로 표시한다 */
    background-color: transparent;
    box-shadow: ${(props) => props.$isSelected
        ? `inset 0 0 0 1px ${props.theme.colors.primary}66`
        : 'none'};
    cursor: pointer;
    transition: box-shadow 0.2s ease;

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
            font-family: ${(props) => props.theme.fonts.celestial};
            font-weight: ${(props) => (props.$isToday || props.$isSelected) ? 'bold' : 'normal'};
            color: ${(props) => props.$isToday ? props.theme.colors.primary : props.theme.colors.text};
        }
    }

    &:hover .add-btn {
        opacity: 1;
    }

`;

/**
 * 오늘 표시 — 셀 한가운데 눈금 원반.
 * 모든 내용 뒤(z-index 0)에 깔려 날짜·할 일 바를 가리지 않고,
 * 모서리를 비워 챌린지 단계 장식과 자리가 겹치지 않는다.
 */
export const TodayDisc = styled.svg`
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    margin: -30px 0 0 -30px;
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
    overflow-y: auto;
    overflow-x: hidden;
    ${celestial_hide_scrollbar}
`;

export const TodoBarSpacer = styled.div`
    height: 20px;
    width: 100%;
`;

export const TodoBarItem = styled.div<{ $isStart: boolean; $isEnd: boolean; $color?: string; $isDone?: boolean }>`
    /* 오늘 원반이 바 뒤로 지나가도록 불투명하게 (셀 배경과 같은 색이라 겉보기는 동일) */
    background-color: ${(props) => props.theme.colors.background};
    border-top: 1px solid ${(props) => props.theme.colors.primary};
    border-bottom: 1px solid ${(props) => props.theme.colors.primary};
    border-left: ${(props) => props.$isStart ? `1px solid ${props.theme.colors.primary}` : 'none'};
    border-right: ${(props) => props.$isEnd ? `1px solid ${props.theme.colors.primary}` : 'none'};

    height: 20px;
    display: flex;
    align-items: center;
    font-size: ${(props) => props.theme.fontSizes.label};
    font-weight: 500;

    margin-left: ${(props) => props.$isStart ? '4px' : '0'};
    margin-right: ${(props) => props.$isEnd ? '4px' : '0'};
    border-top-left-radius: ${(props) => props.$isStart ? '4px' : '0'};
    border-bottom-left-radius: ${(props) => props.$isStart ? '4px' : '0'};
    border-top-right-radius: ${(props) => props.$isEnd ? '4px' : '0'};
    border-bottom-right-radius: ${(props) => props.$isEnd ? '4px' : '0'};
    cursor: pointer;
    transition: background-color 0.2s ease, opacity 0.2s ease;

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
        background-color: ${(props) => props.theme.colors.primary}1A;
    }

    ${(props) => props.$isDone && css`
        opacity: 0.4;
        background-color: transparent;

        .todo-title {
            text-decoration: line-through;
            color: ${(props) => props.theme.colors.textSecondary};
        }
    `}
`;

export const MoreButton = styled.div`
    font-size: 0.75rem;
    color: ${(props) => props.theme.colors.textSecondary};
    font-weight: 500;
    text-align: center;
    padding: 2px 0;
    margin: 2px 4px 0 4px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;

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
    font-family: ${(props) => props.theme.fonts.celestial};
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