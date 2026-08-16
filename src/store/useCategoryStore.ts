import { create } from 'zustand';
import type { AuthFetch, CategoryType, ParticipantType } from '@/types';
import { readError } from '@/lib/readError';

export type { CategoryType, ParticipantType };

interface CategoryState {
    categories: CategoryType[];
    isLoading: boolean;
    error: string | null;

    fetchCategories: (authFetch: AuthFetch) => Promise<void>;
    addCategory: (authFetch: AuthFetch, data: { name: string; color: string; description?: string }) => Promise<string | null>;
    updateCategory: (authFetch: AuthFetch, categoryId: string, data: Partial<{
        name: string;
        color: string;
        description: string;
        addParticipantEmail: string;
        removeParticipantId: string;
    }>) => Promise<string | null>;
    deleteCategory: (authFetch: AuthFetch, categoryId: string) => Promise<string | null>;
}

const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,
    error: null,

    fetchCategories: async (authFetch) => {
        set({ isLoading: true, error: null });
        try {
            const res = await authFetch('/api/category');
            if (!res.ok) throw new Error("카테고리 로드 실패");
            const categories = await res.json();
            set({ categories, isLoading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "카테고리 로딩 중 오류 발생";
            set({ error: message, isLoading: false });
        }
    },

    addCategory: async (authFetch, data) => {
        try {
            const res = await authFetch('/api/category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                return await readError(res, "카테고리를 추가하지 못했습니다.");
            }
            const newCat = await res.json();
            set((state) => ({ categories: [...state.categories, newCat] }));
            return null;
        } catch (err) {
            console.error("[CATEGORY_ADD_ERROR]", err);
            return "네트워크 오류로 카테고리를 추가하지 못했습니다.";
        }
    },

    updateCategory: async (authFetch, id, data) => {
        const prev = get().categories;

        set((state) => ({
            categories: state.categories.map(c =>
                c.id === id ? { ...c, ...data } : c
            )
        }));

        try {
            const res = await authFetch('/api/category', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data }),
            });

            if (!res.ok) {
                set({ categories: prev });
                return await readError(res, "카테고리를 수정하지 못했습니다.");
            }
            const updatedCat = await res.json();
            set((state) => ({
                categories: state.categories.map(c => c.id === id ? updatedCat : c)
            }));
            return null;
        } catch (err) {
            set({ categories: prev });
            console.error("[CATEGORY_PATCH_ERROR]", err);
            return "네트워크 오류로 카테고리를 수정하지 못했습니다.";
        }
    },

    deleteCategory: async (authFetch, categoryId) => {
        const prev = get().categories;
        set((state) => ({ categories: state.categories.filter(c => c.id !== categoryId) }));

        try {
            const res = await authFetch(`/api/category?id=${categoryId}`, { method: 'DELETE' });
            if (!res.ok) {
                set({ categories: prev });
                return await readError(res, "카테고리를 삭제하지 못했습니다.");
            }
            return null;
        } catch (err) {
            set({ categories: prev });
            console.error("[CATEGORY_DELETE_ERROR]", err);
            return "네트워크 오류로 카테고리를 삭제하지 못했습니다.";
        }
    }
}));

export default useCategoryStore;
