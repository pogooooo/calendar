import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import { api, clientHeaders } from "@/lib/apiBase";

export const useAuthFetch = () => {
    const { accessToken, setAccessToken, setRefreshToken, logout } = useAuthStore();
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
            try {
                const stored = useAuthStore.getState().refreshToken;

                const refreshRes = await fetch(api("/api/auth/refresh"), {
                    method: "POST",
                    headers: {
                        ...clientHeaders(),
                        ...(stored ? { "X-Refresh-Token": stored } : {}),
                    },
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    const newAccessToken = data.accessToken;

                    setAccessToken(newAccessToken);
                    if (data.refreshToken) setRefreshToken(data.refreshToken);

                    const newHeaders = {
                        ...clientHeaders(),
                        ...options.headers,
                        Authorization: `Bearer ${newAccessToken}`,
                    };
                    response = await fetch(target, { ...options, headers: newHeaders });
                } else {
                    await logout();
                    router.push("/signIn");
                    throw new Error("Session expired");
                }
            } catch (err) {
                await logout();
                router.push("/signIn");
                return response;
            }
        }

        return response;
    };

    return authFetch;
};
