"use client";

import * as React from 'react';
import type { UserType } from "@/types";
import ProjectModalView from './ProjectModalView';
import { ProjectType } from '@/store/useProjectStore';
import { CategoryType } from "@/store/useCategoryStore";
import useDraftClose from '@/hooks/useDraftClose';

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
    /** 고치기 창에서만 — 묻고 나서 지운다 (예전엔 프로젝트를 지울 길이 화면 어디에도 없었다) */
    onDelete?: () => void;
    setData: (data: Partial<ProjectType>) => void;
    toggleParticipant: (user: UserType) => void;
}

export default function ProjectModal(props: ProjectModalProps) {
    const baseline=React.useRef('');
    const wasOpen=React.useRef(false);
    React.useEffect(()=>{
        if(props.isOpen && !wasOpen.current) baseline.current=JSON.stringify(props.data);
        wasOpen.current=props.isOpen;
    },[props.isOpen,props.data]);
    const close=useDraftClose(props.onClose,()=>JSON.stringify(props.data)!==baseline.current,props.pending);
    if (!props.isOpen) return null;

    return <ProjectModalView {...props} onClose={()=>{void close();}} />;
}
