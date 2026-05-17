"use client";

import * as React from "react";
import { useTheme } from "styled-components";
import CelestialChallengeModal from "./celestial/CelestialChallengeModal";
import { CategoryType } from "@/store/useCategoryStore";

export interface ChallengeData {
    title: string;
    description: string | null;
    interval: number;
    targetCount: number | null;
    categoryId: string;
}

export interface ChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryType[];
    initialData: (ChallengeData & { id: string }) | null;
    onSave: (data: ChallengeData) => Promise<void>;
}

export interface ChallengeThemeProps extends ChallengeModalProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    interval: number;
    setInterval: (interval: number) => void;
    targetCount: string;
    setTargetCount: (targetCount: string) => void;
    categoryId: string;
    setCategoryId: (categoryId: string) => void;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => void;
}

export default function ChallengeModal(props: ChallengeModalProps) {
    const { isOpen, onClose, categories, initialData, onSave } = props;
    const theme = useTheme();
    const themeName = theme?.name || "celestial";

    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [interval, setInterval] = React.useState<number>(1);
    const [targetCount, setTargetCount] = React.useState<string>("");
    const [categoryId, setCategoryId] = React.useState<string>("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setDescription(initialData.description || "");
                setInterval(initialData.interval);
                setTargetCount(initialData.targetCount ? String(initialData.targetCount) : "");
                setCategoryId(initialData.categoryId);
            } else {
                setTitle("");
                setDescription("");
                setInterval(1);
                setTargetCount("");
                setCategoryId(categories.length > 0 ? categories[0].id : "");
            }
            setIsSubmitting(false);
        }
    }, [isOpen, initialData, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !categoryId) return alert("제목과 카테고리를 선택해주세요.");

        setIsSubmitting(true);
        try {
            await onSave({
                title,
                description: description || null,
                interval: Number(interval),
                targetCount: targetCount ? Number(targetCount) : null,
                categoryId,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const themeProps: ChallengeThemeProps = {
        ...props,
        title, setTitle,
        description, setDescription,
        interval, setInterval,
        targetCount, setTargetCount,
        categoryId, setCategoryId,
        isSubmitting, handleSubmit
    };

    switch (themeName) {
        case "celestial":
            return <CelestialChallengeModal {...themeProps} />;
        default:
            return <CelestialChallengeModal {...themeProps} />;
    }
}