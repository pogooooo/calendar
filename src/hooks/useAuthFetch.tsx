import * as React from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import type { User } from "@/types";
import { api, clientHeaders, isDesktopApp } from "@/lib/apiBase";
import { kindFromUrl, notifyDataChange } from "@/lib/dataSync";

/**
 * 갱신 실패를 원인별로 구분한다. 이 구분이 없으면 부팅 직후 네트워크가
 * 아직 안 올라온 상태의 일시적 실패가 영구 로그아웃으로 굳어버린다.
 */
export type RefreshResult =
    | { ok: true; token: string }
    | { ok: false; reason: "network" | "server" | "invalid" };

let refreshInFlight: Promise<RefreshResult> | null = null;

const LOCK_KEY = "cronos-refresh-lock";
const LOCK_TTL = 10000;

export function isWidgetWindow() {
    return typeof window !== "undefined" && window.location.pathname.startsWith("/widget");
}

/** JWT 만료 여부. 만료된 토큰으로 요청을 쏘면 창 수만큼 401 이 쏟아진다. */
export function isTokenExpired(token: string, skewMs = 5000): boolean {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
        if (typeof payload?.exp !== "number") return false;
        return payload.exp * 1000 - skewMs <= Date.now();
    } catch {
        return false;
    }
}

/**
 * 단일 비행 가드는 창(웹뷰)마다 따로다. 부팅 때는 창이 여러 개 동시에 뜨므로
 * 창 사이에서도 겹치지 않도록 localStorage 로 짧은 잠금을 건다.
 * (리프레시 토큰은 회전되므로 동시 요청은 서로를 무효화할 수 있다)
 */
function acquireCrossWindowLock(): boolean {
    try {
        const raw = localStorage.getItem(LOCK_KEY);
        const now = Date.now();
        if (raw) {
            const at = Number(raw);
            if (Number.isFinite(at) && now - at < LOCK_TTL) return false;
        }
        localStorage.setItem(LOCK_KEY, String(now));
        return true;
    } catch {
        return true;
    }
}

function releaseCrossWindowLock() {
    try { localStorage.removeItem(LOCK_KEY); } catch {}
}

/** 다른 창이 갱신을 끝내 새 토큰이 저장되기를 잠시 기다린다. */
async function waitForOtherWindow(previous: string): Promise<RefreshResult> {
    for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 250));
        const token = useAuthStore.getState().accessToken;
        if (token && token !== previous && !isTokenExpired(token)) {
            return { ok: true, token };
        }
        try {
            if (!localStorage.getItem(LOCK_KEY)) break;
        } catch { break; }
    }
    const token = useAuthStore.getState().accessToken;
    if (token && token !== previous) return { ok: true, token };
    return { ok: false, reason: "network" };
}

export async function refreshSession(): Promise<RefreshResult> {
    if (!refreshInFlight) {
        refreshInFlight = (async (): Promise<RefreshResult> => {
            const previous = useAuthStore.getState().accessToken;

            if (!acquireCrossWindowLock()) {
                return waitForOtherWindow(previous);
            }

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

                // 한 번에 쓴다 — 다른 창은 저장소를 다시 읽으므로 반쯤 바뀐 세션을 보지 않게
                const fresh = typeof data.user?.id === "string" ? data.user as Partial<User> & { id: string } : null;
                const { user } = useAuthStore.getState();
                useAuthStore.setState({
                    accessToken: data.accessToken,
                    ...(data.refreshToken ? { refreshToken: data.refreshToken } : {}),
                    // 토큰만 쿠키로 되살린 창("로그인 유지" 끔, 새 탭)은 사용자 정보가 없어 이름·오늘 메모가 비었다
                    ...(fresh ? { user: { ...(user?.id === fresh.id ? user : {}), ...fresh } as User } : {}),
                });
                return { ok: true, token: data.accessToken as string };
            } catch {
                // fetch 자체가 실패 = 서버에 닿지도 못함. 토큰은 멀쩡할 수 있다.
                return { ok: false, reason: "network" };
            } finally {
                releaseCrossWindowLock();
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
        let accessToken = useAuthStore.getState().accessToken;

        // 만료가 뻔한 토큰으로 먼저 쏘면 창 수만큼 401 이 몰린다. 미리 갱신한다.
        if (accessToken && isTokenExpired(accessToken)) {
            const pre = await refreshSession();
            if (pre.ok) accessToken = pre.token;
        }

        const headers = {
            ...clientHeaders(),
            ...options.headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
        };

        /**
         * 폰 앱은 켤 때 요청 여덟 개가 한꺼번에 나가는데, 안드로이드 WebView 에서 그중 하나가 간혹
         * "Failed to fetch" 로 떨어졌다 (서버는 멀쩡했다). 읽기(GET)는 한 번 더 물어도 해가 없으니 한 번 더.
         */
        const method = (options.method ?? "GET").toUpperCase();
        const send = async (h: HeadersInit) => {
            try {
                return await fetch(target, { ...options, headers: h });
            } catch (err) {
                if (method !== "GET") throw err;
                await new Promise(r => setTimeout(r, 800));
                return fetch(target, { ...options, headers: h });
            }
        };

        let response = await send(headers);

        if (response.status === 401) {
            const result = await refreshSession();

            if (result.ok) {
                const newHeaders = {
                    ...clientHeaders(),
                    ...options.headers,
                    Authorization: `Bearer ${result.token}`,
                };
                response = await send(newHeaders);
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

        /**
         * 자료를 바꾸는 요청이 성공하면 다른 창에 알린다.
         * 스토어마다 일일이 심지 않고 여기 한 곳에서 하는 이유: 모든 인증 요청이
         * 이 문을 지나므로 새 기능을 넣어도 알림을 빠뜨릴 일이 없다.
         */
        if (response.ok && method !== "GET" && method !== "HEAD") {
            const kind = kindFromUrl(url);
            if (kind) notifyDataChange(kind);
        }

        return response;
    }, [clearSession, router]);

    return authFetch;
};
