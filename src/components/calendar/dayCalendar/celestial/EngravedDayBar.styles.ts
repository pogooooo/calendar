import styled from "styled-components";

export const Frame = styled.span`
    --metal: ${p => p.theme.mode === "light" ? "#937633" : "#CBB581"};
    --edge: ${p => p.theme.mode === "light" ? "#A68C56" : "#A48E67"};
    --hair: color-mix(in srgb, var(--edge) 46%, transparent);
    --ribbon: var(--category, #586F87);
    --mark: #F1E1AE;
    --etch-size: 14px;
    display: block; container: day-engraving / inline-size; width: 100%; min-width: 0;
    background: transparent; color: ${p=>p.theme.colors.text}; pointer-events: none;
    &[data-done] { --ribbon: #7E897A; --edge: #899285; .word { text-decoration: line-through; } }
    &[data-selected] { --edge: var(--metal); --hair: var(--metal); --ribbon: #D4AF37; --mark: #352A10; }
    .face { position: relative; display: flex; align-items: center; gap: 9px; padding: 4px 12px;
        min-height: 45px; border: 1px solid var(--edge); background: transparent; }
    .face::before { content: ""; position: absolute; inset: 4px; border: 1px solid var(--hair); }
    .bookmark { flex: 0 0 12px; align-self: stretch; margin-block: -4px 0; position: relative; display: grid; place-items: center;
        color: var(--mark); background: var(--ribbon); clip-path: polygon(0 0,100% 0,100% 100%,50% 87%,0 100%); }
    .bookmark::before { content: ""; position: absolute; inset: 3px 2px 7px; border-inline: 1px solid currentColor; opacity: .38; }
    .bookmark svg { fill: none; stroke: currentColor; }
    .word { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: 550 .81rem/1.4 ${p=>p.theme.fonts.body}; }
    .clock { flex: none; border-left: 1px solid var(--hair); padding-left: 8px; font-size: .75rem; font-variant-numeric: tabular-nums; }
    .phase-line { flex: none; width: 112px; height: 24px; fill: currentColor; color: var(--metal); }
    .phase-line .line { fill: none; stroke: currentColor; }
    .end { flex: none; width: 4px; height: 4px; transform: rotate(45deg); background: var(--metal); }
    .carry { color: var(--metal); flex: none; }
    .etch { position: absolute; width: var(--etch-size); height: var(--etch-size); background: var(--metal);
        mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cg fill='none' stroke='black' stroke-width='1.1'%3E%3Cpath d='M2 20V8a6 6 0 0 1 6-6h12M6 18v-7a5 5 0 0 1 5-5h7m-7 0c-1-3 3-4 4-1s-2 5-5 5'/%3E%3C/g%3E%3C/svg%3E") center/contain no-repeat; }
    .tl { top:1px; left:1px; } .tr { top:1px; right:1px; rotate:90deg; }
    .bl { bottom:1px; left:1px; rotate:-90deg; } .br { bottom:1px; right:1px; rotate:180deg; }
    &[data-engraved-bar="timed"] { position: absolute; left: 1px; width: calc(var(--time-span) * 100% - 2px);
        --etch-size: 9px;
        .face { height: 27px; min-height: 0; padding: 2px 7px; gap: 5px; }
        .face::before { inset: 2px; }
        .bookmark { flex-basis: 9px; margin-block: -2px 0; }
        .phase-line { width: 82px; height: 18px; }
        .word { font-size: .72rem; }
        &[data-begins="false"] .face, &[data-begins="false"] .face::before { border-left: 0; }
        &[data-ends="false"] .face, &[data-ends="false"] .face::before { border-right: 0; }
        &[data-handle] .face { padding-left: var(--title-inset); }
    }
    @container day-engraving (max-width: 420px) {
        &[data-engraved-bar="agenda"] > .face .phase-line { display: none; }
        &[data-engraved-bar="agenda"] > .face .word {
            white-space: normal; overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
        }
    }
    [data-day-focus="todos"] &[data-engraved-bar="agenda"] .face .word { display: block; white-space: normal; overflow-wrap: anywhere; }
    @container day-engraving (max-width: 185px) { .face .phase-line { display: none; } }
    @container day-engraving (max-width: 110px) {
        .face .end, .face .etch, .face .bookmark > *, .face .bookmark::before { display: none; }
        & > .face .bookmark { flex-basis: 3px; clip-path: none; margin-block: 2px; }
    }
`;
