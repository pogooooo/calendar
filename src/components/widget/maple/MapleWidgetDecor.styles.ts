import styled from "styled-components";

export const Decor = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;

    &::before {
        content: "";
        position: absolute;
        inset: 1px auto 1px 1px;
        width: 6px;
        border-inline-end: 1px solid var(--folio-edge);
        background: repeating-linear-gradient(132deg, #e7bf9026 0 1px, transparent 1px 3px), var(--folio-cloth);
    }

    [data-widget="memo"] &::after {
        content: "";
        position: absolute;
        top: 35px;
        right: 17px;
        width: 12px;
        height: 27px;
        background: repeating-linear-gradient(84deg, #edc38e3a 0 1px, transparent 1px 3px), var(--folio-cloth);
        clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
    }
`;
