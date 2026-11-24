import styled from "styled-components";
import * as C from "../celestial/CelestialProjectPage.styles";
import { MOBILE } from "@/styles/breakpoints";
import { gemstoneAction, gemstonePanel, gemstonePill } from "@/features/gem/GemWorkspace.styles";

export * from "../celestial/CelestialProjectPage.styles";

export const ContentLayout = styled(C.ContentLayout)`
    max-width: 1400px;
    margin-inline: auto;
    &[data-project-view="board"] [data-mobile-panel="timeline"],
    &[data-project-view="timeline"] [data-mobile-panel="board"] { display: none; }
    ${MOBILE} {
        &[data-project-view="both"] [data-mobile-panel="timeline"] { display: none; }
    }
`;

export const MobileViews = styled.div`
    display: flex;
    align-self: flex-start;
    gap: 6px;
    button { ${gemstonePill} min-height: 34px; padding: 3px 12px; }
    button[aria-pressed="true"] { ${gemstoneAction} }
    ${MOBILE} {
        align-self: stretch;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        padding: 3px;
        border: 1px solid var(--gem-line);
        border-radius: var(--gem-radius);
        background: var(--gem-record);
        button {
            ${gemstonePill}
            min-height: 44px;
            font-size: .84rem;
        }
        button[aria-pressed="true"] { ${gemstoneAction} }
    }
`;

export const MobilePanel = styled.div`
    display: contents;
`;

export const Resizer = styled(C.Resizer)`
    &:focus-visible { outline: 2px solid var(--gem-ink); outline-offset: -2px; }
    &::after, &:hover::after, &:active::after {
        height: 2px;
        width: 42px;
        background: var(--gem-line);
        border-radius: var(--gem-radius);
        box-shadow: none;
    }
    &:hover::after, &:active::after { background: var(--gem-tint-ink); }
`;

export const Empty = styled(C.Empty)`
    ${gemstonePanel}
    width: 100%;
    min-height: 180px;
    color: var(--gem-muted);
`;
