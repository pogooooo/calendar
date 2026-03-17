"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialTodoModal from "./celestial/CelestialTodoModal";
import { CategoryType, TodoType } from "@/types/calendar";

export interface TodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    todo?: TodoType | null; // 값이 있으면 '수정', 없으면 '생성'
    categories: CategoryType[];
    selectedDate?: Date; // 달력에서 특정 날짜를 클릭해 모달을 열 때 기본 날짜로 사용
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