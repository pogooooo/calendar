import {persist} from "zustand/middleware";
import {create} from "zustand/react";

const useAuthStore = create(
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
