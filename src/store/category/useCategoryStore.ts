import { create } from 'zustand';

export interface ParticipantType {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

export interface CategoryType {
    id: string;
    name: string;
    color: string;
    description?: string | null;
    creatorId?: string;
    creatorName?: string;
    participants?: ParticipantType[];
}

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

interface CategoryState {
    categories: CategoryType[];
    isLoading: boolean;
    error: string | null;

    fetchCategories: (authFetch: AuthFetch) => Promise<void>;
    addCategory: (authFetch: AuthFetch, data: { name: string; color: string; description?: string }) => Promise<void>;
    updateCategory: (authFetch: AuthFetch, categoryId: string, data: Partial<{
        name: string;
        color: string;
        description: string;
        addParticipantEmail: string;
        removeParticipantId: string
    }>) => Promise<void>;
    deleteCategory: (authFetch: AuthFetch, categoryId: string) => Promise<void>;
}

const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,
    error: null,

    fetchCategories: async (authFetch: AuthFetch) => {
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
            if (res.ok) {
                const newCat = await res.json();
                set((state) => ({ categories: [...state.categories, newCat] }));
            }
        } catch (err) {
            console.error("[CATEGORY_ADD_ERROR]", err);
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

            if (res.ok) {
                const updatedCat = await res.json();
                set((state) => ({
                    categories: state.categories.map(c => c.id === id ? updatedCat : c)
                }));
            } else {
                throw new Error();
            }
        } catch (err) {
            set({ categories: prev });
            console.error("[CATEGORY_PATCH_ERROR]", err);
        }
    },

    deleteCategory: async (authFetch, categoryId) => {
        const prev = get().categories;
        set((state) => ({ categories: state.categories.filter(c => c.id !== categoryId) }));

        try {
            const res = await authFetch(`/api/category?id=${categoryId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ categories: prev });
            console.error("[CATEGORY_DELETE_ERROR]", err);
        }
    }
}));

export default useCategoryStore;