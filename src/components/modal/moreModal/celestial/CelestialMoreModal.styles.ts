import styled, { css } from "styled-components";

export const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}22;
    background-color: ${(props) => props.theme.colors.primary}05;
    
    .title-text {
        font-size: 1.1rem;
        font-weight: 600;
        color: ${(props) => props.theme.colors.text};
        font-family: ${(props) => props.theme.fonts.celestial};
    }
    
    .close-btn {
        background: transparent;
        border: none;
        color: ${(props) => props.theme.colors.textSecondary};
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;

        &:hover {
            color: ${(props) => props.theme.colors.text};
            background-color: ${(props) => props.theme.colors.primary}22;
        }
    }
`;

export const ScrollBody = styled.div`
    padding: 16px 20px;
    max-height: 400px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}40;
        border-radius: 3px;
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
    padding: 12px 14px;
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary}15;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}08;
        transform: translateX(4px);
    }

    .color-bar {
        width: 4px;
        height: 16px;
        border-radius: 2px;
        background-color: ${(props) => props.$color || props.theme.colors.primary};
        margin-right: 12px;
    }

    .todo-title {
        font-size: 0.95rem;
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