import styled from "styled-components";

export const BotanicalCalendarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
    font-family: ${(props) => props.theme.fonts.body};
`;

export const DateHeader = styled.div`
    font-family: ${(props) => props.theme.fonts.body};
    font-size: 1rem;
    font-weight: 500;
    color: ${(props) => props.theme.colors.text};
    letter-spacing: 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;

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

export const ResizeHandle = styled.div`
    height: 15px;
    flex-shrink: 0;
    cursor: ns-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    user-select: none;

    span {
        height: 1px;
        width: 20px;
        background: ${(props) => props.theme.colors.border};
        transition: background 0.2s;
        flex-shrink: 0;
    }

    span:nth-child(2) {
        width: 6px;
        height: 6px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${(props) => props.theme.colors.primary}60;
    }

    &:hover span {
        background: ${(props) => props.theme.colors.primary}80;
    }

    &:hover span:nth-child(2) {
        background: ${(props) => props.theme.colors.primary};
    }
`;

export const TimelineSection = styled.div`
    flex: 1.5;
    display: flex;
    flex-direction: column;
    border: none;
    border-left: 2px solid ${(props) => props.theme.colors.border};
    border-radius: 0;
    background: repeating-linear-gradient(
        ${(props) => props.theme.colors.background} 0px,
        ${(props) => props.theme.colors.background} 35px,
        ${(props) => props.theme.colors.border}33 35px,
        ${(props) => props.theme.colors.border}33 36px
    );
    overflow: hidden;
    box-shadow: 2px 2px 8px rgba(217, 207, 199, 0.3);

    .timeline-header {
        font-family: ${(props) => props.theme.fonts.body};
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        padding: 8px;
        text-align: center;
        border-bottom: 1px dashed ${(props) => props.theme.colors.border};
        background-color: ${(props) => props.theme.colors.background};
    }
`;

export const TimelineScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const TimeRow = styled.div`
    display: flex;
    align-items: stretch;
    min-height: 36px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}33;

    .time-label {
        width: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: ${(props) => props.theme.fonts.body};
        font-size: 0.75rem;
        color: ${(props) => props.theme.colors.textSecondary};
        border-right: 1px solid ${(props) => props.theme.colors.border};
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
            border: 1px solid ${(props) => props.theme.colors.border}55;
            border-radius: 4px;
            overflow: hidden;
            background-color: transparent;
        }

        .slot-box {
            flex: 1;
            min-width: 0;
            border-right: 1px dashed ${(props) => props.theme.colors.border}40;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: background-color 0.1s;
            position: relative;

            &:last-child {
                border-right: none;
            }

            &:hover {
                background-color: ${(props) => props.theme.colors.primary}0E;
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
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0;

    .todo-text {
        position: absolute;
        left: 4px;
        z-index: 20;
        font-size: 0.6rem;
        color: ${(props) => props.theme.colors.background};
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
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px;
    background-color: ${(props) => props.theme.colors.surface};
    display: flex;
    flex-direction: column;
    box-shadow: 2px 2px 8px rgba(217, 207, 199, 0.3);

    .card-header {
        font-family: ${(props) => props.theme.fonts.body};
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        padding: 8px 12px;
        border-bottom: 1px dashed ${(props) => props.theme.colors.border};
        background-color: ${(props) => props.theme.colors.background};
        border-radius: 10px 10px 0 0;
        display: flex;
        align-items: center;
        gap: 8px;

        &::before {
            content: "";
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50% 50% 50% 0;
            background: ${(props) => props.theme.colors.primary};
            transform: rotate(-45deg);
            flex-shrink: 0;
        }
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
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const TaskItem = styled.div<{ $isDone: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 8px;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}0E;

        .delete-btn {
            opacity: 1;
        }
    }

    .check-btn {
        width: 16px;
        height: 16px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 1px solid ${(props) => props.theme.colors.primary};
        background-color: ${(props) => props.$isDone ? props.theme.colors.primary : 'transparent'};
        color: ${(props) => props.theme.colors.background};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s ease;

        svg {
            transform: rotate(45deg);
        }
    }

    .task-text {
        flex: 1;
        font-size: 0.85rem;
        color: ${(props) => props.$isDone ? props.theme.colors.textSecondary : props.theme.colors.text};
        text-decoration: ${(props) => props.$isDone ? 'line-through' : 'none'};
        transition: color 0.2s ease;
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
        transition: all 0.2s ease;

        &:hover {
            color: ${(props) => props.theme.colors.error};
        }
    }
`;

export const TaskForm = styled.form`
    display: flex;
    border-top: 1px solid ${(props) => props.theme.colors.border};
    padding: 8px;
    gap: 8px;

    input {
        flex: 1;
        background: transparent;
        border: none;
        border-bottom: 1px solid ${(props) => props.theme.colors.border};
        border-radius: 0;
        padding: 6px 10px;
        color: ${(props) => props.theme.colors.text};
        font-size: 0.85rem;
        outline: none;
        font-family: inherit;

        &:focus {
            border-bottom-color: ${(props) => props.theme.colors.primary};
        }

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary};
        }
    }

    button {
        background-color: ${(props) => props.theme.colors.primary}18;
        border: 1px solid ${(props) => props.theme.colors.border};
        color: ${(props) => props.theme.colors.primary};
        width: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background-color: ${(props) => props.theme.colors.primary}22;
            border-color: ${(props) => props.theme.colors.primary};
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
            background-color: ${(props) => props.theme.colors.border};
            border-radius: 2px;
        }
    }
`;
