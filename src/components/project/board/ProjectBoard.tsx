"use client";

import * as React from 'react';
import { usePickTheme } from "@/styles/themed";
import CelestialProjectBoard from './celestial/CelestialProjectBoard';
import { ProjectTaskType } from '@/store/useProjectStore';

export interface ProjectBoardProps {
    tasks: ProjectTaskType[];
    flex?: number;
    onAddTask: (status: string) => void;
    onEditTask: (task: ProjectTaskType) => void;
    onMoveTask: (taskId: string, newStatus: string) => void;
}

const ProjectBoard = React.forwardRef<HTMLDivElement, ProjectBoardProps>((props, ref) => {
    const ProjectBoardView = usePickTheme({ celestial: CelestialProjectBoard });

    return <ProjectBoardView ref={ref} {...props} />;
});

ProjectBoard.displayName = 'ProjectBoard';
export default ProjectBoard;