import styled, { keyframes } from "styled-components";
import { withAlpha } from "@/styles/color";

const catchLight = keyframes`
    0%, 100% { opacity: 0; transform: translateX(-12%); }
    52% { opacity: .8; }
    85% { transform: translateX(24%); }
`;

export const Decor = styled.div`
    position: absolute;
    inset: 1px;
    border-radius: inherit;
    pointer-events: none;
    overflow: hidden;

    /* Natural caustics stay at the perimeter, independently of surface opacity. */
    &::before {
        content: ""; position: absolute; inset: 0;
        background: url("/themes/ocean/widget-lagoon.webp") center / cover;
        mask-image: linear-gradient(110deg, transparent 40%, #0007 80%, #000),
            linear-gradient(to bottom, transparent 78%, #000b);
        opacity: ${(p) => p.theme.mode === "dark" ? .28 : .6};
    }

    /* The highlight follows the glass edge without crossing the content. */
    .rim-light {
        position: absolute;
        inset: 1px 11px auto;
        height: 1px;
        background: linear-gradient(90deg, transparent,
            ${(p) => withAlpha(p.theme.mode === "dark" ? "#99e7db" : "#ffffff", .9)} 26%,
            ${(p) => withAlpha(p.theme.colors.accent, .35)} 68%, transparent);
    }

    .rim-light::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 16%, #ffffff 38%, transparent 63%);
        opacity: 0;
    }

    &::after {
        content: "";
        position: absolute;
        inset: 16px 1px 28% auto;
        width: 1px;
        background: linear-gradient(to bottom, transparent,
            ${(p) => withAlpha(p.theme.colors.accent, .48)} 32%, transparent);
    }

    &[data-glint] .rim-light::after { animation: ${catchLight} 780ms ease-out both; }
`;
