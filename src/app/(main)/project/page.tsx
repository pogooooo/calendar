'use client';

import React, { useEffect, useState, useRef } from 'react';
import useProjectStore, { ProjectType, ProjectTaskType } from '@/store/useProjectStore';
import useCategoryStore from '@/store/useCategoryStore';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useDialog } from '@/components/dialog/DialogProvider';
import { usePickTheme, type ThemeImpls } from "@/styles/themed";
import * as CelestialS from "./celestial/CelestialProjectPage.styles";
import * as MapleS from "./maple/MapleProjectPage.styles";

import ProjectHeader from '@/components/project/header/ProjectHeader';
import ProjectBoard from '@/components/project/board/ProjectBoard';
import ProjectTimeline from '@/components/project/timeline/ProjectTimeline';
import ProjectModal from '@/components/modal/projectModal/ProjectModal';
import ProjectTaskEditor, { type TaskEditTarget } from '@/components/modal/projectModal/ProjectTaskEditor';
import { useT } from "@/i18n/useT";
import EmptyArt from "@/components/empty/EmptyArt";
import CelestialProjectLayout from "./celestial/CelestialProjectLayout";
import MapleProjectLayout from "./maple/MapleProjectLayout";
import { dependencyIssue } from "@/lib/taskInteractions";
import { fromLocalInput, todayKey } from "@/lib/localTime";
import { boxesOf, useSwapMotion } from "@/hooks/useMotion";
import * as OceanS from './ocean/OceanProjectPage.styles';
import OceanProjectLayout from './ocean/OceanProjectLayout';

/** 갈래마다 제 모양. 갈래를 더하면 여기서 컴파일러가 짚는다 */
const STYLES: ThemeImpls<typeof CelestialS> = { celestial: CelestialS, maple: MapleS, ocean: OceanS };

const LAYOUTS = { celestial: CelestialProjectLayout, maple: MapleProjectLayout, ocean: OceanProjectLayout };

