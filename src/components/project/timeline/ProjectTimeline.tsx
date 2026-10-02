"use client";

import * as React from 'react';
import ProjectTimelineView from './ProjectTimelineView';
import { ProjectTaskType } from '@/store/useProjectStore';

export interface ProjectTimelineProps {
    tasks: ProjectTaskType[];
    flex?: number;
    onEditTask: (task: ProjectTaskType) => void;
    onUpdateTaskDates?: (taskId: string, newStart: string, newEnd: string) => void;
    onConnectDependency?: (predecessor: string, successor: string) => Promise<string | null>;
}

const ProjectTimeline = React.forwardRef<HTMLDivElement, ProjectTimelineProps>((props, ref) => {
    return <ProjectTimelineView ref={ref} {...props} />;
});

ProjectTimeline.displayName = 'ProjectTimeline';
export default ProjectTimeline;
