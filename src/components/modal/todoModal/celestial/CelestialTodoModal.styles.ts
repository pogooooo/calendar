import styled from "styled-components";

export const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
`

export const Container = styled.div`
    background-color: ${(props) => props.theme.colors.surface};
    max-width: 90%;
    border-radius: 5px;
    padding: 30px;
    display: flex;
    flex-direction: column;
`

export const Header = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary};
    margin-bottom: 10px;
    
    & > input{
        border-radius: 5px;
        font-size: ${(props) => props.theme.fontSizes.h3};
        padding: 5px;
        outline: none;
        margin-right: 10px;
    }
    
    & > button{
        cursor: pointer;
    }
`

export const CategorySelect = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: ${(props) => props.theme.fontSizes.h4};
    position: relative;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    margin-bottom: 10px;

    label {
        font-size: 0.9rem;
        font-weight: bold;
    }
`

export const ColorDot = styled.div<{ $color: string }>`
    background-color: ${(props) => props.$color};
    width: 15px;
    height: 15px;
    border-radius: 100%;
    margin-right: 10px;
`

export const SelectedCategory = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 5px;
    cursor: pointer;
    
    & > div {
        display: flex;
        align-items: center;
    }
`

export const CategoryList = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 150px;
    overflow-y: auto;
    z-index: 10;
`

export const CategoryItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${(props) => props.theme.colors.textSecondary}55;
    }
`

export const AllDay = styled.div`
    font-size: ${(props) => props.theme.fontSizes.h4};
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    padding-bottom: 10px;
    margin-bottom: 10px;
`

export const ToggleSwitch = styled.label`
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;

    input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${(props) => props.theme.colors.accent};
        transition: 0.3s;
        border-radius: 24px;
    }

    .slider::before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    input:checked + .slider {
        background-color: ${(props) => props.theme.colors.primary};
    }

    input:checked + .slider::before {
        transform: translateX(20px);
    }
`

export const DateRow = styled.div`
    font-size: ${(props) => props.theme.fontSizes.h4};
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    padding-bottom: 10px;
    margin-bottom: 10px;

    input {
        font-family: inherit;
        font-size: 1rem;=
        color: ${(props) => props.theme.colors.text};
        background-color: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        text-align: right;

        &::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.2s;
            
            &:hover {
                opacity: 1;
            }
        }
    }
`

export const MemoRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-bottom: 1px solid ${(props) => props.theme.colors.accent};
    padding-bottom: 15px;
    margin-bottom: 15px;

    label {
        font-size: ${(props) => props.theme.fontSizes.h4};
    }

    textarea {
        width: 100%;
        min-height: 60px;
        font-family: inherit;
        font-size: 1rem;
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
            background-color: ${(props) => props.theme.colors.primary};
            border-radius: 3px;
        }
    }
`

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end; /* 버튼을 오른쪽으로 밀어줍니다 */
    gap: 15px; /* 버튼 사이 간격 */
    margin-top: 20px;
    padding-top: 10px;

    /* ❌ 여기에 있던 .delete-btn 스타일은 전부 삭제하셔도 됩니다! */

    /* 저장 버튼(submit-btn) 스타일은 아직 <button> 태그를 쓰고 있다면 남겨주시고,
       저장 버튼도 <PrimaryButton> 같은 공통 컴포넌트로 바꾸셨다면 여기 내용도 싹 지워주시면 됩니다! */
    .submit-btn {
        width: 100px;
        height: 40px;
        /* ... 기존 저장 버튼 스타일 ... */
    }
`;