import styled, { keyframes } from 'styled-components';
const arrive = keyframes`from { opacity:0; transform:translateY(9px); } to { opacity:1; transform:none; }`;
export const Beach = styled.div`position:relative; width:min(1140px,100%); margin:0 auto; display:flex; flex-direction:column; gap:30px; color:${p=>p.theme.colors.text};`;
export const Horizon = styled.header`
    display:grid; grid-template-columns:minmax(0,1fr) 160px; gap:30px; align-items:center;
    & > div { min-width:0; & > * { padding:0; } } & > svg { width:150px; }
    @media(max-width:768px) { grid-template-columns:minmax(0,1fr) 60px; gap:4px; & > svg { width:70px; opacity:.6; } }
`;
export const DailyShore = styled.div`
    display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr); gap:48px;
    & > * { min-width:0; animation:${arrive} .6s ease-out both; } & > :nth-child(2) { animation-delay:.12s; }
    @media(max-width:768px) { grid-template-columns:1fr; gap:26px; }
`;
export const ShellCollection = styled.aside`
    display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:32px;
    section { min-width:0; animation:${arrive} .65s ease-out both; } .mt { margin-top:0; }
    section:nth-child(2) { animation-delay:.12s; } section:nth-child(3) { animation-delay:.24s; }
    @media(max-width:1000px) { grid-template-columns:1fr; gap:26px; }
`;
