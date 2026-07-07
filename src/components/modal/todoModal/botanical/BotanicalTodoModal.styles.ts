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
    padding: 20px 24px 12px 24px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.background};
    border-radius: 12px 12px 0 0;

    .title-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 1.2rem;
        font-weight: 600;
        color: ${(props) => props.theme.colors.text};
        outline: none;
        font-family: ${(props) => props.theme.fonts.body};
        margin-right: 15px;
        padding: 4px 0;
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
        border-radius: 6px;
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
    padding: 16px 24px;
    display: flex;
    flex-direction: column;
    gap: 4px;
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
    padding: 10px 8px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}55;

    label {
        font-size: 0.9rem;
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
        font-size: 0.9rem;
        color: ${(props) => props.theme.colors.text};
        background-color: ${(props) => props.theme.colors.background};
        border: 1px solid ${(props) => props.theme.colors.border};
        border-radius: 8px;
        padding: 6px 8px;
        outline: none;
        text-align: right;
        transition: all 0.2s ease;
        cursor: pointer;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}55;
        }

        &:hover, &:focus {
            border-color: ${(props) => props.theme.colors.primary};
        }

        &::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.2s ease;
            &:hover { opacity: 1; }
        }
    }
`;

export const RepeatRow = styled(FieldRow)`
    align-items: flex-start;
    padding-top: 14px;
    flex-direction: column;
    gap: 12px;

    .repeat-header {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;

        .repeat-input-group {
            display: flex;
            align-items: center;
            gap: 6px;

            input[type="number"] {
                width: 60px;
                text-align: center;
                font-size: 1rem;
                font-family: inherit;
                font-weight: 600;
                color: ${(props) => props.theme.colors.primary};
                background-color: ${(props) => props.theme.colors.background};
                border: none;
                border-bottom: 1px solid ${(props) => props.theme.colors.primary}66;
                border-radius: 0;
                padding: 4px;
                outline: none;
                transition: all 0.2s ease;

                -moz-appearance: textfield;
                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                &:hover, &:focus {
                    border-bottom: 1px solid ${(props) => props.theme.colors.primary};
                }

                &::placeholder {
                    color: ${(props) => props.theme.colors.textSecondary}55;
                    font-weight: normal;
                }
            }

            span {
                font-size: 0.9rem;
                color: ${(props) => props.theme.colors.textSecondary};
            }
        }
    }
`;

export const RepeatConditionBox = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    background-color: ${(props) => props.theme.colors.background};
    border-radius: 8px;
    border: 1px solid ${(props) => props.theme.colors.border};

    .condition-title {
        font-size: 0.85rem;
        color: ${(props) => props.theme.colors.textSecondary};
        font-weight: 500;
    }

    input[type="date"], input[type="number"] {
        width: 100%;
        text-align: left;
        background-color: ${(props) => props.theme.colors.surface};
        border: 1px solid ${(props) => props.theme.colors.border};
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 0.9rem;
        color: ${(props) => props.theme.colors.text};
        transition: border-color 0.2s ease;
        outline: none;
        font-family: inherit;
        -moz-appearance: textfield;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        &:hover, &:focus {
            border-color: ${(props) => props.theme.colors.primary};
        }
    }

    .count-input-group {
        display: flex;
        align-items: center;
        gap: 10px;

        input[type="number"] {
            flex: 1;
            text-align: right;
        }

        span {
            font-size: 0.9rem;
            color: ${(props) => props.theme.colors.textSecondary};
            white-space: nowrap;
        }
    }
`;

export const MemoRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 8px 0 8px;

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
        padding: 10px;
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

export const DropdownContainer = styled.div`
    position: relative;
    width: 100%;
`;

export const DropdownHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.background};

    &:hover {
        border-color: ${(props) => props.theme.colors.primary};
    }

    .content-wrapper {
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        font-weight: 500;
        color: ${(props) => props.theme.colors.text};

        .placeholder {
            color: ${(props) => props.theme.colors.textSecondary};
            font-weight: normal;
        }
    }
`;

export const DropdownList = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(217, 207, 199, 0.4);
    max-height: 160px;
    overflow-y: auto;
    z-index: 30;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const DropdownItem = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 0.9rem;
    color: ${(props) => props.theme.colors.text};
    transition: background-color 0.2s ease;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}33;

    &:last-child { border-bottom: none; }
    &:first-child { border-radius: 10px 10px 0 0; }
    &:last-child { border-radius: 0 0 10px 10px; }
    &:hover { background-color: ${(props) => props.theme.colors.primary}0E; }
`;

export const ColorDot = styled.div<{ $color: string }>`
    background-color: ${(props) => props.$color};
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 10px;
    flex-shrink: 0;
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
        background-color: ${(props) => props.theme.colors.border};
        transition: 0.2s ease;
        border-radius: 24px;
    }

    .slider::before {
        position: absolute;
        content: "";
        height: 16px; width: 16px;
        left: 3px; bottom: 3px;
        background-color: white;
        transition: 0.2s ease;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(217, 207, 199, 0.5);
    }

    input:checked + .slider { background-color: ${(props) => props.theme.colors.primary}; }
    input:checked + .slider::before { transform: translateX(38px); }
`;

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    background-color: ${(props) => props.theme.colors.background};
    border-top: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 0 0 12px 12px;
`;
