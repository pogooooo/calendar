"use client"

import { ThemeProvider } from 'styled-components';
import { themes } from '@/styles/theme';
import { useEffect, useState } from 'react';
import useSettingStore from "@/store/setting/useSettingStore";

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    const themeName = useSettingStore((state) => state.theme);
    const theme = themes[themeName as keyof typeof themes] || themes.celestial;

    return (
        <ThemeProvider theme={theme}>
            {children}
        </ThemeProvider>
    );
}
