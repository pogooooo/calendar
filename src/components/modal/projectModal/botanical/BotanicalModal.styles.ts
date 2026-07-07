import styled from "styled-components";

export const FormWrapper = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 85vh;
    background-color: ${(props) => props.theme.colors.surface};
    font-family: ${(props) => props.theme.fonts.body};
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px 12px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.background};
`;

export const TitleInput = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    color: ${(props) => props.theme.colors.text};
    outline: none;
    font-family: ${(props) => props.theme.fonts.body};
    font-weight: 500;
    margin-right: 15px;
    padding: 4px 0;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease;

    &::placeholder {
        color: ${(props) => props.theme.colors.textSecondary}66;
    }

    &:focus {
        border-bottom: 1px solid ${(props) => props.theme.colors.primary}66;
    }
`;

export const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: ${(props) => props.theme.colors.textSecondary};
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 6px;

    &:hover {
        color: ${(props) => props.theme.colors.error};
        background-color: ${(props) => props.theme.colors.error}10;
    }
`;

export const ScrollBody = styled.div`
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    background-color: ${(props) => props.theme.colors.surface};
    flex: 1;

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
    padding: 10px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}55;
`;

export const FieldLabel = styled.label`
    font-family: ${(props) => props.theme.fonts.body};
    font-size: 0.85rem;
    color: ${(props) => props.theme.colors.textSecondary};
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 90px;
`;

export const FieldInput = styled.input`
    flex: 1;
    font-family: inherit;
    font-size: 0.85rem;
    color: ${(props) => props.theme.colors.text};
    background: ${(props) => props.theme.colors.background};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 8px;
    padding: 6px 10px;
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
`;

export const ParticipantRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}55;
`;

export const ParticipantPicker = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    border: 1px solid ${(props) => props.theme.colors.border};
    padding: 8px;
    border-radius: 8px;
    background: ${(props) => props.theme.colors.background};
    min-height: 44px;
    max-height: 100px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const ParticipantItem = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid ${(props) => props.$selected ? props.theme.colors.primary : props.theme.colors.border};
    background-color: ${(props) => props.$selected ? props.theme.colors.primary + '18' : 'transparent'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}0E;
        border-color: ${(props) => props.theme.colors.primary};
    }
`;

export const ParticipantName = styled.span`
    font-size: 0.8rem;
    color: ${(props) => props.theme.colors.text};
`;

export const MemoRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 0;
`;

export const MemoTextArea = styled.textarea`
    width: 100%;
    min-height: 100px;
    font-family: inherit;
    font-size: 0.85rem;
    color: ${(props) => props.theme.colors.text};
    background: ${(props) => props.theme.colors.background};
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

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
        border-radius: 2px;
    }
`;

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 20px;
    background-color: ${(props) => props.theme.colors.background};
    border-top: 1px solid ${(props) => props.theme.colors.border};
`;
