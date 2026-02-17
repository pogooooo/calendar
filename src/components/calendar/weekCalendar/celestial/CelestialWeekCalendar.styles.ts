import styled from "styled-components";

export const CelestialCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const DateRangeDisplay = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: ${(props) => props.theme.fontSizes.caption};
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
    width: 50vw;
    min-width: 600px;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;

    & > hr {
        flex: 1;
        border: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        margin: 0;
    }
    & > span { white-space: nowrap; }
`;

export const HeaderWrapper = styled.div`
    display: flex;
    align-items: center;
    & > svg {
        margin: 0 5px;
        transition: all 0.2s ease;
        &:hover {
            stroke: ${(props) => props.theme.colors.accent};
            filter: drop-shadow(0 0 5px ${(props) => props.theme.colors.primary});
            cursor: pointer;
        }
    }
`;

export const Header = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid ${(props) => props.theme.colors.primary};
    position: relative;
    width: 50vw;
    min-width: 600px;
    box-sizing: border-box;

    &::after {
        content: "";
        width: 25px; height: 25px;
        background: linear-gradient(315deg, transparent 49%, ${(props) => props.theme.colors.primary} 50%, transparent 51%);
        position: absolute;
        top: 0; left: 0;
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
    border-right: 1px solid ${(props) => props.theme.colors.surface};
    &:last-child { border-right: none; }
    .day-name { font-size: ${(props) => props.theme.fontSizes.h4}; }
`;

export const TwinklePositioner = styled.div`
    position: absolute;
    right: -8px;
    top: 0; bottom: 0;
    display: flex;
    align-items: center;
    z-index: 2;
    pointer-events: none;
`;

export const BarContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    width: 50vw;
    min-width: 600px;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-top: none;
`;

export const DaySlot = styled.div<{ $isToday: boolean }>`
    display: flex;
    flex-direction: column;
    min-height: 120px;
    position: relative;
    border-right: 1px solid ${(props) => props.theme.colors.primary};
    &:last-child { border-right: none; }
`;

export const TodoBarList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
    margin-top: 10px;
`;

export const TodoBarItem = styled.div<{ $isStart: boolean, $isEnd: boolean, $color?: string }>`
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-left: ${(props) => props.$isStart ? '1px solid props.theme.colors.primary' : '0'};
    border-right: ${(props) => props.$isEnd ? '1px solid props.theme.colors.primary' : '0'};
    
    height: 25px;
    display: flex;
    font-size: ${(props) => props.theme.fontSizes.caption};
    
    margin-left: ${props => props.$isStart ? '4px' : '0'};
    margin-right: ${props => props.$isEnd ? '4px' : '0'};
    border-top-left-radius: ${props => props.$isStart ? '4px' : '0'};
    border-bottom-left-radius: ${props => props.$isStart ? '4px' : '0'};
    border-top-right-radius: ${props => props.$isEnd ? '4px' : '0'};
    border-bottom-right-radius: ${props => props.$isEnd ? '4px' : '0'};
    .todo-title { padding: 0 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

export const TodoBarSpacer = styled.div` height: 25px; width: 100%; `;

export const TodayIndicator = styled.div`
    position: absolute;
`;