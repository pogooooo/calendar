import styled from "styled-components";

export const SettingsContainer = styled.div`
    position: relative;
    display: inline-flex;
`;

export const SetCategoryButton = styled.div`
    color: ${(props) => props.theme.colors.primary};
    border-radius: 8px;
    transition: background-color 0.2s ease;
    padding: 3px;
    cursor: pointer;

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}0E;
    }
`;

export const SettingsBackdrop = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 99;
    cursor: default;
`;

export const SettingsPopover = styled.div`
    position: absolute;
    top: 0;
    left: calc(100% + 8px);
    width: 200px;

    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.border};
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(217, 207, 199, 0.5);
    font-family: ${(props) => props.theme.fonts.body};

    z-index: 100;
    padding: 12px;
    color: ${(props) => props.theme.colors.text};

    .popover-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
`;

export const MenuItem = styled.div<{ $isSelected: boolean }>`
    display: flex;
    align-items: center;
    padding: 8px;
    font-size: 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: ${(props) => props.$isSelected ? 1 : 0.45};
    text-decoration: ${(props) => props.$isSelected ? 'none' : 'line-through'};

    &:hover {
        background-color: ${(props) => props.theme.colors.primary}0E;
    }
`;

export const CategoryColorDot = styled.div<{ $color: string, $isSelected: boolean }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${(props) => props.$isSelected ? props.$color : props.theme.colors.textSecondary};
    transition: background-color 0.2s ease;
`;

export const Divider = styled.hr`
    border: none;
    border-top: 1px solid ${(props) => props.theme.colors.border};
    margin: 4px 0;
`;