export default function ProjectPage() {
    const S = usePickTheme(STYLES);
    const ProjectLayout = usePickTheme(LAYOUTS);
    const authFetch = useAuthFetch();
    const dialog = useDialog();
    const t = useT();
    const { projects, fetchProjects, addProject, updateProject, deleteProject, updateProjectTaskStatus, updateProjectTask } = useProjectStore();
    const { categories, fetchCategories } = useCategoryStore();

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [boardRatio, setBoardRatio] = useState<number>(50);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);
    const boardRatioRef = useRef<number>(50);
    const layoutRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const [projectModal, setProjectModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<ProjectType> }>({
        isOpen: false, mode: 'add', data: { id: '', title: '', description: '', categoryId: '', assignees: [] }
    });

    // 할 일 창은 달력과 같은 것을 쓴다 (저장·삭제·담당자·선행 조건까지 그 안에서)
    const [taskTarget, setTaskTarget] = useState<TaskEditTarget | null>(null);

    useEffect(() => {
        fetchProjects(authFetch);
        fetchCategories(authFetch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (projects.length === 0) return;
        // 고른 프로젝트가 목록에서 사라지면 첫 것으로. 예전엔 처음 만든 프로젝트를 임시 id 로 골라 둔 채 서버 id 로 바뀌어서
        // 탭은 생겼는데 "프로젝트 없음"만 보였다 (다른 창에서 카테고리를 지우거나 나갔을 때도 같았다)
        if (selectedProjectId && projects.some(p => p.id === selectedProjectId)) return;
        const wanted = new URLSearchParams(window.location.search).get('id');
        setSelectedProjectId(projects.some(p => p.id === wanted) ? wanted : projects[0].id);
    }, [projects, selectedProjectId]);

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    // 다른 프로젝트를 고르면 보드·타임라인이 그 탭의 차례 쪽(오른쪽 탭이면 오른쪽)에서 들어온다 — 그려지는 판 하나하나를
    // (바다의 보드는 상자를 벗고 칸 셋이 판이다 — boxesOf). 처음 고를 때는 움직이지 않는다
    useSwapMotion(selectedProjectId, () => [...boxesOf(boardRef.current), ...boxesOf(timelineRef.current)], { order: projects.map(p => p.id) });
    const tasks = selectedProject?.tasks || [];
    const selectedCategory = categories.find(c => c.id === selectedProject?.categoryId);
    const modalCategory = categories.find(c => c.id === projectModal.data.categoryId);
    const modalCategoryParticipants = modalCategory?.participants || [];
    useEffect(() => { setSaveError(null); }, [projectModal.isOpen, projectModal.data.id]);

    const handleMouseDownResizer = (e: React.MouseEvent) => {
        e.preventDefault();
        let rafId: number | null = null;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (!layoutRef.current) return;
                const { top, height } = layoutRef.current.getBoundingClientRect();
                const pointerRatio = ((moveEvent.clientY - top) / height) * 100;
                const newRatio = Math.min(Math.max(layoutRef.current.dataset.boardFirst === "false" ? 100 - pointerRatio : pointerRatio, 20), 80);
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
        if (savingRef.current) return;
        if (!projectModal.data.categoryId) {
            await dialog.notify({ title: t.form.categoryRequiredTitle, message: t.form.categoryRequiredMsg });
            return;
        }
        // 담당자는 사람 그대로 넘긴다 — id 로 바꾸는 건 저장소가 보낼 때 (useProjectStore toWire)
        const projectData = { ...projectModal.data };

        savingRef.current = true;
        setSaving(true);
        setSaveError(null);
        try {
            const error = projectModal.mode === 'add'
                ? await addProject(authFetch, projectData)
                : await updateProject(authFetch, projectModal.data.id!, projectData);
            setSaveError(error);
            if (!error) setProjectModal(prev => ({ ...prev, isOpen: false }));
        } finally { savingRef.current = false; setSaving(false); }
    };

    const handleDeleteProject = async () => {
        const { id, title } = projectModal.data;
        if (!id || savingRef.current) return;
        const ok = await dialog.confirmDanger({ title: t.project.deleteProjectConfirm, message: t.project.deleteProjectMsg(title || "") });
        if (!ok) return;
        setProjectModal(prev => ({ ...prev, isOpen: false }));
        // 바로 목록에서 빼고, 실패하면 되돌리며 알린다 (저장소가 한다)
        await deleteProject(authFetch, id);
    };

    const handleMoveTaskStatus = async (taskId: string, newStatus: string) => {
        if (!selectedProjectId) return;
        await updateProjectTaskStatus(authFetch, selectedProjectId, taskId, newStatus);
    };

    const openTaskEdit = (task: ProjectTaskType) => {
        if (selectedProjectId) setTaskTarget({ projectId: selectedProjectId, taskId: task.id });
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
                    data: { id: selectedProject!.id, title: selectedProject!.title, description: selectedProject!.description || '', categoryId: selectedProject!.categoryId, assignees: selectedProject!.assignees || [], startAt: selectedProject!.startAt ?? null, endAt: selectedProject!.endAt ?? null }
                })}
                // 새 프로젝트는 오늘 하루짜리로 시작한다 — 기간이 있어야 만들자마자 달력에 선다 (끄거나 늘릴 수 있다)
                onOpenNewProject={() => setProjectModal({ isOpen: true, mode: 'add', data: { id: '', title: '', description: '', categoryId: '', assignees: [], startAt: fromLocalInput(todayKey(), "00:00"), endAt: fromLocalInput(todayKey(), "23:59") } })}
            />


            {!selectedProject && (
                <S.Empty>
                    <EmptyArt kind="projects" />
                    {t.home.noProjects}
                </S.Empty>
            )}

            {selectedProject && (
                <ProjectLayout containerRef={layoutRef} board={(<ProjectBoard
                        ref={boardRef}
                        flex={boardRatio}
                        tasks={tasks}
                        onAddTask={(status) => { if (selectedProjectId) setTaskTarget({ projectId: selectedProjectId, defaults: { status } }); }}
                        onEditTask={openTaskEdit}
                        onMoveTask={handleMoveTaskStatus}
                    />)} timeline={(<ProjectTimeline
                        ref={timelineRef}
                        flex={100 - boardRatio}
                        tasks={tasks}
                        onEditTask={openTaskEdit}
                        onConnectDependency={async (from, to) => {
                            if (!selectedProjectId) return t.interaction.linkInvalid;
                            const issue = dependencyIssue(tasks, from, to);
                            if (issue) return issue === 'duplicate' ? t.interaction.linkDuplicate : t.interaction.linkInvalid;
                            const target = tasks.find(t => t.id === to)!;
                            const predecessor = tasks.find(t => t.id === from)!;
                            return updateProjectTask(authFetch, selectedProjectId, to, { blockedBy: [...(target.blockedBy ?? []), predecessor] });
                        }}
                        onUpdateTaskDates={async (taskId, newStart, newEnd) => {
                            if (!selectedProjectId) return;
                            await updateProjectTask(authFetch, selectedProjectId, taskId, { startAt: newStart, endAt: newEnd });
                        }}
                    />)} resizer={(<S.Resizer onMouseDown={handleMouseDownResizer} />)} />
            )}

            <ProjectTaskEditor target={taskTarget} onClose={() => setTaskTarget(null)} />

            <ProjectModal
                pending={saving}
                error={saveError}
                isOpen={projectModal.isOpen}
                mode={projectModal.mode}
                data={projectModal.data}
                categories={categories}
                modalCategoryParticipants={modalCategoryParticipants}
                onClose={() => { if (!savingRef.current) setProjectModal(prev => ({ ...prev, isOpen: false })); }}
                onSave={handleSaveProject}
                onDelete={projectModal.mode === 'edit' ? handleDeleteProject : undefined}
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
