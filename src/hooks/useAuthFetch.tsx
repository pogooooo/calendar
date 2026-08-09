import * as React from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { api, clientHeaders } from "@/lib/apiBase";

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshSession(): Promise<string | null> {
    if (!refreshInFlight) {
        refreshInFlight = (async () => {
            try {
                const stored = useAuthStore.getState().refreshToken;

                const refreshRes = await fetch(api("/api/auth/refresh"), {
                    method: "POST",
                    headers: {
                        ...clientHeaders(),
                        ...(stored ? { "X-Refresh-Token": stored } : {}),
                    },
                });

                if (!refreshRes.ok) return null;

                const data = await refreshRes.json();
                if (!data.accessToken) return null;

                useAuthStore.getState().setAccessToken(data.accessToken);
                if (data.refreshToken) useAuthStore.getState().setRefreshToken(data.refreshToken);
                return data.accessToken as string;
            } catch {
                return null;
            } finally {
                refreshInFlight = null;
            }
        })();
    }
    return refreshInFlight;
}

export const useAuthFetch = () => {
    const logout = useAuthStore((s) => s.logout);
    const router = useRouter();

    // 렌더마다 새 함수를 만들면 이 값을 의존성으로 쓰는 effect 들이 무한 반복된다.
    const authFetch = React.useCallback(async (url: string, options: RequestInit = {}) => {
        const target = api(url);
        const accessToken = useAuthStore.getState().accessToken;

        const headers = {
            ...clientHeaders(),
            ...options.headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
        };

        let response = await fetch(target, { ...options, headers });

        if (response.status === 401) {
            const newAccessToken = await refreshSession();

            if (newAccessToken) {
                const newHeaders = {
                    ...clientHeaders(),
                    ...options.headers,
                    Authorization: `Bearer ${newAccessToken}`,
                };
                response = await fetch(target, { ...options, headers: newHeaders });
            } else {
                await logout();
                router.push("/signIn");
            }
        }

        return response;
    }, [logout, router]);

    return authFetch;
};
