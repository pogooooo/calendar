import styled from "styled-components";

export const SettingsContainer = styled.div`
    position: relative;
    display: inline-flex;
`;

export const SetCategoryButton = styled.div`
    color: ${(props) => props.theme.colors.primary};
    padding: 3px;
    cursor: pointer;

    svg {
        transition: filter 0.25s ease;
    }

    &:hover svg {
        filter: drop-shadow(0 0 3px ${(props) => props.theme.colors.primary});
    }
`;

export const SettingsBackdrop = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 99;
    cursor: default;
`;

export const SettingsPopover = styled.div<{ $openUp?: boolean }>`
    position: absolute;
    ${(props) => props.$openUp
        ? "bottom: calc(100% + 10px);"
        : "top: calc(100% + 10px);"}
    right: 0;
    width: 220px;
    max-width: calc(100vw - 24px);
    max-height: min(58vh, 420px);
    overflow-y: auto;
    box-sizing: border-box;

    background-color: ${(props) => props.theme.colors.surface};
    border: 1px solid ${(props) => props.theme.colors.primary};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    font-family: ${(props) => props.theme.fonts.body};

    z-index: 100;
    padding: 0 0 8px;
    color: ${(props) => props.theme.colors.text};

    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        background: linear-gradient(315deg, transparent 48%, ${(props) => props.theme.colors.primary} 50%, transparent 52%);
        pointer-events: none;
    }

    .popover-content {
        display: flex;
        flex-direction: column;
    }
`;

export const PopoverLabel = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.66rem;
    letter-spacing: 2px;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 12px 14px 7px;
`;

export const MenuItem = styled.div<{ $isSelected: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    padding: 9px 14px 11px;
    font-size: 0.87rem;
    cursor: pointer;
    user-select: none;
    opacity: ${(props) => props.$isSelected ? 1 : 0.4};
    text-decoration: ${(props) => props.$isSelected ? 'none' : 'line-through'};

    background-color: transparent;
    background-image: linear-gradient(${(props) => props.theme.colors.primary}, ${(props) => props.theme.colors.primary});
    background-repeat: no-repeat;
    background-position: 14px calc(100% - 4px);
    background-size: 0 1px;
    transition: background-size 0.3s ease, opacity 0.25s ease;

    &:hover {
        background-size: calc(100% - 28px) 1px;
    }

    .item-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const CategoryColorDot = styled.div<{ $color: string, $isSelected: boolean }>`
    width: 9px;
    height: 9px;
    flex-shrink: 0;
    margin-right: 10px;
    transform: rotate(45deg);
    background-color: ${(props) => props.$isSelected ? props.$color : 'transparent'};
    border: 1px solid ${(props) => props.$isSelected ? props.$color : props.theme.colors.textSecondary};
    transition: background-color 0.25s ease, border-color 0.25s ease;
`;

export const Divider = styled.hr`
    border: none;
    border-top: 1px dashed ${(props) => props.theme.colors.primary}55;
    margin: 6px 14px;
`;
