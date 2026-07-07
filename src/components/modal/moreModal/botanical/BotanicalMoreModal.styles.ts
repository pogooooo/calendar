import styled, { css } from "styled-components";

export const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    font-family: ${(props) => props.theme.fonts.body};
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.background};
    border-radius: 12px 12px 0 0;

    .title-text {
        font-size: 1rem;
        font-weight: 500;
        color: ${(props) => props.theme.colors.text};
        font-family: ${(props) => props.theme.fonts.body};
    }

    .close-btn {
        background: transparent;
        border: none;
        color: ${(props) => props.theme.colors.textSecondary};
        cursor: pointer;
        padding: 4px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
            color: ${(props) => props.theme.colors.text};
            background-color: ${(props) => props.theme.colors.primary}0E;
        }
    }
`;

export const ScrollBody = styled.div`
    padding: 16px 20px;
    max-height: 400px;
    overflow-y: auto;
    background-color: ${(props) => props.theme.colors.surface};
    border-radius: 0 0 12px 12px;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const TodoList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const TodoItem = styled.div<{ $color?: string; $isDone?: boolean }>`
    display: flex;
    align-items: center;
    padding: 10px 12px;
    background-color: ${(props) => props.theme.colors.background};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary}55;
        background-color: ${(props) => props.theme.colors.primary}08;
        transform: translateX(2px);
        box-shadow: 0 2px 8px rgba(217, 207, 199, 0.3);
    }

    .color-bar {
        width: 4px;
        height: 16px;
        border-radius: 2px;
        background-color: ${(props) => props.$color || props.theme.colors.primary};
        margin-right: 12px;
        flex-shrink: 0;
    }

    .todo-title {
        font-size: 0.9rem;
        color: ${(props) => props.theme.colors.text};
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
    }

    ${(props) => props.$isDone && css`
        opacity: 0.5;
        .todo-title {
            text-decoration: line-through;
            color: ${(props) => props.theme.colors.textSecondary};
        }
    `}
`;
