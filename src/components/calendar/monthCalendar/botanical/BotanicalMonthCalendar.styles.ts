import styled, { css } from "styled-components";
import { motion } from "framer-motion";

export const BotanicalCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    font-family: ${(props) => props.theme.fonts.body};

    ::-webkit-scrollbar {
        display: none;
    }
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
    font-family: ${(props) => props.theme.fonts.body};
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px 10px 0 0;
    overflow: hidden;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    background-color: ${(props) => props.theme.colors.surface};
`;

export const DayNameBox = styled.div<{ $isToday?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    position: relative;
    box-sizing: border-box;
    border-right: 1px solid ${(props) => props.theme.colors.border}40;

    &:last-child {
        border-right: none;
    }

    .day-name {
        font-size: ${(props) => props.theme.fontSizes.h4};
        color: ${(props) => props.theme.colors.textSecondary};
    }
`;

export const GridContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-top: none;
    border-radius: 0 0 10px 10px;
    background-color: ${(props) => props.theme.colors.surface};
    box-shadow: 0 2px 12px rgba(217, 207, 199, 0.3);

    overflow-y: auto;
    &::-webkit-scrollbar {
        width: 0;
    }
`;

export const WeekRowContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    flex: 1;
    min-height: 120px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}33;

    &:last-child {
        border-bottom: none;
    }
`;

export const DayCell = styled.div<{ $isToday: boolean; $isCurrentMonth: boolean; $isSelected: boolean }>`
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
    border-right: 1px solid ${(props) => props.theme.colors.border}33;
    opacity: ${(props) => props.$isCurrentMonth ? 1 : 0.35};
    background-color: ${(props) => props.$isSelected ? `${props.theme.colors.primary}18` : 'transparent'};
    cursor: pointer;
    transition: background-color 0.2s ease;
    border-radius: ${(props) => props.$isSelected ? '8px' : '0'};

    &:last-child {
        border-right: none;
    }

    &:hover {
        background-color: ${(props) => props.$isSelected ? `${props.theme.colors.primary}22` : `${props.theme.colors.primary}0E`};
    }

    .day-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 6px 6px 2px 6px;
        width: 100%;
        box-sizing: border-box;
        z-index: 2;

        .day-number {
            font-size: 0.95rem;
            font-family: ${(props) => props.theme.fonts.body};
            font-weight: ${(props) => (props.$isToday || props.$isSelected) ? '600' : 'normal'};
            color: ${(props) => props.$isToday ? props.theme.colors.primary : props.theme.colors.text};
            ${(props) => props.$isToday && `
                background-color: ${props.theme.colors.primary};
                color: ${props.theme.colors.background};
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
            `}

            & > span {
                display: inline-block;
                transform: ${(props) => props.$isToday ? 'rotate(45deg)' : 'none'};
            }
        }
    }

    &:hover .add-btn {
        opacity: 1;
    }
`;

export const DayHeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

export const DayStickerContainer = styled.div`
    display: flex;
    gap: 2px;
    flex: 1;
    justify-content: flex-end;
    flex-wrap: wrap;
    max-height: 52px;
    margin-right: 4px;

    && {
        overflow: visible !important;
    }
`;

export const StickerWrapper = styled.div`
    flex-shrink: 0;
    width: 21px;
    height: 21px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    && {
        overflow: visible !important;
    }

    & svg {
        width: 100%;
        height: 100%;
        overflow: visible;
    }
`;

export const AddTodoButton = styled.button`
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
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

export const TodoBarList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    margin-top: 5px;
    margin-bottom: 5px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const TodoBarSpacer = styled.div`
    height: 20px;
    width: 100%;
`;

export const TodoBarItem = styled.div<{ $isStart: boolean; $isEnd: boolean; $color?: string; $isDone?: boolean }>`
    background-color: ${(props) => props.$color || props.theme.colors.primary};
    opacity: ${(props) => props.$isDone ? 0.45 : 0.8};
    height: 20px;
    display: flex;
    align-items: center;
    font-size: ${(props) => props.theme.fontSizes.label};
    font-weight: 500;
    border-left: ${(props) => props.$isStart ? '3px solid rgba(0,0,0,0.2)' : 'none'};

    margin-left: ${(props) => props.$isStart ? '4px' : '0'};
    margin-right: ${(props) => props.$isEnd ? '4px' : '0'};
    border-radius: ${(props) => props.$isStart ? '0 8px 8px 0' : props.$isEnd ? '0 8px 8px 0' : '0'};
    cursor: pointer;
    transition: opacity 0.2s ease;

    .todo-title {
        padding: 0 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: ${(props) => props.theme.colors.background};
        z-index: 1;
    }

    &:hover {
        opacity: ${(props) => props.$isDone ? 0.6 : 1};
    }

    ${(props) => props.$isDone && css`
        .todo-title {
            text-decoration: line-through;
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
