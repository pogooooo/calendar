"use client";

import * as React from 'react';
import type { UserType } from "@/types";
import TaskModalView from './TaskModalView';
import { ProjectTaskType } from '@/store/useProjectStore';

export interface TaskModalProps {
    pending?: boolean;
    error?: string | null;
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Partial<ProjectTaskType>;
    tasks: ProjectTaskType[];
    availableAssignees: UserType[];
    onClose: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    /** 고칠 때만 — 있으면 왼쪽 아래에 삭제 단추가 선다 */
    onDelete?: () => void;
    setData: (data: Partial<ProjectTaskType>) => void;
    toggleParticipant: (user: UserType) => void;
}

export default function TaskModal(props: TaskModalProps) {
    if (!props.isOpen) return null;

    return <TaskModalView {...props} />;
}
