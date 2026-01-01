import { useRouter } from "next/navigation";
import useAuthStore from "@/store/auth/useAuthStore";

export const useAuthFetch = () => {
    const { accessToken, setAccessToken, logout } = useAuthStore();
    const router = useRouter();

    const authFetch = async (url: string, options: RequestInit = {}) => {
        const headers = {
            ...options.headers,
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
        };

        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            try {
                const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    const newAccessToken = data.accessToken;

                    setAccessToken(newAccessToken);

                    const newHeaders = {
                        ...options.headers,
                        Authorization: `Bearer ${newAccessToken}`,
                    };
                    response = await fetch(url, { ...options, headers: newHeaders });
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
