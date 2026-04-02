import styled, { css } from "styled-components";

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
    width: 49vw;
    min-width: 600px;
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
`;

export const CalendarWindow = styled.div`
    width: 49vw;
    min-width: 600px;
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

export const DayNameBox = styled.div`
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
    background-color: ${(props) => props.theme.colors.surface};
`;

export const WeekRowContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    flex: 1;
    min-height: 0;
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
    background-color: ${(props) => props.$isSelected ? `${props.theme.colors.primary}1A` : props.theme.colors.surface};
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:last-child {
        border-right: none;
    }

    &:hover {
        background-color: ${(props) => props.$isSelected ? `${props.theme.colors.primary}22` : `${props.theme.colors.primary}0D`};
    }

    .day-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 6px 6px 2px 6px;
        z-index: 2;

        .day-number {
            font-size: 0.95rem;
            font-family: ${(props) => props.theme.fonts.celestial};
            font-weight: ${(props) => (props.$isToday || props.$isSelected) ? 'bold' : 'normal'};
            color: ${(props) => props.$isToday ? props.theme.colors.primary : props.theme.colors.text};
        }
    }

    &:hover .add-btn {
        opacity: 1;
    }

    ${(props) => props.$isToday && css`
        &::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            box-shadow: inset 0 0 0 2px ${(props) => props.theme.colors.primary};
            pointer-events: none;
            z-index: 5;
        }
    `}
`;

export const AddTodoButton = styled.button`
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    border-radius: 20%;
    background-color: ${(props) => props.theme.colors.surface};
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
    display: flex;
    flex-direction: column;
    gap: 4px;
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
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const TodoBarSpacer = styled.div`
    height: 26px;
    width: 100%;
`;

export const TodoBarItem = styled.div<{ $isStart: boolean; $isEnd: boolean; $color?: string; $isDone?: boolean }>`
    background-color: ${(props) => props.theme.colors.surface};
    border-top: 1px solid ${(props) => props.theme.colors.primary};
    border-bottom: 1px solid ${(props) => props.theme.colors.primary};
    border-left: ${(props) => props.$isStart ? `1px solid ${props.theme.colors.primary}` : 'none'};
    border-right: ${(props) => props.$isEnd ? `1px solid ${props.theme.colors.primary}` : 'none'};

    height: 26px;
    display: flex;
    align-items: center;
    font-size: 0.85rem;
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