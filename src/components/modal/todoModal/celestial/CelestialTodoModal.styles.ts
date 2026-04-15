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
    padding: 20px 24px 12px 24px;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent}40;
    background-color: ${(props) => props.theme.colors.surface};
    border-radius: 5px 5px 0 0;

    .title-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 1.25rem;
        font-weight: 600;
        color: ${(props) => props.theme.colors.text};
        outline: none;
        font-family: ${(props) => props.theme.fonts.celestial};
        margin-right: 15px;
        padding: 4px 0;
        border-bottom: 2px solid transparent;
        transition: border-color 0.2s;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}80;
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
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
            color: ${(props) => props.theme.colors.error};
            background-color: ${(props) => props.theme.colors.error}1A;
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

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.accent};
        border-radius: 5px;
    }
`;

export const FieldRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 8px;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent}33;

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
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        background-color: transparent;
        border: 1px solid transparent;
        border-radius: 5px;
        padding: 6px 8px;
        outline: none;
        text-align: right;
        transition: all 0.2s;
        cursor: pointer;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}66;
        }

        &:hover, &:focus {
            background-color: ${(props) => props.theme.colors.primary}08;
            border-color: ${(props) => props.theme.colors.primary}40;
        }

        &::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.5;
            transition: opacity 0.2s;
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
                background-color: transparent;
                border: none;
                border-bottom: 1px solid ${(props) => props.theme.colors.primary}66;
                border-radius: 0; /* 밑줄 스타일을 위해 radius 제거 */
                padding: 4px;
                outline: none;
                transition: all 0.2s;

                /* 화살표(스피너) 숨김 유지 */
                -moz-appearance: textfield;
                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                &:hover, &:focus {
                    background-color: transparent;
                    border-bottom: 1px solid ${(props) => props.theme.colors.primary};
                }

                &::placeholder {
                    color: ${(props) => props.theme.colors.textSecondary}66;
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
    background-color: ${(props) => props.theme.colors.accent}11;
    border-radius: 5px;
    border: 1px solid ${(props) => props.theme.colors.accent}33;

    .condition-title {
        font-size: 0.85rem;
        color: ${(props) => props.theme.colors.textSecondary};
        font-weight: 500;
    }

    input[type="date"], input[type="number"] {
        width: 100%;
        text-align: left;
        background-color: ${(props) => props.theme.colors.surface};
        border: 1px solid ${(props) => props.theme.colors.accent}66;
        border-radius: 5px;
        padding: 10px 12px;
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        transition: all 0.2s;
        outline: none;
        font-family: inherit;
        -moz-appearance: textfield;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        &:hover, &:focus {
            border-color: ${(props) => props.theme.colors.primary}66;
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
        font-size: 0.95rem;
        color: ${(props) => props.theme.colors.text};
        background-color: transparent;
        border: 1px solid ${(props) => props.theme.colors.accent}66;
        border-radius: 5px;
        padding: 10px;
        outline: none;
        resize: vertical;
        line-height: 1.5;
        transition: all 0.2s;

        &::placeholder {
            color: ${(props) => props.theme.colors.textSecondary}66;
        }

        &:focus {
            border-color: ${(props) => props.theme.colors.primary}66;
            background-color: ${(props) => props.theme.colors.primary}05;
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
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid ${(props) => props.theme.colors.accent}66;
    background-color: ${(props) => props.theme.colors.surface};

    &:hover {
        border-color: ${(props) => props.theme.colors.primary}66;
    }

    .content-wrapper {
        display: flex;
        align-items: center;
        font-size: 0.95rem;
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
    border: 1px solid ${(props) => props.theme.colors.accent}66;
    border-radius: 5px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    max-height: 160px;
    overflow-y: auto;
    z-index: 30;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.accent};
        border-radius: 5px;
    }
`;

export const DropdownItem = styled.div`
    display: flex;
    align-items: center;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 0.95rem;
    color: ${(props) => props.theme.colors.text};
    transition: background-color 0.2s;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent}22;

    &:last-child { border-bottom: none; }
    &:hover { background-color: ${(props) => props.theme.colors.primary}1A; }
`;

export const ColorDot = styled.div<{ $color: string }>`
    background-color: ${(props) => props.$color};
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 10px;
    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.surface}, 0 0 0 3px ${(props) => props.$color}66;
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
    gap: 10px;
    padding: 16px 24px;
    background-color: ${(props) => props.theme.colors.surface};
    border-top: 1px solid ${(props) => props.theme.colors.accent}40;
    border-radius: 0 0 5px 5px;
`;