"use client";

import * as React from 'react';
import { ProjectTimelineProps } from '../ProjectTimeline';
import { ProjectTaskType } from '@/store/useProjectStore';
import * as S from "./CelestialTimeline.styles";

const ROW_HEIGHT = 48;
const DAY_WIDTH = 48;

type DragMode = 'move' | 'resize-right';

const CelestialProjectTimeline = React.forwardRef<HTMLDivElement, ProjectTimelineProps>(({ tasks, flex, onEditTask, onUpdateTaskDates }, ref) => {

    const [dragging, setDragging] = React.useState<{
        taskId: string;
        mode: DragMode;
        startX: number;
        initialLeft: number;
        initialWidth: number;
        currentLeft: number;
        currentWidth: number;
    } | null>(null);
    const [isDragMove, setIsDragMove] = React.useState(false);

    const todayTime = React.useMemo(() => new Date().setHours(0, 0, 0, 0), []);
    const timelineDays = React.useMemo(() => {
        const start = new Date(todayTime);
        start.setDate(start.getDate() - 30);

        return Array.from({ length: 120 }).map((_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [todayTime]);

    const timelineStart = timelineDays[0].getTime();
    const taskIndexMap = React.useMemo(() => new Map(tasks.map((t, idx) => [t.id, idx])), [tasks]);

    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            const todayIndex = timelineDays.findIndex(day => day.getTime() === todayTime);
            if (todayIndex !== -1) {
                scrollRef.current.scrollLeft = (todayIndex * DAY_WIDTH) - 150;
            }
        }
    }, [timelineDays, todayTime]);

    const getTaskBounds = React.useCallback((t: ProjectTaskType) => {
        const startTs = t.startAt ? new Date(t.startAt).setHours(0,0,0,0) : new Date().setHours(0,0,0,0);
        const endTs = t.endAt ? new Date(t.endAt).setHours(0,0,0,0) : startTs;

        const baseLeft = Math.floor((startTs - timelineStart) / 86400000) * DAY_WIDTH;
        const baseWidth = Math.max(1, Math.floor((endTs - startTs) / 86400000) + 1) * DAY_WIDTH;

        if (dragging?.taskId === t.id) {
            return { left: dragging.currentLeft, right: dragging.currentLeft + dragging.currentWidth, width: dragging.currentWidth };
        }
        return { left: baseLeft, right: baseLeft + baseWidth, width: baseWidth };
    }, [dragging, timelineStart]);

    const handleMouseDownMove = (e: React.MouseEvent, taskId: string, left: number, width: number) => {
        e.stopPropagation();
        setDragging({ taskId, mode: 'move', startX: e.clientX, initialLeft: left, initialWidth: width, currentLeft: left, currentWidth: width });
        setIsDragMove(false);
    };

    const handleMouseDownResize = (e: React.MouseEvent, taskId: string, left: number, width: number) => {
        e.stopPropagation();
        setDragging({ taskId, mode: 'resize-right', startX: e.clientX, initialLeft: left, initialWidth: width, currentLeft: left, currentWidth: width });
        setIsDragMove(false);
    };

    React.useEffect(() => {
        if (!dragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - dragging.startX;
            if (Math.abs(deltaX) > 5) setIsDragMove(true);

            if (dragging.mode === 'move') {
                setDragging(prev => prev ? { ...prev, currentLeft: prev.initialLeft + deltaX } : null);
            } else if (dragging.mode === 'resize-right') {
                const newWidth = Math.max(DAY_WIDTH, dragging.initialWidth + deltaX);
                setDragging(prev => prev ? { ...prev, currentWidth: newWidth } : null);
            }
        };

        const handleMouseUp = () => {
            if (isDragMove && onUpdateTaskDates) {
                const task = tasks.find(t => t.id === dragging.taskId);
                if (task) {
                    const startTs = new Date(task.startAt || timelineStart).setHours(0,0,0,0);
                    const endTs = new Date(task.endAt || startTs).setHours(0,0,0,0);

                    if (dragging.mode === 'move') {
                        const deltaX = dragging.currentLeft - dragging.initialLeft;
                        const daysShifted = Math.round(deltaX / DAY_WIDTH);

                        if (daysShifted !== 0) {
                            const newStart = new Date(startTs);
                            newStart.setDate(newStart.getDate() + daysShifted);
                            const newEnd = new Date(endTs);
                            newEnd.setDate(newEnd.getDate() + daysShifted);
                            onUpdateTaskDates(task.id, newStart.toISOString(), newEnd.toISOString());
                        }
                    } else if (dragging.mode === 'resize-right') {
                        const deltaX = dragging.currentWidth - dragging.initialWidth;
                        const daysShifted = Math.round(deltaX / DAY_WIDTH);

                        if (daysShifted !== 0) {
                            const newStart = new Date(startTs);
                            const newEnd = new Date(endTs);
                            newEnd.setDate(newEnd.getDate() + daysShifted);
                            onUpdateTaskDates(task.id, newStart.toISOString(), newEnd.toISOString());
                        }
                    }
                }
            }
            setDragging(null);
            setTimeout(() => setIsDragMove(false), 50);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, isDragMove, tasks, onUpdateTaskDates, timelineStart]);

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

                        <S.TimelineGraphContainer>
                            <S.TimelineBackground>
                                {timelineDays.map((day, i) => {
                                    const isToday = day.getTime() === todayTime;
                                    return <S.TimelineVerticalLine key={i} $isToday={isToday} />;
                                })}
                            </S.TimelineBackground>

                            <S.DependencySvg>
                                {tasks.flatMap(task => {
                                    if (!task.blockedBy || task.blockedBy.length === 0) return [];
                                    return task.blockedBy.map(dep => {
                                        const depTask = tasks.find(t => t.id === dep.id);
                                        if (!depTask) return null;

                                        const fromIdx = taskIndexMap.get(dep.id);
                                        const toIdx = taskIndexMap.get(task.id);
                                        if (fromIdx === undefined || toIdx === undefined) return null;

                                        const depBounds = getTaskBounds(depTask);
                                        const taskBounds = getTaskBounds(task);

                                        const x1 = depBounds.right;
                                        const y1 = fromIdx * ROW_HEIGHT + (ROW_HEIGHT / 2);
                                        const x2 = taskBounds.left;
                                        const y2 = toIdx * ROW_HEIGHT + (ROW_HEIGHT / 2);

                                        return <S.DependencyLine key={`line-${dep.id}-${task.id}`} d={`M ${x1} ${y1} C ${x1 + 20} ${y1}, ${x2 - 20} ${y2}, ${x2} ${y2}`} />;
                                    });
                                })}
                            </S.DependencySvg>

                            {tasks.map(task => {
                                const bounds = getTaskBounds(task);
                                const top = (taskIndexMap.get(task.id) || 0) * ROW_HEIGHT;
                                const isBeingDragged = dragging?.taskId === task.id;

                                return (
                                    <S.TaskNode
                                        key={task.id}
                                        $left={bounds.left}
                                        $top={top}
                                        $width={bounds.width}
                                        $status={task.status}
                                        $isDragging={isBeingDragged}
                                        onMouseDown={(e) => handleMouseDownMove(e, task.id, bounds.left, bounds.width)}
                                        onClick={(e) => {
                                            if (isDragMove) { e.stopPropagation(); return; }
                                            onEditTask(task);
                                        }}
                                    >
                                        <S.TaskNodeText>{task.title}</S.TaskNodeText>

                                        <S.TaskResizeHandle
                                            onMouseDown={(e) => handleMouseDownResize(e, task.id, bounds.left, bounds.width)}
                                            onClick={(e) => e.stopPropagation()}
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