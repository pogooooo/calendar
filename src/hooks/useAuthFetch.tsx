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
    const { accessToken, logout } = useAuthStore();
    const router = useRouter();

    const authFetch = async (url: string, options: RequestInit = {}) => {
        const target = api(url);

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
    };

    return authFetch;
};
