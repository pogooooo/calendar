import { DefaultTheme } from "styled-components";
import { THEME_FAMILIES, type ThemeFamily } from "./themed";

const commonStyles = {
    fontSizes: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.5rem',
        h4: '1.25rem',
        body: '1rem',
        caption: '0.875rem',
        label: '0.75rem',
    },
    fontWeights: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700,
    },
    lineHeights: {
        body: 1.5,
        heading: 1.2,
    },
    fonts: {
        display: "'Orbit', serif",
        body: "'Inter', sans-serif",
    },
};

const CELESTIAL: ThemeFamily = 'celestial';

/** 갈래마다 하나. 설정 화면에 보이는 이름·설명이 여기서 나온다. */
const FAMILY_META: Record<ThemeFamily, { label: string; description: string }> = {
    celestial: { label: 'Celestial', description: 'Gold accents, Orbit typeface' },
};

const celestial: DefaultTheme = {
    name: 'celestial',
    family: CELESTIAL,
    mode: 'light',
    ...commonStyles,
    colors: {
        background: '#FFFFFF',
        primary: '#D4AF37',
        accent: '#FAE7B5',
        surface: '#F9F9F9',
        text: '#2E2E2E',
        textSecondary: '#7A7A7A',
        border: '#D4AF37',
        success: '#4E8A6D',
        error: '#A13D4B',
        weekend: '#C4696E',
    },
    preview: { cell: '#F2F2F2', event: '#FAE7B5' },
};

const celestialDark: DefaultTheme = {
    name: 'celestial-dark',
    family: CELESTIAL,
    mode: 'dark',
    ...commonStyles,
    colors: {
        background: '#111111',
        primary: '#D4AF37',
        accent: '#FAE7B5',
        surface: '#1A1A1A',
        text: '#E8E8E8',
        textSecondary: '#888888',
        border: '#D4AF37',
        success: '#4E8A6D',
        error: '#A13D4B',
        weekend: '#D98A8E',
    },
    preview: { cell: '#1E1E1E', event: '#4A3D1C' },
};

/**
 * 이름 규칙: 갈래 이름이 밝은 벌, 거기에 '-dark' 를 붙인 것이 어두운 벌이다.
 * ThemeProviderWrapper 가 이 규칙으로 찾는다.
 */
export const themes: Record<string, DefaultTheme> = {
    celestial,
    'celestial-dark': celestialDark,
};

/* ── 설정 화면이 읽어 가는 목록 ─────────────────────────────────────────
   예전에는 SettingsPage 에 THEMES 배열이 따로 있었다. 값은 여기, 이름과
   미리보기 색은 저기 — 한쪽만 고치면 조용히 어긋났다. 이제 한 곳에서 만든다. */

export interface ThemeGround {
    bg: string;
    rail: string;
    ink: string;
    dimInk: string;
    cell: string;
    event: string;
    accent: string;
}

export interface ThemeChoice {
    /** 갈래 이름. 저장되는 값이다. */
    id: ThemeFamily;
    label: string;
    description: string;
    /** 이 갈래가 가진 벌들. 첫 번째가 기본이다. */
    options: string[];
    /** 벌마다의 축소판 미리보기 색 */
    grounds: Record<string, ThemeGround>;
}

const groundOf = (t: DefaultTheme): ThemeGround => ({
    bg: t.colors.background,
    rail: t.colors.surface,
    ink: t.colors.text,
    dimInk: t.colors.textSecondary,
    cell: t.preview.cell,
    event: t.preview.event,
    accent: t.colors.primary,
});

export function listThemes(): ThemeChoice[] {
    return THEME_FAMILIES.map((family) => {
        const variants = Object.values(themes).filter((t) => t.family === family);
        // 밝은 벌을 앞에 둔다 — 설정 화면의 기본 선택이 된다.
        const ordered = [...variants].sort((a, b) => (a.mode === 'light' ? -1 : 1) - (b.mode === 'light' ? -1 : 1));

        const grounds: Record<string, ThemeGround> = {};
        ordered.forEach((t) => { grounds[t.mode] = groundOf(t); });

        return {
            id: family,
            label: FAMILY_META[family].label,
            description: FAMILY_META[family].description,
            options: ordered.map((t) => t.mode),
            grounds,
        };
    });
}

export default celestial;
