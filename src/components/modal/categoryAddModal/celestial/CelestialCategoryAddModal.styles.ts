import styled from "styled-components";

export const FormWrapper = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 85vh;
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px 24px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}22;
    background-color: ${(props) => props.theme.colors.primary}05;
    
    .title-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 1.4rem;
        font-weight: 600;
        color: ${(props) => props.theme.colors.text};
        outline: none;
        font-family: ${(props) => props.theme.fonts.celestial};
        margin-right: 15px;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}80;
        }
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
        transition: all 0.2s;

        &:hover {
            color: ${(props) => props.theme.colors.text};
            background-color: ${(props) => props.theme.colors.primary}22;
        }
    }
`;

export const ScrollBody = styled.div`
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}40;
        border-radius: 3px;
    }
`;

export const FieldRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 10px;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent}66;

    label {
        font-size: 0.95rem;
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
            font-size: 0.95rem;
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
                box-shadow: 0 2px 5px rgba(0,0,0,0.15);
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
        font-size: 0.95rem;
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
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        background-color: ${(props) => props.theme.colors.primary}05;
        border: 1px solid ${(props) => props.theme.colors.primary}22;
        border-radius: 8px;
        padding: 12px;
        outline: none;
        resize: vertical;
        line-height: 1.5;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}66;
        }
    }
`;

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 24px 24px;
    background-color: ${(props) => props.theme.colors.surface};
    border-top: 1px solid ${(props) => props.theme.colors.primary}1A;
`;