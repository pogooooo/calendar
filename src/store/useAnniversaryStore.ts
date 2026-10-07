import { create } from 'zustand';
import { coalesce, READ_TTL } from "@/lib/fetchOnce";
import { reportSaveFailure } from "@/lib/saveError";
import { fx } from "@/lib/fx";
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
        // 같은 읽기가 겹치면 하나만 (src/lib/fetchOnce.ts)
        await coalesce("anniversary", READ_TTL, async () => {
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
        });
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
                fx.emit("add");
                return null;
            }
            const body = await res.json().catch(() => null);
            return body?.message ?? "기념일 등록에 실패했습니다.";
        } catch (err) {
            console.error("[ANNIVERSARY_ADD_ERROR]", err);
            reportSaveFailure("anniversary");
            return "기념일 등록 중 오류가 발생했습니다.";
        }
    },

    deleteAnniversary: async (authFetch, id) => {
        const previous = get().anniversaries;
        set((state) => ({ anniversaries: state.anniversaries.filter(a => a.id !== id) }));
        fx.emit("remove");

        try {
            const res = await authFetch(`/api/anniversary?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
        } catch (err) {
            set({ anniversaries: previous });
            console.error("[ANNIVERSARY_DELETE_ERROR]", err);
            reportSaveFailure("anniversary");
        }
    },
}));

export default useAnniversaryStore;
