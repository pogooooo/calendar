"use client";

import * as React from 'react';
import type { CategoryType } from "@/types";
import ProjectHeaderView from './ProjectHeaderView';
import { ProjectType } from '@/store/useProjectStore';

export interface ProjectHeaderProps {
    selectedProject: ProjectType | undefined;
    selectedCategory: CategoryType | undefined;
    projects: ProjectType[];
    selectedProjectId: string | null;
    onSelectProject: (id: string) => void;
    onOpenSettings: () => void;
    onOpenNewProject: () => void;
}

const ProjectHeader = React.forwardRef<HTMLDivElement, ProjectHeaderProps>((props, ref) => {
    return <ProjectHeaderView ref={ref} {...props} />;
});

ProjectHeader.displayName = 'ProjectHeader';

export default ProjectHeader;