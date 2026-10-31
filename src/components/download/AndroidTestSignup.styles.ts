import styled from 'styled-components';

export const Panel = styled.section`
    width:min(100%,760px); margin:24px auto 48px; padding:clamp(20px,4vw,36px);
    scroll-margin-top:88px; color:${p=>p.theme.colors.text}; box-sizing:border-box;
    background:${p=>p.theme.colors.background}; border:1px solid ${p=>p.theme.colors.primary}55; border-radius:16px;
    h1,h2 { font-size:clamp(1.35rem,4vw,1.8rem); line-height:1.4; margin:8px 0 14px; }
    p { font-size:.95rem; line-height:1.75; margin:10px 0; overflow-wrap:anywhere; }
    a { color:${p=>p.theme.colors.text}; text-underline-offset:4px; }
    form { display:flex; flex-direction:column; gap:12px; margin-top:22px; }
    input[type=email] { width:100%; min-width:0; box-sizing:border-box; min-height:48px; padding:12px;
        background:${p=>p.theme.colors.background}; border:1px solid ${p=>p.theme.colors.textSecondary}; border-radius:8px;
        color:inherit; font:inherit; font-size:16px; }
    input:focus-visible,button:focus-visible,a:focus-visible { outline:2px solid ${p=>p.theme.colors.primary}; outline-offset:4px; }
    label { line-height:1.65; font-size:.92rem; }
    label:has(input[type=checkbox]) { display:flex; gap:10px; align-items:flex-start; padding:12px 0; min-height:44px; box-sizing:border-box; }
    input[type=checkbox] { flex:none; width:20px; height:20px; margin-top:3px; accent-color:${p=>p.theme.colors.primary}; }
    ol { padding-left:22px; line-height:1.8; font-size:.94rem; }
    li { margin:5px 0; }
`;
export const Badge = styled.span`color:${p=>p.theme.colors.textSecondary}; font-size:.8rem; font-weight:650; letter-spacing:.08em;`;
export const Actions = styled.div`display:flex; flex-wrap:wrap; gap:12px; margin-top:20px; align-items:center; >a {min-height:48px;display:inline-flex;align-items:center;} `;
export const Button = styled.button`
    min-height:48px; padding:12px 20px; border:1px solid ${p=>p.theme.colors.primary}; border-radius:8px;
    background:${p=>p.theme.colors.text}; color:${p=>p.theme.colors.background}; font:inherit; font-weight:600;
    cursor:pointer; text-align:center; text-decoration:none !important;
    &:disabled { opacity:.6; cursor:not-allowed; }
    &[href] { color:${p=>p.theme.colors.background}; display:inline-flex; align-items:center; justify-content:center; }
`;
export const Notice = styled.div`margin:18px 0 0; padding:14px 16px; border-left:3px solid ${p=>p.theme.colors.primary}; background:${p=>p.theme.colors.primary}0D; line-height:1.75; overflow-wrap:anywhere;`;
export const Small = styled.p`&& { font-size:.82rem; color:${p=>p.theme.colors.textSecondary}; line-height:1.7; }`;
export const Page = styled.main`width:100%; min-height:100dvh; box-sizing:border-box; padding:24px max(16px,env(safe-area-inset-left)); background:${p=>p.theme.colors.background}; color:${p=>p.theme.colors.text}; & > a { color:inherit; display:inline-flex; align-items:center; min-height:44px; }`;
export const Step = styled.div`padding:22px 0; border-top:1px solid ${p=>p.theme.colors.primary}33; margin-top:20px; h3 { font-size:1.05rem; margin:0 0 12px; line-height:1.5; } p { margin:8px 0; }`;
export const FormFrame = styled.div`
    margin-top:20px; border:1px solid ${p=>p.theme.colors.border}; border-radius:12px; overflow:hidden;
    background:#fff; width:100%;
    iframe {display:block;width:100%;height:1200px;border:0;}
    @media(max-width:480px){iframe{height:1480px;}}
`;
