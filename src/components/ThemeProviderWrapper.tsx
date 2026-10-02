"use client"

import { useEffect, useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import { themes } from '@/styles/theme';
import GlobalScrollbar from '@/styles/GlobalScrollbar';
import GlobalTypography, { getFontSize, getFontWeight } from '@/styles/GlobalTypography';
import useSettingStore from "@/store/useSettingStore";
import { getFontOption, ensureFontLoaded, THEME_FONTS } from "@/lib/fonts";
import MapleGround from "@/styles/maple/MapleGround";
import CelestialGround from "@/styles/celestial/CelestialGround";
import type { ThemeFamily } from "@/styles/themed";

/** 갈래가 화면 전체에 얹는 한 겹 (종이결 같은 것). 없는 갈래는 아무것도 안 얹는다. */
const GROUNDS: Partial<Record<ThemeFamily, React.ComponentType>> = { maple: MapleGround, celestial: CelestialGround };

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    const themeName = useSettingStore((state) => state.theme);
    const themeOptions = useSettingStore((state) => state.themeOptions);
    const fontKey = useSettingStore((state) => state.font);
    const fontSizeKey = useSettingStore((state) => state.fontSize);
    const fontWeightKey = useSettingStore((state) => state.fontWeight);

    /**
     * 테마 이름 규칙: 갈래 이름이 밝은 벌, 거기에 '-어두운벌' 을 붙인 것이 어두운 벌이다.
     * (celestial / celestial-dark). 새 테마도 이 규칙을 따라 styles/theme.ts 에 등록한다.
     * 다만 "지금 어두운 벌인가" 는 이름이 아니라 테마의 mode 값으로 판단한다.
     */
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

    // 테마가 제 글꼴을 요구하면(Maple 의 고운바탕·Cormorant) 같이 내려받는다
    useEffect(() => {
        (THEME_FONTS[theme.family] ?? []).forEach(ensureFontLoaded);
    }, [theme.family]);

    const Ground = GROUNDS[theme.family];

    // 테마가 스스로 밝은 벌인지 어두운 벌인지 말해 준다.
    // 이름이 '-dark' 로 끝나는지 보던 예전 방식은 테마 이름 규칙에 묶여 있었다.
    useEffect(() => {
        document.documentElement.style.colorScheme = theme.mode;
        import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
            getCurrentWindow().setTheme(theme.mode).catch(() => {});
        }).catch(() => {});
    }, [theme.mode]);

    return (
        <ThemeProvider theme={theme}>
            <GlobalScrollbar />
            {Ground && <Ground />}
            <GlobalTypography
                $sizePx={getFontSize(fontSizeKey).px}
                $weight={getFontWeight(fontWeightKey).weight}
            />
            {children}
        </ThemeProvider>
    );
}
