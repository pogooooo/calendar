import styled from "styled-components";

export const Art = styled.span`
    display: inline-flex; align-items: center; justify-content: center;
    width: 54px; height: 54px; margin: 0 auto 12px;
    border: 1px solid transparent; border-radius: 18px;
    background: var(--gem-control); color: var(--gem-tint-ink);
    html[data-presentation="mobile-app"] &[data-empty-art="todos"] { display: none; }
`;
