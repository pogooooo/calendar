import styled from "styled-components";
import * as O from "../ocean/OceanTodoModal.styles";
import { gemField } from "@/features/gem/GemLive.styles";

export * from "../ocean/OceanTodoModal.styles";

export const Header = styled(O.Header)`
    background: var(--gem-heading);
    border-block-end: 1px solid var(--gem-line);
`;

export const RepeatConditionBox = styled(O.RepeatConditionBox)`
    border: 1px solid var(--gem-line);
    border-radius: 10px;
    background: var(--gem-record);
    .condition-title { color: var(--gem-muted); }
`;

export const FormWrapper = styled(O.FormWrapper)`
    && input:is(.title-input, [type="text"], [type="number"], [type="search"]) { ${gemField} }
    && input.title-input { padding-inline: 14px; min-height: 44px; }
    && textarea {
        ${gemField}
        border-radius: 12px;
        padding: 9px 12px;
    }
`;

export const ToggleSwitch = styled(O.ToggleSwitch)`
    min-width: 56px !important;
    height: 44px;
    .slider {
        inset-block: 8px;
        border: 1px solid var(--gem-line);
        border-radius: var(--gem-radius);
        background: var(--gem-panel);
    }
    .slider::before {
        width: 20px;
        height: 20px;
        left: 3px;
        bottom: 3px;
        border-radius: 50%;
        border: 1px solid var(--gem-gold);
        background: var(--gem-action-map) 58% center / 72px auto no-repeat, #d2b1d4;
    }
    input:checked + .slider { background: var(--gem-rail); }
    input:checked + .slider::before { transform: translateX(27px); }
`;
