import styled from 'styled-components';

/** Keep the theme's row surface while separating completion from opening an editor. */
export const Check = styled.button`
    display:flex; align-items:center; justify-content:center; flex:none;
    width:44px; min-height:48px; padding:0; border:0; background:none; color:inherit; cursor:pointer;
    &:focus-visible {outline:2px solid ${({theme})=>theme.colors.primary};outline-offset:-2px;}
`;

export const Open = styled.button`
    display:flex; align-items:center; gap:10px; flex:1; min-width:0; min-height:48px;
    padding:8px 4px; border:0; background:none; color:inherit; font:inherit; text-align:left; cursor:pointer;
    .name {flex:1; white-space:normal; overflow-wrap:anywhere; line-height:1.5;
        display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden;}
    > svg {flex:none; opacity:.65;}
    &:focus-visible {outline:2px solid ${({theme})=>theme.colors.primary};outline-offset:-2px;}
`;
