"use client";

import * as React from 'react';
import { useTheme } from 'styled-components';
import CelestialProjectModal from './celestial/CelestialProjectModal';
import { ProjectType } from '@/store/useProjectStore';
import { CategoryType } from "@/store/useCategoryStore";

export interface ProjectModalProps {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Partial<ProjectType>;
    categories: CategoryType[];
    modalCategoryParticipants: any[];
    onClose: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    setData: (data: Partial<ProjectType>) => void;
    toggleParticipant: (user: any) => void;
}

export default function ProjectModal(props: ProjectModalProps) {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (!props.isOpen) return null;

    if (themeName === 'celestial') {
        return <CelestialProjectModal {...props} />;
    }
    return null;
}