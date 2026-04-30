"use client";

import * as React from 'react';
import { useTheme } from 'styled-components';
import CelestialProjectHeader from './celestial/CelestialProjectHeader';
import { ProjectType } from '@/store/useProjectStore';

export interface ProjectHeaderProps {
    selectedProject: ProjectType | undefined;
    selectedCategory: any;
    projects: ProjectType[];
    selectedProjectId: string | null;
    onSelectProject: (id: string) => void;
    onOpenSettings: () => void;
    onOpenNewProject: () => void;
}

const ProjectHeader = React.forwardRef<HTMLDivElement, ProjectHeaderProps>((props, ref) => {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (themeName === 'celestial') {
        return <CelestialProjectHeader ref={ref} {...props} />;
    }

    return null;
});

ProjectHeader.displayName = 'ProjectHeader';

export default ProjectHeader;