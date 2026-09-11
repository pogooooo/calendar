"use client";

import * as React from 'react';
import { useT } from "@/i18n/useT";
import { ProjectBoardProps } from '../ProjectBoard';
import { ProjectTaskType } from '@/store/useProjectStore';
import { SectionWrapper, SectionTitle } from "@/components/project/celestial/section";
import * as S from "./CelestialProjectBoard.styles";
export { SectionWrapper, SectionTitle };

const CelestialProjectBoard = React.forwardRef<HTMLDivElement, ProjectBoardProps>(({
                                                                                       tasks,
                                                                                       flex,
                                                                                       onAddTask,
                                                                                       onEditTask,
                                                                                       onMoveTask
                                                                                   }, ref) => {
    const tr = useT().project;
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const boardColumns = [
        { t: tr.colTodo,  d: todoTasks,       s: 'todo',        prevStatus: null,           prevLabel: null,          nextStatus: 'in_progress', nextLabel: tr.moveStart },
        { t: tr.colDoing, d: inProgressTasks, s: 'in_progress', prevStatus: 'todo',        prevLabel: tr.movePrev,   nextStatus: 'done',        nextLabel: tr.moveDone },
        { t: tr.colDone,  d: doneTasks,       s: 'done',        prevStatus: 'in_progress', prevLabel: tr.movePrev,   nextStatus: null,             nextLabel: null }
    ];

    return (
        <SectionWrapper ref={ref} style={{ flex }} $mobileHeight="420px">
            <SectionTitle>{tr.board}</SectionTitle>
            <S.BoardGrid>
                {boardColumns.map(col => (
                    <S.BoardColumn key={col.s}>
                        <S.ColumnHeader>
                            <S.ColumnTitle>{col.t} ({col.d.length})</S.ColumnTitle>
                            {col.s !== 'done' && (
                                <S.AddTaskButton type="button" onClick={() => onAddTask(col.s)}>
                                    {tr.add}
                                </S.AddTaskButton>
                            )}
                        </S.ColumnHeader>
                        <S.CardList>
                            {col.d.map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    allTasks={tasks}
                                    onEdit={() => onEditTask(task)}
                                    onMove={onMoveTask}
                                    prevStatus={col.prevStatus}
                                    prevLabel={col.prevLabel}
                                    nextStatus={col.nextStatus}
                                    nextLabel={col.nextLabel}
                                />
                            ))}
                        </S.CardList>
                    </S.BoardColumn>
                ))}
            </S.BoardGrid>
        </SectionWrapper>
    );
});

CelestialProjectBoard.displayName = 'CelestialProjectBoard';
export default CelestialProjectBoard;

function TaskCard({ task, allTasks, onEdit, onMove, prevStatus, prevLabel, nextStatus, nextLabel }: { task: ProjectTaskType, allTasks: ProjectTaskType[], onEdit: () => void, onMove: (taskId: string, newStatus: string) => void, prevStatus: string | null, prevLabel: string | null, nextStatus: string | null, nextLabel: string | null }) {
    const isLocked = task.blockedBy?.some(dep => {
        const currentDepTask = allTasks.find(t => t.id === dep.id);
        return currentDepTask ? currentDepTask.status !== 'done' : false;
    });

    const t = useT();
    const tr = t.project;
    const priorityLabel = task.priority === 'high' ? tr.priorityHigh : task.priority === 'low' ? tr.priorityLow : tr.priorityMid;
    const isDone = task.status === 'done';

    return (
        <S.CardBox onClick={onEdit} $isLocked={isLocked}>
            <S.CardMain>
                <S.CardTitle $isDone={isDone}>
                    <S.PriorityTag $priority={task.priority || 'medium'}>{priorityLabel}</S.PriorityTag>
                    {isLocked && <S.LockedTag>{tr.waiting}</S.LockedTag>}
                    <span className="title-text">{task.title}</span>
                </S.CardTitle>
                <S.CardActionGroup className="action-group">
                    {!isLocked && prevStatus && prevLabel && <S.CardMoveButton onClick={e => { e.stopPropagation(); onMove(task.id, prevStatus); }}>{prevLabel}</S.CardMoveButton>}
                    {!isLocked && nextStatus && nextLabel && <S.CardMoveButton onClick={e => { e.stopPropagation(); onMove(task.id, nextStatus); }}>{nextLabel}</S.CardMoveButton>}
                </S.CardActionGroup>
            </S.CardMain>
            <S.CardMeta>
                {/* slice(5) 는 한국어 표기에만 맞아 다른 로캘에선 '/2026' 처럼 잘린다 */}
                <S.CardDate>{task.startAt ? (() => { const d = new Date(task.startAt); return t.calendar.dayLabelShort(d.getMonth() + 1, d.getDate()); })() : t.form.noDate}</S.CardDate>
                <S.CardAssignees>
                    {task.assignees && task.assignees.length > 0
                        ? task.assignees.map(a => a.name).join(', ')
                        : tr.noAssignee}
                </S.CardAssignees>
            </S.CardMeta>
        </S.CardBox>
    );
}


/** 칸 머리글의 "추가". 예전에는 인라인 style 로 40x24 가 박혀 있어
    반응형에서 !important 로만 덮을 수 있었다. */
