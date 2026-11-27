import styled, { css } from 'styled-components';
import MaplePaperTurn from '@/components/transition/maple/MaplePaperTurn';
import { MOBILE } from '@/styles/breakpoints';
import { withAlpha } from '@/styles/color';

export const Journal = styled.div<{ $compact:boolean }>`
    width:min(1280px,100%);
    min-height:100%;
    margin-inline:auto;
    display:grid;
    grid-template-columns:minmax(238px,.76fr) minmax(0,1.24fr);
    grid-template-areas:"cover reading" "notes reading";
    align-content:start;
    align-items:start;
    gap:24px clamp(24px,4.1vw,60px);
    color:${p=>p.theme.colors.text};

    ${MOBILE} {
        grid-template-columns:minmax(0,1fr);
        grid-template-areas:"cover" "reading" "notes";
        gap:${p=>p.$compact?'12px':'18px'};
        ${p=>p.$compact&&css`[data-maple-ribbon] { display:none; }`}
    }
`;

export const JournalHeader = styled.header`
    grid-area:cover;
    display:grid;
    grid-template-columns:minmax(0,1fr);
    grid-template-areas:"title" "nav" "ribbon" "foot";
    gap:8px;
    align-items:center;
    min-width:0;
    touch-action:pan-y;

    ${MOBILE} {
        &[data-compact] { grid-template-areas:"title" "nav" "foot"; }
    }
`;

export const DateBookmark = styled.div`
    grid-area:nav;
    min-width:0;
    & > * { justify-content:center; flex-wrap:wrap; }
`;

export const Reading = styled(MaplePaperTurn)`
    grid-area:reading;
    height:auto;
    min-width:0;
`;

export const OpenPages = styled.div`
    display:grid;
    gap:22px;
    min-width:0;
    background-color:${p=>withAlpha(p.theme.colors.background,.72)};
    > * {
        min-width:0;
        padding:14px 0 18px;
        background:transparent;
        border:0;
        border-block-start:1px solid ${p=>withAlpha(p.theme.colors.primary,.44)};
        box-shadow:none;
        border-radius:0;
    }

    ${MOBILE} { gap:13px; > * { padding:10px 0 12px; } }
`;

export const FieldNotes = styled.aside`
    grid-area:notes;
    display:grid;
    gap:13px;
    min-width:0;
    padding-bottom:14px;

    section {
        min-width:0;
        padding-block:10px;
        border-block-start:1px solid ${p=>withAlpha(p.theme.colors.primary,.30)};
    }
    .mt { margin-top:0; }

    ${MOBILE} { gap:8px; }
`;

export const coverMaterial = css`
    position:relative;
    isolation:isolate;
    overflow:hidden;
    background:
        repeating-linear-gradient(45deg,transparent 0 3px,${p=>withAlpha(p.theme.colors.accent,.055)} 3px 4px),
        linear-gradient(156deg,${p=>p.theme.mode==='dark'?'#512925':'#faedda'},${p=>p.theme.mode==='dark'?'#261715':p.theme.colors.surface});
    border:1px solid ${p=>withAlpha(p.theme.colors.primary,.58)};
    border-radius:3px 5px 5px 3px;
    box-shadow:inset 0 0 0 4px ${p=>withAlpha(p.theme.colors.background,.54)},inset 0 0 0 5px ${p=>withAlpha(p.theme.colors.accent,.33)};

    &::before {
        content:"";
        position:absolute;
        inset:8px 8px auto auto;
        width:12px;
        height:30px;
        background:${p=>p.theme.mode==='dark'?'#925347':withAlpha(p.theme.colors.primary,.72)};
        clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%);
        pointer-events:none;
    }
    &::after {
        content:"";
        position:absolute;
        inset:0;
        background:radial-gradient(155px circle at var(--paper-x,50%) var(--paper-y,50%),#f8c99129,transparent);
        opacity:0;
        pointer-events:none;
        transition:opacity .19s ease;
    }
    @media (hover:hover) and (pointer:fine) {
        html[data-theme-motion="full"] &:hover::after { opacity:1; }
    }
`;
