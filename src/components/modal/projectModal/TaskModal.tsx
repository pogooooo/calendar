"use client";

import * as React from 'react';
import type { UserType } from "@/types";
import { usePickTheme } from "@/styles/themed";
import CelestialTaskModal from './celestial/CelestialTaskModal';
import { ProjectTaskType } from '@/store/useProjectStore';

export interface TaskModalProps {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Partial<ProjectTaskType>;
    tasks: ProjectTaskType[];
    availableAssignees: UserType[];
    onClose: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    setData: (data: Partial<ProjectTaskType>) => void;
    toggleParticipant: (user: UserType) => void;
}

export default function TaskModal(props: TaskModalProps) {
    const TaskModalView = usePickTheme({ celestial: CelestialTaskModal });

    if (!props.isOpen) return null;

    return <TaskModalView {...props} />;
}