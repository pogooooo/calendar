import styled, {css, keyframes} from "styled-components";
import { motion } from "framer-motion";

const beadRun = keyframes`
    0% { left: 0; opacity: 0; }
    12% { opacity: 1; }
    88% { opacity: 1; }
    100% { left: 100%; opacity: 0; }
`;

const lineStarTwinkle = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
`;

export const CelestialCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
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

    & > hr {
        flex: 1;
        border: none;
        border-top: 1px solid ${(props) => props.theme.colors.primary};
        margin: 0;
    }
    & > span { white-space: nowrap; }
`;

export const DateLine = styled.div<{ $direction?: number }>`
    position: relative;
    flex: 1;
    min-width: 24px;
    height: 1px;
    background-color: ${(props) => props.theme.colors.primary};

    &::before {
        content: "";
        position: absolute;
        top: 50%;
        width: 4px;
        height: 4px;
        margin-top: -2px;
        margin-left: -2px;
        border-radius: 50%;
        background-color: ${(props) => props.theme.colors.primary};
        animation: ${beadRun} ${(props) =>
            props.$direction && props.$direction > 0 ? '2.6s'
                : props.$direction && props.$direction < 0 ? '12s'
                    : '7s'} linear infinite;
    }

    &::after {
        content: "";
        position: absolute;
        right: -3px;
        top: 50%;
        width: 7px;
        height: 7px;
        margin-top: -3.5px;
        background-color: ${(props) => props.theme.colors.primary};
        clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
        animation: ${lineStarTwinkle} 4.2s ease-in-out infinite;
    }
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
    display: flex;
    align-items: center;
    flex-shrink: 0;
    cursor: pointer;
    transition: filter 0.5s ease;
    &:hover {
        filter: drop-shadow(0 0 3px ${(props) => props.theme.colors.primary});
    }
`;

export const CalendarWindow = styled.div`
    width: calc(100% + 16px);
    overflow: hidden;
    position: relative;
    padding: 15px 8px;
    margin: -15px -8px;
    box-sizing: border-box;
`;

export const Header = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid ${(props) => props.theme.colors.primary};
    position: relative;
    width: 100%;
    box-sizing: border-box;
    /* 기념일 로켓이 헤더 아래(본문 영역)로 늘어지므로 본문보다 위에 그린다 */
    z-index: 2;

    &::after {
        content: "";
        width: 25px; height: 25px;
        background: linear-gradient(315deg, transparent 49%, ${(props) => props.theme.colors.primary} 50%, transparent 51%);
        position: absolute;
        top: 0; left: 0;
        pointer-events: none;
    }

    &::before {
        content: "";
        width: 25px; height: 25px;
        background: linear-gradient(45deg, transparent 49%, ${(props) => props.theme.colors.primary} 50%, transparent 51%);
        position: absolute;
        top: 0; right: 0;
        pointer-events: none;
        z-index: 2;
    }
`;

export const DayNameBox = styled.div<{ $isToday?: boolean; $tier?: number }>`
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

    .day-mark {
        position: absolute;
        bottom: 7px;
        left: 50%;
        transform: translateX(-50%);
        height: 1px;
        width: 18px;
        background-color: ${(props) => props.theme.colors.primary};
        pointer-events: none;
    }

    .day-mark.done {
        width: 26px;
    }

    /* 3단계 요일 헤더 장식: 밑선 글로우 + 양끝 다이아 스터드 */
    ${(props) => props.$tier === 3 && css`
        .day-mark.done {
            box-shadow: 0 0 5px ${(props) => props.theme.colors.primary};
        }

        .day-mark.done::before,
        .day-mark.done::after {
            content: "";
            position: absolute;
            top: 50%;
            width: 3px;
            height: 3px;
            background-color: ${(props) => props.theme.colors.primary};
            transform: translateY(-50%) rotate(45deg);
        }
        .day-mark.done::before { left: -5px; }
        .day-mark.done::after { right: -5px; }
    `}

    ${(props) => props.$isToday && css`
        &::before {
            content: "";
            position: absolute;
            width: calc(100% + 2px);
            height: calc(100% + 131px);
            top: -1px;
            left: -1px;
            border: 1px solid ${(props) => props.theme.colors.primary};
            box-shadow: 0 0 4px ${(props) => props.theme.colors.primary};
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
    position: relative;
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-top: none;

    &::after {
        content: "";
        width: 25px;
        height: 25px;
        background: linear-gradient(135deg, transparent 49%, ${(props) => props.theme.colors.primary} 50%, transparent 51%);
        position: absolute;
        bottom: 0;
        right: 0;
        pointer-events: none;
        z-index: 2;
    }

    &::before {
        content: "";
        width: 25px;
        height: 25px;
        background: linear-gradient(225deg, transparent 49%, ${(props) => props.theme.colors.primary} 50%, transparent 51%);
        position: absolute;
        bottom: 0;
        left: 0;
        pointer-events: none;
        z-index: 2;
    }
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
    /* 투명 left border로 right border(구분선)와 대칭 → 콘텐츠 정확히 가운데 */
    border-right: 1px solid ${(props) => props.theme.colors.primary};
    border-left: 1px solid transparent;

    &:last-child {
        border-right: 1px solid transparent;
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
    margin-top: 15px;
    position: relative;
    z-index: 1;
`;

export const TodoBarItem = styled.div<{ $isStart: boolean, $isEnd: boolean, $color?: string, $isDone?: boolean }>`
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-left: ${(props) => props.$isStart ? '1px solid props.theme.colors.primary' : '0'};
    border-right: ${(props) => props.$isEnd ? '1px solid props.theme.colors.primary' : '0'};

    height: 25px;
    display: flex;
    font-size: ${(props) => props.theme.fontSizes.caption};

    /* 프레임 안쪽으로 8px 들어오게 → 바가 프레임 안, 왼쪽에 실(thread)이 걸릴 채널 확보 */
    margin-left: ${props => props.$isStart ? 'calc(5.45% + 8px)' : '0'};
    margin-right: ${props => props.$isEnd ? 'calc(5.45% + 8px)' : '0'};
    border-top-left-radius: ${props => props.$isStart ? '4px' : '0'};
    border-bottom-left-radius: ${props => props.$isStart ? '4px' : '0'};
    border-top-right-radius: ${props => props.$isEnd ? '4px' : '0'};
    border-bottom-right-radius: ${props => props.$isEnd ? '4px' : '0'};
    .todo-title { padding: 0 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    ${(props) => props.$isDone && css`
        /* 좁고 진한 바깥 글로우 — 바가 프레임 안쪽이라 여백 안에서 빛나 겹치지 않음 */
        box-shadow: 0 0 3px ${(props) => props.theme.colors.primary};

        /* 이어지는(연결) 변에는 글로우가 새지 않도록 클립 */
        clip-path: inset(
                -8px
                ${props.$isEnd ? '-8px' : '0px'}
                -8px
                ${props.$isStart ? '-8px' : '0px'}
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
    font-size: ${(props) => props.theme.fontSizes.label};
    color: ${(props) => props.theme.colors.textSecondary};
    font-weight: 500;
    text-align: center;
    padding: 1px 0;
    margin: 1px 4px 0 4px;
    cursor: pointer;
    transition: color 0.2s ease, text-shadow 0.2s ease;

    &:hover {
        color: ${(props) => props.theme.colors.primary};
        text-shadow: 0 0 5px ${(props) => props.theme.colors.primary}99;
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