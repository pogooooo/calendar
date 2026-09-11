"use client";

import * as React from 'react';
import type { CategoryType } from "@/types";
import { usePickTheme } from "@/styles/themed";
import CelestialProjectHeader from './celestial/CelestialProjectHeader';
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
    const ProjectHeaderView = usePickTheme({ celestial: CelestialProjectHeader });

    return <ProjectHeaderView ref={ref} {...props} />;
});

ProjectHeader.displayName = 'ProjectHeader';

export default ProjectHeader;