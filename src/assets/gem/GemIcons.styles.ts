import styled from "styled-components";

export const Icon = styled.svg`
    flex: none;
    overflow: visible;
    .facet { fill: currentColor; fill-opacity: .19; stroke-width: .7; }
`;

export const Sticker = styled.svg`
    overflow: visible;
    .setting { fill: var(--gem-surface); }
    .rim { fill: none; stroke: var(--gem-line); stroke-width: 1.3; }
    .facets { fill: none; stroke: var(--gem-line); stroke-width: .8; opacity: .55; }
    &[data-filled="true"] .rim { stroke: var(--gem-gold); }
    &[data-filled="true"] .facets { stroke: #e5c9e5; opacity: .62; }
    .complete { fill: none; stroke: #fff7fc; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
`;
