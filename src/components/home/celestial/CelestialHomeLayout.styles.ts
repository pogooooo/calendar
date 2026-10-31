import styled, { keyframes } from 'styled-components';

const reading = keyframes`from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; }`;

export const Observatory = styled.div`
    width: min(1180px, 100%); margin: 0 auto; min-height: 100%;
    display: flex; flex-direction: column; gap: 14px; color: ${p=>p.theme.colors.text};
`;
export const SkyAlmanac = styled.div`
    position: relative; flex: none; padding: 0 7%;
    & > :first-child { padding: 0; }
    & > :last-child { position: absolute; width: 146px; right: 0; top: 8px; }
    @media(max-width:768px) { padding:0; & > :last-child { width:82px; right:-10px; top:0; opacity:.5; } }
`;
export const Navigation = styled.div`
    position:relative; z-index:1; & > * { padding:0; }
`;
export const OrbitGrid = styled.div`
    display:grid; grid-template-columns:minmax(0,1fr) 260px; gap:36px; min-height:300px;
    @media(max-width:1050px) { grid-template-columns:1fr; gap:28px; }
`;
export const DailyReading = styled.div`
    display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:28px; min-width:0;
    & > * { min-width:0; padding:24px 22px; position:relative; border:1px solid ${p=>p.theme.colors.primary}66; background:${p=>p.theme.colors.surface}88; animation:${reading} .55s ease-out both; }
    & > *::before {content:'';position:absolute;inset:5px;border:1px solid ${p=>p.theme.colors.primary}33;pointer-events:none;}
    & > *::after {content:'✦';position:absolute;top:-10px;left:50%;padding:0 8px;background:${p=>p.theme.colors.background};color:${p=>p.theme.colors.primary};font-size:14px;line-height:18px;}
    & > :nth-child(2) { animation-delay:.1s; }
    @media(max-width:768px) { grid-template-columns:1fr; gap:24px; }
`;
export const Constellations = styled.aside`
    display:flex; flex-direction:column; gap:26px; min-width:0;
    section { min-width:0; padding:16px 0 4px; border-top:1px solid ${p=>p.theme.colors.primary}66; animation:${reading} .6s ease-out both; }
    section:nth-child(2) { animation-delay:.12s; } section:nth-child(3) { animation-delay:.24s; } .mt { margin-top:0; }
    @media(min-width:769px) and (max-width:1050px) { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; }
`;
