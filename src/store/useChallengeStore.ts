import { create } from 'zustand';
import { coalesce, READ_TTL } from "@/lib/fetchOnce";
import { reportSaveFailure } from "@/lib/saveError";
import type { AuthFetch, ChallengeType, ChallengeCompletionType } from '@/types';
import { utcDayKey } from '@/lib/dateKey';
import { addDaysToKey } from '@/lib/timezone';
import { readError } from '@/lib/readError';
import { fx, stickerLevel } from '@/lib/fx';

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

// 서버는 보낸 시각의 UTC 날(그날 0시)로 완료를 적고 지운다. 미리 고칠 때도 같은 날로 셈한다 —
// 예전엔 사용자 시간대로 읽어서 서쪽(UTC-) 시간대에선 기록이 하루 앞 날로 읽히고, 다시 누르면 서버에서 지워졌다
const toDateKey = (d: Date | string) => utcDayKey(d);

const useChallengeStore = create<ChallengeState>((set, get) => ({
    challenges: [],
    isLoading: false,
    error: null,

    fetchChallenges: async (authFetch, categoryId) => {
        // 같은 읽기가 겹치면 하나만 (src/lib/fetchOnce.ts)
        await coalesce(`challenge:${categoryId ?? ""}`, READ_TTL, async () => {
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
        });
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
            fx.emit("add");
            return null;
        } catch (err) {
            console.error("[CHALLENGE_ADD_ERROR]", err);
            reportSaveFailure("challenge");
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
            reportSaveFailure("challenge");
            set({ challenges: previous });
            return "네트워크 오류로 챌린지를 수정하지 못했습니다.";
        }
    },

    deleteChallenge: async (authFetch, challengeId) => {
        const previous = get().challenges;
        set((state) => ({ challenges: state.challenges.filter(c => c.id !== challengeId) }));
        fx.emit("remove");

        try {
            const res = await authFetch(`/api/challenge?id=${challengeId}`, { method: 'DELETE' });
            if (!res.ok) {
                set({ challenges: previous });
                return await readError(res, "챌린지를 삭제하지 못했습니다.");
            }
            return null;
        } catch (err) {
            console.error("[CHALLENGE_DELETE_ERROR]", err);
            reportSaveFailure("challenge");
            set({ challenges: previous });
            return "네트워크 오류로 챌린지를 삭제하지 못했습니다.";
        }
    },

    toggleChallengeCompletion: async (authFetch, challengeId, targetDate) => {
        const previous = get().challenges;
        const challenge = previous.find(c => c.id === challengeId);
        if (!challenge) return;

        const dateKey = toDateKey(targetDate);

        const existingComp = (challenge.completions ?? []).find(comp =>
            toDateKey(comp.targetDate) === dateKey
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
        if (!existingComp) {
            // 이번 칸까지 끊기지 않고 이어 온 칸 수 — 이정표(7·30·100…)나 목표를 다 채우면 효과가 커진다
            const done = new Set(newCompletions.map(comp => toDateKey(comp.targetDate)));
            let streak = 0;
            for (let key = dateKey; done.has(key) && streak < 5000; key = addDaysToKey(key, -Math.max(1, challenge.interval))) streak += 1;
            const reached = challenge.targetCount != null && newCompletions.length >= challenge.targetCount;
            fx.emit("sticker", { level: stickerLevel(streak, reached), count: reached ? newCompletions.length : streak });
        }

        try {
            const res = await authFetch('/api/challenge/completion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 바라는 상태를 같이 보낸다 — 다른 기기에서 이미 바뀐 것을 옛 화면에서 눌러도 서버가 거꾸로 뒤집지 않게
                body: JSON.stringify({ challengeId, targetDate, done: !existingComp }),
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
            reportSaveFailure("challenge");
            set({ challenges: previous });
        }
    }
}));

export default useChallengeStore;
