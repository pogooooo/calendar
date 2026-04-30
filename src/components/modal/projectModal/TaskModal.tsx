"use client";

import * as React from 'react';
import { useTheme } from 'styled-components';
import CelestialTaskModal from './celestial/CelestialTaskModal';
import { ProjectTaskType } from '@/store/useProjectStore';

export interface TaskModalProps {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Partial<ProjectTaskType>;
    tasks: ProjectTaskType[];
    availableAssignees: any[];
    onClose: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    setData: (data: Partial<ProjectTaskType>) => void;
    toggleParticipant: (user: any) => void;
}

export default function TaskModal(props: TaskModalProps) {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    if (!props.isOpen) return null;

    if (themeName === 'celestial') {
        return <CelestialTaskModal {...props} />;
    }
    return null;
}