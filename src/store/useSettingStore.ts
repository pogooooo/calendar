import { persist } from "zustand/middleware";
import { create } from "zustand/react";
import type { AuthFetch } from '@/types';
import type { Locale } from '@/i18n/types';

interface SettingState {
    theme: string;
    themeOptions: Record<string, string>;
    locale: Locale;
    autostart: boolean;
    font: string;
    isLoading: boolean;
    setTheme: (inputTheme: string) => void;
    setThemeOption: (themeId: string, option: string) => void;
    setLocale: (locale: Locale) => void;
    setAutostart: (enabled: boolean) => void;
    setFont: (font: string) => void;
    updateTheme: (authFetch: AuthFetch, inputTheme: string) => Promise<void>;
    fetchSettings: (authFetch: AuthFetch) => Promise<void>;
}

const useSettingStore = create<SettingState>()(
    persist(
        (set) => ({
            theme: 'celestial',
            themeOptions: {},
            locale: 'ko' as Locale,
            autostart: true,
            font: 'default',
            isLoading: false,

            setTheme: (inputTheme) => set({ theme: inputTheme }),
            setThemeOption: (themeId, option) =>
                set((s) => ({ themeOptions: { ...s.themeOptions, [themeId]: option } })),
            setLocale: (locale) => set({ locale }),
            setAutostart: (enabled) => set({ autostart: enabled }),
            setFont: (font) => set({ font }),

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
