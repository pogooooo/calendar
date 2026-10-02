import styled from 'styled-components';
export const Shop = styled.section`
    margin-top:24px; color:${p=>p.theme.colors.text};
    h2 { margin:0 0 6px; font-size:1rem; font-weight:500; }
    p { margin:0 0 14px; font-size:.8rem; line-height:1.6; color:${p=>p.theme.colors.textSecondary}; }
`;
export const Cards = styled.div`display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; @media(max-width:768px) { grid-template-columns:1fr; }`;
export const Card = styled.div`
    display:flex; flex-direction:column; gap:12px; min-width:0; padding:14px 0;
    strong { font-size:.9rem; font-weight:500; } span { font-size:.8rem; color:${p=>p.theme.colors.textSecondary}; }
    button { align-self:start; font:inherit; font-size:.8rem; border:1px solid ${p=>p.theme.colors.primary+'55'}; color:${p=>p.theme.colors.primary}; background:transparent; padding:8px 14px; border-radius:8px; cursor:pointer; }
    button:disabled { cursor:default; color:${p=>p.theme.colors.textSecondary}; opacity:.6; }
`;
export const Checkout = styled.div`
    width:min(640px,100%); margin:0 auto; padding:20px 0; position:relative;
    h1 { font-size:1.4rem; font-weight:500; } p { line-height:1.6; }
    a { color:${p=>p.theme.colors.primary}; } button { font:inherit; padding:10px 18px; background:${p=>p.theme.colors.primary}; color:${p=>p.theme.colors.background}; border:0; border-radius:8px; cursor:pointer; }
    button:disabled { opacity:.5; cursor:default; }
`;
