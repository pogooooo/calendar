'use client';

import React, { useEffect, useState, useRef } from 'react';
import useProjectStore, { ProjectType, ProjectTaskType } from '@/store/useProjectStore';
import useCategoryStore from '@/store/useCategoryStore';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import SecondaryButton from '@/components/button/secondary/SecondaryButton';
import * as S from './styles';

interface ProjectModalData { id: string; title: string; description: string; categoryId: string; assignees: any[]; }
interface TaskModalData { id: string; title: string; description: string; status: string; priority: string; startAt: string; endAt: string; blockedBy: any[]; assignees: any[]; }

export default function ProjectPage() {
    const authFetch = useAuthFetch();
    const { projects, fetchProjects, addProject, updateProject, addProjectTask, updateProjectTaskStatus, updateProjectTask } = useProjectStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [boardRatio, setBoardRatio] = useState<number>(50);
    const layoutRef = useRef<HTMLDivElement>(null);

    const [projectModal, setProjectModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: ProjectModalData }>({
        isOpen: false, mode: 'add', data: { id: '', title: '', description: '', categoryId: '', assignees: [] }
    });

    const [taskModal, setTaskModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: TaskModalData }>({
        isOpen: false, mode: 'add', data: { id: '', title: '', description: '', status: 'todo', priority: 'medium', startAt: '', endAt: '', blockedBy: [], assignees: [] }
    });

    useEffect(() => {
        fetchProjects(authFetch);
        fetchCategories(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) setSelectedProjectId(projects[0].id);
    }, [projects, selectedProjectId]);

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const tasks = selectedProject?.tasks || [];
    const selectedCategory = categories.find(c => c.id === selectedProject?.categoryId);
    const availableAssignees = selectedCategory?.participants || [];

    const modalCategory = categories.find(c => c.id === projectModal.data.categoryId);
    const modalCategoryParticipants = modalCategory?.participants || [];

    const handleMouseDownResizer = (e: React.MouseEvent) => {
        e.preventDefault();
        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!layoutRef.current) return;
            const { top, height } = layoutRef.current.getBoundingClientRect();
            const newRatio = ((moveEvent.clientY - top) / height) * 100;
            setBoardRatio(Math.min(Math.max(newRatio, 20), 80));
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectModal.data.categoryId) return;

        const projectData = {
            ...projectModal.data,
            assignees: projectModal.data.assignees?.map(a => a.id) as any
        };

        if (projectModal.mode === 'add') await addProject(authFetch, projectData);
        else if (projectModal.data.id) await updateProject(authFetch, projectModal.data.id, projectData);

        setProjectModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) return;

        if (taskModal.mode === 'add') {
            await addProjectTask(authFetch, selectedProjectId, taskModal.data);
        } else if (taskModal.data.id) {
            await updateProjectTask(authFetch, selectedProjectId, taskModal.data.id, taskModal.data);
        }
        setTaskModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleMoveTaskStatus = async (taskId: string, newStatus: string) => {
        if (!selectedProjectId) return;
        await updateProjectTaskStatus(authFetch, selectedProjectId, taskId, newStatus);
    };

    const openTaskEdit = (task: ProjectTaskType) => {
        setTaskModal({
            isOpen: true, mode: 'edit',
            data: {
                id: task.id, title: task.title, description: task.description || '', status: task.status, priority: task.priority || 'medium',
                startAt: task.startAt || '', endAt: task.endAt || '',
                blockedBy: task.blockedBy || [],
                assignees: task.assignees || []
            }
        });
    };

    const toggleParticipant = (user: any, isProjectModal: boolean) => {
        if (isProjectModal) {
            const isSelected = projectModal.data.assignees.some(a => a.id === user.id);
            const newAssignees = isSelected
                ? projectModal.data.assignees.filter(a => a.id !== user.id)
                : [...projectModal.data.assignees, user];
            setProjectModal({ ...projectModal, data: { ...projectModal.data, assignees: newAssignees } });
        } else {
            const isSelected = taskModal.data.assignees.some(a => a.id === user.id);
            const newAssignees = isSelected
                ? taskModal.data.assignees.filter(a => a.id !== user.id)
                : [...taskModal.data.assignees, user];
            setTaskModal({ ...taskModal, data: { ...taskModal.data, assignees: newAssignees } });
        }
    };

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    const ROW_HEIGHT = 48;
    const DAY_WIDTH = 48;
    const today = new Date();
    const timelineStart = new Date(today.setHours(0, 0, 0, 0));
    timelineStart.setDate(timelineStart.getDate() - 3);

    const timelineDays = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date(timelineStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const taskIndexMap = new Map(tasks.map((t, idx) => [t.id, idx]));

    const boardColumns = [
        { t: '진행 전', d: todoTasks, s: 'todo', prevStatus: null, prevLabel: null, nextStatus: 'in_progress', nextLabel: '시작' },
        { t: '진행 중', d: inProgressTasks, s: 'in_progress', prevStatus: 'todo', prevLabel: '이전', nextStatus: 'done', nextLabel: '완료' },
        { t: '완료', d: doneTasks, s: 'done', prevStatus: 'in_progress', prevLabel: '이전', nextStatus: null, nextLabel: null }
    ];

    return (
        <S.PageContainer>
            <S.Header>
                <S.HeaderTitle>
                    <S.TitleText>프로젝트 보드</S.TitleText>
                    {selectedCategory && (
                        <S.CategoryTag $color={selectedCategory.color}>
                            {selectedCategory.name}
                        </S.CategoryTag>
                    )}
                    <S.HeaderLine />
                </S.HeaderTitle>
                <S.HeaderActions>
                    {selectedProject && (
                        <SecondaryButton
                            $variant="default"
                            onClick={() => setProjectModal({
                                isOpen: true, mode: 'edit',
                                data: {
                                    id: selectedProject.id,
                                    title: selectedProject.title,
                                    description: selectedProject.description || '',
                                    categoryId: selectedProject.categoryId,
                                    assignees: selectedProject.assignees || []
                                }
                            })}
                            $width={"150px"}
                        >
                            프로젝트 설정
                        </SecondaryButton>
                    )}
                    <SecondaryButton
                        $variant="primary"
                        $width={"150px"}
                        onClick={() => setProjectModal({ isOpen: true, mode: 'add', data: { id: '', title: '', description: '', categoryId: '', assignees: [] } })}
                    >
                        새 프로젝트
                    </SecondaryButton>
                </S.HeaderActions>
            </S.Header>

            <S.TabContainer>
                {projects.map(project => (
                    <S.Tab key={project.id} $active={project.id === selectedProjectId} onClick={() => setSelectedProjectId(project.id)}>
                        <S.TabText>{project.title}</S.TabText>
                    </S.Tab>
                ))}
            </S.TabContainer>

            {selectedProject && (
                <S.ContentLayout ref={layoutRef}>
                    <S.SectionWrapper style={{ flex: boardRatio }}>
                        <S.SectionTitle>칸반 보드</S.SectionTitle>
                        <S.BoardGrid>
                            {boardColumns.map(col => (
                                <S.BoardColumn key={col.s}>
                                    <S.ColumnHeader>
                                        <S.ColumnTitle>{col.t} ({col.d.length})</S.ColumnTitle>
                                        {col.s !== 'done' && (
                                            <SecondaryButton
                                                $variant="default"
                                                style={{ width: '40px', height: '24px', fontSize: '0.7rem' }}
                                                onClick={() => setTaskModal({ isOpen: true, mode: 'add', data: { id: '', title: '', description: '', status: col.s, priority: 'medium', startAt: '', endAt: '', blockedBy: [], assignees: [] } })}
                                            >
                                                추가
                                            </SecondaryButton>
                                        )}
                                    </S.ColumnHeader>
                                    <S.CardList>
                                        {col.d.map(task => (
                                            <TaskCard
                                                key={task.id}
                                                task={task}
                                                allTasks={tasks}
                                                onEdit={() => openTaskEdit(task)}
                                                onMove={handleMoveTaskStatus}
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

                    <S.Resizer onMouseDown={handleMouseDownResizer} />

                    <S.SectionWrapper style={{ flex: 100 - boardRatio }}>
                        <S.SectionTitle>일정 타임라인</S.SectionTitle>
                        <S.TimelineLayout>
                            <S.TimelineGridArea>
                                <S.TimelineDateHeader>
                                    {timelineDays.map((day, i) => <S.DateCell key={i}><S.DateNumber>{day.getDate()}</S.DateNumber></S.DateCell>)}
                                </S.TimelineDateHeader>

                                <S.TimelineGraphContainer>
                                    <S.TimelineBackground>
                                        {timelineDays.map((_, i) => <S.TimelineVerticalLine key={i} />)}
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

                                                const fromStart = depTask.startAt ? new Date(depTask.startAt).setHours(0,0,0,0) : new Date().setHours(0,0,0,0);
                                                const fromEnd = depTask.endAt ? new Date(depTask.endAt).setHours(0,0,0,0) : fromStart;
                                                const toStart = task.startAt ? new Date(task.startAt).setHours(0,0,0,0) : new Date().setHours(0,0,0,0);

                                                const fromLeft = Math.floor((fromEnd - timelineStart.getTime()) / 86400000) + 1;
                                                const toLeft = Math.floor((toStart - timelineStart.getTime()) / 86400000);

                                                const x1 = fromLeft * DAY_WIDTH;
                                                const y1 = fromIdx * ROW_HEIGHT + (ROW_HEIGHT / 2);
                                                const x2 = toLeft * DAY_WIDTH;
                                                const y2 = toIdx * ROW_HEIGHT + (ROW_HEIGHT / 2);

                                                return <S.DependencyLine key={`line-${dep.id}-${task.id}`} d={`M ${x1} ${y1} C ${x1 + 20} ${y1}, ${x2 - 20} ${y2}, ${x2} ${y2}`} />;
                                            });
                                        })}
                                    </S.DependencySvg>

                                    {tasks.map(task => {
                                        const startTs = task.startAt ? new Date(task.startAt).setHours(0,0,0,0) : new Date().setHours(0,0,0,0);
                                        const endTs = task.endAt ? new Date(task.endAt).setHours(0,0,0,0) : startTs;

                                        const left = Math.floor((startTs - timelineStart.getTime()) / 86400000);
                                        const width = Math.max(1, Math.floor((endTs - startTs) / 86400000) + 1);
                                        const top = (taskIndexMap.get(task.id) || 0) * ROW_HEIGHT;

                                        return (
                                            <S.TaskNode key={task.id} $left={left * DAY_WIDTH} $top={top} $width={width * DAY_WIDTH} $status={task.status} onClick={() => openTaskEdit(task)}>
                                                <S.TaskNodeText>{task.title}</S.TaskNodeText>
                                            </S.TaskNode>
                                        );
                                    })}
                                </S.TimelineGraphContainer>
                            </S.TimelineGridArea>
                        </S.TimelineLayout>
                    </S.SectionWrapper>
                </S.ContentLayout>
            )}

            {taskModal.isOpen && (
                <S.ModalOverlay>
                    <S.ModalForm onSubmit={handleSaveTask}>
                        <S.ModalHeading>{taskModal.mode === 'add' ? '할 일 추가' : '할 일 수정'}</S.ModalHeading>
                        <S.FormGroup>
                            <S.FormLabel>제목</S.FormLabel>
                            <S.FormInput required value={taskModal.data.title || ''} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, title: e.target.value } })} />
                        </S.FormGroup>
                        <S.FormRow>
                            <S.FormGroup>
                                <S.FormLabel>시작일</S.FormLabel>
                                <S.FormInput type="date" value={taskModal.data.startAt ? (taskModal.data.startAt || '').split('T')[0] : ''} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, startAt: new Date(e.target.value).toISOString() } })} />
                            </S.FormGroup>
                            <S.FormGroup>
                                <S.FormLabel>종료일</S.FormLabel>
                                <S.FormInput type="date" value={taskModal.data.endAt ? (taskModal.data.endAt || '').split('T')[0] : ''} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, endAt: new Date(e.target.value).toISOString() } })} />
                            </S.FormGroup>
                        </S.FormRow>
                        <S.FormRow>
                            <S.FormGroup>
                                <S.FormLabel>중요도</S.FormLabel>
                                <S.FormSelect value={taskModal.data.priority || 'medium'} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, priority: e.target.value } })}>
                                    <S.FormOption value="low">낮음</S.FormOption>
                                    <S.FormOption value="medium">보통</S.FormOption>
                                    <S.FormOption value="high">높음</S.FormOption>
                                </S.FormSelect>
                            </S.FormGroup>
                            <S.FormGroup>
                                <S.FormLabel>담당자 할당</S.FormLabel>
                                <S.ParticipantPicker>
                                    {availableAssignees.map(user => (
                                        <S.ParticipantItem
                                            key={user.id}
                                            $selected={taskModal.data.assignees.some(a => a.id === user.id)}
                                            onClick={() => toggleParticipant(user, false)}
                                        >
                                            {/* ✨ 아바타 이미지 태그 완전히 제거됨 */}
                                            <S.ParticipantName>{user.name}</S.ParticipantName>
                                        </S.ParticipantItem>
                                    ))}
                                </S.ParticipantPicker>
                            </S.FormGroup>
                        </S.FormRow>
                        <S.FormGroup>
                            <S.FormLabel>선행 조건 (작업 종속성)</S.FormLabel>
                            <S.FormSelectMultiple multiple value={taskModal.data.blockedBy?.map(b => b.id) || []} onChange={e => {
                                const selectedIds = Array.from(e.target.selectedOptions, opt => opt.value);
                                const selectedTasks = tasks.filter(t => selectedIds.includes(t.id));
                                setTaskModal({ ...taskModal, data: { ...taskModal.data, blockedBy: selectedTasks } });
                            }}>
                                {tasks.filter(t => t.id !== taskModal.data.id).map(t => <S.FormOption key={t.id} value={t.id}>{t.title}</S.FormOption>)}
                            </S.FormSelectMultiple>
                        </S.FormGroup>
                        <S.FormGroup>
                            <S.FormLabel>설명</S.FormLabel>
                            <S.FormTextArea value={taskModal.data.description || ''} onChange={e => setTaskModal({ ...taskModal, data: { ...taskModal.data, description: e.target.value } })} />
                        </S.FormGroup>
                        <S.ModalActions>
                            <SecondaryButton $variant="default" type="button" onClick={() => setTaskModal(prev => ({ ...prev, isOpen: false }))}>취소</SecondaryButton>
                            <SecondaryButton $variant="primary" type="submit">저장</SecondaryButton>
                        </S.ModalActions>
                    </S.ModalForm>
                </S.ModalOverlay>
            )}

            {projectModal.isOpen && (
                <S.ModalOverlay>
                    <S.ModalForm onSubmit={handleSaveProject}>
                        <S.ModalHeading>{projectModal.mode === 'add' ? '새 프로젝트' : '프로젝트 설정'}</S.ModalHeading>
                        <S.FormGroup>
                            <S.FormLabel>이름</S.FormLabel>
                            <S.FormInput required value={projectModal.data.title || ''} onChange={e => setProjectModal({ ...projectModal, data: { ...projectModal.data, title: e.target.value } })} />
                        </S.FormGroup>
                        <S.FormRow>
                            <S.FormGroup>
                                <S.FormLabel>카테고리 지정</S.FormLabel>
                                <S.FormSelect required value={projectModal.data.categoryId || ''} onChange={e => setProjectModal({ ...projectModal, data: { ...projectModal.data, categoryId: e.target.value } })}>
                                    <S.FormOption value="" disabled>선택하세요</S.FormOption>
                                    {categories.map(c => <S.FormOption key={c.id} value={c.id}>{c.name}</S.FormOption>)}
                                </S.FormSelect>
                            </S.FormGroup>
                        </S.FormRow>
                        {projectModal.data.categoryId && (
                            <S.FormGroup>
                                <S.FormLabel>프로젝트 참가자 할당</S.FormLabel>
                                <S.ParticipantPicker>
                                    {modalCategoryParticipants.map(user => (
                                        <S.ParticipantItem
                                            key={user.id}
                                            $selected={projectModal.data.assignees.some(a => a.id === user.id)}
                                            onClick={() => toggleParticipant(user, true)}
                                        >
                                            <S.ParticipantName>{user.name}</S.ParticipantName>
                                        </S.ParticipantItem>
                                    ))}
                                </S.ParticipantPicker>
                            </S.FormGroup>
                        )}
                        <S.FormGroup>
                            <S.FormLabel>설명</S.FormLabel>
                            <S.FormTextArea value={projectModal.data.description || ''} onChange={e => setProjectModal({ ...projectModal, data: { ...projectModal.data, description: e.target.value } })} />
                        </S.FormGroup>
                        <S.ModalActions>
                            <SecondaryButton $variant="default" type="button" onClick={() => setProjectModal(prev => ({ ...prev, isOpen: false }))}>취소</SecondaryButton>
                            <SecondaryButton $variant="primary" type="submit">저장</SecondaryButton>
                        </S.ModalActions>
                    </S.ModalForm>
                </S.ModalOverlay>
            )}
        </S.PageContainer>
    );
}

