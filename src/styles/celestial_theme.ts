import {css} from "styled-components";

export const celestial_secondaryButton = css`
    border: 1px solid ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.text};
    border-radius: 5px;
    transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;
    font-size: ${(props) => props.theme.fontSizes.body};
    
    &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 10px 3px ${(props) => props.theme.colors.accent};
    }
`;

export const celestial_tertiaryButton = css`
    color: ${(props) => props.theme.colors.primary};
    cursor: pointer;
    font-weight: 500;
    &:hover {
        text-decoration: underline;
    }
`

export const celestial_sidebar_menuButton = css`
    border-radius: 5px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out;
    
    & > span {
        margin-left: 5px;
    }
    
    &:hover {
        background-color: ${(props) => props.theme.colors.border};
    }
`;

export const celestial_singleInput_wrapper = css`
    position: relative;
    display: flex;
    align-items: center;
`

export const celestial_singleInput_label = css`
    position: absolute;
    left: 5px;
    transition: all 0.2s ease-in-out;
    font-size: ${(props) => props.theme.fontSizes.body};
    z-index: 1;
    background-color: ${(props) => props.theme.colors.surface};
    color: ${(props) => props.theme.colors.textSecondary};

    pointer-events: none;
`

export const celestial_singleInput_input = css`
    padding: 5px;
    
    font-size: ${(props) => props.theme.fontSizes.body};
    
    border: 1px solid ${(props) => props.theme.colors.primary};
    outline: none;
    border-radius: 5px;
    transition: box-shadow 0.3s ease;
    
    &:focus + .input-label, &:not(:placeholder-shown) + .input-label {
        top: 0;
        transform: translateY(-50%);
        font-size: ${(props) => props.theme.fontSizes.label};
        color: ${(props) => props.theme.colors.text};
    }
    
    &:focus {
        box-shadow: 0 0 10px 3px ${(props) => props.theme.colors.accent};
    }
`
