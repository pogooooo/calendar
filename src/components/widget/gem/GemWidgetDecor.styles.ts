import styled from "styled-components";

export const Setting = styled.div`
    position: absolute;
    inset: 1px;
    border-radius: 14px;
    pointer-events: none;

    &::before {
        position: absolute;
        inset: 0;
        border: 1px solid transparent;
        border-radius: inherit;
        background: var(--gem-gold-edge) border-box;
        mask: linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0);
        content: "";
    }

    & > i {
        position: absolute;
        inset: 1px 8px auto auto;
        width: min(44%, 168px);
        height: 22px;
        border-radius: inherit;
        background: var(--gem-action-map) 64% 57% / cover no-repeat;
        mask-image: radial-gradient(ellipse at 70% 0%, #000 7%, transparent 71%);
        transform-origin: top right;
        transition: transform 230ms ease-out;
    }

    &[data-busy="true"] > i { height: 13px; width: 36%; }
    [data-widget-motion="full"]:hover &:not([data-locked="true"]) > i { transform: scale(1.08, 1.04); }
    [data-widget-motion="gentle"]:hover &:not([data-locked="true"]) > i { transform: scale(1.035, 1.02); }
`;
