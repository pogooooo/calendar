"use client";

import * as React from "react";
import CategoryAddModalView from "./CategoryAddModalView";
import { useDialog } from "@/components/dialog/DialogProvider";
import { useT } from "@/i18n/useT";

export interface CategoryAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** 넣었으면 true — 실패하면 창을 닫지 않는다 (적던 이름·설명이 남게) */
    onAdd: (data: { name: string; color: string; description: string }) => Promise<boolean>;
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
    const { isOpen, onClose, onAdd } = props;    const dialog = useDialog();
    const t = useT();

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
            await dialog.notify({ title: t.form.nameRequiredTitle, message: t.form.nameRequiredMsg });
            return;
        }

        setIsSubmitting(true);
        try {
            if (await onAdd({ name: trimmedName, color, description: description.trim() })) onClose();
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

    return <CategoryAddModalView {...themeProps} />;
}