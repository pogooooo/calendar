"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTheme } from "styled-components";
import useCategoryStore, { CategoryType } from "@/store/useCategoryStore";
import useTodoStore, { TodoType } from "@/store/useTodoStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";

import CelestialCategory from "./celestial/CelestialCategory";
import CategoryAddModal from "@/components/modal/categoryAddModal/CategoryAddModal";
import TodoModal from "@/components/modal/todoModal/TodoModal";

export type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

export interface CategoryThemeProps {
    categories: CategoryType[];
    selectedCategory: CategoryType | undefined;
    selectedCategoryId: string | null;
    setSelectedCategoryId: (id: string | null) => void;
    activeTab: 'info' | 'todos';
    setActiveTab: (tab: 'info' | 'todos') => void;
    editName: string;
    setEditName: (name: string) => void;
    editColor: string;
    setEditColor: (color: string) => void;
    editDescription: string;
    setEditDescription: (desc: string) => void;
    handleNameBlur: () => void;
    handleColorBlur: () => void;
    handleDescriptionBlur: () => void;
    handleNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleDelete: (categoryId: string) => void;
    categoryTodos: TodoType[];
    handleEditTodo: (todo: TodoType) => void;
    toggleTodo: (authFetch: AuthFetch, todoId: string) => void;
    deleteTodo: (authFetch: AuthFetch, todoId: string) => void;
    authFetch: AuthFetch;

    openInviteModal: () => void;
    closeInviteModal: () => void;
    isInviteModalOpen: boolean;
    inviteEmail: string;
    setInviteEmail: (email: string) => void;
    handleInviteSubmit: () => void;
    inviteError: string;

    kickTarget: { id: string, name: string } | null;
    setKickTarget: (target: { id: string, name: string } | null) => void;
    closeKickModal: () => void;
    handleKickSubmit: () => void;

    setIsAddModalOpen: (isOpen: boolean) => void;
}

export default function CategoryPage() {
    const theme = useTheme();
    const themeName = theme?.name || 'celestial';

    const { categories, deleteCategory, updateCategory, addCategory } = useCategoryStore();
    const { todos, toggleTodo, deleteTodo } = useTodoStore();
    const authFetch = useAuthFetch();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'todos'>('info');
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteError, setInviteError] = useState("");
    const [kickTarget, setKickTarget] = useState<{ id: string, name: string } | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
    const [selectedTodo, setSelectedTodo] = useState<TodoType | null>(null);

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    const categoryTodos = useMemo(() => {
        if (!selectedCategory) return [];
        return todos.filter(t => t.categoryId === selectedCategory.id);
    }, [todos, selectedCategory]);

    useEffect(() => {
        setActiveTab('info');
    }, [selectedCategoryId]);

    useEffect(() => {
        if (selectedCategory) {
            setEditName(selectedCategory.name);
            setEditColor(selectedCategory.color);
            setEditDescription(selectedCategory.description || "");
        }
    }, [selectedCategory?.id, selectedCategory?.name, selectedCategory?.color, selectedCategory?.description]);

    const openInviteModal = () => {
        setInviteEmail("");
        setInviteError("");
        setIsInviteModalOpen(true);
    };

    const closeInviteModal = () => setIsInviteModalOpen(false);
    const closeKickModal = () => setKickTarget(null);

    const handleAddCategorySubmit = async (data: { name: string; color: string; description: string }) => {
        await addCategory(authFetch, data);
    };

    const handleInviteSubmit = async () => {
        if (!selectedCategory) return;
        setInviteError("");

        const email = inviteEmail.trim();
        if (!email) {
            setInviteError("이메일을 입력해주세요.");
            return;
        }
        if (selectedCategory.participants?.some((p: { email: string }) => p.email === email)) {
            setInviteError("이미 참여 중인 멤버입니다.");
            return;
        }

        try {
            const res = await authFetch('/api/category', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedCategory.id, addParticipantEmail: email }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setInviteError(errorData.message || "초대에 실패했습니다.");
                return;
            }

            closeInviteModal();
        } catch (err) {
            setInviteError("서버 오류가 발생했습니다.");
        }
    };

    const handleKickSubmit = async () => {
        if (!selectedCategory || !kickTarget) return;

        try {
            const res = await authFetch('/api/category', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedCategory.id, removeParticipantId: kickTarget.id }),
            });

            if (res.ok) {
                closeKickModal();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDescriptionBlur = async () => {
        if (!selectedCategory) return;
        const trimmedDesc = editDescription.trim();
        if (trimmedDesc === (selectedCategory.description || "")) return;
        await updateCategory(authFetch, selectedCategory.id, { description: trimmedDesc });
    };

    const handleNameBlur = async () => {
        if (!selectedCategory) return;
        const trimmedName = editName.trim();
        if (trimmedName === "" || trimmedName === selectedCategory.name) {
            setEditName(selectedCategory.name);
            return;
        }
        await updateCategory(authFetch, selectedCategory.id, { name: trimmedName });
    };

    const handleColorBlur = async () => {
        if (!selectedCategory) return;
        if (editColor === selectedCategory.color) return;
        await updateCategory(authFetch, selectedCategory.id, { color: editColor });
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') e.currentTarget.blur();
    };

    const handleDelete = async (categoryId: string) => {
        if (window.confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
            await deleteCategory(authFetch, categoryId);
            if (selectedCategoryId === categoryId) setSelectedCategoryId(null);
        }
    };

    const handleEditTodo = (todo: TodoType) => {
        setSelectedTodo(todo);
        setIsTodoModalOpen(true);
    };

    const themeProps: CategoryThemeProps = {
        categories, selectedCategory, selectedCategoryId, setSelectedCategoryId,
        activeTab, setActiveTab, editName, setEditName, editColor, setEditColor,
        editDescription, setEditDescription, handleNameBlur, handleColorBlur,
        handleDescriptionBlur, handleNameKeyDown, handleDelete, categoryTodos,
        handleEditTodo, toggleTodo, deleteTodo, authFetch,
        openInviteModal, closeInviteModal, isInviteModalOpen, inviteEmail,
        setInviteEmail, handleInviteSubmit, inviteError,
        kickTarget, setKickTarget, closeKickModal, handleKickSubmit,
        setIsAddModalOpen
    };

    return (
        <>
            {themeName === 'celestial' ? (
                <CelestialCategory {...themeProps} />
            ) : (
                <CelestialCategory {...themeProps} />
            )}

            <CategoryAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddCategorySubmit}
            />

            <TodoModal
                isOpen={isTodoModalOpen}
                onClose={() => setIsTodoModalOpen(false)}
                todo={selectedTodo}
                categories={categories}
            />
        </>
    );
}