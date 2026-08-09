"use client"

import { useEffect, useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import { themes } from '@/styles/theme';
import GlobalScrollbar from '@/styles/GlobalScrollbar';
import GlobalTypography, { getFontSize, getFontWeight } from '@/styles/GlobalTypography';
import useSettingStore from "@/store/useSettingStore";
import { getFontOption, ensureFontLoaded } from "@/lib/fonts";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    const themeName = useSettingStore((state) => state.theme);
    const themeOptions = useSettingStore((state) => state.themeOptions);
    const fontKey = useSettingStore((state) => state.font);
    const fontSizeKey = useSettingStore((state) => state.fontSize);
    const fontWeightKey = useSettingStore((state) => state.fontWeight);

    const option = themeOptions[themeName];
    const effectiveKey = option && option !== 'light'
        ? `${themeName}-${option}`
        : themeName;
    const baseTheme = themes[effectiveKey as keyof typeof themes]
        ?? themes[themeName as keyof typeof themes]
        ?? themes.celestial;

    const fontOption = getFontOption(fontKey);

    const theme = useMemo(() => ({
        ...baseTheme,
        fonts: { ...baseTheme.fonts, body: fontOption.family },
    }), [baseTheme, fontOption]);

    useEffect(() => {
        ensureFontLoaded(fontOption);
        document.body.style.fontFamily = fontOption.family;
    }, [fontOption]);

    useEffect(() => {
        const isDark = effectiveKey.endsWith('-dark');
        import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
            getCurrentWindow().setTheme(isDark ? 'dark' : 'light').catch(() => {});
        }).catch(() => {});
    }, [effectiveKey]);

    return (
        <ThemeProvider theme={theme}>
            <GlobalScrollbar />
            <GlobalTypography
                $sizePx={getFontSize(fontSizeKey).px}
                $weight={getFontWeight(fontWeightKey).weight}
            />
            {children}
        </ThemeProvider>
    );
}
