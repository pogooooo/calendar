"use client";
import styled from 'styled-components';
import { Plus } from 'lucide-react';
import { useT } from '@/i18n/useT';
import useSettingStore from '@/store/useSettingStore';
import type { ReactNode } from 'react';

export default function CalendarWorkspace({children,onAdd}:{children:ReactNode;onAdd:()=>void}) {
    const t=useT();
    const locale=useSettingStore(s=>s.locale);
    return <Workspace>
        <header data-workspace-heading>
            <div><span className="eyebrow">CRONOS / {locale==='ko'?'일정과 기록':'PLANNING & JOURNAL'}</span><h1>{locale==='ko'?'캘린더':'Calendar'}</h1></div>
            <div className="key"><span><i className="today"/>{t.home.today}</span><span><i className="selected"/>{locale==='ko'?'선택한 날짜':'Selected date'}</span></div>
            <button type="button" onClick={onAdd}><Plus size={17}/>{t.calendar.addTask}</button>
        </header>
        {children}
    </Workspace>;
}
const Workspace=styled.div`
    height:100%;min-height:0;display:flex;flex-direction:column;
    &>[data-theme-layout] {flex:1;height:auto;min-height:0;}
    &>header {display:flex;align-items:center;gap:20px;padding:0 20px 18px;flex:none;}
    .eyebrow {font:500 .6rem/1.5 ${({theme})=>theme.fonts.body};letter-spacing:.2em;color:${({theme})=>theme.colors.textSecondary};}
    h1 {font:500 1.7rem/1.25 ${({theme})=>theme.fonts.display};margin:3px 0 0;letter-spacing:.025em;}
    .key {display:flex;gap:16px;margin-left:auto;color:${({theme})=>theme.colors.textSecondary};font-size:.7rem;}
    .key span {display:flex;align-items:center;gap:6px;white-space:nowrap;}
    .key i {display:block;width:14px;height:14px;}
    .today {border-bottom:2px solid var(--control-ink);}
    .selected {border:1px solid var(--control-ink);background:${({theme})=>theme.colors.primary}18;}
    header>button {display:flex;align-items:center;gap:7px;min-height:42px;padding:8px 14px;border:1px solid var(--control-ink);color:var(--control-ink);background:${({theme})=>theme.colors.surface}aa;border-radius:6px;font:600 .8rem ${({theme})=>theme.fonts.body};cursor:pointer;}
    @media(max-height:720px){header{padding-bottom:8px;}h1{font-size:1.4rem;}}
`;
