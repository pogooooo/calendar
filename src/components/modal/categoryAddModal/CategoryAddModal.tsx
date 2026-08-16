"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialCategoryAddModal from "./celestial/CelestialCategoryAddModal";
import { useDialog } from "@/components/dialog/DialogProvider";

export interface CategoryAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: { name: string; color: string; description: string }) => Promise<void>;
}

export interface CategoryAddThemeProps extends CategoryAddModalProps {
    name: string;
    setName: (name: string) => void;
    color: string;
    setColor: (color: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => void;
}

export default function CategoryAddModal(props: CategoryAddModalProps) {
    const { isOpen, onClose, onAdd } = props;
    const theme = useTheme();
    const themeName = theme?.name || "celestial";
    const dialog = useDialog();

    const [name, setName] = React.useState("");
    const [color, setColor] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setName("");
            setColor('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
            setDescription("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            await dialog.notify({ title: "이름을 입력해주세요", message: "카테고리를 구분할 이름이 필요합니다." });
            return;
        }

        setIsSubmitting(true);
        try {
            await onAdd({ name: trimmedName, color, description: description.trim() });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const themeProps: CategoryAddThemeProps = {
        ...props,
        name, setName,
        color, setColor,
        description, setDescription,
        isSubmitting, handleSubmit
    };

    switch (themeName) {
        case "celestial":
            return <CelestialCategoryAddModal {...themeProps} />;
        default:
            return <CelestialCategoryAddModal {...themeProps} />;
    }
}