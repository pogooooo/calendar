import styled from 'styled-components';
export const Header = styled.header`
    display:flex; align-items:center; justify-content:space-between; gap:20px; padding:8px 0 18px;
    & > div { min-width:0; flex:1; display:flex; flex-direction:column; gap:14px; & > * { padding:0; } }
    & > svg { width:70px; flex:none; opacity:.6; }
    @media(max-width:768px) { gap:5px; & > svg { width:42px; } }
`;