function TaskCard({ task, allTasks, onEdit, onMove, prevStatus, prevLabel, nextStatus, nextLabel }: { task: ProjectTaskType, allTasks: ProjectTaskType[], onEdit: () => void, onMove: any, prevStatus: string | null, prevLabel: string | null, nextStatus: string | null, nextLabel: string | null }) {

    const isLocked = task.blockedBy?.some(dep => {
        const currentDepTask = allTasks.find(t => t.id === dep.id);
        return currentDepTask ? currentDepTask.status !== 'done' : false;
    });

    const priorityLabel = task.priority === 'high' ? '높음' : task.priority === 'low' ? '낮음' : '보통';

    return (
        <S.CardBox onClick={onEdit} $isLocked={isLocked}>
            <S.CardTitle>
                {/* ✨ 중요도 태그를 다시 제목 옆(이전 위치)으로 이동했습니다 */}
                <S.PriorityTag $priority={task.priority || 'medium'}>{priorityLabel}</S.PriorityTag>
                {isLocked && <S.LockedTag>대기</S.LockedTag>}
                {task.title}
            </S.CardTitle>
            <S.CardAssignees>
                {task.assignees && task.assignees.length > 0
                    ? task.assignees.map(a => a.name).join(', ')
                    : '담당자 없음'}
            </S.CardAssignees>
            <S.CardFooter>
                <S.CardDate>{task.startAt ? new Date(task.startAt).toLocaleDateString().slice(5) : '일정 없음'}</S.CardDate>
                <S.CardActionGroup>
                    {!isLocked && prevStatus && prevLabel && <S.CardMoveButton onClick={e => { e.stopPropagation(); onMove(task.id, prevStatus); }}>{prevLabel}</S.CardMoveButton>}
                    {!isLocked && nextStatus && nextLabel && <S.CardMoveButton onClick={e => { e.stopPropagation(); onMove(task.id, nextStatus); }}>{nextLabel}</S.CardMoveButton>}
                </S.CardActionGroup>
            </S.CardFooter>
        </S.CardBox>
    );
}