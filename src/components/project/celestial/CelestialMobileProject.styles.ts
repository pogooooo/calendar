import styled from "styled-components";

export const Shell = styled.div`
    position:relative;
    width:100%;
    max-width:36rem;
    margin-inline:auto;
    padding-bottom:16px;
    min-width:0;
    font-family:${p=>p.theme.fonts.body};
    color:${p=>p.theme.colors.text};
    --paper:${p=>p.theme.colors.surface};
    --page:${p=>p.theme.colors.background};
    --line:${p=>p.theme.colors.border};
    --fine:color-mix(in srgb,var(--line) 60%,transparent);
    --gold:${p=>p.theme.colors.primary};
    --sand:color-mix(in srgb,var(--gold) 24%,var(--paper));
    --muted:${p=>p.theme.colors.textSecondary};
    button, select { color:inherit;font-family:inherit; }
    button { cursor:pointer; }
`;
export const Masthead = styled.header`
    display:flex;align-items:center;justify-content:space-between;gap:8px;
    border-bottom:1px solid var(--line);
    h1 { display:flex;align-items:center;gap:9px;margin:0;font-size:1.15rem; }
    i {font-style:normal;font-size:.8rem;color:var(--control-ink);}
`;
export const Menu = styled.details`
    position:relative;z-index:3;
    summary {min-height:44px;display:flex;align-items:center;gap:5px;cursor:pointer;font-size:.77rem;color:var(--muted);}
    summary::after {content:"⌄";}
    > div {position:absolute;right:0;top:100%;width:max-content;max-width:75vw;display:grid;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:4px;}
    button {min-height:44px;background:none;border:0;text-align:left;padding:0 10px;}
`;
export const Project = styled.div`
    display:flex;align-items:center;gap:8px;min-width:0;
    padding-inline:4px;border-bottom:1px solid var(--line);margin-bottom:10px;
    small {flex:none;max-width:25%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:.72rem;}
    select {min-height:44px;flex:1;min-width:0;width:100%;text-overflow:ellipsis;border:0;background:var(--page);font-weight:650;font-size:.86rem;}
`;
export const Summary = styled.section`
    position:relative;isolation:isolate;min-height:88px;padding:11px 14px;
    border:1px solid var(--line);border-radius:6px;background:var(--paper);
    box-shadow:inset 0 0 0 4px var(--paper),inset 0 0 0 5px var(--fine);
    div {display:flex;align-items:baseline;gap:9px;max-width:75%;}
    b {font-size:.8rem;}
    strong {font:700 1.7rem Georgia,serif;}
    small {margin-inline-end:7px;font-size:.73rem;color:var(--muted);}
    meter {width:52px;height:8px;accent-color:var(--gold);}
    meter::-webkit-meter-optimum-value {background:var(--gold);}
    svg {position:absolute;z-index:-1;right:10px;top:7px;width:72px;height:72px;color:var(--control-ink);opacity:.74;}
`;
export const Toolbar = styled.div`
    display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px;margin-block:10px;
    nav {display:flex; align-items:stretch;}
    button {min-height:44px;font-size:.78rem;padding:0 8px;}
    nav button {border:0;border-bottom:2px solid var(--fine);background:none;color:var(--muted);}
    nav button[aria-pressed="true"] {border-color:var(--gold);color:inherit;font-weight:700;}
    >button {display:flex;align-items:center;gap:4px;background:var(--paper);border:1px solid var(--line);border-radius:6px;font-weight:650;}
`;
export const Week = styled.section`
    border:1px solid var(--line);border-radius:6px;background:var(--paper);min-width:0;
    >header {display:flex;align-items:center;justify-content:space-between;gap:4px;padding-inline:10px 3px;border-bottom:1px solid var(--line);}
    h2 {font-size:.9rem;line-height:1.3;margin:0;}
    header > div {display:flex;}
    header button {display:grid;place-items:center;min-width:44px;min-height:44px;padding:0;border:0;background:none;color:var(--control-ink);}
`;
export const Dates = styled.div`
    display:grid;grid-template-columns:repeat(7,minmax(0,1fr));margin-inline:7px;border-bottom:1px solid var(--line);
    >div {text-align:center;display:grid;gap:2px;padding:5px 0;border-inline-start:1px solid var(--fine);}
    >div:last-child {border-inline-end:1px solid var(--fine);}
    small {color:var(--muted);font-size:.65rem;}
    b {font:700 1rem Georgia,serif;}
    [aria-current="date"] {background:var(--sand);}
    [aria-current="date"] b {text-decoration:underline;text-underline-offset:2px;}
`;
export const Tracks = styled.div<{ $today:number }>`
    margin-inline:7px;
    padding-block:3px;
    max-height:19rem;
    overflow:auto;
    border-inline-end:1px solid var(--fine);
    background:repeating-linear-gradient(90deg,var(--fine) 0 1px,transparent 1px calc(100% / 7));
    position:relative;isolation:isolate;
    &::before {
        content:"";display:${p=>p.$today<0?"none":"block"};position:absolute;z-index:-1;inset-block:0;
        inset-inline-start:${p=>p.$today*100/7}%;width:calc(100% / 7);background:var(--sand);opacity:.7;
        pointer-events:none;
    }
`;
export const Lane = styled.div`
    display:grid;grid-template-columns:repeat(7,minmax(0,1fr));min-height:32px;align-items:center;
`;
export const Moon = styled.i<{ $state:string }>`
    display:inline-block; flex:none; width:9px;height:9px;border-radius:50%;border:1px solid var(--muted);
    background:${p=>p.$state==="done"?"var(--muted)":p.$state==="in_progress"?"linear-gradient(90deg,var(--muted) 50%,transparent 50%)":"transparent"};
`;
export const Bar = styled.button`
    display:flex;align-items:center;gap:4px;
    padding:3px 4px;margin:1px 2px;text-align:left;min-width:0;min-height:28px;
    font-size:.72rem;font-weight:650;line-height:1.3;border-radius:4px;border:1px solid var(--line);background:var(--paper);
    &[aria-pressed="true"] {background:var(--sand);outline:1px solid var(--control-ink);outline-offset:0;}
    >span {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
    &:focus-visible {outline-offset:-2px;}
`;
export const Legend = styled.div`
    display:flex;flex-wrap:wrap;justify-content:center;gap:6px 12px;padding:7px;border-top:1px solid var(--fine);
    span {display:flex;align-items:center;gap:5px;font-size:.7rem;color:var(--muted);}
`;
export const Detail = styled.section`
    border:1px solid var(--line);border-radius:6px;background:var(--paper);
    margin-top:10px;padding:8px 9px;
    header {display:flex;justify-content:space-between;gap:8px;font-size:.74rem;color:var(--muted);}
    header >span:first-child {display:flex;align-items:center;gap:5px;white-space:nowrap;}
    header >span:last-child {min-width:0;overflow-wrap:anywhere;}
    h2 {font-size:.9rem;margin:5px 0;line-height:1.4;overflow-wrap:anywhere;}
    >div {display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;border-top:1px solid var(--fine);padding-top:4px;}
    small,b {display:block;font-size:.74rem;}
    small {color:var(--muted);}
    button {min-height:44px;margin-left:auto;border:1px solid var(--line);border-radius:6px;background:var(--sand);font-size:.77rem;font-weight:650;}
`;
export const LedgerHeading = styled.h2`font-size:.92rem;margin:9px 0 0;padding-bottom:7px;border-bottom:1px solid var(--line);`;
export const Record = styled.button`
    width:100%;display:grid;grid-template-columns:minmax(48px,20%) minmax(0,1fr);text-align:left;align-items:center;gap:10px;
    min-height:48px;padding:5px 2px;background:none;border:0;border-bottom:1px solid var(--fine);
    b {color:var(--muted);font-size:.73rem;}
    strong {font-size:.84rem;overflow-wrap:anywhere;}
    small {display:flex;align-items:center;gap:5px;color:var(--muted);font-size:.72rem;}
`;
export const Empty = styled.p`font-size:.8rem;color:var(--muted);padding:10px;margin:0;`;
export const Unscheduled = styled.details`
    margin-top:9px;border-bottom:1px solid var(--line);
    summary {line-height:44px;cursor:pointer;font-size:.83rem;}
    summary span {color:var(--muted);margin-inline-start:6px;}
`;
