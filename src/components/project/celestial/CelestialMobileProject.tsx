"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ReadingSeal from "@/components/ornament/celestial/ReadingSeal";
import { useCurrentDayKey } from "@/hooks/useCurrentDay";
import { endDateKey, labelDate, localDateKey } from "@/lib/dateKey";
import { addDaysToKey } from "@/lib/timezone";
import { useT } from "@/i18n/useT";
import useSettingStore from "@/store/useSettingStore";
import type { ProjectTaskType, ProjectType } from "@/types";
import * as S from "./CelestialMobileProject.styles";

interface Props {
    projects: ProjectType[];
    project?: ProjectType;
    category?: string;
    board: ReactNode;
    fullTimeline: ReactNode;
    onProject: (id: string) => void;
    onSettings: () => void;
    onNewProject: () => void;
    onAddTask: () => void;
    onEditTask: (task: ProjectTaskType) => void;
}

function taskPeriod(task: ProjectTaskType) {
    const a = task.startAt && Number.isFinite(Date.parse(task.startAt)) ? localDateKey(task.startAt) : "";
    const b = task.endAt && Number.isFinite(Date.parse(task.endAt))
        ? (a ? endDateKey(task.startAt!, task.endAt) : localDateKey(task.endAt)) : "";
    const start = a || b;
    return { start, end: b && b >= start ? b : start, a, b };
}

