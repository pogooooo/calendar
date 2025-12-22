import {persist} from "zustand/middleware";
import {create} from "zustand/react";

export interface User {
    id: string;
    email: string;
    name: string;
    theme: string;
}

interface AuthStore {
    accessToken: string;
    user: User | null;
    setAccessToken: (token: string) => void;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            accessToken: "",
            user: null,

            setAccessToken: (token: string) => set({ accessToken: token }),
            setUser: (user: any) => set({ user }),

            logout: async () => {
                try{
                    await fetch("/api/auth/logout", {
                        method: "POST",
                    });
                    set({ accessToken: '', user: null });
                }catch (err) {
                    console.error("Logout failed", err);
                }
            },

        }),
        {
            name: "auth-store"
        }
    )
)

export default useAuthStore
