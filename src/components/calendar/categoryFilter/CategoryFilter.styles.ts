import styled from "styled-components";

export const SettingsContainer = styled.div`
    position: relative;
    display: inline-flex;
`;

export const SetCategoryButton = styled.div`
    color: ${(props) => props.theme.colors.primary};
    border-radius: 5px;
    padding: 3px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
        overflow: visible;
        transition: filter 0.3s ease;
    }
    
    &:hover {
        background-color: rgba(0, 0, 0, 0.1);
        svg {
            filter: drop-shadow(0 0 5px ${(props) => props.theme.colors.accent}) 
                    drop-shadow(0 0 5px ${(props) => props.theme.colors.accent});
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
    top: calc(100% + 8px);
    right: 0;
    width: 200px;
    
    background-color: ${(props) => props.theme.colors.surface || '#fff'};
    border: 1px solid ${(props) => props.theme.colors.primary};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    z-index: 100;
    padding: 12px;
    color: ${(props) => props.theme.colors.text};

    .popover-header {
        font-size: 0.9rem;
        font-weight: bold;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid ${(props) => props.theme.colors.border || '#eee'};
        color: ${(props) => props.theme.colors.textSecondary || 'gray'};
    }

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
        transition: all 0.3s ease;

        &:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }
    }
`;