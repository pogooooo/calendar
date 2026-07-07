import styled from "styled-components";

export const DropdownContainer = styled.div<{ $width?: string }>`
    position: relative;
    width: ${(props) => props.$width || '100%'};
    font-family: ${(props) => props.theme.fonts.body};
`;

export const DropdownHeader = styled.div<{ $disabled?: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: ${(props) => props.$disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    border: 1px solid ${(props) => props.theme.colors.border};
    background-color: ${(props) => props.theme.colors.background};
    color: ${(props) => props.theme.colors.text};
    font-size: 0.85rem;
    opacity: ${(props) => props.$disabled ? 0.5 : 1};

    &:hover {
        border-color: ${(props) => props.$disabled ? props.theme.colors.border : props.theme.colors.primary};
        background-color: ${(props) => props.$disabled ? props.theme.colors.background : props.theme.colors.primary + '08'};
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
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 8px 8px 8px 0;
    box-shadow: 2px 2px 8px rgba(217, 207, 199, 0.4);
    max-height: 200px;
    overflow-y: auto;
    z-index: 50;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${(props) => props.theme.colors.border};
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
    transition: background-color 0.2s ease;
    border-bottom: 1px solid ${(props) => props.theme.colors.border}22;

    background-color: ${(props) => props.$selected ? props.theme.colors.primary + '18' : 'transparent'};
    border-left: 3px solid ${(props) => props.$selected ? props.theme.colors.primary : 'transparent'};

    &:first-child {
        border-radius: 8px 8px 0 0;
    }
    &:last-child {
        border-radius: 0 0 8px 0;
        border-bottom: none;
    }

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}0E;
    }
`;

export const ColorDot = styled.div<{ $color: string }>`
    background-color: ${(props) => props.$color};
    width: 10px;
    height: 10px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    flex-shrink: 0;
`;
