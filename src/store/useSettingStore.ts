import { persist } from "zustand/middleware";
import { create } from "zustand/react";

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

interface SettingState {
    theme: string;
    isLoading: boolean;
    setTheme: (inputTheme: string) => void;
    updateTheme: (authFetch: AuthFetch, inputTheme: string) => Promise<void>;
    fetchSettings: (authFetch: AuthFetch) => Promise<void>;
}

const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            theme: 'celestial',
            isLoading: false,

            setTheme: (inputTheme: string) => set({ theme: inputTheme }),

            fetchSettings: async (authFetch) => {
                set({ isLoading: true });
                try {
                    const res = await authFetch('/api/setting');
                    if (res.ok) {
                        const data = await res.json();
                        set({ theme: data.theme, isLoading: false });
                    } else {
                        set({ isLoading: false });
                    }
                } catch (err) {
                    console.error("[SETTINGS_FETCH_ERROR]", err);
                    set({ isLoading: false });
                }
            },

            updateTheme: async (authFetch, inputTheme) => {
                set({ theme: inputTheme });
                try {
                    await authFetch('/api/setting', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ theme: inputTheme }),
                    });
                } catch (err) {
                    console.error("[SETTINGS_UPDATE_ERROR]", err);
                }
            }
        }),
        {
            name: "setting-store"
        }
    )
)

export default useSettingStore;