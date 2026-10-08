"use client";

import React, { useEffect, useState, useMemo } from "react";
import useCategoryStore from "@/store/useCategoryStore";
import useTodoStore from "@/store/useTodoStore";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { readError } from "@/lib/readError";
import { bustFetchCache } from "@/lib/fetchOnce";
import useAuthStore from "@/store/useAuthStore";
import { useDialog } from "@/components/dialog/DialogProvider";
import { useT } from "@/i18n/useT";
import type { AuthFetch, CategoryType, TodoType } from "@/types";

import CategoryView from "./CategoryView";
import CategoryAddModal from "@/components/modal/categoryAddModal/CategoryAddModal";
import TodoModal from "@/components/modal/todoModal/TodoModal";

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
    toggleTodo: (authFetch: AuthFetch, todoId: string, targetDate: string) => void;
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
    const { categories, deleteCategory, updateCategory, addCategory, fetchCategories } = useCategoryStore();
    const { todos, toggleTodo, deleteTodo, fetchTodos } = useTodoStore();
    const authFetch = useAuthFetch();
    const dialog = useDialog();
    const t = useT();

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
    // 객체 참조가 아니라 실제로 바뀐 값에만 반응한다 (저장 응답으로 객체가 새로 와도 입력 중인 내용을 덮지 않게)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory?.id, selectedCategory?.name, selectedCategory?.color, selectedCategory?.description]);

    const openInviteModal = () => {
        setInviteEmail("");
        setInviteError("");
        setIsInviteModalOpen(true);
    };

    const closeInviteModal = () => setIsInviteModalOpen(false);
    const closeKickModal = () => setKickTarget(null);

    const handleAddCategorySubmit = async (data: { name: string; color: string; description: string }) => {
        const error = await addCategory(authFetch, data);
        if (error) { await dialog.notify({ title: t.category.addFailedTitle, message: error }); return false; }
        return true;
    };

    const handleInviteSubmit = async () => {
        if (!selectedCategory) return;
        setInviteError("");

        const email = inviteEmail.trim();
        if (!email) {
            setInviteError(t.category.emailRequired);
            return;
        }
        if (selectedCategory.participants?.some((p: { email: string }) => p.email === email)) {
            setInviteError(t.category.alreadyMember);
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
                setInviteError(errorData.message || t.category.inviteFailed);
                return;
            }

            // 목록을 다시 받지 않으면 초대해도 화면에 멤버가 나타나지 않는다 (방금 읽었어도 건너뛰지 않게)
            bustFetchCache("category");
            await fetchCategories(authFetch);
            closeInviteModal();
        } catch {
            setInviteError(t.alert.serverError);
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

            if (!res.ok) {
                await dialog.notify({ title: t.category.kickFailedTitle, message: await readError(res, t.alert.retryLater) });
                return;
            }
            // 방금 읽었어도 다시 읽는다 — 1.5초 안에 읽은 적이 있으면 읽기를 건너뛰어 내보낸 사람이 남아 보일 수 있다
            bustFetchCache("category");
            await fetchCategories(authFetch);
            // 나 자신이 나갔으면 그 카테고리의 할 일도 이제 내 것이 아니다
            if (kickTarget.id === useAuthStore.getState().user?.id) {
                bustFetchCache("todo");
                void fetchTodos(authFetch);
                setSelectedCategoryId(null);
            }
            closeKickModal();
        } catch (err) {
            console.error(err);
            await dialog.notify({ title: t.category.kickFailedTitle, message: t.alert.checkConnection });
        }
    };

    const handleDescriptionBlur = async () => {
        if (!selectedCategory) return;
        const trimmedDesc = editDescription.trim();
        if (trimmedDesc === (selectedCategory.description || "")) return;
        const error = await updateCategory(authFetch, selectedCategory.id, { description: trimmedDesc });
        if (error) await dialog.notify({ title: t.alert.saveFailed, message: error });
    };

    const handleNameBlur = async () => {
        if (!selectedCategory) return;
        const trimmedName = editName.trim();
        if (trimmedName === "" || trimmedName === selectedCategory.name) {
            setEditName(selectedCategory.name);
            return;
        }
        const error = await updateCategory(authFetch, selectedCategory.id, { name: trimmedName });
        if (error) { setEditName(selectedCategory.name); await dialog.notify({ title: t.alert.saveFailed, message: error }); }
    };

    const handleColorBlur = async () => {
        if (!selectedCategory) return;
        if (editColor === selectedCategory.color) return;
        const error = await updateCategory(authFetch, selectedCategory.id, { color: editColor });
        if (error) await dialog.notify({ title: t.alert.saveFailed, message: error });
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') e.currentTarget.blur();
    };

    const handleDelete = async (categoryId: string) => {
        const ok = await dialog.confirmDanger({
            title: t.category.deleteTitle,
            message: t.category.deleteMessage,
        });
        if (!ok) return;
        const error = await deleteCategory(authFetch, categoryId);
        if (error) { await dialog.notify({ title: t.alert.deleteFailed, message: error }); return; }
        if (selectedCategoryId === categoryId) setSelectedCategoryId(null);
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
            <CategoryView {...themeProps} />

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