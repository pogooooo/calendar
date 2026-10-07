import { DefaultTheme } from "styled-components";
import { THEME_FAMILIES, type ThemeFamily } from "./themed";
import { causticNet, sandGrain } from "./ocean/shoreArt";

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
};

/**
 * 갈래마다 글꼴 셋. display 는 제목·머리글, numeral 은 시각·날짜 숫자, body 는 본문(설정에서 고른 글꼴이 덮어쓴다).
 * Orbit 은 next/font 가 번들에 넣어 --font-orbit 변수로 건네주고(이름이 해시라 변수로만 닿는다),
 * Maple 의 두 글꼴은 한글 조각이 커서 번들에 넣지 않고 켤 때 Google Fonts 에서 받는다 (lib/fonts.ts 의 THEME_FONTS).
 */
const CELESTIAL_FONTS = {
    display: "var(--font-orbit), 'Orbit', serif",
    numeral: "var(--font-orbit), 'Orbit', serif",
    body: "'Inter', sans-serif",
};
/**
 * 바다: 라틴 제목은 가는 세리프 Marcellus(참고 그림의 "Under the Sea"), 한글은 둥근 고딕(고운돋움), 숫자는 둥근 Quicksand.
 * 셋 다 켤 때 Google Fonts 에서 받는다. 한글 글자는 Marcellus 에 없으니 고운돋움으로 넘어간다.
 */
const OCEAN_FONTS = {
    display: "'Marcellus', 'Quicksand', 'Gowun Dodum', 'Noto Sans KR', serif",
    numeral: "'Quicksand', 'Gowun Dodum', sans-serif",
    body: "'Gowun Dodum', 'Noto Sans KR', sans-serif",
};
const MAPLE_FONTS = {
    display: "'Gowun Batang', 'Nanum Myeongjo', 'Noto Serif KR', serif",
    numeral: "'Cormorant Garamond', 'Times New Roman', serif",
    body: "'Inter', sans-serif",
};

const CELESTIAL: ThemeFamily = 'celestial';
const MAPLE: ThemeFamily = 'maple';
const OCEAN: ThemeFamily = 'ocean';

/** 갈래마다 하나. 설정 화면에 보이는 이름·설명·미리보기 그림이 여기서 나온다. */
const FAMILY_META: Record<ThemeFamily, { label: string; description: string; preview?: Record<string, string> }> = {
    celestial: { label: 'Celestial', description: 'Gold accents, Orbit typeface' },
    ocean: { label: 'Ocean', description: 'Sunlight through clear water, caustics and seashells' },
    maple: {
        label: 'Maple',
        description: 'Pressed maple leaves on aged paper',
        preview: { light: '/themes/maple/preview-light.webp', dark: '/themes/maple/preview-dark.webp' },
    },
};

