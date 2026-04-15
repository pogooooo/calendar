"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialTodoModal from "./celestial/CelestialTodoModal";
import { CategoryType } from "@/types/calendar";
import { TodoType } from "@/store/useTodoStore"

export interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    todo?: TodoType | null;
    categories: CategoryType[];
    selectedDate?: Date;
}

export default function TodoModal(props: TodoModalProps) {
    const theme = useTheme();
    const themeName = theme?.name || "celestial";

    if (!props.isOpen) return null;

    switch (themeName) {
        case "celestial":
            return <CelestialTodoModal {...props} />;
        default:
            return <CelestialTodoModal {...props} />;
    }
}