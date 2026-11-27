import styled from 'styled-components';

export const Home = styled.div`
    max-inline-size: 32rem;
    margin-inline: auto;
    padding-bottom: 16px;
    color: ${p => p.theme.colors.text};
    font-family: ${p => p.theme.fonts.body};
    button { font-family: inherit; }
`;

export const Masthead = styled.header`
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    padding: 0 0 1px;
    margin-bottom:9px;
    border-bottom:1px solid ${p=>p.theme.colors.border};
    h1 { display:flex; align-items:center; gap:9px; margin:0; font-size:1.15rem; font-weight:700; line-height:1.4; }
    i, >div { color:var(--control-ink); font-size:.82rem; font-style:normal; }
    >div { display:flex; align-items:center; }
    button { display:grid; place-items:center; width:44px; min-height:44px; padding:0; background:none; border:0; color:inherit; cursor:pointer; }
`;

export const Summary = styled.section`
    position:relative;
    isolation:isolate;
    padding:8px 11px 14px;
    border:1px solid ${p=>p.theme.colors.border};
    border-radius:6px;
    background:${p=>p.theme.colors.surface};
    text-align:center;
    &::before, &::after {
        content:"";
        position:absolute;
        inset:4px;
        pointer-events:none;
        background:
            linear-gradient(var(--control-ink) 0 0) left top/18px 1px no-repeat,
            linear-gradient(var(--control-ink) 0 0) left top/1px 16px no-repeat,
            linear-gradient(var(--control-ink) 0 0) right top/18px 1px no-repeat,
            linear-gradient(var(--control-ink) 0 0) right top/1px 16px no-repeat;
        border-radius:4px;
        opacity:.66;
    }
    &::after { transform:rotate(180deg); }
    h2 { margin:1px 0 0; font-size:1.05rem; font-weight:700; line-height:1.45; }
    p { margin:2px auto 0; max-width:100%; color:${p=>p.theme.colors.textSecondary}; font-size:.82rem; line-height:1.45; overflow-wrap:anywhere; }
`;

export const Seal = styled.div`
    display:grid;
    place-items:center;
    width:104px;
    height:104px;
    margin:auto;
    svg, b { grid-area:1 / 1; }
    svg { width:100%; color:var(--control-ink); }
    b { z-index:1; background:${p=>p.theme.colors.surface}; padding:2px 4px; font:700 1.52rem/1 Georgia,serif; }
`;

export const Stats = styled.div`
    display:flex; justify-content:center; flex-wrap:wrap; gap:3px 9px;
    margin-top:12px;
    color:${p=>p.theme.colors.textSecondary};
    font-size:.75rem;
    > span { white-space:nowrap; }
    > span + span::before { content:"·"; margin-right:9px; color:var(--control-ink); }
    b { color:${p=>p.theme.colors.text}; }
`;

export const List = styled.section<{ $paper?: boolean }>`
    min-width:0;
    margin-top:12px;
    padding:${p=>p.$paper?'8px 10px 5px':'0'};
    background:${p=>p.$paper?p.theme.colors.surface:'transparent'};
    border:${p=>p.$paper?'1px solid '+p.theme.colors.border:'0'};
    border-radius:6px;
    [data-home-row] {
        border:0;
        border-bottom:1px solid ${p=>p.theme.colors.border}78;
        background:transparent;
        font-family:inherit;
        gap:0;
    }
    [data-home-row]:last-child { border-bottom:0; }
    [data-home-row] button { min-height:44px; }
    [data-home-row] .name { white-space:normal; overflow-wrap:anywhere; line-height:1.45; }
    [data-home-row] button svg { display:none; }
`;
export const Heading = styled.div`
    display:flex; align-items:center; gap:8px; min-height:26px;
    h2 { margin:0; font-size:.9rem; font-weight:700; }
    span { color:var(--control-ink); font-size:.8rem; }
    i { flex:1; border-top:1px dotted ${p=>p.theme.colors.border}; }
    small { font-size:.75rem; color:${p=>p.theme.colors.textSecondary}; }
`;
export const Empty = styled.p`margin:0; padding:10px 5px; color:${p=>p.theme.colors.textSecondary}; font-size:.8rem;`;

export const Secondary = styled.div`
    display:grid;
    grid-template-columns:minmax(0,1fr);
    gap:12px;
    margin-top:16px;
    min-width:0;
    > section { min-width:0; border-top:1px solid ${p=>p.theme.colors.border}88; padding-top:10px; }
    [data-home-quick] { border-radius:6px; }
`;
