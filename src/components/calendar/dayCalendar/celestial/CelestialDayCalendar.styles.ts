import styled, { css, keyframes } from "styled-components";

export const CelestialCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
`;

export const DateHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 1rem;
    font-weight: 500;
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 2px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;

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

export const ContentLayout = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;
`;

export const ResizeHandle = styled.div`
    height: 15px;
    flex-shrink: 0;
    cursor: ns-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    user-select: none;

    span {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${(props) => props.theme.colors.primary}50;
        transition: background 0.2s, transform 0.2s;
        flex-shrink: 0;
    }

    &:hover span {
        background: ${(props) => props.theme.colors.primary}90;
        transform: scale(1.3);
    }
`;

export const TimelineSection = styled.div`
    flex: 1.5;
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.colors.primary};
    background-color: transparent;
    overflow: hidden;

    .timeline-header {
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        padding: 8px;
        text-align: center;
        border-bottom: 1px solid ${(props) => props.theme.colors.primary};
    }
`;

export const TimelineScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const TimeRow = styled.div`
    display: flex;
    align-items: stretch;
    min-height: 36px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;

    .time-label {
        width: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 0.75rem;
        color: ${(props) => props.theme.colors.text};
        border-right: 1px solid ${(props) => props.theme.colors.primary}; /* ✨ 원래의 진한 선 복구 */
        flex-shrink: 0;
    }

    .time-slots {
        flex: 1;
        display: flex;
        align-items: stretch;
        padding: 6px 15px;

        .slot-bar-container {
            flex: 1;
            display: flex;
            border: 1px solid ${(props) => props.theme.colors.primary}55; /* ✨ 원래 테두리 복구 */
            border-radius: 4px;
            overflow: hidden;
            background-color: transparent;
        }

        .slot-box {
            flex: 1;
            min-width: 0;
            border-right: 1px dashed ${(props) => props.theme.colors.primary}40;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: background-color 0.1s;
            position: relative;

            &:last-child {
                border-right: none;
            }

            &:hover {
                background-color: ${(props) => props.theme.colors.primary}22;
            }
        }
    }
`;

export const SlotTodoItem = styled.div<{ $isContinuingPrev: boolean; $isContinuingNext: boolean; $isDone?: boolean }>`
    flex: 1;
    min-height: 0;
    min-width: 0;
    width: ${(props) => (props.$isContinuingNext ? "calc(100% + 2px)" : "100%")};
    position: relative;
    z-index: ${(props) => (props.$isDone ? 40 : (props.$isContinuingPrev ? 10 : 30))};

    background-color: ${(props) => props.theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0;

    .todo-text {
        position: absolute;
        left: 4px;
        z-index: 20;
        font-size: 0.6rem;
        color: ${(props) => props.theme.colors.surface};
        white-space: nowrap;
        font-weight: 500;
        pointer-events: none;
        text-decoration: ${(props) => (props.$isDone ? 'line-through' : 'none')};
    }
`;

export const SideSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const BaseCard = styled.div`
    border: 1px solid ${(props) => props.theme.colors.primary};
    background-color: transparent;
    display: flex;
    flex-direction: column;

    .card-header {
        font-family: ${(props) => props.theme.fonts.celestial};
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        padding: 8px 12px;
        border-bottom: 1px solid ${(props) => props.theme.colors.primary};
    }
`;

export const TaskCard = styled(BaseCard)`
    flex: 1.2;
    min-height: 0;
`;

export const TaskList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const TaskItem = styled.div<{ $isDone: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}1A;

        .delete-btn {
            opacity: 1;
        }
    }

    .check-btn {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        border: 1px solid ${(props) => props.theme.colors.primary};
        background-color: ${(props) => props.$isDone ? props.theme.colors.primary : 'transparent'};
        color: ${(props) => props.theme.colors.surface};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s;
    }

    .task-text {
        flex: 1;
        font-size: 0.85rem;
        color: ${(props) => props.$isDone ? props.theme.colors.textSecondary : props.theme.colors.text};
        text-decoration: ${(props) => props.$isDone ? 'line-through' : 'none'};
        transition: color 0.2s;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .delete-btn {
        background: transparent;
        border: none;
        color: ${(props) => props.theme.colors.textSecondary};
        cursor: pointer;
        opacity: 0;
        padding: 4px;
        display: flex;
        align-items: center;
        transition: all 0.2s;

        &:hover {
            color: #ff5252;
        }
    }
`;

export const TaskForm = styled.form`
    display: flex;
    border-top: 1px solid ${(props) => props.theme.colors.primary}55;
    padding: 8px;
    gap: 8px;

    input {
        flex: 1;
        background: transparent;
        border: 1px solid ${(props) => props.theme.colors.primary}55;
        border-radius: 4px;
        padding: 6px 10px;
        color: ${(props) => props.theme.colors.text};
        font-size: 0.85rem;
        outline: none;

        &:focus {
            border-color: ${(props) => props.theme.colors.primary};
        }
    }

    button {
        background-color: transparent;
        border: 1px solid ${(props) => props.theme.colors.primary};
        color: ${(props) => props.theme.colors.primary};
        width: 30px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            background-color: ${(props) => props.theme.colors.primary}1A;
        }
    }
`;

export const MemoCard = styled(BaseCard)`
    flex: 0.8;
    min-height: 120px;

    textarea {
        flex: 1;
        background: transparent;
        border: none;
        padding: 10px 12px;
        color: ${(props) => props.theme.colors.text};
        font-size: 0.85rem;
        font-family: inherit;
        line-height: 1.5;
        resize: none;
        outline: none;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary};
        }

        &::-webkit-scrollbar {
            width: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: ${(props) => props.theme.colors.primary}80;
            border-radius: 2px;
        }
    }
`;