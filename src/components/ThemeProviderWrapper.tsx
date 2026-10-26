"use client"

import GemGround from '@/styles/gem/GemGround';
import { useEffect, useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import { themes } from '@/styles/theme';
import { availableThemeName } from '@/styles/themeAvailability';
import { applyGemColor } from '@/styles/gem/palette';
import GlobalScrollbar from '@/styles/GlobalScrollbar';
import GlobalTypography, { getFontSize, getFontWeight } from '@/styles/GlobalTypography';
import useSettingStore from "@/store/useSettingStore";
import { getFontOption, ensureFontLoaded, THEME_FONTS } from "@/lib/fonts";
import MapleGround from "@/styles/maple/MapleGround";
import CelestialGround from "@/styles/celestial/CelestialGround";
import type { ThemeFamily } from "@/styles/themed";
import OceanGround from '@/styles/ocean/OceanGround';
import ThemeAtmosphere from './ambient/ThemeAtmosphere';
import FxStage from './fx/FxStage';
import { MotionConfig } from 'framer-motion';
import InterfaceMotion from './transition/InterfaceMotion';

/** 갈래가 화면 전체에 얹는 한 겹 (종이결 같은 것). 없는 갈래는 아무것도 안 얹는다. */
const GROUNDS: Partial<Record<ThemeFamily, React.ComponentType>> = { maple: MapleGround, celestial: CelestialGround, ocean: OceanGround , gem: GemGround };

export default function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    const themeName = useSettingStore((state) => state.theme);
    const themeOptions = useSettingStore((state) => state.themeOptions);
    const gemColor = useSettingStore((state) => state.gemColor);
    const fontKey = useSettingStore((state) => state.font);
    const fontSizeKey = useSettingStore((state) => state.fontSize);
    const fontWeightKey = useSettingStore((state) => state.fontWeight);
    const motion = useSettingStore((state) => state.motion);
    const motionOverOs = useSettingStore((state) => state.motionOverOs);
    const locale = useSettingStore((state) => state.locale);

    useEffect(() => {
        const root = document.documentElement;
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        // 기기의 동작 줄이기를 따른다 — 설정에서 '그래도 움직이기'를 켰으면 고른 값 그대로
        const syncMotion = () => { root.dataset.themeMotion = preference.matches && !motionOverOs ? 'off' : motion; };
        const syncVisibility = () => { root.toggleAttribute('data-page-hidden', document.hidden); };
        syncMotion(); syncVisibility();
        preference.addEventListener('change', syncMotion);
        document.addEventListener('visibilitychange', syncVisibility);
        return () => {
            preference.removeEventListener('change', syncMotion);
            document.removeEventListener('visibilitychange', syncVisibility);
            delete root.dataset.themeMotion;
            root.removeAttribute('data-page-hidden');
        };
    }, [motion, motionOverOs]);

    /**
     * 테마 이름 규칙: 갈래 이름이 밝은 벌, 거기에 '-어두운벌' 을 붙인 것이 어두운 벌이다.
     * (celestial / celestial-dark). 새 테마도 이 규칙을 따라 styles/theme.ts 에 등록한다.
     * 다만 "지금 어두운 벌인가" 는 이름이 아니라 테마의 mode 값으로 판단한다.
     */
    const option = themeOptions[themeName];
    const effectiveKey = option && option !== 'light'
        ? `${themeName}-${option}`
        : themeName;
    const baseTheme = themes[availableThemeName(effectiveKey) as keyof typeof themes]
        ?? themes[availableThemeName(themeName) as keyof typeof themes]
        ?? themes.celestial;

    const fontOption = getFontOption(fontKey);

    // "기본" 은 갈래가 정한 본문 글꼴이다 — 지금은 세 갈래 모두 Pretendard
    const bodyFamily = fontOption.key === "default" ? baseTheme.fonts.body : fontOption.family;
    const theme = useMemo(() => ({
        ...applyGemColor(baseTheme, gemColor),
        fonts: { ...baseTheme.fonts, body: bodyFamily },
    }), [baseTheme, bodyFamily, gemColor]);

    useEffect(() => {
        ensureFontLoaded(fontOption);
        document.body.style.fontFamily = bodyFamily;
    }, [fontOption, bodyFamily]);

    // 테마가 제 글꼴을 요구하면(Maple 의 고운바탕·Cormorant) 같이 내려받는다
    useEffect(() => {
        (THEME_FONTS[theme.family] ?? []).forEach(ensureFontLoaded);
    }, [theme.family]);

    const Ground = GROUNDS[theme.family];

    // 첫 그림 전에 layout 의 PRE_PAINT 가 칠해 둔 바탕 — 이제 갈래의 Ground 가 칠하므로 걷는다
    // (남겨 두면 html 의 바탕을 덮어 테마를 바꿔도 처음 색이 비쳤다). 위젯 창의 투명은 제 것이라 손대지 않는다
    useEffect(() => {
        const root = document.documentElement;
        if (!root.hasAttribute('data-prepaint')) return;
        root.style.removeProperty('background-color');
        root.removeAttribute('data-prepaint');
    }, []);

    // 화면 언어를 html 에도 — layout 은 늘 lang="ko" 라 영어 화면을 화면 읽기 프로그램이 한국어 발음으로 읽었다
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

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
            <MotionConfig reducedMotion={motion === 'off' ? 'always' : 'user'}>
            <GlobalScrollbar />
            {Ground && <Ground />}
            <GlobalTypography
                $sizePx={getFontSize(fontSizeKey).px}
                $weight={getFontWeight(fontWeightKey).weight}
            />
            <ThemeAtmosphere />
            <InterfaceMotion />
            {children}
            <FxStage />
            </MotionConfig>
        </ThemeProvider>
    );
}
