import styled, {css} from "styled-components";
import { motion } from "framer-motion";

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
    width: 49vw;
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

export const SliderWrapper = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 10px;
`;

export const ArrowWrapper = styled.div`
    transition: filter 0.5s ease;
    display: flex;
    margin-top: 10px;
    cursor: pointer;
    &:hover {
        filter: drop-shadow(0 0 3px ${(props) => props.theme.colors.primary});
    }
`;

export const CalendarWindow = styled.div`
    width: 49vw;
    min-width: 600px;
    overflow: hidden; 
    position: relative;

    padding-top: 15px;
    padding-bottom: 15px;
    margin-top: -15px;
    margin-bottom: -15px;
`;

export const Header = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid ${(props) => props.theme.colors.primary};
    position: relative;

    width: 100%; /* 수정: 49vw -> 100% */
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

export const DayNameBox = styled.div<{ $isToday?: boolean }>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    position: relative;
    box-sizing: border-box;
    border-right: 1px solid ${(props) => props.theme.colors.primary};
    
    &:last-child { border-right: none; }
    
    .day-name { 
        font-size: ${(props) => props.theme.fontSizes.h4};
    }

    ${(props) => props.$isToday && css`
        &::before {
            content: "";
            position: absolute;
            
            width: calc(100% + 2px);
            height: calc(100% + 132px);
            
            top: -1px;
            left: -1px;
            
            border: 1px solid ${(props) => props.theme.colors.primary};
            box-shadow: 0 0 5px 0.5px ${(props) => props.theme.colors.primary};
            
            pointer-events: none;
            z-index: 10;
        }
    `}
    
`;

export const BarContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);

    width: 100%;
    height: 130px;
    box-sizing: border-box;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-top: none;
`;

export const AddTodoButton = styled.button`
    position: absolute;
    top: 4px;
    left: 4px;
    width: 24px;
    height: 24px;
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

export const DaySlot = styled.div<{ $isToday: boolean }>`
    display: flex;
    flex-direction: column;
    height: 130px;
    min-width: 0;
    position: relative;
    top: 0;
    border-right: 1px solid ${(props) => props.theme.colors.primary};

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

    ${(props) => props.$isDone && css`
        box-shadow: 0 0 5px 1px ${(props) => props.theme.colors.primary || props.theme.colors.primary};

        clip-path: inset(
                -10px
                ${props.$isEnd ? '-10px' : '0px'}
                -10px
                ${props.$isStart ? '-10px' : '0px'}
        );
        
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
    backdrop-filter: blur(3px); /* 배경 흐림 효과 살짝 강화 */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const ModalContainer = styled(motion.div)`
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary}80; /* 테두리를 살짝 연하게 */
    width: 320px;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    border-radius: 12px; /* ✨ 부드러운 라운드 처리 */
    overflow: hidden; /* ✨ 헤더가 둥근 모서리를 삐져나가지 않도록 설정 */
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15), 0 0 20px ${(props) => props.theme.colors.primary}22; /* ✨ 부드럽고 입체적인 그림자 */
    position: relative;
`;

export const ModalHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 1.1rem;
    color: ${(props) => props.theme.colors.text};
    padding: 15px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33; /* 헤더 구분선을 아주 연하게 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${(props) => props.theme.colors.primary}0D; /* 헤더에만 아주 옅은 배경색 추가 */
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

    /* 스크롤바 디자인 */
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}66;
        border-radius: 2px;
    }
`;