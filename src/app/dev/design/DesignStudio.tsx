"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import MainLayout from '@/components/layout/AppLayout';
import CalendarPage from '@/app/(main)/calendar/page';
import HomeView from '@/components/home/HomeView';
import ProjectPage from '@/app/(main)/project/page';
import ChallengePage from '@/components/challenge/ChallengePage';
import AnniversaryPage from '@/app/(main)/anniversary/page';
import SettingsPage from '@/components/settings/SettingsPage';
import { AuthFetchScope } from '@/hooks/useAuthFetch';
import useTodoStore from '@/store/useTodoStore';
import useCategoryStore from '@/store/useCategoryStore';
import useProjectStore from '@/store/useProjectStore';
import useChallengeStore from '@/store/useChallengeStore';
import useAnniversaryStore from '@/store/useAnniversaryStore';
import useSettingStore from '@/store/useSettingStore';
import useDailyStore from '@/store/useDailyStore';
import { labelKey, wallNow } from '@/lib/dateKey';
import { bustFetchCache } from '@/lib/fetchOnce';
import DesktopWidgetStudio from './DesktopWidgetStudio';
import { DialogProvider } from '@/components/dialog/DialogProvider';
import type { TodoType, CategoryType, AuthFetch } from '@/types';
import type {ProjectTaskType} from '@/store/useProjectStore';