const celestial: DefaultTheme = {
    name: 'celestial',
    family: CELESTIAL,
    mode: 'light',
    ...commonStyles,
    fonts: CELESTIAL_FONTS,
    colors: {
        background: '#FAF8F2',
        primary: '#D4AF37',
        accent: '#FAE7B5',
        surface: '#FFFDF7',
        text: '#292D3B',
        textSecondary: '#626577',
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
    fonts: CELESTIAL_FONTS,
    colors: {
        background: '#121725',
        primary: '#D9BD78',
        accent: '#FAE7B5',
        surface: '#1B2233',
        text: '#F0EDE5',
        textSecondary: '#A5AABD',
        border: '#D4AF37',
        success: '#4E8A6D',
        error: '#A13D4B',
        weekend: '#D98A8E',
    },
    preview: { cell: '#1E1E1E', event: '#4A3D1C' },
};

/* ── Maple — 1950년대 식물도감에 끼워 둔 단풍잎 ── */

const maple: DefaultTheme = {
    name: 'maple',
    family: MAPLE,
    mode: 'light',
    ...commonStyles,
    fonts: MAPLE_FONTS,
    colors: {
        background: '#F4EADB',   // 크림 종이
        primary: '#B5432B',      // 단풍 붉음
        accent: '#E4B26A',       // 황토
        surface: '#ECDFC9',
        text: '#3B2A20',         // 먹
        textSecondary: '#7C6656',
        border: '#C8702A',       // 탄 주황
        success: '#6E8B5B',      // 바랜 세이지
        error: '#9E3B2E',
        weekend: '#A24A5B',      // 오디빛
    },
    preview: { cell: '#EFE3CF', event: '#E4B26A' },
    paper: '/themes/maple/widget-paper-light.webp',
    line: '#7C6656',
};

const mapleDark: DefaultTheme = {
    name: 'maple-dark',
    family: MAPLE,
    mode: 'dark',
    ...commonStyles,
    fonts: MAPLE_FONTS,
    colors: {
        background: '#1F1612',   // 호두나무
        primary: '#D8703F',      // 잉걸 주황
        accent: '#E8B45C',
        surface: '#2A1E18',
        text: '#EFE3D0',
        textSecondary: '#A08C78',
        border: '#D8703F',
        success: '#8FA57A',
        error: '#C9584A',
        weekend: '#D98A8E',
    },
    preview: { cell: '#2A1E18', event: '#5A3A22' },
    paper: '/themes/maple/widget-paper-dark.webp',
    line: '#A08C78',
};

/**
 * 이름 규칙: 갈래 이름이 밝은 벌, 거기에 '-dark' 를 붙인 것이 어두운 벌이다.
 * ThemeProviderWrapper 가 이 규칙으로 찾는다.
 */
export const themes: Record<string, DefaultTheme> = {
    celestial,
    'celestial-dark': celestialDark,
    maple,
    'maple-dark': mapleDark,
    /* 맑은 얕은 물 — 흰 모래 위로 비치는 물빛. 테두리 대신 유리(반투명 + 흐림), 금빛·먹 대신 청록과 진주 */
    ocean: {
        name: 'ocean', family: OCEAN, mode: 'light', ...commonStyles,
        fonts: OCEAN_FONTS,
        colors: { background:'#EAF7F7', primary:'#0E8C96', accent:'#6FD6CF', surface:'#F7FDFC', text:'#12404C', textSecondary:'#4F7C86', border:'#9CCFD2', success:'#1F9A7A', error:'#D9604E', weekend:'#E9806E' },
        preview: {
            cell: 'rgba(255,255,255,0.72)', event: '#7FD9D2', today: '#F5A847',
            bg: `${causticNet({ size: 160, freq: 0.03, seed: 11, alpha: 0.7 })} 0 0 / 160px 160px, linear-gradient(180deg, #A6ECE7, #3FC8D0)`,
            rail: `${sandGrain(false)} 0 0 / 120px 120px, linear-gradient(180deg, #F8EDD8, #EAD1A9)`,
        }, line:'#9CCFD2',
    },
    /* 밤의 석호 — 깊은 남청 바탕에 달빛 같은 청록 */
    'ocean-dark': {
        name: 'ocean-dark', family: OCEAN, mode: 'dark', ...commonStyles,
        fonts: OCEAN_FONTS,
        colors: { background:'#06222E', primary:'#6FE3DA', accent:'#1FA6B4', surface:'#0B3140', text:'#E3F7F5', textSecondary:'#94C3CB', border:'#2E6A78', success:'#6FD3B0', error:'#FF9A8B', weekend:'#FF9F8A' },
        preview: {
            cell: 'rgba(40,120,136,0.35)', event: '#1F8C98', today: '#F5A847',
            bg: `${causticNet({ size: 160, freq: 0.03, seed: 11, alpha: 0.35, color: '150 245 235' })} 0 0 / 160px 160px, linear-gradient(180deg, #0B3D4C, #04202B)`,
            rail: `${sandGrain(true)} 0 0 / 120px 120px, linear-gradient(180deg, #3D4651, #2A313B)`,
        }, line:'#2E6A78',
    },
};

/* ── 설정 화면이 읽어 가는 목록 ─────────────────────────────────────────
   예전에는 SettingsPage 에 THEMES 배열이 따로 있었다. 값은 여기, 이름과
   미리보기 색은 저기 — 한쪽만 고치면 조용히 어긋났다. 이제 한 곳에서 만든다. */

export interface ThemeGround {
    /** CSS background 값 — 색 하나거나, 그림을 쓰는 갈래는 그라데이션·무늬 */
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
    /** 벌마다의 미리보기 그림 (있는 갈래만). 없으면 grounds 색으로 축소판을 그린다 */
    preview?: Record<string, string>;
}

const groundOf = (t: DefaultTheme): ThemeGround => ({
    bg: t.preview.bg ?? t.colors.background,
    rail: t.preview.rail ?? t.colors.surface,
    ink: t.colors.text,
    dimInk: t.colors.textSecondary,
    cell: t.preview.cell,
    event: t.preview.event,
    accent: t.preview.today ?? t.colors.primary,
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
            preview: FAMILY_META[family].preview,
        };
    });
}

export default celestial;
