import { createGlobalStyle } from "styled-components";

const GlobalScrollbar = createGlobalStyle`
    * {
        scrollbar-width: thin;
        scrollbar-color: ${(props) => props.theme.colors.primary}66 transparent;
    }

    *::-webkit-scrollbar {
        width: 10px;
        height: 10px;
        background: transparent;
    }

    *::-webkit-scrollbar-track {
        background: linear-gradient(
            to right,
            transparent calc(50% - 0.5px),
            ${(props) => props.theme.colors.primary}26 calc(50% - 0.5px),
            ${(props) => props.theme.colors.primary}26 calc(50% + 0.5px),
            transparent calc(50% + 0.5px)
        );
    }

    *::-webkit-scrollbar-track:horizontal {
        background: linear-gradient(
            to bottom,
            transparent calc(50% - 0.5px),
            ${(props) => props.theme.colors.primary}26 calc(50% - 0.5px),
            ${(props) => props.theme.colors.primary}26 calc(50% + 0.5px),
            transparent calc(50% + 0.5px)
        );
    }

    *::-webkit-scrollbar-thumb {
        min-height: 30px;
        border: 3px solid transparent;
        border-radius: 0;
        background-clip: content-box;
        background-color: transparent;
        background-image: linear-gradient(
            180deg,
            transparent 0%,
            ${(props) => props.theme.colors.primary}CC 18%,
            ${(props) => props.theme.colors.primary} 50%,
            ${(props) => props.theme.colors.primary}CC 82%,
            transparent 100%
        );
        transition: background-image 0.2s;
    }

    *::-webkit-scrollbar-thumb:horizontal {
        min-width: 30px;
        background-image: linear-gradient(
            90deg,
            transparent 0%,
            ${(props) => props.theme.colors.primary}CC 18%,
            ${(props) => props.theme.colors.primary} 50%,
            ${(props) => props.theme.colors.primary}CC 82%,
            transparent 100%
        );
    }

    *::-webkit-scrollbar-thumb:hover {
        box-shadow: 0 0 7px ${(props) => props.theme.colors.primary}80;
    }

    *::-webkit-scrollbar-corner {
        background: transparent;
    }

    *::-webkit-scrollbar-button {
        display: none;
        width: 0;
        height: 0;
    }
`;

export default GlobalScrollbar;
