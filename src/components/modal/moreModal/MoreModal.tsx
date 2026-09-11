"use client";

import * as React from "react";
import { usePickTheme } from "@/styles/themed";
import CelestialMoreModal from "./celestial/CelestialMoreModal";
import { CategoryType } from "@/store/useCategoryStore";
import {TodoType} from "@/store/useTodoStore";

export interface MoreModalChallenge {
    id: string;
    title: string;
    isDone?: boolean;
    startAt?: string | number | Date | null;
}

export interface MoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    todos: TodoType[];
    categories: CategoryType[];
    handleContextMenu: (e: React.MouseEvent, todo: TodoType) => void;
    challenges?: MoreModalChallenge[];
    onToggleChallenge?: (challenge: MoreModalChallenge) => void;
}

export default function MoreModal(props: MoreModalProps) {
    const MoreModalView = usePickTheme({ celestial: CelestialMoreModal });

    if (!props.isOpen) return null;

    return <MoreModalView {...props} />;
}