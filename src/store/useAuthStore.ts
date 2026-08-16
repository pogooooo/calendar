import { persist } from "zustand/middleware";
import { create } from "zustand/react";
import type { User } from '@/types';
import { api, clientHeaders } from "@/lib/apiBase";

export type { User };

interface AuthStore {
    accessToken: string;
    refreshToken: string;
    user: User | null;
    setAccessToken: (token: string) => void;
    setRefreshToken: (token: string) => void;
    setUser: (user: User | null) => void;
    clearSession: () => void;
    logout: () => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            accessToken: "",
            refreshToken: "",
            user: null,

            setAccessToken: (token: string) => set({ accessToken: token }),
            setRefreshToken: (token: string) => set({ refreshToken: token }),
            setUser: (user: User | null) => set({ user }),

            // 서버 revoke 없이 이 기기의 상태만 비운다.
            // 토큰이 실제로 거부됐을 때 쓰며, 일시적 네트워크 장애에는 쓰지 않는다.
            clearSession: () => set({ accessToken: '', refreshToken: '', user: null }),

            logout: async () => {
                const stored = get().refreshToken;
                try {
                    await fetch(api("/api/auth/logout"), {
                        method: "POST",
                        headers: {
                            ...clientHeaders(),
                            ...(stored ? { "X-Refresh-Token": stored } : {}),
                        },
                    });
                } catch (err) {
                    console.error("Logout failed", err);
                } finally {
                    set({ accessToken: '', refreshToken: '', user: null });
                }
            },
        }),
        { name: "auth-store" }
    )
);

export default useAuthStore;
