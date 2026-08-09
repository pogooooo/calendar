import { create } from 'zustand';
import type { AuthFetch } from '@/types';

export interface AnniversaryType {
    id: string;
    title: string;
    month: number;
    day: number;
    icon?: string | null;
}

interface AnniversaryState {
    anniversaries: AnniversaryType[];
    isLoading: boolean;

    fetchAnniversaries: (authFetch: AuthFetch) => Promise<void>;
    addAnniversary: (authFetch: AuthFetch, data: { title: string; month: number; day: number; icon?: string | null }) => Promise<string | null>;
    deleteAnniversary: (authFetch: AuthFetch, id: string) => Promise<void>;
}

const useAnniversaryStore = create<AnniversaryState>((set, get) => ({
    anniversaries: [],
    isLoading: false,

    fetchAnniversaries: async (authFetch) => {
        set({ isLoading: true });
        try {
            const res = await authFetch('/api/anniversary');
            if (res.ok) {
                const data = await res.json();
                set({ anniversaries: data, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (err) {
            console.error("[ANNIVERSARY_FETCH_ERROR]", err);
            set({ isLoading: false });
        }
    },

    addAnniversary: async (authFetch, data) => {
        try {
            const res = await authFetch('/api/anniversary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                const created = await res.json();
                set((state) => ({
                    anniversaries: [...state.anniversaries, created].sort(
                        (a, b) => a.month - b.month || a.day - b.day
                    ),
                }));
                return null;
            }
            const body = await res.json().catch(() => null);
            return body?.message ?? "기념일 등록에 실패했습니다.";
        } catch (err) {
            console.error("[ANNIVERSARY_ADD_ERROR]", err);
            return "기념일 등록 중 오류가 발생했습니다.";
        }
    },

    deleteAnniversary: async (authFetch, id) => {
        const previous = get().anniversaries;
        set((state) => ({ anniversaries: state.anniversaries.filter(a => a.id !== id) }));

        try {
            const res = await authFetch(`/api/anniversary?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ anniversaries: previous });
            console.error("[ANNIVERSARY_DELETE_ERROR]", err);
        }
    },
}));

export default useAnniversaryStore;
