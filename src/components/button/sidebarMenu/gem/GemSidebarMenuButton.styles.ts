import styled, { css } from "styled-components";
import * as C from "../celestial/SidebarMenuButton.styles";
import { TOUCH } from "@/styles/breakpoints";

export * from "../celestial/SidebarMenuButton.styles";
export const Numeral = styled(C.Numeral)`display: none;`;
export const IconContainer = styled(C.IconContainer)`
    width: 19px;
    height: 19px;
    margin-left: 0;
`;

const activeMenuItem = css`
    color: var(--gem-action-ink);
    font-weight: 700;
    &::before {
        opacity: 1;
        background: var(--gem-action);
        border-color: transparent;
        box-shadow: inset 0 1px var(--gem-rim-light), 0 1px 3px #20122638;
    }
`;

export const SidebarButton = styled(C.SidebarButton)`
    min-height: 38px;
    height: auto;
    gap: 8px;
    padding: 0 10px;
    border: 0;
    border-radius: 8px;
    background: none;
    isolation: isolate;
    color: var(--gem-ink);
    font: 650 .88rem/1.35 ${({ theme }) => theme.fonts.body};
    transition: color .16s ease;
    > span { margin-left: 0; align-self: center; }
    svg { width: 18px; height: 18px; }
    ${TOUCH} { min-height: 44px; }

    &&::before {
        content: "";
        position: absolute;
        inset: 3px 0;
        z-index: -1;
        width: auto;
        height: auto;
        transform: none;
        clip-path: none;
        mask: none;
        border: 1px solid color-mix(in srgb, var(--gem-frame-silver) 60%, transparent);
        border-radius: var(--gem-radius);
        background: var(--gem-navigation);
        box-sizing: border-box;
        pointer-events: none;
        opacity: 0;
        transition: opacity .18s ease;
    }
    &::after { display: none; }
    @media (hover: hover) {
        html[data-theme-family="gem"] &&:hover { box-shadow: none; }
        &:hover::before { opacity: 1; }
    }
    ${({ $active }) => $active && css`&& { ${activeMenuItem} }`}
    &&[aria-current="page"] { ${activeMenuItem} }
`;
