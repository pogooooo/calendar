import styled from "styled-components";

export const SettingsContainer = styled.div`
    position: relative;
    display: inline-flex;
`;

export const SetCategoryButton = styled.div`
    color: ${(props) => props.theme.colors.primary};
    border-radius: 5px;
    transition: background-color 0.3s ease;
    padding: 3px;
    cursor: pointer;

    &:hover {
        background-color: rgba(0, 0, 0, 0.1);
        svg {
            filter: drop-shadow(0 0 3px ${(props) => props.theme.colors.accent});
        }
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

    background-color: ${(props) => props.theme.colors.surface || '#fff'};
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-radius: 8px;
    box-shadow: 0 4px 20px 4px rgba(0, 0, 0, 0.15);
    font-family: ${(props) => props.theme.fonts.body};

    z-index: 100;
    padding: 12px;
    color: ${(props) => props.theme.colors.text};

    .popover-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .menu-item {
        padding: 8px;
        font-size: 0.9rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
    }
`;

export const MenuItem = styled.div<{ $isSelected: boolean }>`
    display: flex;
    align-items: center;
    padding: 8px;
    font-size: 0.9rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: ${(props) => props.$isSelected ? 1 : 0.4};
    text-decoration: ${(props) => props.$isSelected ? 'none' : 'line-through'};

    &:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }
`;

export const CategoryColorDot = styled.div<{ $color: string, $isSelected: boolean }>`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${(props) => props.$isSelected ? props.$color : 'gray'};
    transition: background-color 0.3s ease;
`;