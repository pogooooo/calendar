"use client";

import * as React from 'react';
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import { ProjectBoardProps } from '../ProjectBoard';
import { ProjectTaskType } from '@/store/useProjectStore';
import styled, { css } from "styled-components";
import { TOUCH } from "@/styles/breakpoints";
import { celestial_corner_accent } from "@/styles/celestial_theme";

const CelestialProjectBoard = React.forwardRef<HTMLDivElement, ProjectBoardProps>(({
                                                                                       tasks,
                                                                                       flex,
                                                                                       onAddTask,
                                                                                       onEditTask,
                                                                                       onMoveTask
                                                                                   }, ref) => {
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const boardColumns = [
        { t: '진행 전', d: todoTasks, s: 'todo', prevStatus: null, prevLabel: null, nextStatus: 'in_progress', nextLabel: '시작' },
        { t: '진행 중', d: inProgressTasks, s: 'in_progress', prevStatus: 'todo', prevLabel: '이전', nextStatus: 'done', nextLabel: '완료' },
        { t: '완료', d: doneTasks, s: 'done', prevStatus: 'in_progress', prevLabel: '이전', nextStatus: null, nextLabel: null }
    ];

    return (
        <SectionWrapper ref={ref} style={{ flex }}>
            <SectionTitle>보드</SectionTitle>
            <BoardGrid>
                {boardColumns.map(col => (
                    <BoardColumn key={col.s}>
                        <ColumnHeader>
                            <ColumnTitle>{col.t} ({col.d.length})</ColumnTitle>
                            {col.s !== 'done' && (
                                <SecondaryButton
                                    $variant="default"
                                    style={{ width: '40px', height: '24px', fontSize: '0.7rem' }}
                                    onClick={() => onAddTask(col.s)}
                                >
                                    추가
                                </SecondaryButton>
                            )}
                        </ColumnHeader>
                        <CardList>
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
                        </CardList>
                    </BoardColumn>
                ))}
            </BoardGrid>
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

    const priorityLabel = task.priority === 'high' ? '높음' : task.priority === 'low' ? '낮음' : '보통';
    const isDone = task.status === 'done';

    return (
        <CardBox onClick={onEdit} $isLocked={isLocked}>
            <CardMain>
                <CardTitle $isDone={isDone}>
                    <PriorityTag $priority={task.priority || 'medium'}>{priorityLabel}</PriorityTag>
                    {isLocked && <LockedTag>대기</LockedTag>}
                    <span className="title-text">{task.title}</span>
                </CardTitle>
                <CardActionGroup className="action-group">
                    {!isLocked && prevStatus && prevLabel && <CardMoveButton onClick={e => { e.stopPropagation(); onMove(task.id, prevStatus); }}>{prevLabel}</CardMoveButton>}
                    {!isLocked && nextStatus && nextLabel && <CardMoveButton onClick={e => { e.stopPropagation(); onMove(task.id, nextStatus); }}>{nextLabel}</CardMoveButton>}
                </CardActionGroup>
            </CardMain>
            <CardMeta>
                {/* slice(5) 는 한국어 표기에만 맞아 다른 로캘에선 '/2026' 처럼 잘린다 */}
                <CardDate>{task.startAt ? new Date(task.startAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : '일정 없음'}</CardDate>
                <CardAssignees>
                    {task.assignees && task.assignees.length > 0
                        ? task.assignees.map(a => a.name).join(', ')
                        : '담당자 없음'}
                </CardAssignees>
            </CardMeta>
        </CardBox>
    );
}

export const SectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 150px;
    overflow: hidden;
    border: 1px solid ${(props) => props.theme.colors.primary};
    background: transparent;
    ${celestial_corner_accent}
`;

export const SectionTitle = styled.div`
    font-family: ${(props) => props.theme.fonts.celestial};
    font-size: 0.9rem;
    letter-spacing: 2px;
    color: ${(props) => props.theme.colors.textSecondary};
    padding: 8px 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary};
`;

export const BoardGrid = styled.div`
    display: flex;
    flex: 1;
    overflow-x: auto;
    background: transparent;
`;

export const BoardColumn = styled.div`
    flex: 1;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${(props) => props.theme.colors.primary}40;
    &:last-child {
        border-right: none;
    }
`;

export const ColumnHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid ${(props) => props.theme.colors.primary}33;
`;

export const ColumnTitle = styled.span`
    font-size: 0.8rem;
    color: ${(props) => props.theme.colors.textSecondary};
    font-family: ${(props) => props.theme.fonts.celestial};
`;

export const CardList = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

export const CardBox = styled.div<{ $isLocked?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 6px;
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.border};
    padding: 8px 10px;
    cursor: pointer;
    opacity: ${(props) => props.$isLocked ? 0.6 : 1};
    transition: background-color 0.2s, border-color 0.2s;

    &:hover {
        border-color: ${(props) => props.theme.colors.primary}80;
        box-shadow: 0 0 6px ${(props) => props.theme.colors.primary}40;

        .action-group {
            opacity: 1;
            pointer-events: auto;
        }
    }
`;

export const CardMain = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
`;

export const CardTitle = styled.div<{ $isDone?: boolean }>`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-family: ${(props) => props.theme.fonts.body};
    font-size: ${(props) => props.theme.fontSizes.caption};
    font-weight: ${(props) => props.theme.fontWeights.medium};
    color: ${(props) => props.$isDone ? props.theme.colors.textSecondary : props.theme.colors.text};
    text-decoration: ${(props) => props.$isDone ? 'line-through' : 'none'};
    line-height: 1.2;

    .title-text {
        flex: 1;
        word-break: keep-all;
    }
`;

export const PriorityTag = styled.span<{ $priority: string }>`
    font-size: 0.65rem;
    padding: 1px 4px;
    border: 1px solid;
    white-space: nowrap;
    color: ${(props) =>
            props.$priority === 'high' ? props.theme.colors.error :
                    props.$priority === 'low' ? props.theme.colors.textSecondary :
                            props.theme.colors.primary};
    border-color: ${(props) =>
            props.$priority === 'high' ? props.theme.colors.error :
                    props.$priority === 'low' ? props.theme.colors.textSecondary :
                            props.theme.colors.primary};
`;

export const LockedTag = styled.span`
    font-size: 0.65rem;
    color: ${(props) => props.theme.colors.textSecondary};
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.textSecondary};
    padding: 1px 4px;
    white-space: nowrap;
`;

export const CardMeta = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
`;

export const CardDate = styled.span`
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textSecondary};
`;

export const CardAssignees = styled.div`
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textSecondary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    border-left: 1px solid ${(props) => props.theme.colors.border};
    padding-left: 8px;
`;

export const CardActionGroup = styled.div`
    display: flex;
    gap: 4px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;

    ${TOUCH} {
        opacity: 1;
        pointer-events: auto;
    }
`;

export const CardMoveButton = styled.button`
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
    font-size: 0.65rem;
    padding: 2px 6px;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
    white-space: nowrap;

    &:hover {
        box-shadow: 0 0 5px ${(props) => props.theme.colors.primary}66;
    }
`;