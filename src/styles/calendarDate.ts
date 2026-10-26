import { css } from 'styled-components';

/** Clear date typography; transient effects supply the decoration. */
export const dateNumber = css`
    position:relative; display:inline-flex; align-items:center; justify-content:center;
    box-sizing:border-box; width:auto; min-width:0; height:24px; margin:0; padding:0 2px;
    background:none; background-image:none; border:0; border-radius:0; box-shadow:none; text-shadow:none;
    color:${p => p.theme.colors.text}; font-weight:750;
    &::before, &::after { display:none; }
`;
