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
    gap: 8px;
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
        min-width: 90px;
    }

    input[type="text"], input[type="date"], input[type="datetime-local"] {
        flex: 1;
        font-family: inherit;
        font-size: 1rem;
        color: ${(props) => props.theme.colors.text};
        background-color: transparent;
        border: none;
        outline: none;
        text-align: right;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}66;
        }

        &::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.2s;
            &:hover { opacity: 1; }
        }
    }

    .repeat-input-wrapper {
        display: flex;
        align-items: center;
        gap: 6px;
        color: ${(props) => props.theme.colors.text};

        input {
            width: 40px;
            text-align: right;
            font-family: inherit;
            font-size: 1rem;
            background: transparent;
            border: none;
            outline: none;
            color: ${(props) => props.theme.colors.primary};
            font-weight: bold;
            border-bottom: 1px solid ${(props) => props.theme.colors.primary}66;

            &::placeholder {
                color: ${(props) => props.theme.colors.textSecondary}66;
                font-weight: normal;
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

export const CategorySelect = styled.div`
    position: relative;
    margin-bottom: 8px;
`;

export const SelectedCategory = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    border: 1px solid transparent;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}11;
        border: 1px solid ${(props) => props.theme.colors.primary}33;
    }

    & > div {
        display: flex;
        align-items: center;
        font-size: 1rem;
        font-weight: 500;
        color: ${(props) => props.theme.colors.text};

        .placeholder {
            color: ${(props) => props.theme.colors.textSecondary};
            font-weight: normal;
        }
    }
`;

export const ColorDot = styled.div<{ $color: string }>`
    background-color: ${(props) => props.$color};
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 12px;
    box-shadow: 0 0 4px rgba(0,0,0,0.1);
`;

export const CategoryList = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary}40;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    max-height: 160px;
    overflow-y: auto;
    z-index: 20;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}66;
        border-radius: 2px;
    }
`;

export const CategoryItem = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}1A;
    }
`;

export const ToggleSwitch = styled.label`
    position: relative;
    display: inline-block;
    min-width: 60px !important;
    height: 22px;

    input { opacity: 0; width: 0; height: 0; }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: ${(props) => props.theme.colors.accent};
        transition: 0.3s;
        border-radius: 24px;
    }

    .slider::before {
        position: absolute;
        content: "";
        height: 16px; width: 16px;
        left: 3px; bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    input:checked + .slider { background-color: ${(props) => props.theme.colors.primary}; }
    input:checked + .slider::before { transform: translateX(38px); }
`;

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 24px 24px;
    background-color: ${(props) => props.theme.colors.surface};
    border-top: 1px solid ${(props) => props.theme.colors.primary}1A;
`;