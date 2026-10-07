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
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}; /* 얇은 테마 선 */
    background-color: ${(props) => props.theme.colors.surface};
`;

export const TitleInput = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    color: ${(props) => props.theme.colors.text};
    outline: none;
    font-family: ${(props) => props.theme.fonts.display};
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

export const ScrollBody = styled.fieldset`
    border: none;
    margin: 0;
    min-width: 0;
    padding: 12px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    background-color: ${(props) => props.theme.colors.surface};
    flex: 1;
    min-height: 0;
    /* fieldset 은 넘친 안쪽을 다 잘라 주지 않는다 — 종이 무늬로 relative 가 걸린 칩(선행 조건)이
       아래 단추 줄 위로 비어져 나왔다. 그리기를 이 상자 안으로 가둔다 */
    contain: paint;
`;

export const FieldRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
`;

export const FieldLabel = styled.label`
    font-family: ${(props) => props.theme.fonts.display};
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

`;

export const ParticipantItem = styled.button.attrs({ type: 'button' })<{ $selected: boolean }>`
    font-family: inherit;
    min-height: 32px;
    &:disabled { opacity: 0.45; cursor: not-allowed; }
    @media (max-width: 768px) { min-height: 44px; }
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

`;

export const Footer = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 20px;
    background-color: ${(props) => props.theme.colors.surface};
    border-top: 1px solid ${(props) => props.theme.colors.primary}55;
`;

export const ErrorMessage = styled.p`
    margin: 0;
    padding: 8px 20px;
    color: ${(p) => p.theme.colors.error};
    font-size: 0.8rem;
`;

/* 하루 종일·날짜 지정 스위치 — 할 일 창(TodoModal)의 것과 같은 모양 */
export const ToggleSwitch = styled.label`
    position: relative;
    display: inline-block;
    flex: none;
    width: 60px;
    height: 22px;

    input { opacity: 0; width: 0; height: 0; }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: ${(props) => props.theme.colors.textSecondary}66;
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
    input:focus-visible + .slider { outline: 2px solid ${(props) => props.theme.colors.primary}; outline-offset: 2px; }
`;

/* 고르개(DateTimePicker)가 줄의 남은 폭을 쓰게 */
export const PickerCell = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: flex-end;
`;

/* 왼쪽 끝의 삭제 단추를 밀어 두고 나머지는 오른쪽에 */
export const FooterSpacer = styled.div`
    flex: 1;
`;
