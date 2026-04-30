"use client";

import * as React from 'react';
import { useTheme } from 'styled-components';
import CelestialProjectTimeline from './celestial/CelestialProjectTimeline';
import { ProjectTaskType } from '@/store/useProjectStore';

export interface ProjectTimelineProps {
    tasks: ProjectTaskType[];
    flex?: number;
    onEditTask: (task: ProjectTaskType) => void;
    onUpdateTaskDates?: (taskId: string, newStart: string, newEnd: string) => void;
}

const ProjectTimeline = React.forwardRef<HTMLDivElement, ProjectTimelineProps>((props, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName === 'celestial') {
        return <CelestialProjectTimeline ref={ref} {...props} />;
    }
    return null;
});

ProjectTimeline.displayName = 'ProjectTimeline';
export default ProjectTimeline;