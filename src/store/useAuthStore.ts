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

            logout: async () => {
                const stored = get().refreshToken;
                try {
                    await fetch(api("/api/auth/logout"), {
                        method: "POST",
                        credentials: "include",
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
