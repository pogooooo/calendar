import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialAnniversary.styles";
import { gemstoneAction, gemstoneHeading, gemstonePanel, gemstonePill, gemstoneSlab } from "@/features/gem/GemWorkspace.styles";
import { MOBILE, TOUCH } from "@/styles/breakpoints";
import { gemField, gemIconSize } from "@/features/gem/GemLive.styles";

export * from "../celestial/CelestialAnniversary.styles";

export const Page = styled(C.Page).attrs(({ className }) => ({ className, "data-theme-layout": "gem-anniversary" }))`
    max-width: 1100px;
`;
export const Zodiac = styled(C.Zodiac)`display: none;`;
export const Corners = styled(C.Corners)`display: none;`;

export const PageHeader = styled(C.PageHeader)`
    ${gemstonePanel}
    ${gemstoneHeading}
    padding: 14px clamp(12px, 2vw, 24px);
    margin-block-end: 16px;
    span { font-size: clamp(1.15rem, 2.1vw, 1.7rem); font-weight: 700; letter-spacing: -.02em; }
    i { transform: none; border: 0; border-radius: 50%; background: var(--gem-gold-edge); }
    hr { background: var(--gem-gold-edge); }
`;

export const AddForm = styled(C.AddForm)`
    ${gemstonePanel}
    margin-block-end: 18px;
`;
export const FormCaption = styled(C.FormCaption)`
    position: static;
    transform: none;
    padding: 0;
    background: none;
    color: var(--gem-ink);
    font-size: .96rem;
    font-weight: 700;
    letter-spacing: 0;
`;
export const TitleInput = styled(C.TitleInput)`
    ${gemField}
    min-height: 44px;
    padding-inline: 14px;
`;
export const IconChoice = styled(C.IconChoice)`
    ${gemstonePill}
    ${gemIconSize}
    svg { filter: none; }
    &:hover { color: var(--gem-ink); }
    ${p => p.$selected && css`
        ${gemstoneSlab}
        &:hover:not(:disabled) { color: var(--gem-slab-ink); }
    `}
`;
export const IconRow = styled(C.IconRow)`flex-wrap: wrap;`;
export const AddButton = styled(C.AddButton)`
    ${gemstonePill}
    min-height: 44px;
    justify-content: center;
    &[type="submit"] { ${gemstoneAction} }
`;
export const Card = styled(C.Card)`
    ${gemstonePanel}
    padding-block-start: 47px;
    animation: none;
    &::before { content: none; }
    ${p => p.$today && css`border-color: var(--gem-gold); box-shadow: inset 0 2px var(--gem-gold); `}
`;
export const CardAction = styled(C.CardAction)`
    ${gemstonePill}
    left: auto;
    right: ${p => p.$edit ? "44px" : "8px"};
    opacity: 1;
    width: 30px; height: 30px;
    ${TOUCH} { width: 44px; height: 44px; right: ${p => p.$edit ? "57px" : "8px"}; }
`;
export const CardEmblem = styled(C.CardEmblem)`
    &::before {
        content: "";
        position: absolute;
        inset: 12px;
        border: 1px solid transparent;
        border-radius: 50%;
        background: var(--gem-action);
    }
    svg .dia { display: none; }
    svg .orbit-fill { stroke: var(--gem-gold); }
    .glyph { color: var(--gem-action-ink); }
    .glyph svg { filter: none; width: 20px; height: 20px; }
`;
export const CardTitle = styled(C.CardTitle)`
    color: var(--gem-ink);
    font-weight: 700;
    overflow-wrap: anywhere;
`;
export const CardDday = styled(C.CardDday)`
    ${gemstonePill}
    padding: 2px 8px;
    letter-spacing: 0;
    i { display: none; }
`;
