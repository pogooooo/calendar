import { create } from 'zustand';
import type { AuthFetch, ChallengeType, ChallengeCompletionType } from '@/types';
import { localDateKey } from '@/lib/dateKey';
import { readError } from '@/lib/readError';

export type { ChallengeType, ChallengeCompletionType };

interface ChallengeState {
    challenges: ChallengeType[];
    isLoading: boolean;
    error: string | null;

    fetchChallenges: (authFetch: AuthFetch, categoryId?: string) => Promise<void>;
    addChallenge: (authFetch: AuthFetch, data: Partial<ChallengeType>) => Promise<string | null>;
    updateChallenge: (authFetch: AuthFetch, challengeId: string, data: Partial<ChallengeType>) => Promise<string | null>;
    deleteChallenge: (authFetch: AuthFetch, challengeId: string) => Promise<string | null>;
    toggleChallengeCompletion: (authFetch: AuthFetch, challengeId: string, targetDate: string) => Promise<void>;
}

// 사용자가 고른 시간대를 따른다. 브라우저 시간대를 쓰면 여행 중에 날짜가 어긋난다.
const toDateKey = (d: Date) => localDateKey(d);

const useChallengeStore = create<ChallengeState>((set, get) => ({
    challenges: [],
    isLoading: false,
    error: null,

    fetchChallenges: async (authFetch, categoryId) => {
        set({ isLoading: true, error: null });
        try {
            let url = '/api/challenge';
            if (categoryId) url += `?${new URLSearchParams({ categoryId })}`;

            const res = await authFetch(url);
            if (res.status === 401) { set({ isLoading: false }); return; }
            if (!res.ok) throw new Error("챌린지 데이터를 불러오는 데 실패했습니다.");

            const data = await res.json();
            const challenges = data.map((c: ChallengeType) => ({ ...c, completions: c.completions ?? [] }));
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
            if (!res.ok) {
                set({ challenges: previous });
                return await readError(res, "챌린지를 추가하지 못했습니다.");
            }
            const serverChallenge = await res.json();
            set((state) => ({
                challenges: [...state.challenges, { ...serverChallenge, completions: serverChallenge.completions ?? [] }]
            }));
            return null;
        } catch (err) {
            console.error("[CHALLENGE_ADD_ERROR]", err);
            set({ challenges: previous });
            return "네트워크 오류로 챌린지를 추가하지 못했습니다.";
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
            if (!res.ok) {
                set({ challenges: previous });
                return await readError(res, "챌린지를 수정하지 못했습니다.");
            }
            return null;
        } catch (err) {
            console.error("[CHALLENGE_UPDATE_ERROR]", err);
            set({ challenges: previous });
            return "네트워크 오류로 챌린지를 수정하지 못했습니다.";
        }
    },

    deleteChallenge: async (authFetch, challengeId) => {
        const previous = get().challenges;
        set((state) => ({ challenges: state.challenges.filter(c => c.id !== challengeId) }));

        try {
            const res = await authFetch(`/api/challenge?id=${challengeId}`, { method: 'DELETE' });
            if (!res.ok) {
                set({ challenges: previous });
                return await readError(res, "챌린지를 삭제하지 못했습니다.");
            }
            return null;
        } catch (err) {
            console.error("[CHALLENGE_DELETE_ERROR]", err);
            set({ challenges: previous });
            return "네트워크 오류로 챌린지를 삭제하지 못했습니다.";
        }
    },

    toggleChallengeCompletion: async (authFetch, challengeId, targetDate) => {
        const previous = get().challenges;
        const challenge = previous.find(c => c.id === challengeId);
        if (!challenge) return;

        const tDate = new Date(targetDate);
        const dateKey = toDateKey(tDate);

        const existingComp = (challenge.completions ?? []).find(comp =>
            toDateKey(new Date(comp.targetDate)) === dateKey
        );

        let newCompletions: ChallengeCompletionType[];
        if (existingComp) {
            newCompletions = challenge.completions.filter(comp => comp.id !== existingComp.id);
        } else {
            // 정오로 저장하면 어느 시간대에서 읽어도 같은 달력일로 해석된다
            const safeDate = `${dateKey}T12:00:00.000Z`;
            newCompletions = [
                ...(challenge.completions ?? []),
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
