import styled from "styled-components";

export const FormWrapper = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 85vh;
    font-family: ${(props) => props.theme.fonts.body};
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px 24px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.background};
    border-radius: 12px 12px 0 0;

    .title-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 1.3rem;
        font-weight: 600;
        color: ${(props) => props.theme.colors.text};
        outline: none;
        font-family: ${(props) => props.theme.fonts.body};
        margin-right: 15px;
        border-bottom: 2px solid transparent;
        transition: border-color 0.2s ease;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}66;
        }

        &:focus {
            border-bottom: 2px solid ${(props) => props.theme.colors.primary}66;
        }
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
            color: ${(props) => props.theme.colors.error};
            background-color: ${(props) => props.theme.colors.error}10;
        }
    }
`;

export const ScrollBody = styled.div`
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    background-color: ${(props) => props.theme.colors.surface};

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const FieldRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 10px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}55;

    label {
        font-size: 0.9rem;
        font-weight: 500;
        color: ${(props) => props.theme.colors.textSecondary};
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .color-picker-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;

        .hex-text {
            font-size: 0.9rem;
            color: ${(props) => props.theme.colors.textSecondary};
            font-family: monospace;
            font-weight: 500;
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
                border: none;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(217, 207, 199, 0.4);
            }
        }
    }
`;

export const MemoRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 10px;

    label {
        font-size: 0.9rem;
        font-weight: 500;
        color: ${(props) => props.theme.colors.textSecondary};
        display: flex;
        align-items: center;
        gap: 8px;
    }

    textarea {
        width: 100%;
        min-height: 80px;
        font-family: inherit;
        font-size: 0.9rem;
        color: ${(props) => props.theme.colors.text};
        background-color: ${(props) => props.theme.colors.background};
        border: 1px solid ${(props) => props.theme.colors.border};
        border-radius: 8px;
        padding: 12px;
        outline: none;
        resize: vertical;
        line-height: 1.5;
        transition: border-color 0.2s ease;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}55;
        }

        &:focus {
            border-color: ${(props) => props.theme.colors.primary};
        }
    }
`;

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    background-color: ${(props) => props.theme.colors.background};
    border-top: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 0 0 12px 12px;
`;
