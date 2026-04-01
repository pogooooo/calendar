"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialCategoryAddModal from "./celestial/CelestialCategoryAddModal";

export interface CategoryAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { name: string; color: string; description: string }) => Promise<void>;
}

export default function CategoryAddModal(props: CategoryAddModalProps) {
    const theme = useTheme();
    const themeName = theme?.name || "celestial";

    if (!props.isOpen) return null;

    switch (themeName) {
        case "celestial":
            return <CelestialCategoryAddModal {...props} />;
        default:
            return <CelestialCategoryAddModal {...props} />;
    }
}