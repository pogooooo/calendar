import styled, { css } from "styled-components";
import * as C from "../celestial/CelestialCategory.styles";
import { gemstoneAction, gemstoneHeading, gemstonePanel, gemstonePill, gemstoneSlab } from "@/features/gem/GemWorkspace.styles";
import { MOBILE } from "@/styles/breakpoints";
import { gemField } from "@/features/gem/GemLive.styles";

export * from "../celestial/CelestialCategory.styles";

export const CategoryWrapper = styled(C.CategoryWrapper).attrs(({ className }) => ({ className, "data-theme-layout": "gem-category" }))`
    background: transparent;
    ${MOBILE} { height: auto; min-height: 100%; }
`;
export const CenterWrapper = styled(C.CenterWrapper)`
    ${MOBILE} { height: auto; }
`;
export const ContentContainer = styled(C.ContentContainer)`
    ${MOBILE} { flex: none; overflow: visible; }
`;
export const CategoryList = styled(C.CategoryList)`
    ${MOBILE} {
        > * { min-width: clamp(86px, 29vw, 124px); }
        > :last-child { min-width: 44px; }
    }
`;
export const Zodiac = styled(C.Zodiac)`display: none;`;
export const Corners = styled(C.Corners)`display: none;`;
export const PageHeader = styled(C.PageHeader)`
    ${gemstonePanel}
    ${gemstoneHeading}
    padding: 12px clamp(12px, 2vw, 22px);
    span { font-size: clamp(1.15rem, 2vw, 1.65rem); font-weight: 700; letter-spacing: -.02em; }
    i { transform: none; border: 0; border-radius: 50%; background: var(--gem-gold-edge); }
    hr { background: var(--gem-gold-edge); }
`;
export const DeckCard = styled(C.DeckCard).attrs(p => ({ "aria-pressed": p.$isSelected }))`
    ${gemstonePill}
    min-height: 44px;
    animation: none;
    &::before { content: none; }
    &, &:hover { transform: none; }
    .num, .mark { display: none; }
    .chip { clip-path: none; border-radius: 50%; }
    .nm { font-weight: 700; }
    ${p => p.$isSelected && css`
        ${gemstoneSlab}
        .nm { color: var(--gem-slab-ink); }
    `}
`;
export const DeckAddCard = styled(C.DeckAddCard)`
    ${gemstoneAction}
    min-height: 44px;
`;
export const Plate = styled(C.Plate)`
    ${gemstonePanel}
    ${gemstoneHeading}
    margin-block-end: 12px;
`;
export const EmblemWrap = styled(C.EmblemWrap)`
    border: 1px solid transparent;
    border-radius: 50%;
    background: linear-gradient(${p => p.$color}, ${p => p.$color}) padding-box, var(--gem-gold-edge) border-box;
    animation: none;
    width: 44px;
    height: 44px;
    svg { opacity: 0; }
    &:focus-within { outline: 2px solid var(--gem-gold); outline-offset: 2px; }
`;
export const PlateText = styled(C.PlateText)`
    .numeral { display: none; }
    .title-input { border-radius: var(--gem-radius); }
`;
export const DetailHeader = styled(C.DetailHeader)`
    gap: 8px;
    button { ${gemstonePill} min-height: 44px; padding: 8px 14px; letter-spacing: 0; }
    button::after { content: none; }
    ${p => css`
        button.${p.$activeTab === "info" ? "info-tab" : "todo-tab"} {
            ${gemstoneSlab}
            text-shadow: none;
            font-weight: 700;
            &:hover:not(:disabled) { color: var(--gem-slab-ink); }
        }
    `}
`;
export const DescBlock = styled(C.DescBlock)`
    textarea { ${gemField} border-radius: 10px; }
`;
export const TodoCard = styled(C.TodoCard)`
    ${gemstonePanel}
    background: var(--gem-record);
    border-radius: 10px;
    &::before { content: none; }
    .check-btn, .delete-btn { ${gemstonePill} }
    .check-btn[aria-pressed="true"] { ${gemstoneSlab} }
    .delete-btn:focus-visible { opacity: 1; }
    .todo-info .title { white-space: normal; overflow-wrap: anywhere; }
    ${MOBILE} {
        padding: 8px;
        .check-btn, .delete-btn { width: 44px; height: 44px; }
        .delete-btn { opacity: 1; }
    }
`;
export const TodoGrid = styled(C.TodoGrid)`
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
`;
export const EmptyBox = styled(C.EmptyBox)`${gemstonePanel}`;