/** Isolated data and network scope. No preview write can reach a user's API. */
export default function DesignStudio() {
    const [ready, setReady] = useState(false);
    const [screen, setScreen] = useState(()=>typeof window==='undefined'?'calendar':new URLSearchParams(location.search).get('screen')??'calendar');
    const [empty, setEmpty] = useState(()=>typeof window!=='undefined'&&new URLSearchParams(location.search).get('empty')==='1');
    const [failure, setFailure] = useState(false);
    const failureRef = useRef(false);
    const [saved, setSaved] = useState(false);
    const theme = useSettingStore(s=>s.theme);
    const motion = useSettingStore(s=>s.motion);
    const fontSize = useSettingStore(s=>s.fontSize);
    const day = useMemo(()=>labelKey(wallNow()),[]);
    const categories = useMemo<CategoryType[]>(()=>[
        {id:'studio-work',name:'업무',color:'#387A9A'}, {id:'studio-life',name:'일상',color:'#B56B38'},
    ],[]);
    const fixture = useMemo<TodoType[]>(()=>[
        '팀 주간 회의와 다음 분기 서비스 출시 일정 검토', '병원 예약 · 검사 결과 확인', '완료한 기획안 전달',
        '반복 일정 · 저녁 산책 30분', '디자인 시스템 접근성과 한국어 줄바꿈 최종 확인', '친구와 저녁 약속',
        '이번 달 정산 자료와 영수증 정리', '서점에서 주문한 책 찾아오기',
    ].map((title,i)=>({id:`studio-${i}`,title,categoryId:categories[i%2].id,isAllDay:i===6,repeat:i===3?1:0,
        startAt:`${day}T${String(9+i).padStart(2,'0')}:00:00+09:00`,endAt:`${day}T${String(10+i).padStart(2,'0')}:00:00+09:00`,
        memo:'테스트 데이터입니다. 실제 계정에는 저장되지 않습니다.',completions:i===2?[{targetDate:`${day}T00:00:00.000Z`}]:[],
    })),[categories,day]);
    const request: AuthFetch = useMemo(()=>async(url,init={})=>{
        const method=init.method??'GET';
        if(method!=='GET') {
            // Fail one request, then let the same retained draft be retried without closing its dialog.
            if(failureRef.current) { failureRef.current=false; setFailure(false); return Response.json({error:'프리뷰 저장 오류'}, {status:503}); }
            await new Promise(r=>setTimeout(r,1800));
            setSaved(true);
            const input=typeof init.body==='string'?JSON.parse(init.body):{};
            return Response.json({id:`studio-new-${Date.now()}`,...input,completions:[]});
        }
        const p=new URL(url,'http://preview.local').pathname;
        const data=p==='/api/todo'?useTodoStore.getState().todos:p==='/api/category'?categories:
            p==='/api/project'?useProjectStore.getState().projects:p==='/api/challenge'?useChallengeStore.getState().challenges:
            p==='/api/anniversary'?useAnniversaryStore.getState().anniversaries:
            p==='/api/dailyTask'?useDailyStore.getState().tasks:p==='/api/dailyMemo'?{content:useDailyStore.getState().memo}:{};
        return Response.json(data);
    },[categories]);

    useEffect(()=>{
        const old = useSettingStore.getState();
        const previousData = {todos:useTodoStore.getState().todos,categories:useCategoryStore.getState().categories,projects:useProjectStore.getState().projects,challenges:useChallengeStore.getState().challenges,anniversaries:useAnniversaryStore.getState().anniversaries,daily:useDailyStore.getState()};
        const raw=localStorage.getItem('setting-store');
        const q=new URLSearchParams(location.search);
        useSettingStore.setState({timezone:'Asia/Seoul'});
        const family=q.get('theme');
        if(family && ['celestial','maple','ocean'].includes(family)) useSettingStore.setState({theme:family});
        if(q.get('mode')) useSettingStore.getState().setThemeOption(family??old.theme,q.get('mode')!);
        const isEmpty=q.get('empty')==='1';
        useTodoStore.setState({todos:isEmpty?[]:fixture});
        useCategoryStore.setState({categories});
        const timelineFixture: ProjectTaskType[] = Array.from({length:13},(_,index)=>{
            const [start,end]=index===0?[3,4]:index===1?[3,5]:index===2?[4,6]:index===12?[6,8]:[9+(index-3)*2,10+(index-3)*2];
            const date=(value:number)=>`${day.slice(0,7)}-${String(value).padStart(2,'0')}`;
            return {id:`studio-timeline-${index+1}`,projectId:'studio-project',title:`할 일 ${index+1} · ${index===12?'배포 전 접근성과 한국어 긴 제목의 표시 확인':'서비스 개편 일정 검토'}`,
                status:index===1?'in_progress':index===3?'done':'todo',priority:'medium',startAt:`${date(start)}T09:00:00+09:00`,endAt:`${date(end)}T18:00:00+09:00`};
        });
        timelineFixture[12].blockedBy=[timelineFixture[0]];
        const projectTasks=q.get('timeline')==='dense'?timelineFixture.map(task=>({...task,startAt:timelineFixture[0].startAt,endAt:timelineFixture[12].endAt})):q.get('timeline')==='many'?timelineFixture:[{id:'studio-task',title:'캘린더와 위젯의 정보 위계 점검',status:'todo',priority:'high',projectId:'studio-project'}];
        useProjectStore.setState({projects:isEmpty?[]:[{id:'studio-project',title:'서비스 개편 · 사용자 경험 개선 프로젝트',status:'doing',categoryId:categories[0].id,startAt:`${day}T00:00:00+09:00`,endAt:`${day}T23:59:00+09:00`,tasks:projectTasks}]});
        useChallengeStore.setState({challenges:isEmpty?[]:[{id:'studio-challenge',title:'물 2L 마시기',startAt:`${day}T00:00:00+09:00`,interval:1,targetCount:30,categoryId:categories[1].id,completions:[]}]});
        useAnniversaryStore.setState({anniversaries:isEmpty?[]:[{id:'studio-anniversary',title:'함께한 날',month:Number(day.slice(5,7)),day:Number(day.slice(8,10))}]});
        useDailyStore.setState({tasks:[],memo:'읽는 영역과 조작 영역을 분리해 확인합니다.',memoDate:day});
        bustFetchCache();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- The studio must seed external stores before mounting data consumers.
        setReady(true);
        return ()=>{
            // Client navigation must not carry sample records into the real application.
            useTodoStore.setState({todos:previousData.todos});
            useCategoryStore.setState({categories:previousData.categories});
            useProjectStore.setState({projects:previousData.projects});
            useChallengeStore.setState({challenges:previousData.challenges});
            useAnniversaryStore.setState({anniversaries:previousData.anniversaries});
            useDailyStore.setState(previousData.daily);
            bustFetchCache();
            useSettingStore.setState({theme:old.theme,themeOptions:old.themeOptions,motion:old.motion,fontSize:old.fontSize,fontWeight:old.fontWeight,font:old.font,timezone:old.timezone});
            if(raw) localStorage.setItem('setting-store',raw);
        };
    },[categories,day,fixture]);

    if(!ready) return <p>디자인 프리뷰 준비 중</p>;
    const content=screen==='home'?<HomeView/>:screen==='project'?<ProjectPage/>:screen==='challenge'?<ChallengePage/>:screen==='anniversary'?<AnniversaryPage/>:screen==='settings'?<SettingsPage/>:screen==='widget'?<DialogProvider><DesktopWidgetStudio/></DialogProvider>:<CalendarPage/>;
    return <AuthFetchScope.Provider value={request}>
        <StudioInsets/>
        {screen!=='widget' && <Tools data-preview-tools>
            <span>로컬 샘플 · 실제 저장 없음</span>
            <select aria-label="프리뷰 화면" value={screen} onChange={e=>setScreen(e.target.value)}><option value="calendar">캘린더</option><option value="home">홈</option><option value="project">프로젝트</option><option value="challenge">챌린지</option><option value="anniversary">기념일</option><option value="settings">설정</option><option value="widget">데스크톱 위젯</option></select>
            <select aria-label="프리뷰 테마" value={theme} onChange={e=>useSettingStore.setState({theme:e.target.value})}>{['celestial','maple','ocean'].map(x=><option key={x}>{x}</option>)}</select>
            <button onClick={()=>{const s=useSettingStore.getState();s.setThemeOption(s.theme,s.themeOptions[s.theme]==='dark'?'light':'dark');}}>밝기</button>
            <select aria-label="프리뷰 모션" value={motion} onChange={e=>useSettingStore.getState().setMotion(e.target.value as 'full'|'gentle'|'off')}><option>full</option><option>gentle</option><option>off</option></select>
            <select aria-label="프리뷰 글자 크기" value={fontSize} onChange={e=>useSettingStore.getState().setFontSize(e.target.value)}><option value="sm">14px</option><option value="md">16px</option><option value="lg">18px</option><option value="xl">20px</option></select>
            <button onClick={()=>{setEmpty(!empty);useTodoStore.setState({todos:empty?fixture:[]});}}>빈 일정</button>
            <label><input type="checkbox" checked={failure} onChange={e=>{failureRef.current=e.target.checked;setFailure(e.target.checked);}}/>저장 오류</label>
            {saved && <span role="status">프리뷰 저장 완료</span>}
        </Tools>}
        {screen==='widget'?content:<MainLayout activePath={screen==='home'?'/':`/${screen}`}>{content}</MainLayout>}
    </AuthFetchScope.Provider>;
}
const Tools=styled.div`
    position:fixed;left:0;right:0;top:0;z-index:9000;display:flex;gap:8px;align-items:center;flex-wrap:wrap;
    padding:calc(6px + var(--native-inset-top,0px)) 10px 6px;background:#202735;color:#fff;font:12px/1.3 system-ui;
    button,select {font:12px system-ui;color:#fff;background:#344257;border:1px solid #6c7b91;border-radius:4px;min-height:28px;}
    & ~ [data-app-shell] {padding-top:calc(42px + var(--native-inset-top,0px)) !important;}
    @media(max-width:600px){gap:4px;font-size:10px; &>span:first-child{display:none;} &~[data-app-shell]{padding-top:calc(68px + var(--native-inset-top,0px)) !important;}}
`;
const StudioInsets=createGlobalStyle`
    html:has([data-preview-tools]) [role='dialog'] {max-height:calc(100dvh - 92px - var(--native-inset-top,0px)) !important;}
    html:has([data-preview-tools]) div:has(> [role='dialog']) {padding-top:calc(78px + var(--native-inset-top,0px)) !important;padding-bottom:12px !important;}
`;
