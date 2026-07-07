"use client";

import * as React from 'react';
import { useTheme } from 'styled-components';
import CelestialProjectBoard from './celestial/CelestialProjectBoard';
import BotanicalProjectBoard from './botanical/BotanicalProjectBoard';
import { ProjectTaskType } from '@/store/useProjectStore';

export interface ProjectBoardProps {
    tasks: ProjectTaskType[];
    flex?: number;
    onAddTask: (status: string) => void;
    onEditTask: (task: ProjectTaskType) => void;
    onMoveTask: (taskId: string, newStatus: string) => void;
}

const ProjectBoard = React.forwardRef<HTMLDivElement, ProjectBoardProps>((props, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName.startsWith('celestial')) {
        return <CelestialProjectBoard ref={ref} {...props} />;
    }
    if (themeName === 'botanical') {
        return <BotanicalProjectBoard ref={ref} {...props} />;
    }
    return null;
});

ProjectBoard.displayName = 'ProjectBoard';
export default ProjectBoard;