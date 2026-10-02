"use client";

import * as React from 'react';
import type { UserType } from "@/types";
import ProjectModalView from './ProjectModalView';
import { ProjectType } from '@/store/useProjectStore';
import { CategoryType } from "@/store/useCategoryStore";

export interface ProjectModalProps {
    pending?: boolean;
    error?: string | null;
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Partial<ProjectType>;
    categories: CategoryType[];
    modalCategoryParticipants: UserType[];
    onClose: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    setData: (data: Partial<ProjectType>) => void;
    toggleParticipant: (user: UserType) => void;
}

export default function ProjectModal(props: ProjectModalProps) {
    if (!props.isOpen) return null;

    return <ProjectModalView {...props} />;
}
