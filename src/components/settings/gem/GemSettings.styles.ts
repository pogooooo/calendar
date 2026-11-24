import styled from "styled-components";
import * as L from "../ocean/OceanSettings.layout";
import * as S from "../celestial/CelestialSettings.styles";
import { gemButton, gemField, gemPanel, gemQuietButton } from "@/features/gem/GemLive.styles";

export const layout = {
    ...L,
    Shell: styled(L.Shell).attrs<{ "data-gem-settings"?: string }>({ "data-gem-settings": "" })``,
    Pane: styled(L.Pane)`
        ${gemPanel}
        box-shadow: 0 12px 30px #38233e16;
    `,
    PaneHeader: styled(L.PaneHeader)`
        background: var(--gem-heading);
        border-block-end: 1px solid var(--gem-line);
        border-radius: 13px 13px 0 0;
    `,
    PaneTitle: styled(L.PaneTitle)`font-family: ${({ theme }) => theme.fonts.display};`,
    TabButton: styled(L.TabButton)`
        border-radius: var(--gem-radius);
        &[aria-selected="true"] { ${gemButton} }
    `,
    FamilyTile: styled(L.FamilyTile)`
        background: var(--gem-panel);
        border-color: var(--gem-line);
        backdrop-filter: none;
        &[aria-checked="true"] { border-color: var(--gem-gold); }
    `,
    ThemeStage: styled(L.ThemeStage)`${gemPanel} background: var(--gem-heading);`,
    StageName: styled(L.StageName)`font-family: ${({ theme }) => theme.fonts.display};`,
    Seg: styled(L.Seg)`
        ${gemQuietButton}
        &[aria-checked="true"], &[aria-pressed="true"] { ${gemButton} }
    `,
    FontCard: styled(L.FontCard)`${gemPanel} &[aria-checked="true"] { border-color: var(--gem-gold); }`,
    WidgetCard: styled(L.WidgetCard)`${gemPanel}`,
};

export const styles = {
    ...S,
    FormInput: styled(S.FormInput)`${gemField} min-height: 44px; padding-inline: 14px;`,
    FormButton: styled(S.FormButton)`
        ${({ $variant }) => $variant === "primary" ? gemButton : gemQuietButton}
        ${({ $variant, theme }) => $variant === "danger" ? `color: ${theme.colors.error}; border-color: currentColor;` : ""}
        min-height: 44px;
    `,
};

export const ColorBox = styled.fieldset`
    ${gemPanel}
    min-width: 0;
    margin: 14px 0 0;
    padding: 12px;
    legend { padding-inline: 5px; font-size: .86rem; font-weight: 700; }

    .gem-color-layout { display: flex; flex-wrap: wrap; gap: 12px; }
    .gem-color-controls { flex: 1 1 325px; min-width: 0; }
    .gem-swatches, .gem-color-current {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
    }
    .gem-color-current { margin-top: 8px; gap: 8px; }
    .gem-color-current output { color: var(--gem-tint-ink); font: 650 .8rem/1.2 ui-monospace, monospace; }
    .gem-swatches button { display: inline-flex; align-items: center; gap: 6px; }
    .gem-swatches button[aria-pressed="true"] {
        border-color: var(--gem-tint-ink);
        box-shadow: inset 0 0 0 1px var(--gem-tint-ink);
        font-weight: 700;
    }
    .gem-swatches i {
        display: inline-block;
        width: 13px;
        height: 13px;
        flex: none;
        border: 1px solid var(--gem-line);
        border-radius: 50%;
    }
    .gem-color-sample {
        flex: 1 1 138px;
        max-width: 188px;
        min-width: 0;
        display: grid;
        align-content: center;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 6px 8px;
        padding: 8px 10px;
        border: 1px solid var(--gem-line);
        border-radius: 12px;
        background: var(--gem-calendar-glaze), var(--gem-calendar-map) center / cover no-repeat, var(--gem-calendar-ground);
        font-size: .72rem;
        line-height: 1.3;
    }
    .gem-color-sample > :first-child { grid-column: 1 / -1; font-weight: 700; }
    .gem-color-sample strong { font: 650 1.1rem/1 ${({ theme }) => theme.fonts.numeral}; }
    .gem-color-event {
        overflow: hidden;
        padding: 2px 6px;
        border-radius: var(--gem-radius);
        color: var(--gem-event-ink);
        background: var(--gem-event-track);
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .gem-color-current label { display: inline-flex; align-items: center; gap: 7px; }
    label { color: var(--gem-ink); font-size: .78rem; font-weight: 700; }
    input[type="text"] {
        ${gemField}
        width: 100%;
        min-width: 0;
        min-height: 44px;
        padding: 4px 6px;
        text-align: center;
        font-family: ui-monospace, monospace;
        font-size: .84rem;
    }
    input[type="color"] {
        inline-size: 44px;
        block-size: 44px;
        padding: 5px;
        border: 1px solid var(--gem-gold);
        border-radius: 50%;
        background: var(--gem-panel);
        cursor: pointer;
        &::-webkit-color-swatch-wrapper { padding: 0; }
        &::-webkit-color-swatch { border: 0; border-radius: 50%; }
        &::-moz-color-swatch { border: 0; border-radius: 50%; }
    }
    button { ${gemQuietButton} min-height: 44px; padding-inline: 9px; font-size: .78rem; }
    button[type="submit"] { ${gemButton} white-space: nowrap; }
    .gem-color-exact { margin-top: 9px; border-block-start: 1px solid var(--gem-line); }
    summary {
        align-content: center;
        min-height: 44px;
        cursor: pointer;
        color: var(--gem-tint-ink);
        font-size: .78rem;
        font-weight: 700;
    }
    .gem-color-forms {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
        gap: 10px;
        margin-block: 0 8px;
    }
    .gem-color-forms form { min-width: 0; margin: 0; }
    .gem-color-entry { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 5px; align-items: center; }
    .gem-color-entry-rgb { grid-template-columns: repeat(3, minmax(0, 1fr)) auto; align-items: end; }
    .gem-color-entry-rgb label { display: grid; gap: 2px; text-align: center; min-width: 0; }
    p { margin: 0; color: var(--gem-muted); font-size: .76rem; line-height: 1.45; }
    p[role="alert"] { margin-block: 5px; color: ${({ theme }) => theme.colors.error}; font-weight: 650; }
    @media (max-width: 620px) {
        .gem-color-sample { max-width: none; }
        input[type="text"] { font-size: max(16px, .84rem); }
    }
`;
