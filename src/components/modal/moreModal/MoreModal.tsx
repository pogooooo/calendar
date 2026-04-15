"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialMoreModal from "./celestial/CelestialMoreModal";
import { CategoryType } from "@/store/useCategoryStore";
import {TodoType} from "@/store/useTodoStore";

export interface MoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    todos: TodoType[];
    categories: CategoryType[];
    handleContextMenu: (e: React.MouseEvent, todo: TodoType) => void;
}

export default function MoreModal(props: MoreModalProps) {
    const theme = useTheme();
    const themeName = theme?.name || "celestial";

    if (!props.isOpen) return null;

    switch (themeName) {
        case "celestial":
            return <CelestialMoreModal {...props} />;
        default:
            return <CelestialMoreModal {...props} />;
    }
}