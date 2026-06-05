"use client";

import * as React from 'react';
import { ProjectTimelineProps } from '../ProjectTimeline';
import type { ProjectTaskType } from '@/types';
import * as S from "./CelestialTimeline.styles";

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

const CelestialProjectTimeline = React.forwardRef<HTMLDivElement, ProjectTimelineProps>(
    ({ tasks, flex, onEditTask, onUpdateTaskDates }, ref) => {

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
                        const finalWidth = Math.max(DAY_WIDTH, drag.initialWidth + daysShifted * DAY_WIDTH);
                        if (el) el.style.width = `${finalWidth}px`;
                        const ne = new Date(endTs); ne.setDate(ne.getDate() + daysShifted);
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

        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingTaskId, tasks, onUpdateTaskDates, getBaseTaskBounds]);

    return (
        <S.SectionWrapper ref={ref} style={{ flex }}>
            <S.SectionTitle>타임라인</S.SectionTitle>
            <S.TimelineLayout>
                <S.TimelineGridArea ref={scrollRef}>
                    <S.TimelineContent>
                        <S.TimelineDateHeader>
                            {timelineDays.map((day, i) => {
                                const isToday = day.getTime() === todayTime;
                                return (
                                    <S.DateCell key={i} $isToday={isToday}>
                                        <S.DateNumber $isToday={isToday}>{day.getDate()}</S.DateNumber>
                                    </S.DateCell>
                                );
                            })}
                        </S.TimelineDateHeader>

                        <S.TimelineGraphContainer style={{ height: Math.max(tasks.length * ROW_HEIGHT, 80) }}>
                            <S.TimelineBackground>
                                {timelineDays.map((day, i) => (
                                    <S.TimelineVerticalLine key={i} $isToday={day.getTime() === todayTime} />
                                ))}
                            </S.TimelineBackground>

                            <S.DependencySvg>
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
                                                d={`M ${x1} ${y1} C ${x1+20} ${y1}, ${x2-20} ${y2}, ${x2} ${y2}`}
                                            />
                                        );
                                    });
                                })}
                            </S.DependencySvg>

                            {tasks.map(task => {
                                const { left, width } = getBaseTaskBounds(task);
                                const top      = (taskIndexMap.get(task.id) ?? 0) * ROW_HEIGHT + 10;
                                const isDragged = draggingTaskId === task.id;

                                return (
                                    <S.TaskNode
                                        key={task.id}
                                        ref={el => {
                                            if (el) taskElemsRef.current.set(task.id, el);
                                            else    taskElemsRef.current.delete(task.id);
                                        }}
                                        style={{ left, top, width }}
                                        $status={task.status}
                                        $isDragging={isDragged}
                                        onMouseDown={e => handleMouseDownMove(e, task, left, width)}
                                        onClick={e => {
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

CelestialProjectTimeline.displayName = 'CelestialProjectTimeline';
export default CelestialProjectTimeline;
