import styled, { css } from "styled-components";
import { motion } from "framer-motion";

export const BotanicalCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    font-family: ${(props) => props.theme.fonts.body};
`;

export const LeafAccent = styled.span`
    display: inline-block;
    width: 10px;
    height: 14px;
    border-radius: 0 50% 0 50%;
    border: 1.5px solid ${(props) => props.theme.colors.primary};
    transform: rotate(-45deg);
    flex-shrink: 0;
`;

export const TwigDivider = styled.div`
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, ${(props) => props.theme.colors.primary}60, transparent);
`;

export const DateRangeDisplay = styled.div`
    font-family: ${(props) => props.theme.fonts.body};
    font-size: ${(props) => props.theme.fontSizes.caption};
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 0;
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;

    & > span { white-space: nowrap; }
`;

export const SliderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

export const CalendarRow = styled.div`
    position: relative;
    width: 100%;
`;

export const ArrowWrapper = styled.div<{ $side: "left" | "right" }>`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    ${p => p.$side === "left" ? "left: -90px;" : "right: -90px;"}
    transition: opacity 0.2s ease;
    display: flex;
    cursor: pointer;
    opacity: 0.6;
    color: ${(props) => props.theme.colors.primary};

    &:hover {
        opacity: 1;
    }
`;

export const CalendarWindow = styled.div`
    width: 100%;
    overflow: hidden;
    position: relative;
    border-radius: 10px;
    background-color: ${(props) => props.theme.colors.surface};
    box-shadow: 0 2px 12px rgba(217, 207, 199, 0.3);
    padding: 15px 0;
    margin: -15px 0;
`;

export const Header = styled.div`
    font-family: ${(props) => props.theme.fonts.body};
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    position: relative;
    width: 100%;
    box-sizing: border-box;
`;

export const DayNameBox = styled.div<{ $isToday?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    position: relative;
    box-sizing: border-box;
    border-right: 1px solid ${(props) => props.theme.colors.border}40;
    border-bottom: 2px solid ${(props) => props.theme.colors.primary}40;

    &:last-child { border-right: none; }

    .day-name {
        font-size: ${(props) => props.theme.fontSizes.h4};
    }

    ${(props) => props.$isToday && css`
        background-color: ${(props) => props.theme.colors.primary}18;

        &::after {
            content: "";
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%) rotate(-45deg);
            width: 6px;
            height: 6px;
            border-radius: 50% 50% 50% 0;
            background: ${(props) => props.theme.colors.primary};
        }

        .day-name {
            color: ${(props) => props.theme.colors.primary};
            font-weight: 600;
        }
    `}
`;

export const StickerRowContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    width: 100%;
    min-height: 50px;
    box-sizing: border-box;
    border-left: 1px solid ${(props) => props.theme.colors.border};
    border-right: 1px solid ${(props) => props.theme.colors.border};
    border-bottom: 1px solid ${(props) => props.theme.colors.border}30;
`;

export const StickerSlot = styled.div<{ $isToday?: boolean }>`
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 5px;
    gap: 4px;
    align-items: center;
    justify-content: flex-start;
    border-right: 1px solid ${(props) => props.theme.colors.border}40;
    background-color: ${(props) => props.$isToday ? `${props.theme.colors.primary}0E` : 'transparent'};

    &:last-child {
        border-right: none;
    }

    &::-webkit-scrollbar {
        height: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const BarContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    width: 100%;
    height: 130px;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-top: none;
    border-radius: 0 0 8px 8px;
    overflow: hidden;
`;

export const AddTodoButton = styled.button`
    position: absolute;
    top: 4px;
    left: 4px;
    width: 24px;
    height: 24px;
    border-radius: 20%;
    background-color: transparent;
    color: ${(props) => props.theme.colors.primary};
    border: 1px solid ${(props) => props.theme.colors.border};
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.1s ease;
    z-index: 10;

    &:hover {
        transform: scale(1.1);
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const DaySlot = styled.div<{ $isToday: boolean }>`
    display: flex;
    flex-direction: column;
    height: 130px;
    min-width: 0;
    position: relative;
    top: 0;
    border-right: 1px solid ${(props) => props.theme.colors.border}40;
    background-color: ${(props) => props.$isToday ? `${props.theme.colors.primary}0E` : 'transparent'};

    &:last-child {
        border-right: none;
    }

    &:hover .add-btn {
        opacity: 0.8;
    }
`;

export const TodoBarList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
    margin-top: 10px;
`;

export const TodoBarItem = styled.div<{ $isStart: boolean, $isEnd: boolean, $color?: string, $isDone?: boolean }>`
    height: 25px;
    display: flex;
    align-items: center;
    font-size: ${(props) => props.theme.fontSizes.caption};
    background-color: ${(props) => props.$color || props.theme.colors.primary};
    opacity: ${(props) => props.$isDone ? 0.5 : 0.85};
    border-left: ${props => props.$isStart ? `3px solid rgba(0,0,0,0.2)` : 'none'};
    border-radius: ${props => props.$isStart ? '0 8px 8px 0' : props.$isEnd ? '0 8px 8px 0' : '0'};

    margin-left: ${props => props.$isStart ? '4px' : '0'};
    margin-right: ${props => props.$isEnd ? '4px' : '0'};

    .todo-title {
        padding: 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${(props) => props.theme.colors.background};
        font-size: 0.7rem;
        font-weight: 500;
    }

    ${(props) => props.$isDone && css`
        .todo-title {
            text-decoration: line-through;
            opacity: 0.8;
        }
    `}
`;

export const TodoBarSpacer = styled.div` height: 25px; width: 100%; `;

export const TodayIndicator = styled.div`
    position: absolute;
`;

export const MoreButton = styled.div`
    font-size: ${(props) => props.theme.fontSizes.caption};
    color: ${(props) => props.theme.colors.textSecondary};
    font-weight: 500;
    text-align: center;
    padding: 3px 0;
    margin: 2px 4px 0 4px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}18;
        color: ${(props) => props.theme.colors.text};
    }
`;

export const ModalOverlay = styled(motion.div)`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(58, 53, 48, 0.3);
    backdrop-filter: blur(3px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContainer = styled(motion.div)`
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    width: 320px;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(217, 207, 199, 0.4);
    position: relative;
`;

export const ModalHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.body};
    font-size: 1.1rem;
    color: ${(props) => props.theme.colors.text};
    padding: 15px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${(props) => props.theme.colors.background};
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
        background-color: ${(props) => props.theme.colors.primary}18;
    }
`;

export const ModalBody = styled.div`
    padding: 15px 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;
