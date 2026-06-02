import { create } from 'zustand';

export interface ChallengeCompletionType {
    id: string;
    challengeId: string;
    targetDate: string | Date;
}

export interface ChallengeType {
    id: string;
    title: string;
    description?: string | null;
    startAt: string | Date;
    interval: number;
    targetCount?: number | null;
    categoryId: string;
    completions: ChallengeCompletionType[];
}

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

interface ChallengeState {
    challenges: ChallengeType[];
    isLoading: boolean;
    error: string | null;

    fetchChallenges: (authFetch: AuthFetch, categoryId?: string) => Promise<void>;
    addChallenge: (authFetch: AuthFetch, data: Partial<ChallengeType>) => Promise<void>;
    updateChallenge: (authFetch: AuthFetch, challengeId: string, data: Partial<ChallengeType>) => Promise<void>;
    deleteChallenge: (authFetch: AuthFetch, challengeId: string) => Promise<void>;
    toggleChallengeCompletion: (authFetch: AuthFetch, challengeId: string, targetDate: string) => Promise<void>;
}

const useChallengeStore = create<ChallengeState>((set, get) => ({
    challenges: [],
    isLoading: false,
    error: null,

    fetchChallenges: async (authFetch, categoryId) => {
        set({ isLoading: true, error: null });
        try {
            let url = '/api/challenge';
            if (categoryId) {
                const query = new URLSearchParams({ categoryId }).toString();
                url += `?${query}`;
            }

            const res = await authFetch(url);
            if (res.status === 401) {
                set({ isLoading: false });
                return;
            }
            if (!res.ok) throw new Error("챌린지 데이터를 불러오는 데 실패했습니다.");

            const data = await res.json();
            const challenges = data.map((c: any) => ({ ...c, completions: c.completions || [] }));
            set({ challenges, isLoading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
            if (message === "Session expired") return set({ isLoading: false });
            set({ error: message, isLoading: false });
        }
    },

    addChallenge: async (authFetch, data) => {
        const previous = get().challenges;
        try {
            const res = await authFetch('/api/challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                const serverChallenge = await res.json();
                set((state) => ({
                    challenges: [...state.challenges, { ...serverChallenge, completions: serverChallenge.completions || [] }]
                }));
            }
        } catch (err) {
            console.error("[CHALLENGE_ADD_ERROR]", err);
            set({ challenges: previous });
        }
    },

    updateChallenge: async (authFetch, challengeId, data) => {
        const previous = get().challenges;
        set((state) => ({
            challenges: state.challenges.map(c => c.id === challengeId ? { ...c, ...data } : c)
        }));

        try {
            const res = await authFetch('/api/challenge', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: challengeId, ...data }),
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            console.error("[CHALLENGE_UPDATE_ERROR]", err);
            set({ challenges: previous });
        }
    },

    deleteChallenge: async (authFetch, challengeId) => {
        const previous = get().challenges;
        set((state) => ({ challenges: state.challenges.filter(c => c.id !== challengeId) }));

        try {
            const res = await authFetch(`/api/challenge?id=${challengeId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
        } catch (err) {
            console.error("[CHALLENGE_DELETE_ERROR]", err);
            set({ challenges: previous });
        }
    },

    toggleChallengeCompletion: async (authFetch, challengeId, targetDate) => {
        const previous = get().challenges;
        const challenge = previous.find(c => c.id === challengeId);
        if (!challenge) return;

        const tDate = new Date(targetDate);
        const dateStr = `${tDate.getFullYear()}-${tDate.getMonth()}-${tDate.getDate()}`;

        const existingComp = (challenge.completions || []).find(comp => {
            const cDate = new Date(comp.targetDate);
            return `${cDate.getFullYear()}-${cDate.getMonth()}-${cDate.getDate()}` === dateStr;
        });

        let newCompletions: ChallengeCompletionType[];
        if (existingComp) {
            newCompletions = challenge.completions.filter(comp => comp.id !== existingComp.id);
        } else {
            const safeDate = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate(), 12, 0, 0).toISOString();
            newCompletions = [
                ...(challenge.completions || []),
                { id: `temp-${Date.now()}`, challengeId, targetDate: safeDate }
            ];
        }

        set((state) => ({
            challenges: state.challenges.map(c =>
                c.id === challengeId ? { ...c, completions: newCompletions } : c
            )
        }));

        try {
            const res = await authFetch('/api/challenge/completion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId, targetDate }),
            });

            if (!res.ok) throw new Error("업데이트 실패");

            const updatedCompletions = await res.json();
            set((state) => ({
                challenges: state.challenges.map(c =>
                    c.id === challengeId ? { ...c, completions: updatedCompletions } : c
                )
            }));
        } catch (err) {
            console.error("[CHALLENGE_TOGGLE_ERROR]", err);
            set({ challenges: previous });
        }
    }
}));

export default useChallengeStore;