import styled from "styled-components";

export const FloatingContextMenu = styled.div`
    position: fixed;
    z-index: 9999;

    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;

    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(217, 207, 199, 0.5);

    button {
        background: none;
        border: none;
        padding: 4px 8px;
        font-size: 0.85rem;
        cursor: pointer;
        color: ${(props) => props.theme.colors.text};
        font-family: inherit;
        border-radius: 8px;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: ${(props) => props.theme.colors.primary}0E;
        }

        &.danger {
            color: ${(props) => props.theme.colors.error};
            &:hover {
                background-color: ${(props) => props.theme.colors.error}18;
            }
        }
    }

    .divider {
        width: 1px;
        height: 14px;
        background-color: ${(props) => props.theme.colors.border};
    }
`;