export default function CelestialMobileProject(p: Props) {
    const [view, setView] = useState<"ledger" | "timeline" | "board" | "all">("timeline");
    const [offset, setOffset] = useState(0);
    const [picked, setPicked] = useState<string>();
    const today = useCurrentDayKey();
    const t = useT();
    const locale = useSettingStore(s=>s.locale);
    const ko = locale === "ko";
    const formatDate = (key: string) => key ? labelDate(key).toLocaleDateString(locale, {month:"short", day:"numeric"}) : "—";
    const monday = addDaysToKey(today, -((labelDate(today).getDay() + 6) % 7) + offset * 7);
    const days = Array.from({length:7}, (_,i)=>addDaysToKey(monday,i));
    const datePeriod = (task: ProjectTaskType) => {
        const {a,b} = taskPeriod(task);
        return a && b && a !== b ? formatDate(a)+" – "+formatDate(b) : a || b ? formatDate(a || b) : missingDate;
    };
    const missingDate = ko ? "날짜 미정" : "Unscheduled";
    const tasks = p.project?.tasks ?? [];
    const dated = tasks.map(task => ({task, ...taskPeriod(task)})).filter(item=>item.start);
    const weekly = dated.filter(({start,end})=>start <= days[6] && end >= days[0])
        .sort((a,b)=>a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
    const deadlines = [...dated].sort((a,b)=>a.end.localeCompare(b.end));
    const undated = tasks.filter(task=>!taskPeriod(task).start);
    const selected = weekly.find(({task})=>task.id === picked) ?? weekly.find(({task})=>task.status==="in_progress") ?? weekly[0];
    const done = tasks.filter(task=>task.status==="done").length;
    const statusText = (status: string) => status === "done" ? t.project.colDone : status === "in_progress" ? t.project.colDoing : t.project.colTodo;
    const projectChange = (id: string) => {
        setPicked(undefined);
        setOffset(0);
        p.onProject(id);
    };
    const openMenu = (callback: () => void) => (event: React.MouseEvent<HTMLButtonElement>) => {
        event.currentTarget.closest("details")?.removeAttribute("open");
        callback();
    };
    const renderLine = (task: ProjectTaskType, end: string) => <S.Record key={task.id} type="button" onClick={()=>p.onEditTask(task)}>
        <span><b>{end ? formatDate(end) : missingDate}</b></span>
        <span><strong>{task.title}</strong><small><S.Moon $state={task.status} />{statusText(task.status)}</small></span>
    </S.Record>;

    return <S.Shell data-theme-layout="celestial-mobile-project">
        <S.Masthead>
            <h1><i aria-hidden="true">✦</i>{t.sidebar.project}</h1>
            <S.Menu>
                <summary>{ko ? "프로젝트 메뉴" : "Project menu"}</summary>
                <div>
                    <button type="button" onClick={openMenu(p.onNewProject)}>{t.project.newProject}</button>
                    {p.project && <>
                        <button type="button" onClick={openMenu(p.onSettings)}>{t.project.settings}</button>
                        <button type="button" onClick={openMenu(()=>setView("board"))}>{t.project.board}</button>
                        <button type="button" onClick={openMenu(()=>setView("all"))}>{ko ? "전체 타임라인" : "Full timeline"}</button>
                    </>}
                </div>
            </S.Menu>
        </S.Masthead>
        {!p.project ? <S.Empty>{t.home.noProjects}</S.Empty> : <>
            <S.Project>
                {p.category && <small>{p.category}</small>}
                <select aria-label={ko ? "프로젝트 선택" : "Select project"} value={p.project.id} onChange={e=>projectChange(e.target.value)}>
                    {p.projects.map(project=><option key={project.id} value={project.id}>{project.title}</option>)}
                </select>
            </S.Project>
            <S.Summary>
                <div><b>{ko ? "프로젝트 진척" : "Project progress"}</b> <strong>{tasks.length ? Math.round(done / tasks.length * 100) : 0}%</strong></div>
                <small>{ko ? tasks.length+"건 중 "+done+"건 완료" : done+" of "+tasks.length+" complete"}</small>
                <meter min={0} max={tasks.length || 1} value={done} aria-label={ko ? "프로젝트 진척" : "Project progress"} />
                <ReadingSeal />
            </S.Summary>
            <S.Toolbar>
                <nav aria-label={ko ? "프로젝트 보기" : "Project view"}>
                    <button type="button" aria-pressed={view==="ledger"} onClick={()=>setView("ledger")}>{ko ? "마감 기록" : "Deadlines"}</button>
                    <button type="button" aria-pressed={view==="timeline" || view==="all"} onClick={()=>setView("timeline")}>{t.project.timeline}</button>
                    {view==="board" && <button type="button" aria-pressed>{t.project.board}</button>}
                </nav>
                <button type="button" onClick={p.onAddTask}><Plus size={15} />{ko ? "할 일 추가" : "Add task"}</button>
            </S.Toolbar>
            {view==="board" ? p.board : view==="all" ? p.fullTimeline : view==="ledger" ? <>
                <S.LedgerHeading>{ko ? "마감일순" : "By deadline"}</S.LedgerHeading>
                {deadlines.map(({task,end})=>renderLine(task,end))}
                {undated.map(task=>renderLine(task,""))}
                {!tasks.length && <S.Empty>{t.project.noTasks}</S.Empty>}
            </> : <>
                <S.Week>
                    <header><h2>{formatDate(monday)} – {formatDate(days[6])}</h2><div>
                        <button type="button" onClick={()=>setOffset(value=>value-1)} aria-label={t.calendar.prevWeek}><ChevronLeft size={16}/></button>
                        <button type="button" onClick={()=>setOffset(value=>value+1)} aria-label={t.calendar.nextWeek}><ChevronRight size={16}/></button>
                    </div></header>
                    <S.Dates>{days.map(key=><div key={key} aria-current={key===today ? "date" : undefined}>
                        <small>{labelDate(key).toLocaleDateString(locale,{weekday:"short"})}</small><b>{labelDate(key).getDate()}</b>
                    </div>)}</S.Dates>
                    <S.Tracks $today={days.indexOf(today)}>
                        {!weekly.length && <S.Empty>{ko ? "이번 주에 날짜가 지정된 작업이 없어요." : "No scheduled tasks this week."}</S.Empty>}
                        {weekly.map(({task,start,end})=>{
                            const left = start < monday ? 0 : days.indexOf(start);
                            const right = end > days[6] ? 6 : days.indexOf(end);
                            return <S.Lane key={task.id}><S.Bar type="button"
                                style={{gridColumn:(left+1)+" / "+(right+2)}} aria-pressed={selected?.task.id===task.id}
                                aria-label={task.title+", "+datePeriod(task)}
                                onClick={()=>setPicked(task.id)}>
                                <S.Moon $state={task.status}/><span>{task.title}</span>
                            </S.Bar></S.Lane>;
                        })}
                    </S.Tracks>
                    <S.Legend>{["done","in_progress","todo"].map(state=><span key={state}><S.Moon $state={state}/>{statusText(state)}</span>)}</S.Legend>
                </S.Week>
                {selected && <S.Detail aria-live="polite">
                    <header><span><S.Moon $state={selected.task.status}/> {statusText(selected.task.status)}</span>
                        <span>{selected.task.assignees?.map(person=>person.name).filter(Boolean).join(", ") || t.project.noAssignee}</span></header>
                    <h2>{selected.task.title}</h2>
                    <div>
                        <span><small>{t.project.startLabel}</small><b>{formatDate(selected.a)}</b></span>
                        <span><small>{ko ? "마감" : "Deadline"}</small><b>{formatDate(selected.b)}</b></span>
                        <button type="button" onClick={()=>p.onEditTask(selected.task)}>{ko ? "작업 열기" : "Open task"}</button>
                    </div>
                </S.Detail>}
                {undated.length>0 && <S.Unscheduled>
                    <summary>{missingDate} <span>{undated.length}</span></summary>
                    {undated.map(task=>renderLine(task,""))}
                </S.Unscheduled>}
            </>}
        </>}
    </S.Shell>;
}
