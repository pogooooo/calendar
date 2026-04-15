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
    border-radius: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    button {
        background: none;
        border: none;
        padding: 4px 8px;
        font-size: 0.85rem;
        cursor: pointer;
        color: ${(props) => props.theme.colors.text};
        font-family: inherit;
        border-radius: 12px;
        transition: background-color 0.2s;

        &:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }

        &.danger {
            color: ${(props) => props.theme.colors.error};
            &:hover {
                background-color: #fff1f0;
            }
        }
    }

    .divider {
        width: 1px;
        height: 14px;
        background-color: ${(props) => props.theme.colors.border};
    }
`;