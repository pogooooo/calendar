import { persist } from "zustand/middleware";
import { create } from "zustand/react";
import type { AuthFetch } from '@/types';
import type { Locale } from '@/i18n/types';

interface SettingState {
    theme: string;
    locale: Locale;
    autostart: boolean;
    isLoading: boolean;
    setTheme: (inputTheme: string) => void;
    setLocale: (locale: Locale) => void;
    setAutostart: (enabled: boolean) => void;
    updateTheme: (authFetch: AuthFetch, inputTheme: string) => Promise<void>;
    fetchSettings: (authFetch: AuthFetch) => Promise<void>;
}

const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            theme: 'celestial',
            locale: 'ko' as Locale,
            autostart: true,
            isLoading: false,

            setTheme: (inputTheme) => set({ theme: inputTheme }),
            setLocale: (locale) => set({ locale }),
            setAutostart: (enabled) => set({ autostart: enabled }),

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
        { name: "setting-store" }
    )
);

export default useSettingStore;
