"use client";

import * as React from 'react';
import { useT } from "@/i18n/useT";
import { ProjectTimelineProps } from "./ProjectTimeline";
import type { ProjectTaskType } from '@/types';
import useIsMobile from "@/hooks/useIsMobile";
import useDragTarget from "@/hooks/useDragTarget";
import { Link2 } from "lucide-react";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialTimeline.styles";
import * as MapleS from "./maple/MapleTimeline.styles";
import * as OceanS from './ocean/OceanTimeline.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

const ROW_HEIGHT = 48;
const DAY_WIDTH = 48;

type DragMode = 'move' | 'resize-right';

interface DragState {
    taskId: string;
    mode: DragMode;
    startX: number;
    initialLeft: number;
    initialWidth: number;
    currentDeltaX: number;
    hasMoved: boolean;
}

const ProjectTimelineView = React.forwardRef<HTMLDivElement, ProjectTimelineProps>(
    ({ tasks, flex, onEditTask, onUpdateTaskDates, onConnectDependency }, ref) => {
    const S = usePickTheme(STYLES);
    const t = useT();
    const tr = t.project;
    const [linkSource, setLinkSource] = React.useState<string | null>(null);
    const [linkMessage, setLinkMessage] = React.useState<string | null>(null);
    const connecting = React.useRef(false);
    const graphRef = React.useRef<HTMLDivElement>(null);
    const arrowId = React.useId().replace(/:/g, '');
    const connect = async (from: string, to: string) => {
        if (!onConnectDependency || connecting.current) return;
        connecting.current = true;
        try {
            const error = await onConnectDependency(from, to);
            setLinkMessage(error || t.interaction.linkCreated);
            if (!error) setLinkSource(null);
        } finally { connecting.current = false; }
    };
    const linkDrag = useDragTarget<string>('data-project-task', (from, to) => { void connect(from, to); });
    const source = linkDrag.drag?.source ?? linkSource;
    const selectSource = (id: string) => {
        if (linkDrag.consumeClick()) return;
        setLinkSource(value => value === id ? null : id);
        setLinkMessage(null);
    };
    React.useEffect(() => {
        const cancel = (e: KeyboardEvent) => { if (e.key === 'Escape') setLinkSource(null); };
        document.addEventListener('keydown', cancel);
        return () => document.removeEventListener('keydown', cancel);
    }, []);
    /* 폰에서는 간트를 옆으로 밀어야 하는 데다, 막대를 끌어 옮기는 것은 마우스 전용이었다.
       손가락에게는 날짜 순 목록이 더 낫다 — 같은 자료를 세로로 읽는다. */
    const isMobile = useIsMobile();

    // ── Ref 기반 드래그 — mousemove에서 React 리렌더 없음 ───────────────────
    const draggingRef     = React.useRef<DragState | null>(null);
    const lastMovedRef    = React.useRef(false); // mouseup 이후 click에서 확인용
    const taskElemsRef    = React.useRef<Map<string, HTMLDivElement>>(new Map());
    const [draggingTaskId, setDraggingTaskId] = React.useState<string | null>(null);

    const todayTime = React.useMemo(() => new Date().setHours(0, 0, 0, 0), []);
    const timelineDays = React.useMemo(() => {
        const start = new Date(todayTime);
        start.setDate(start.getDate() - 30);
        return Array.from({ length: 120 }, (_, i) => {
            const d = new Date(start); d.setDate(d.getDate() + i); return d;
        });
    }, [todayTime]);

    const timelineStart  = timelineDays[0].getTime();
    const taskIndexMap   = React.useMemo(
        () => new Map(tasks.map((t, i) => [t.id, i])),
        [tasks]
    );

    const scrollRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (scrollRef.current) {
            const idx = timelineDays.findIndex(d => d.getTime() === todayTime);
            if (idx !== -1) scrollRef.current.scrollLeft = idx * DAY_WIDTH - 150;
        }
    }, [timelineDays, todayTime]);

    // ── 기본 위치 계산 ────────────────────────────────────────────────────────
    const getBaseTaskBounds = React.useCallback((t: ProjectTaskType) => {
        const startTs = t.startAt ? new Date(t.startAt).setHours(0,0,0,0) : todayTime;
        const endTs   = t.endAt   ? new Date(t.endAt).setHours(0,0,0,0)   : startTs;
        const left    = Math.floor((startTs - timelineStart) / 86400000) * DAY_WIDTH;
        const width   = Math.max(1, Math.floor((endTs - startTs) / 86400000) + 1) * DAY_WIDTH;
        return { left, width, startTs, endTs };
    }, [timelineStart, todayTime]);

    // 의존선 SVG 전용 — 드래그 중 실시간 위치 반영
    const getBoundsForSvg = React.useCallback((t: ProjectTaskType) => {
        const { left, width } = getBaseTaskBounds(t);
        const drag = draggingRef.current;
        if (drag?.taskId === t.id) {
            if (drag.mode === 'move') {
                const finalLeft = drag.initialLeft + drag.currentDeltaX;
                return { left: finalLeft, right: finalLeft + drag.initialWidth };
            }
            const finalWidth = Math.max(DAY_WIDTH, drag.initialWidth + drag.currentDeltaX);
            return { left, right: left + finalWidth };
        }
        return { left, right: left + width };
    }, [getBaseTaskBounds]);

    // ── 마우스다운 ────────────────────────────────────────────────────────────
    const handleMouseDownMove = React.useCallback(
        (e: React.MouseEvent, task: ProjectTaskType, left: number, width: number) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            lastMovedRef.current = false;
            draggingRef.current = {
                taskId: task.id, mode: 'move',
                startX: e.clientX, initialLeft: left, initialWidth: width,
                currentDeltaX: 0, hasMoved: false,
            };
            setDraggingTaskId(task.id);
        }, []
    );

    const handleMouseDownResize = React.useCallback(
        (e: React.MouseEvent, task: ProjectTaskType, left: number, width: number) => {
            e.stopPropagation();
            lastMovedRef.current = false;
            draggingRef.current = {
                taskId: task.id, mode: 'resize-right',
                startX: e.clientX, initialLeft: left, initialWidth: width,
                currentDeltaX: 0, hasMoved: false,
            };
            setDraggingTaskId(task.id);
        }, []
    );

    // ── 이벤트 핸들러 등록 ────────────────────────────────────────────────────
    React.useEffect(() => {
        if (!draggingTaskId) return;

        const handleMouseMove = (e: MouseEvent) => {
            const drag = draggingRef.current;
            if (!drag) return;

            const deltaX = e.clientX - drag.startX;
            if (Math.abs(deltaX) > 3) drag.hasMoved = true;
            drag.currentDeltaX = deltaX;

            const el = taskElemsRef.current.get(drag.taskId);
            if (!el) return;

            if (drag.mode === 'move') {
                // translateX: GPU 합성 — layout 재계산 없음
                el.style.transform = `translateX(${deltaX}px)`;
            } else {
                el.style.width = `${Math.max(DAY_WIDTH, drag.initialWidth + deltaX)}px`;
            }
        };

        const handleMouseUp = () => {
            const drag = draggingRef.current;
            if (!drag) { setDraggingTaskId(null); return; }

            const el = taskElemsRef.current.get(drag.taskId);
            lastMovedRef.current = drag.hasMoved; // click 이벤트에서 확인

            if (drag.hasMoved && onUpdateTaskDates) {
                const task = tasks.find(t => t.id === drag.taskId);
                if (task) {
                    const { startTs, endTs } = getBaseTaskBounds(task);
                    const daysShifted = Math.round(drag.currentDeltaX / DAY_WIDTH);

                    if (drag.mode === 'move' && daysShifted !== 0) {
                        // 스냅백 방지: 최종 위치를 미리 style.left에 적용 후 transform 제거
                        const finalLeft = drag.initialLeft + daysShifted * DAY_WIDTH;
                        if (el) {
                            el.style.left      = `${finalLeft}px`;
                            el.style.transform = '';
                        }
                        const ns = new Date(startTs); ns.setDate(ns.getDate() + daysShifted);
                        const ne = new Date(endTs);   ne.setDate(ne.getDate() + daysShifted);
                        onUpdateTaskDates(task.id, ns.toISOString(), ne.toISOString());

                    } else if (drag.mode === 'resize-right' && daysShifted !== 0) {
                        // 스냅백 방지: 최종 폭 유지, React 리렌더가 같은 값으로 덮어씀
                        const actualShift = Math.max(daysShifted, -Math.round(drag.initialWidth / DAY_WIDTH) + 1);
                        const finalWidth = Math.max(DAY_WIDTH, drag.initialWidth + actualShift * DAY_WIDTH);
                        if (el) el.style.width = `${finalWidth}px`;
                        const ne = new Date(endTs); ne.setDate(ne.getDate() + actualShift);
                        onUpdateTaskDates(task.id, new Date(startTs).toISOString(), ne.toISOString());

                    } else {
                        // 이동했지만 그리드 경계 미달 — 원위치
                        if (el) { el.style.transform = ''; el.style.width = ''; }
                    }
                }
            } else {
                if (el) { el.style.transform = ''; el.style.width = ''; }
            }

            draggingRef.current = null;
            setDraggingTaskId(null); // 단 한 번의 리렌더
        };

        const cancel = () => {
            const drag = draggingRef.current;
            const el = drag && taskElemsRef.current.get(drag.taskId);
            if (el) { el.style.transform = ''; el.style.width = ''; }
            lastMovedRef.current = Boolean(drag?.hasMoved);
            draggingRef.current = null;
            setDraggingTaskId(null);
        };
        const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); cancel(); } };

        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', key);
        window.addEventListener('blur', cancel);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', key);
            window.removeEventListener('blur', cancel);
        };
    }, [draggingTaskId, tasks, onUpdateTaskDates, getBaseTaskBounds]);

    const agenda = React.useMemo(
        () => [...tasks].sort((a, b) => {
            const av = a.startAt ? new Date(a.startAt).getTime() : Infinity;
            const bv = b.startAt ? new Date(b.startAt).getTime() : Infinity;
            return av - bv;
        }),
        [tasks],
    );

    const dayLabel = (v: string | Date | null | undefined) => {
        if (!v) return t.form.noDate;
        const d = new Date(v);
        return t.calendar.dayLabelShort(d.getMonth() + 1, d.getDate());
    };

    if (isMobile) {
        return (
            <S.SectionWrapper ref={ref} style={{ flex }} $mobileHeight="340px">
                <S.SectionTitle>{tr.timeline}</S.SectionTitle>
                {onConnectDependency && <S.LinkHint role="status">{linkMessage || (source ? t.interaction.linkSelectedMobile(tasks.find(t => t.id === source)?.title ?? '') : t.interaction.linkHintMobile)}</S.LinkHint>}
                <S.AgendaList>
                    {agenda.length === 0 && <S.AgendaEmpty>{tr.noTasks}</S.AgendaEmpty>}
                    {agenda.map(task => (
                        <S.MobileTaskRow key={task.id} data-project-task={task.id}>
                        <S.AgendaRow type="button" aria-label={source ? t.interaction.linkTarget(task.title) : undefined} $status={task.status} onClick={() => source ? void connect(source, task.id) : onEditTask(task)}>
                            <S.AgendaWhen>
                                <b>{dayLabel(task.startAt)}</b>
                                {/* 하루짜리면 같은 날짜를 두 번 적지 않는다 */}
                                {task.endAt && dayLabel(task.endAt) !== dayLabel(task.startAt) && <em>{dayLabel(task.endAt)}</em>}
                            </S.AgendaWhen>
                            <S.AgendaTitle $done={task.status === 'done'}>{task.title}</S.AgendaTitle>
                        </S.AgendaRow>
                        {onConnectDependency && <S.MobileConnector type="button" aria-label={t.interaction.linkStart(task.title)} aria-pressed={source === task.id} onClick={() => selectSource(task.id)}><Link2 size={16} /></S.MobileConnector>}
                        </S.MobileTaskRow>
                    ))}
                </S.AgendaList>
            </S.SectionWrapper>
        );
    }

    return (
        <S.SectionWrapper ref={ref} style={{ flex }} $mobileHeight="340px">
            <S.SectionTitle>{tr.timeline}</S.SectionTitle>
            {onConnectDependency && <S.LinkHint role="status">{linkMessage || (source ? t.interaction.linkSelected(tasks.find(t => t.id === source)?.title ?? '') : t.interaction.linkHint)}</S.LinkHint>}
            <S.TimelineLayout>
                <S.TimelineGridArea ref={scrollRef}>
                    <S.TimelineContent>
                        <S.TimelineDateHeader>
                            {timelineDays.map((day, i) => {
                                const isToday = day.getTime() === todayTime;
                                return (
                                    <S.DateCell key={i} $isToday={isToday} data-weekend={day.getDay() % 6 === 0 ? "" : undefined}>
                                        <S.DateNumber $isToday={isToday}>{day.getDate()}</S.DateNumber>
                                    </S.DateCell>
                                );
                            })}
                        </S.TimelineDateHeader>

                        <S.TimelineGraphContainer ref={graphRef} data-connecting={source ? 'true' : undefined} style={{ height: Math.max(tasks.length * ROW_HEIGHT, 80) }}>
                            <S.TimelineBackground>
                                {/* 주말은 data-weekend 로만 알린다 — 칠할지는 갈래가 정한다 */}
                                {timelineDays.map((day, i) => (
                                    <S.TimelineVerticalLine key={i} $isToday={day.getTime() === todayTime} data-weekend={day.getDay() % 6 === 0 ? "" : undefined} />
                                ))}
                            </S.TimelineBackground>

                            <S.DependencySvg>
                                <defs><marker id={arrowId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor" /></marker></defs>
                                {tasks.flatMap(task => {
                                    if (!task.blockedBy?.length) return [];
                                    return task.blockedBy.map(dep => {
                                        const depTask = tasks.find(t => t.id === dep.id);
                                        if (!depTask) return null;
                                        const fi = taskIndexMap.get(dep.id);
                                        const ti = taskIndexMap.get(task.id);
                                        if (fi === undefined || ti === undefined) return null;
                                        const db = getBoundsForSvg(depTask);
                                        const tb = getBoundsForSvg(task);
                                        const x1 = db.right, y1 = fi * ROW_HEIGHT + ROW_HEIGHT / 2;
                                        const x2 = tb.left,  y2 = ti * ROW_HEIGHT + ROW_HEIGHT / 2;
                                        return (
                                            <S.DependencyLine
                                                key={`${dep.id}-${task.id}`}
                                                markerEnd={`url(#${arrowId})`}
                                                d={`M ${x1} ${y1} C ${x1+20} ${y1}, ${x2-20} ${y2}, ${x2} ${y2}`}
                                            />
                                        );
                                    });
                                })}
                                {linkDrag.drag && graphRef.current && (() => {
                                    const task = tasks.find(t => t.id === linkDrag.drag!.source);
                                    if (!task) return null;
                                    const rect = graphRef.current!.getBoundingClientRect();
                                    const x1 = getBoundsForSvg(task).right;
                                    const y1 = (taskIndexMap.get(task.id) ?? 0) * ROW_HEIGHT + ROW_HEIGHT / 2;
                                    const x2 = linkDrag.drag!.x - rect.left;
                                    const y2 = linkDrag.drag!.y - rect.top;
                                    return <S.DependencyLine strokeDasharray="4 4" d={`M ${x1} ${y1} C ${x1+24} ${y1}, ${x2-24} ${y2}, ${x2} ${y2}`} />;
                                })()}
                            </S.DependencySvg>

                            {tasks.map(task => {
                                const { left, width } = getBaseTaskBounds(task);
                                const top      = (taskIndexMap.get(task.id) ?? 0) * ROW_HEIGHT + 10;
                                const isDragged = draggingTaskId === task.id;

                                return (
                                    <S.TaskNode
                                        key={task.id}
                                        data-project-task={task.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={source ? t.interaction.linkTarget(task.title) : task.title}
                                        title={task.title}
                                        $connectTarget={!!source && source !== task.id && (linkDrag.drag?.target === task.id || !!linkSource)}
                                        ref={el => {
                                            if (el) taskElemsRef.current.set(task.id, el);
                                            else    taskElemsRef.current.delete(task.id);
                                        }}
                                        style={{ left, top, width }}
                                        $status={task.status}
                                        $isDragging={isDragged}
                                        onMouseDown={e => { if (!source && e.button === 0) handleMouseDownMove(e, task, left, width); }}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (source) void connect(source, task.id); else onEditTask(task); } }}
                                        onClick={e => {
                                            if (linkDrag.consumeClick()) { e.stopPropagation(); return; }
                                            if (source) { void connect(source, task.id); return; }
                                            // lastMovedRef: draggingRef가 이미 null인 시점에서도 이동 여부 확인
                                            if (lastMovedRef.current) {
                                                lastMovedRef.current = false;
                                                e.stopPropagation();
                                                return;
                                            }
                                            onEditTask(task);
                                        }}
                                    >
                                        <S.TaskNodeText>{task.title}</S.TaskNodeText>
                                        {onConnectDependency && <S.Connector
                                            type="button"
                                            aria-label={t.interaction.linkStart(task.title)}
                                            aria-pressed={source === task.id}
                                            title={t.interaction.linkHint}
                                            onPointerDown={e => { e.stopPropagation(); linkDrag.begin(e, task.id); }}
                                            onMouseDown={e => e.stopPropagation()}
                                            onKeyDown={e => e.stopPropagation()}
                                            onClick={e => { e.stopPropagation(); selectSource(task.id); }}
                                        ><Link2 size={12} /></S.Connector>}
                                        <S.TaskResizeHandle
                                            onMouseDown={e => handleMouseDownResize(e, task, left, width)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </S.TaskNode>
                                );
                            })}
                        </S.TimelineGraphContainer>
                    </S.TimelineContent>
                </S.TimelineGridArea>
            </S.TimelineLayout>
        </S.SectionWrapper>
    );
});

ProjectTimelineView.displayName = 'ProjectTimelineView';
export default ProjectTimelineView;
