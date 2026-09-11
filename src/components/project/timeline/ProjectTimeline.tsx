"use client";

import * as React from 'react';
import { usePickTheme } from "@/styles/themed";
import CelestialProjectTimeline from './celestial/CelestialProjectTimeline';
import { ProjectTaskType } from '@/store/useProjectStore';

export interface ProjectTimelineProps {
    tasks: ProjectTaskType[];
    flex?: number;
    onEditTask: (task: ProjectTaskType) => void;
    onUpdateTaskDates?: (taskId: string, newStart: string, newEnd: string) => void;
}

const ProjectTimeline = React.forwardRef<HTMLDivElement, ProjectTimelineProps>((props, ref) => {
    const ProjectTimelineView = usePickTheme({ celestial: CelestialProjectTimeline });

    return <ProjectTimelineView ref={ref} {...props} />;
});

ProjectTimeline.displayName = 'ProjectTimeline';
export default ProjectTimeline;