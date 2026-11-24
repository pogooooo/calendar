import styled from "styled-components";
import { Surface as Base } from "../WidgetAppearance.styles";
import { gemField, gemQuietButton } from "@/features/gem/GemLive.styles";

export const Surface = styled(Base)`
    --widget-control-radius: var(--gem-radius);
    --widget-card-radius: var(--gem-radius);
    --widget-field-radius: var(--gem-radius);
    --widget-badge-radius: var(--gem-radius);
    --widget-switch-radius: var(--gem-radius);
    background: var(--gem-panel);
    border-color: var(--gem-line);

    .settings-head {
        background: var(--gem-heading);
        border-bottom-color: var(--gem-line);
    }
    .settings-head h3 { font-family: ${p => p.theme.fonts.display}; }
    .appearance-preview { background: color-mix(in srgb, var(--gem-surface) 62%, transparent); }
    .sample { border: 1px solid var(--gem-line); border-radius: 12px; }
    .sample[data-inspect] { display: block; overflow: auto; }
    .gem-preview-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-block-end: 7px; }
    .gem-preview-actions > button { min-height: 28px; padding: 3px 10px; }
    .settings-foot { background: var(--gem-record); border-top-color: var(--gem-line); }
    .section-tabs { gap: 5px; padding-block: 4px; }
    .section-tabs button {
        border: 1px solid transparent;
        border-radius: var(--gem-radius);
        color: var(--gem-muted);
    }
    .section-tabs button[aria-selected="true"] {
        border-color: var(--gem-gold);
        background: var(--gem-action);
        color: var(--gem-action-ink);
        font-weight: 750;
    }
    .section-tabs button:focus-visible { outline: 2px solid var(--gem-ink); outline-offset: 2px; }
    .numeric-value { border-color: var(--gem-line); }
    .numeric-value:focus-within { border-color: var(--gem-gold); }
    && .numeric-value, && .color-inputs input[type=text] { ${gemField} }
    && .choices button, && .quick-looks button, && .settings-foot .undo { ${gemQuietButton} }
    && .choices button[aria-pressed="true"] { background: var(--gem-action); color: var(--gem-action-ink); }
    && button[role=switch] > span { background: var(--gem-record); border: 1px solid var(--gem-frame-silver); }
    && button[role=switch] > span::after { background: var(--gem-action); }
    && button[role=switch][aria-checked=true] > span { background: var(--gem-rail); }
    && button[role=switch][aria-checked=true] > span::after { background: var(--gem-control); }
    && input[type=range]::-webkit-slider-runnable-track {
        background: var(--gem-action-map) left / var(--range-fill, 0%) 100% no-repeat, var(--gem-pearl-map) center / cover;
        border: 1px solid var(--gem-line);
    }
    && input[type=range]::-moz-range-track { background: var(--gem-record); }
    && input[type=range]::-moz-range-progress { background: var(--gem-rail); }
    input[type=range]:focus-visible { outline-offset: 0; border-radius: var(--gem-radius); }
    @media (pointer: coarse) {
        input[type=range] { min-height: 44px; }
    }

    && .settings-foot .done, && .quick-looks button[aria-pressed="true"] {
        border-color: transparent;
        color: var(--gem-action-ink);
        background: var(--gem-action);
        box-shadow: none;
    }
    && .settings-foot .done:hover:not(:disabled), && .quick-looks button[aria-pressed="true"]:hover:not(:disabled) {
        border-color: transparent;
        background: var(--gem-action);
        filter: brightness(1.05);
    }
    && input[type=range]::-webkit-slider-thumb {
        width: 21px;
        height: 21px;
        margin-top: -8px;
        border: 1px solid var(--gem-gold);
        background: var(--gem-refraction-map) 40% center / 30px auto;
        box-shadow: none;
    }
    && input[type=range]::-moz-range-thumb {
        width: 19px;
        height: 19px;
        border: 1px solid var(--gem-gold);
        background: var(--gem-refraction-map) 40% center / 30px auto;
    }
    .color-inputs input[type=color] { width: 42px; }
    .color-inputs input[type=color]::-webkit-color-swatch-wrapper { padding: 0; }
    .color-inputs input[type=color]::-webkit-color-swatch { border: 0; border-radius: 50%; }
    .color-inputs input[type=color]::-moz-color-swatch { border: 0; border-radius: 50%; }
`;
