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
    const layoutRef = useRef<HTMLDivElement>(null);

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
        const projectData = { ...projectModal.data, assignees: projectModal.data.assignees?.map(a => a.id) as any };

        if (projectModal.mode === 'add') await addProject(authFetch, projectData);
        else if (projectModal.data.id) await updateProject(authFetch, projectModal.data.id, projectData);
        setProjectModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleSaveTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProjectId) return;
        if (taskModal.mode === 'add') await addProjectTask(authFetch, selectedProjectId, taskModal.data);
        else if (taskModal.data.id) await updateProjectTask(authFetch, selectedProjectId, taskModal.data.id, taskModal.data);
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
                        flex={boardRatio}
                        tasks={tasks}
                        onAddTask={(status) => setTaskModal({ isOpen: true, mode: 'add', data: { id: '', title: '', description: '', status, priority: 'medium', startAt: '', endAt: '', blockedBy: [], assignees: [] } })}
                        onEditTask={openTaskEdit}
                        onMoveTask={handleMoveTaskStatus}
                    />

                    <S.Resizer onMouseDown={handleMouseDownResizer} />

                    <ProjectTimeline
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