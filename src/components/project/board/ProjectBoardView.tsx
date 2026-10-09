"use client";

import * as React from 'react';
import { useT } from "@/i18n/useT";
import { ProjectBoardProps } from "./ProjectBoard";
import { ProjectTaskType } from '@/store/useProjectStore';
import useIsMobile from "@/hooks/useIsMobile";
import useSwipe from "@/hooks/useSwipe";
import { localDateKey } from "@/lib/dateKey";
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialProjectBoard.styles";
import * as MapleS from "./maple/MapleProjectBoard.styles";
import * as OceanS from './ocean/OceanProjectBoard.styles';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

const ProjectBoardView = React.forwardRef<HTMLDivElement, ProjectBoardProps>(({
                                                                                       tasks,
                                                                                       flex,
                                                                                       onAddTask,
                                                                                       onEditTask,
                                                                                       onMoveTask
                                                                                   }, ref) => {
    const S = usePickTheme(STYLES);
    const tr = useT().project;
    /* 폰에서는 세 칸을 옆으로 밀어 봤다 — 칸이 세 개뿐인데도 지금 어디를 보고 있는지 알기 어려웠다.
       이름표를 위에 놓고 한 칸씩 보여 준다. 화면이 세로로만 움직인다. */
    const isMobile = useIsMobile();
    const [picked, setPicked] = React.useState<string>('todo');
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const boardColumns = [
        { t: tr.colTodo,  d: todoTasks,       s: 'todo',        prevStatus: null,           prevLabel: null,          nextStatus: 'in_progress', nextLabel: tr.moveStart },
        { t: tr.colDoing, d: inProgressTasks, s: 'in_progress', prevStatus: 'todo',        prevLabel: tr.movePrev,   nextStatus: 'done',        nextLabel: tr.moveDone },
        { t: tr.colDone,  d: doneTasks,       s: 'done',        prevStatus: 'in_progress', prevLabel: tr.movePrev,   nextStatus: null,             nextLabel: null }
    ];

    const shown = isMobile ? boardColumns.filter(col => col.s === picked) : boardColumns;

    /* 이름표를 누르는 것 말고, 카드 위를 좌우로 쓸어도 옆 칸으로 간다 (달력·홈과 같은 손짓) */
    const step = (delta: number) => {
        const i = boardColumns.findIndex(c => c.s === picked);
        const next = boardColumns[Math.min(boardColumns.length - 1, Math.max(0, i + delta))];
        if (next) setPicked(next.s);
    };
    const swipe = useSwipe(() => step(1), () => step(-1));

    return (
        <S.SectionWrapper ref={ref} style={{ flex }} $mobileHeight="420px">
            <S.SectionTitle>{tr.board}</S.SectionTitle>

            {isMobile && (
                <S.ColumnPicker role="tablist" aria-label={tr.board}>
                    {boardColumns.map(col => (
                        <S.ColumnPick
                            key={col.s}
                            type="button"
                            role="tab"
                            aria-selected={picked === col.s}
                            $on={picked === col.s}
                            onClick={() => setPicked(col.s)}
                        >
                            {col.t}<em>{col.d.length}</em>
                        </S.ColumnPick>
                    ))}
                </S.ColumnPicker>
            )}

            <S.BoardGrid {...(isMobile ? swipe : {})}>
                {shown.map(col => (
                    <S.BoardColumn key={col.s}>
                        <S.ColumnHeader>
                            {/* 폰에서는 위의 이름표가 이미 말하고 있다 */}
                            {/* 개수는 따로 감싸 둔다 — 갈래마다 꼬리표로 꾸밀 수 있게 (글자는 그대로 "진행 전 (3)") */}
                            {!isMobile && <S.ColumnTitle>{col.t} <span className="count"><span className="paren">(</span>{col.d.length}<span className="paren">)</span></span></S.ColumnTitle>}
                            {col.s !== 'done' && (
                                <S.AddTaskButton type="button" onClick={() => onAddTask(col.s)}>
                                    {tr.add}
                                </S.AddTaskButton>
                            )}
                        </S.ColumnHeader>
                        <S.CardList>
                            {col.d.length === 0 && <S.ColumnEmpty>{tr.noTasks}</S.ColumnEmpty>}
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
        </S.SectionWrapper>
    );
});

ProjectBoardView.displayName = 'ProjectBoardView';
export default ProjectBoardView;

function TaskCard({ task, allTasks, onEdit, onMove, prevStatus, prevLabel, nextStatus, nextLabel }: { task: ProjectTaskType, allTasks: ProjectTaskType[], onEdit: () => void, onMove: (taskId: string, newStatus: string) => void, prevStatus: string | null, prevLabel: string | null, nextStatus: string | null, nextLabel: string | null }) {
    const S = usePickTheme(STYLES);
    const isLocked = task.blockedBy?.some(dep => {
        const currentDepTask = allTasks.find(t => t.id === dep.id);
        return currentDepTask ? currentDepTask.status !== 'done' : false;
    });

    const t = useT();
    const tr = t.project;
    const priorityLabel = task.priority === 'high' ? tr.priorityHigh : task.priority === 'low' ? tr.priorityLow : tr.priorityMid;
    const isDone = task.status === 'done';

    return (
        <S.CardBox
            onClick={onEdit}
            // 자판으로도 열리게 — 안의 옮기기 단추에서 누른 Enter 는 그 단추 몫이다
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onEdit(); } }}
            $isLocked={isLocked}
        >
            <S.CardMain>
                <S.CardTitle $isDone={isDone}>
                    <S.PriorityTag $priority={task.priority || 'medium'}>{priorityLabel}</S.PriorityTag>
                    {isLocked && <S.LockedTag>{tr.waiting}</S.LockedTag>}
                    <span className="title-text">{task.title}</span>
                </S.CardTitle>
                <S.CardActionGroup className="action-group">
                    {/* 대기(선행 조건이 안 끝남)는 앞으로만 막는다 — 이미 진행 중·완료였던 할 일에 조건이 걸리면 되돌릴 길까지 없어졌다 */}
                    {prevStatus && prevLabel && <S.CardMoveButton onClick={e => { e.stopPropagation(); onMove(task.id, prevStatus); }}>{prevLabel}</S.CardMoveButton>}
                    {!isLocked && nextStatus && nextLabel && <S.CardMoveButton onClick={e => { e.stopPropagation(); onMove(task.id, nextStatus); }}>{nextLabel}</S.CardMoveButton>}
                </S.CardActionGroup>
            </S.CardMain>
            <S.CardMeta>
                {/* slice(5) 는 한국어 표기에만 맞아 다른 로캘에선 '/2026' 처럼 잘린다 */}
                {/* 고른 시간대의 날 — 예전엔 이 기기의 날이라 시간대가 다르면 달력과 하루 어긋났다 */}
                <S.CardDate>{task.startAt ? (() => { const k = localDateKey(task.startAt); return t.calendar.dayLabelShort(Number(k.slice(5, 7)), Number(k.slice(8, 10))); })() : t.form.noDate}</S.CardDate>
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
