import styled from "styled-components";

export const FormWrapper = styled.form`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: 85vh;
    background-color: ${(props) => props.theme.colors.surface};
    /* 여기서 테두리를 제거하여 BaseModal의 테두리와 겹치지 않게 함 */
`;

export const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px 12px 20px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}55; /* 얇은 테마 선 */
    background-color: ${(props) => props.theme.colors.surface};
`;

export const TitleInput = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    color: ${(props) => props.theme.colors.text};
    outline: none;
    font-family: ${(props) => props.theme.fonts.celestial};
    margin-right: 15px;
    padding: 4px 0;
    border-bottom: 1px solid transparent;
    transition: all 0.2s;

    &::placeholder {
        color: ${(props) => props.theme.colors.textSecondary}80;
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
    transition: all 0.2s;

    &:hover {
        color: #ff5252;
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
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const FieldRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
`;

export const FieldLabel = styled.label`
    font-family: ${(props) => props.theme.fonts.celestial};
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
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    border-radius: 4px;
    padding: 6px 10px;
    outline: none;
    text-align: right;
    transition: all 0.2s;
    cursor: pointer;

    &::placeholder {
        color: ${(props) => props.theme.colors.textSecondary}66;
    }

    &:hover, &:focus {
        border-color: ${(props) => props.theme.colors.primary};
    }

    &::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s;
        &:hover { opacity: 1; }
    }
`;

export const ParticipantRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
`;

export const ParticipantPicker = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    padding: 8px;
    border-radius: 4px;
    background: transparent;
    min-height: 44px;
    max-height: 100px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const ParticipantItem = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid ${(props) => props.$selected ? props.theme.colors.primary : props.theme.colors.primary + '40'};
    background-color: ${(props) => props.$selected ? props.theme.colors.primary + '1A' : 'transparent'};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}1A;
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
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    border-radius: 4px;
    padding: 10px;
    outline: none;
    resize: vertical;
    line-height: 1.5;
    transition: all 0.2s;

    &::placeholder {
        color: ${(props) => props.theme.colors.textSecondary}66;
    }

    &:focus {
        border-color: ${(props) => props.theme.colors.primary};
    }

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 20px;
    background-color: ${(props) => props.theme.colors.surface};
    border-top: 1px solid ${(props) => props.theme.colors.primary}55;
`;