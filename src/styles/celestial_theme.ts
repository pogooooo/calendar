import {css} from "styled-components";

export const celestial_corner_accent = css`
    position: relative;

    &::after {
        content: "";
        width: 25px;
        height: 25px;
        background: linear-gradient(315deg, transparent 49%, ${(props) => props.theme.colors.primary} 50%, transparent 51%);
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }
`;

export const celestial_hide_scrollbar = css`
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
    }
`;

export const celestial_star = css`
    width: 7px;
    height: 7px;
    background-color: ${(props) => props.theme.colors.primary};
    clip-path: polygon(50% 0%, 59% 41%, 100% 50%, 59% 59%, 50% 100%, 41% 59%, 0% 50%, 41% 41%);
`;

export const celestial_sidebar_menuButton = css`
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding-bottom: 8px;
    cursor: pointer;
    background-color: transparent;
    background-image: linear-gradient(${(props) => props.theme.colors.primary}, ${(props) => props.theme.colors.primary});
    background-repeat: no-repeat;
    background-position: 17px calc(100% - 4px);
    background-size: 0 1px;
    transition: background-size 0.3s ease;

    & > span {
        margin-left: 5px;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &::before,
    &::after {
        content: "";
        position: absolute;
        bottom: 1px;
        ${celestial_star}
        transform: scale(0) rotate(-45deg);
        transition: transform 0.35s ease 0.08s;
    }

    &::before {
        left: 8px;
    }

    &::after {
        right: 8px;
    }

    &:hover {
        background-size: calc(100% - 32px) 1px;
    }

    &:hover::before,
    &:hover::after {
        transform: scale(1) rotate(0deg);
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
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}66;
    }
`
