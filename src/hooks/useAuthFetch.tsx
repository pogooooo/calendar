import * as React from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { api, clientHeaders, isDesktopApp } from "@/lib/apiBase";

/**
 * 갱신 실패를 원인별로 구분한다. 이 구분이 없으면 부팅 직후 네트워크가
 * 아직 안 올라온 상태의 일시적 실패가 영구 로그아웃으로 굳어버린다.
 */
export type RefreshResult =
    | { ok: true; token: string }
    | { ok: false; reason: "network" | "server" | "invalid" };

let refreshInFlight: Promise<RefreshResult> | null = null;

export function isWidgetWindow() {
    return typeof window !== "undefined" && window.location.pathname.startsWith("/widget");
}

export async function refreshSession(): Promise<RefreshResult> {
    if (!refreshInFlight) {
        refreshInFlight = (async (): Promise<RefreshResult> => {
            try {
                const stored = useAuthStore.getState().refreshToken;

                const refreshRes = await fetch(api("/api/auth/refresh"), {
                    method: "POST",
                    headers: {
                        ...clientHeaders(),
                        ...(stored ? { "X-Refresh-Token": stored } : {}),
                    },
                });

                if (refreshRes.status >= 500 || refreshRes.status === 408 || refreshRes.status === 429) {
                    return { ok: false, reason: "server" };
                }
                if (!refreshRes.ok) return { ok: false, reason: "invalid" };

                const data = await refreshRes.json();
                if (!data.accessToken) return { ok: false, reason: "invalid" };

                useAuthStore.getState().setAccessToken(data.accessToken);
                if (data.refreshToken) useAuthStore.getState().setRefreshToken(data.refreshToken);
                return { ok: true, token: data.accessToken as string };
            } catch {
                // fetch 자체가 실패 = 서버에 닿지도 못함. 토큰은 멀쩡할 수 있다.
                return { ok: false, reason: "network" };
            } finally {
                refreshInFlight = null;
            }
        })();
    }
    return refreshInFlight;
}

export const useAuthFetch = () => {
    const clearSession = useAuthStore((s) => s.clearSession);
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
            const result = await refreshSession();

            if (result.ok) {
                const newHeaders = {
                    ...clientHeaders(),
                    ...options.headers,
                    Authorization: `Bearer ${result.token}`,
                };
                response = await fetch(target, { ...options, headers: newHeaders });
            } else if (result.reason === "invalid") {
                // 서버가 실제로 거부한 경우에만 세션을 버린다.
                // 서버 revoke 는 하지 않는다 — 다른 창의 세션까지 죽이기 때문.
                clearSession();
                // 위젯 창을 로그인 페이지로 보내면 바탕화면에 로그인 폼이 떠버린다.
                // 데스크톱 앱은 로그인 화면으로, 웹은 다운로드(랜딩) 페이지로
                if (!isWidgetWindow()) router.push(isDesktopApp() ? "/signIn" : "/download");
            }
            // network / server 는 일시적 장애다. 토큰을 그대로 두고
            // 401 응답을 반환해 호출자가 나중에 다시 시도하게 한다.
        }

        return response;
    }, [clearSession, router]);

    return authFetch;
};
