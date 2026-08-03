import styled, { css } from "styled-components";

export const ContentWrapper = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 0;

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 22px;
        height: 22px;
        background: linear-gradient(315deg, transparent 48%, ${(props) => props.theme.colors.primary} 50%, transparent 52%);
        pointer-events: none;
    }
`;

export const Header = styled.div`
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 16px 18px 14px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary};

    .title-text {
        font-size: 0.95rem;
        letter-spacing: 1.5px;
        color: ${(props) => props.theme.colors.text};
        font-family: ${(props) => props.theme.fonts.celestial};
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .close-btn {
        flex-shrink: 0;
        background: transparent;
        border: 1px solid transparent;
        color: ${(props) => props.theme.colors.textSecondary};
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease, border-color 0.2s ease;

        &:hover {
            color: ${(props) => props.theme.colors.primary};
            border-color: ${(props) => props.theme.colors.primary};
        }
    }
`;

export const CountLabel = styled.div`
    flex-shrink: 0;
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.66rem;
    letter-spacing: 2px;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 12px 18px 6px;
`;

export const ScrollBody = styled.div`
    flex: 1;
    min-height: 0;
    padding: 0 18px 18px;
    overflow-y: auto;

`;

export const TodoList = styled.div`
    display: flex;
    flex-direction: column;
`;

export const SectionLabel = styled.div`
    margin-top: 14px;
    padding-bottom: 6px;
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.7rem;
    letter-spacing: 2px;
    color: ${(props) => props.theme.colors.textSecondary};
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}55;
`;

export const ChallengeList = styled.div`
    display: flex;
    flex-direction: column;
`;

export const ChallengeItem = styled.div<{ $isDone: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 4px 12px;
    border-bottom: 1px dashed ${(props) => props.theme.colors.primary}33;

    &:last-child {
        border-bottom: none;
    }

    .check {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid ${(props) => props.theme.colors.primary};
        background-color: ${(props) => props.$isDone ? props.theme.colors.primary : 'transparent'};
        color: ${(props) => props.theme.colors.background};
        transition: box-shadow 0.15s;

        &:hover {
            box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}AA;
        }
    }

    .challenge-title {
        flex: 1;
        min-width: 0;
        font-size: 0.86rem;
        color: ${(props) => props.theme.colors.text};
        opacity: ${(props) => props.$isDone ? 0.55 : 1};
        text-decoration: ${(props) => props.$isDone ? 'line-through' : 'none'};
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const EmptyText = styled.div`
    padding: 24px 0;
    text-align: center;
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.82rem;
    letter-spacing: 1px;
    color: ${(props) => props.theme.colors.textSecondary};
`;

export const TodoItem = styled.div<{ $color?: string; $isDone?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    padding: 11px 4px 13px;
    cursor: pointer;
    border-bottom: 1px dashed ${(props) => props.theme.colors.primary}33;

    background-color: transparent;
    background-image: linear-gradient(${(props) => props.theme.colors.primary}, ${(props) => props.theme.colors.primary});
    background-repeat: no-repeat;
    background-position: 0 calc(100% - 1px);
    background-size: 0 1px;
    transition: background-size 0.3s ease;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-size: 100% 1px;
    }

    .color-bar {
        width: 8px;
        height: 8px;
        flex-shrink: 0;
        transform: rotate(45deg);
        background-color: ${(props) => props.$color || props.theme.colors.primary};
        margin-right: 12px;
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
        .color-bar {
            background-color: transparent;
            border: 1px solid ${(props) => props.theme.colors.textSecondary};
        }
        .todo-title {
            text-decoration: line-through;
            color: ${(props) => props.theme.colors.textSecondary};
        }
    `}
`;
