import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";
import { watercolorLeaf } from "@/styles/maple/ink";

const turnLeaf = keyframes`
    0%, 100% { transform: rotate(0); }
    45% { transform: rotate(9deg); }
`;

export const Decor = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;

    /* A bound edge leaves the writing surface clear, even on narrow widgets. */
    &::before {
        content: "";
        position: absolute;
        top: 12px;
        bottom: 12px;
        left: 1px;
        width: 3px;
        border-radius: 2px;
        background: linear-gradient(to bottom,
            transparent,
            ${(p) => withAlpha(p.theme.colors.primary, p.theme.mode === "dark" ? .65 : .48)} 12px,
            ${(p) => withAlpha(p.theme.colors.primary, .24)} 70%,
            transparent);
    }

    .pressed-leaf {
        ${watercolorLeaf("orange", "24px")}
        position: absolute;
        top: 3px;
        left: 28px;
        rotate: 24deg;
        transform-origin: 32% 72%;
    }

    .corner-leaf {
        ${watercolorLeaf("red", "68px")}
        position: absolute; right: -24px; bottom: -19px;
        rotate: -23deg; opacity: .86;
    }
    .small-leaf {
        ${watercolorLeaf("brown", "30px")}
        position: absolute; right: 33px; bottom: -10px;
        rotate: 38deg; opacity: .7;
    }

    &[data-glint] .pressed-leaf { animation: ${turnLeaf} 660ms ease-out both; }
`;
