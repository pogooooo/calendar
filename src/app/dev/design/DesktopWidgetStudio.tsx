"use client";
import {useState} from 'react';
import styled from 'styled-components';
import WidgetShell from '@/components/widget/WidgetShell';
import {TodayPanel,NowNextPanel,DuePanel,AnniversaryPanel,ProjectsPanel,StatsPanel,ChallengePanel,MemoPanel,QuickTaskPanel} from '@/components/widget/WidgetPanels';
import MonthCalendar from '@/components/calendar/monthCalendar/MonthCalendar';
import WeekCalendar from '@/components/calendar/weekCalendar/WeekCalendar';
import useTodoStore from '@/store/useTodoStore';
import useCategoryStore from '@/store/useCategoryStore';
import {isWidgetKind} from '@/lib/widgetKinds';
import {useWidgetTitle} from '@/hooks/useWidgetMeta';

const PANELS={today:TodayPanel,nownext:NowNextPanel,due:DuePanel,anniversary:AnniversaryPanel,projects:ProjectsPanel,stats:StatsPanel,challenge:ChallengePanel,memo:MemoPanel,quicktask:QuickTaskPanel};
export default function DesktopWidgetStudio(){
    const [kind]=useState(()=>{const k=new URLSearchParams(location.search).get('kind');return isWidgetKind(k)?k:'monthly';});
    const title=useWidgetTitle(kind);
    const todos=useTodoStore(s=>s.todos),categories=useCategoryStore(s=>s.categories);
    const Panel=kind==='monthly'||kind==='weekly'?null:PANELS[kind];
    return <Backdrop data-widget-preview><WidgetShell kind={kind} title={title}><Content>{kind==='monthly'?<MonthCalendar todos={todos} categories={categories}/>:kind==='weekly'?<WeekCalendar todos={todos} categories={categories}/>:Panel?<Panel/>:null}</Content></WidgetShell></Backdrop>;
}
/** A checkerboard makes actual backdrop transparency visible without an OS wallpaper. */
const Backdrop=styled.div`position:fixed;inset:0;z-index:1;background:repeating-conic-gradient(#24303b 0% 25%,#303e4b 0% 50%) 0 0/24px 24px;`;
const Content=styled.div`height:100%;min-height:0;`;
