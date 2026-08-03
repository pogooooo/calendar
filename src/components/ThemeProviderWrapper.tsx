"use client"

import { useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { themes } from '@/styles/theme';
import GlobalScrollbar from '@/styles/GlobalScrollbar';
import useSettingStore from "@/store/useSettingStore";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    const themeName = useSettingStore((state) => state.theme);
    const themeOptions = useSettingStore((state) => state.themeOptions);

    const option = themeOptions[themeName];
    const effectiveKey = option && option !== 'light'
        ? `${themeName}-${option}`
        : themeName;
    const theme = themes[effectiveKey as keyof typeof themes]
        ?? themes[themeName as keyof typeof themes]
        ?? themes.celestial;

    useEffect(() => {
        const isDark = effectiveKey.endsWith('-dark');
        import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
            getCurrentWindow().setTheme(isDark ? 'dark' : 'light').catch(() => {});
        }).catch(() => {});
    }, [effectiveKey]);

    return (
        <ThemeProvider theme={theme}>
            <GlobalScrollbar />
            {children}
        </ThemeProvider>
    );
}
