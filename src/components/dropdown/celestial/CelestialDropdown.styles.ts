import styled from "styled-components";

export const DropdownContainer = styled.div<{ $width?: string }>`
    position: relative;
    width: ${(props) => props.$width || '100%'};
    font-family: ${(props) => props.theme.fonts.celestial};
`;

export const DropdownHeader = styled.div<{ $disabled?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: ${(props) => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s;
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    background-color: transparent;
    color: ${(props) => props.theme.colors.text};
    font-size: 0.85rem;
    opacity: ${(props) => props.$disabled ? 0.5 : 1};

    &:hover {
        border-color: ${(props) => props.$disabled ? props.theme.colors.primary + '55' : props.theme.colors.primary};
        background-color: ${(props) => props.$disabled ? 'transparent' : props.theme.colors.primary + '08'};
    }

    .content-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .placeholder {
        color: ${(props) => props.theme.colors.textSecondary}80;
    }
`;

export const DropdownList = styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary}55;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    max-height: 200px;
    overflow-y: auto;
    z-index: 50;

    /* 제공해주신 커스텀 스크롤바 디자인 적용 */
    &::-webkit-scrollbar { 
        width: 4px; 
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.primary}80;
        border-radius: 2px;
    }
`;

export const DropdownItem = styled.div<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.85rem;
    color: ${(props) => props.theme.colors.text};
    transition: background-color 0.1s;
    
    background-color: ${(props) => props.$selected ? props.theme.colors.primary + '22' : 'transparent'};
    border-left: 2px solid ${(props) => props.$selected ? props.theme.colors.primary : 'transparent'};

    &:hover { 
        background-color: ${(props) => props.theme.colors.primary}1A; 
    }
`;

export const ColorDot = styled.div<{ $color: string }>`
    background-color: ${(props) => props.$color};
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
`;