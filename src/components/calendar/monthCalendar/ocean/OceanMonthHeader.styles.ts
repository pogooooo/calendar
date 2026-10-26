import styled, { keyframes } from 'styled-components';
import { EASE, SERIF, calm, rise } from '@/styles/ocean/water';

const drift = keyframes`from { translate:-8% 0; opacity:.45; } to { translate:8% -4%; opacity:.8; }`;
export const Header = styled.header`
    position:relative; isolation:isolate; overflow:hidden; align-self:stretch;
    display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:end; gap:12px 18px;
    width:100%; box-sizing:border-box; padding:8px 6px 18px; margin-bottom:8px; min-height:88px;
    border-bottom:1px solid ${p => p.theme.colors.primary}30;
    &::before {
        content:""; position:absolute; inset:-60% -10% -50% 30%; z-index:-1; pointer-events:none;
        background:linear-gradient(118deg,transparent 22%,${p => p.theme.colors.primary}0B 32%,transparent 43%,${p => p.theme.mode==='dark' ? '#99E1D719' : '#F4FCF54A'} 56%,transparent 70%);
        filter:blur(12px); transform:rotate(-8deg);
        :where(html[data-theme-motion="full"]) & { animation:${drift} 8s ease-in-out infinite alternate; }
        :where(html[data-theme-motion="gentle"]) & { animation:${drift} 16s ease-in-out infinite alternate; }
    }
    @media(max-width:1000px) { grid-template-columns:minmax(0,1fr) auto; gap:10px 8px; }
    @media(max-width:768px) { padding:3px 4px 12px; min-height:0; }
    [data-widget] & { display:flex; align-items:center; min-height:0; gap:8px; padding:0 4px 4px; &::before { display:none; } }
`;
export const Title = styled.div`
    display:flex; flex-direction:column; gap:9px; grid-column:1; min-width:0;
    font-family:${SERIF}; font-style:italic; font-size:2.6rem; line-height:1.1; letter-spacing:-.02em;
    color:${p => p.theme.colors.text};
    .eyebrow { font-family:${p => p.theme.fonts.body}; font-style:normal; font-size:.57rem; line-height:1.5; letter-spacing:.19em; font-weight:600; color:${p => p.theme.colors.textSecondary}; }
    .month i { font-style:normal; font-size:.8rem; font-family:${p => p.theme.fonts.body}; color:${p => p.theme.colors.textSecondary}; letter-spacing:0; }
    :where(html:not([data-theme-motion="off"])) & .month { animation:${rise} .5s ${EASE} backwards; }
    ${calm}
    @media(max-width:768px) { font-size:2rem; gap:5px; .eyebrow { font-size:.53rem; } }
    [data-widget] & { display:none; }
`;
export const Nav = styled.div`
    grid-column:2; grid-row:1; display:flex; align-items:center; gap:4px; min-width:0; font-size:.95rem;
    & > * { flex:none; }
    @media(max-width:1000px) { grid-column:1; grid-row:2; }
    [data-widget] & { flex:1; }
`;
export const Filters = styled.div`
    grid-column:3; grid-row:1; display:flex; align-items:center; justify-content:flex-end; align-self:center;
    @media(max-width:1000px) { grid-column:2; grid-row:1 / 3; }
`;
