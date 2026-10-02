import styled, { keyframes } from 'styled-components';

const unfold = keyframes`from { opacity:0; transform:translateY(7px) rotate(.35deg); } to { opacity:1; transform:none; }`;

export const Journal = styled.div`
    width:min(1180px,100%); margin:0 auto; min-height:100%; display:flex; flex-direction:column; gap:32px;
    color:${p=>p.theme.colors.text};
`;
export const JournalHeader = styled.header`
    display:grid; grid-template-columns:minmax(0,1fr) minmax(230px,.7fr); align-items:center; gap:24px;
    @media(max-width:900px) { grid-template-columns:1fr; gap:12px; }
`;
export const MonthPlate = styled.div`
    min-width:0; & > * { padding:0; max-width:none; }
`;
export const DateBookmark = styled.div`
    min-width:0; & > * { padding:0; flex-wrap:wrap; }
`;
export const OpenPages = styled.div`
    display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:52px; min-height:240px;
    & > * { min-width:0; animation:${unfold} .65s ease-out both; }
    & > :nth-child(2) { animation-delay:.13s; }
    @media(max-width:768px) { grid-template-columns:1fr; gap:24px; }
`;
export const FieldNotes = styled.aside`
    display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:32px; padding-bottom:24px;
    section { min-width:0; animation:${unfold} .65s ease-out both; }
    section:nth-child(2) { animation-delay:.13s; } section:nth-child(3) { animation-delay:.26s; } .mt { margin-top:0; }
    @media(max-width:900px) { grid-template-columns:1fr; gap:24px; }
`;
