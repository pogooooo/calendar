'use client';

import React, { useEffect, useState, useRef } from 'react';
import useProjectStore, { ProjectType, ProjectTaskType } from '@/store/useProjectStore';
import useCategoryStore from '@/store/useCategoryStore';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import * as S from './styles';

import ProjectHeader from '@/components/project/header/ProjectHeader';
import ProjectBoard from '@/components/project/board/ProjectBoard';
import ProjectTimeline from '@/components/project/timeline/ProjectTimeline';
import ProjectModal from '@/components/modal/projectModal/ProjectModal';
import TaskModal from '@/components/modal/projectModal/TaskModal';

export default function ProjectPage() {
    const authFetch = useAuthFetch();
    const { projects, fetchProjects, addProject, updateProject, addProjectTask, updateProjectTaskStatus, updateProjectTask } = useProjectStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [boardRatio, setBoardRatio] = useState<number>(50);
    const boardRatioRef = useRef<number>(50);
    const layoutRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const [projectModal, setProjectModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<ProjectType> }>({
        isOpen: false, mode: 'add', data: { id: '', title: '', description: '', categoryId: '', assignees: [] }
    });

    const [taskModal, setTaskModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<ProjectTaskType> }>({
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
        let rafId: number | null = null;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (!layoutRef.current) return;
                const { top, height } = layoutRef.current.getBoundingClientRect();
                const newRatio = Math.min(Math.max(((moveEvent.clientY - top) / height) * 100, 20), 80);
                boardRatioRef.current = newRatio;
                // 직접 DOM 업데이트 — React 리렌더 없음
                if (boardRef.current)    boardRef.current.style.flex    = `${newRatio} 1 0`;
                if (timelineRef.current) timelineRef.current.style.flex = `${100 - newRatio} 1 0`;
            });
        };

        const onMouseUp = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            setBoardRatio(boardRatioRef.current); // 드래그 종료 시 단 한 번 리렌더
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectModal.data.categoryId) {
            alert("카테고리를 선택해주세요.");
            return;
        }
        const projectData = { ...projectModal.data, assignees: projectModal.data.assignees?.map(a => a.id) as any };

        if (projectModal.mode === 'add') await addProject(authFetch, projectData);
        else if (projectModal.data.id) await updateProject(authFetch, projectModal.data.id, projectData);
        setProjectModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) return;
        const taskData = { ...taskModal.data, assignees: taskModal.data.assignees?.map(a => a.id) as any };
        if (taskModal.mode === 'add') await addProjectTask(authFetch, selectedProjectId, taskData);
        else if (taskModal.data.id) await updateProjectTask(authFetch, selectedProjectId, taskModal.data.id, taskData);
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
                startAt: task.startAt || '', endAt: task.endAt || '', blockedBy: task.blockedBy || [], assignees: task.assignees || []
            }
        });
    };

    return (
        <S.PageContainer>

            <ProjectHeader
                selectedProject={selectedProject}
                selectedCategory={selectedCategory}
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onOpenSettings={() => setProjectModal({
                    isOpen: true, mode: 'edit',
                    data: { id: selectedProject!.id, title: selectedProject!.title, description: selectedProject!.description || '', categoryId: selectedProject!.categoryId, assignees: selectedProject!.assignees || [] }
                })}
                onOpenNewProject={() => setProjectModal({ isOpen: true, mode: 'add', data: { id: '', title: '', description: '', categoryId: '', assignees: [] } })}
            />


            {selectedProject && (
                <S.ContentLayout ref={layoutRef}>
                    <ProjectBoard
                        ref={boardRef}
                        flex={boardRatio}
                        tasks={tasks}
                        onAddTask={(status) => setTaskModal({ isOpen: true, mode: 'add', data: { id: '', title: '', description: '', status, priority: 'medium', startAt: '', endAt: '', blockedBy: [], assignees: [] } })}
                        onEditTask={openTaskEdit}
                        onMoveTask={handleMoveTaskStatus}
                    />

                    <S.Resizer onMouseDown={handleMouseDownResizer} />

                    <ProjectTimeline
                        ref={timelineRef}
                        flex={100 - boardRatio}
                        tasks={tasks}
                        onEditTask={openTaskEdit}
                        onUpdateTaskDates={async (taskId, newStart, newEnd) => {
                            if (!selectedProjectId) return;
                            await updateProjectTask(authFetch, selectedProjectId, taskId, { startAt: newStart, endAt: newEnd });
                        }}
                    />
                </S.ContentLayout>
            )}

            <TaskModal
                isOpen={taskModal.isOpen}
                mode={taskModal.mode}
                data={taskModal.data}
                tasks={tasks}
                availableAssignees={availableAssignees}
                onClose={() => setTaskModal(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveTask}
                setData={(d) => setTaskModal(prev => ({ ...prev, data: { ...prev.data, ...d } }))}
                toggleParticipant={(user) => {
                    const isSelected = taskModal.data.assignees?.some(a => a.id === user.id);
                    const newAssignees = isSelected ? taskModal.data.assignees?.filter(a => a.id !== user.id) : [...(taskModal.data.assignees || []), user];
                    setTaskModal(prev => ({ ...prev, data: { ...prev.data, assignees: newAssignees } }));
                }}
            />

            <ProjectModal
                isOpen={projectModal.isOpen}
                mode={projectModal.mode}
                data={projectModal.data}
                categories={categories}
                modalCategoryParticipants={modalCategoryParticipants}
                onClose={() => setProjectModal(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveProject}
                setData={(d) => setProjectModal(prev => ({ ...prev, data: { ...prev.data, ...d } }))}
                toggleParticipant={(user) => {
                    const isSelected = projectModal.data.assignees?.some(a => a.id === user.id);
                    const newAssignees = isSelected ? projectModal.data.assignees?.filter(a => a.id !== user.id) : [...(projectModal.data.assignees || []), user];
                    setProjectModal(prev => ({ ...prev, data: { ...prev.data, assignees: newAssignees } }));
                }}
            />
        </S.PageContainer>
    );
}