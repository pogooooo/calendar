import { persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand/react";
import type { User } from '@/types';
import { api, clientHeaders } from "@/lib/apiBase";
import { authStorage, setRemember } from "@/lib/session";
import { fx } from "@/lib/fx";

export type { User };

interface AuthStore {
    accessToken: string;
    refreshToken: string;
    user: User | null;
    setAccessToken: (token: string) => void;
    setRefreshToken: (token: string) => void;
    setUser: (user: User | null) => void;
    /** 로그인 성공 뒤 한 번에. remember 가 토큰이 어디에 저장될지 정하므로 토큰보다 먼저 적는다. */
    beginSession: (s: { accessToken: string; refreshToken?: string; user: User; remember: boolean }) => void;
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

            beginSession: ({ accessToken, refreshToken, user, remember }) => {
                setRemember(remember);
                set({ accessToken, refreshToken: refreshToken ?? "", user });
                // 첫 화면이 뜬 뒤 갈래가 인사한다 (FxStage 가 화면이 바뀔 때까지 기다린다)
                fx.emit("welcome", { level: 1 });
            },

            // 서버 revoke 없이 이 기기의 상태만 비운다.
            // 토큰이 실제로 거부됐을 때 쓰며, 일시적 네트워크 장애에는 쓰지 않는다.
            clearSession: () => set({ accessToken: '', refreshToken: '', user: null }),

            logout: async () => {
                const stored = get().refreshToken;

                // 먼저 비운다. 서버 응답을 기다리면 네트워크가 죽었을 때
                // 타임아웃만큼 화면이 로그인 상태로 멈춰 있는다.
                set({ accessToken: '', refreshToken: '', user: null });

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
                }
            },
        }),
        {
            name: "auth-store",
            // "로그인 유지" 를 끈 브라우저는 sessionStorage 에 둔다 — src/lib/session.ts
            storage: createJSONStorage(() => authStorage),
        }
    )
);

/**
 * 다른 창(위젯 창·다른 탭)이 세션을 새로 쓰면 이 창의 메모리도 그걸 다시 읽는다.
 * persist 는 창끼리 맞춰 주지 않는다. 그래서 위젯 창은 켜질 때 읽은 토큰을 끝까지 들고 있었다 —
 * 본 창이 갱신해 리프레시 토큰이 바뀌면(옛것은 1분 뒤 지워진다) 위젯의 다음 갱신이 거부돼 위젯이 로그아웃되고
 * 그 빈 세션을 저장소에 써서 다음에 켤 때 앱까지 로그아웃됐다. 본 창의 로그인·로그아웃도 위젯은 몰랐다.
 */
if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
        if (e.key === "auth-store") void useAuthStore.persist.rehydrate();
    });
}

export default useAuthStore;
