import styled from "styled-components";

export const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

export const Container = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    width: 420px;
    border-radius: 12px;
    padding: 30px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.2s ease-out;

    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid ${(props) => props.theme.colors.accent};
    padding-bottom: 15px;
    margin-bottom: 10px;

    .title-input {
        font-size: ${(props) => props.theme.fontSizes.h3};
        color: ${(props) => props.theme.colors.text};
        background: transparent;
        border: none;
        outline: none;
        width: 100%;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary};
        }
    }

    .close-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        color: ${(props) => props.theme.colors.textSecondary};
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            color: ${(props) => props.theme.colors.text};
        }
    }
`;

export const InputRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    padding-bottom: 12px;

    label {
        font-size: 0.95rem;
        font-weight: bold;
        color: ${(props) => props.theme.colors.text};
        width: 60px;
    }

    .color-picker-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        justify-content: flex-end;

        .hex-text {
            font-size: 0.95rem;
            color: ${(props) => props.theme.colors.textSecondary};
            font-family: monospace;
        }

        input[type="color"] {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            background-color: transparent;
            outline: none;
            padding: 0;

            &::-webkit-color-swatch-wrapper {
                padding: 0;
            }
            &::-webkit-color-swatch {
                border: 2px solid ${(props) => props.theme.colors.accent};
                border-radius: 50%;
            }
        }
    }
`;

export const MemoRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    padding-bottom: 15px;

    label {
        font-size: 0.95rem;
        font-weight: bold;
        color: ${(props) => props.theme.colors.text};
    }

    textarea {
        width: 100%;
        min-height: 80px;
        font-family: inherit;
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        background-color: transparent;
        border: none;
        outline: none;
        resize: vertical;
        line-height: 1.5;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary};
        }

        &::-webkit-scrollbar {
            width: 6px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: ${(props) => props.theme.colors.accent};
            border-radius: 3px;
        }
    }
`;

export const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
`;