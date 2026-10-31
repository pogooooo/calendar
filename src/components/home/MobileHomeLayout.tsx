"use client";
import styled from 'styled-components';
import type { HomeLayoutProps } from './HomeLayout.types';

/** App reading order is stable across themes. No extra steps for adding or finishing a task. */
export default function MobileHomeLayout(p: HomeLayoutProps) {
    return <ReadingList data-theme-layout="mobile-home">
        <header>{p.navigation}</header>
        <div className="primary" {...p.listProps}>{p.today}</div>
        <section className="upcoming">{p.upcoming}</section>
        <aside><section>{p.projects}</section><section>{p.challenges}</section><section>{p.anniversaries}</section></aside>
        {p.dialogs}
    </ReadingList>;
}
const ReadingList = styled.div`
    min-width:0; max-width:820px; margin:auto; padding-bottom:16px;
    header { padding-bottom:12px; border-bottom:1px solid ${({theme})=>theme.colors.border}66; margin-bottom:18px; }
    .primary { min-width:0; padding:0 0 16px; }
    .upcoming, aside > section { min-width:0; padding:18px 0; border-top:1px solid ${({theme})=>theme.colors.border}66; }
    aside { display:grid; grid-template-columns:1fr; }
    .mt { margin-top:0; }
    [data-home-empty] { min-height:76px; }
    [data-home-section-head] { color:${({theme})=>theme.colors.text}; }
    [data-home-quick] { background:${({theme})=>theme.colors.surface}; border-radius:10px; padding-inline:8px; }
`;
