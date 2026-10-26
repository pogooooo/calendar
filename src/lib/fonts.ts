export interface FontOption {
    key: string;
    label: string;
    family: string;
    cssUrl: string | null;
}

export const FONT_OPTIONS: FontOption[] = [
    {
        key: "default",
        label: "기본",
        family: "'Inter', sans-serif",
        cssUrl: null,
    },
    {
        key: "noto-sans",
        label: "노토 산스",
        family: "'Noto Sans KR', sans-serif",
        cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300..700&display=swap",
    },
    {
        key: "noto-serif",
        label: "노토 세리프",
        family: "'Noto Serif KR', serif",
        cssUrl: "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300..700&display=swap",
    },
    {
        key: "gowun-dodum",
        label: "고운돋움",
        family: "'Gowun Dodum', sans-serif",
        cssUrl: "https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap",
    },
    {
        key: "gowun-batang",
        label: "고운바탕",
        family: "'Gowun Batang', serif",
        cssUrl: "https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap",
    },
    {
        key: "ibm-plex",
        label: "IBM 플렉스",
        family: "'IBM Plex Sans KR', sans-serif",
        cssUrl: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@300;400;500;700&display=swap",
    },
    {
        key: "nanum-gothic",
        label: "나눔고딕",
        family: "'Nanum Gothic', sans-serif",
        cssUrl: "https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap",
    },
    {
        key: "nanum-myeongjo",
        label: "나눔명조",
        family: "'Nanum Myeongjo', serif",
        cssUrl: "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap",
    },
    {
        key: "gaegu",
        label: "개구쟁이",
        family: "'Gaegu', cursive",
        cssUrl: "https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&display=swap",
    },
    {
        key: "nanum-pen",
        label: "나눔 손글씨 펜",
        family: "'Nanum Pen Script', cursive",
        cssUrl: "https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap",
    },
];

const PRETENDARD: FontOption = {
    key: "pretendard",
    label: "Pretendard",
    family: "'Pretendard Variable', Pretendard, sans-serif",
    cssUrl: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css",
};

const CORMORANT: FontOption = {
    key: "cormorant",
    label: "Cormorant Garamond",
    family: "'Cormorant Garamond', serif",
    cssUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap",
};

/**
 * 테마 갈래가 제 글꼴로 요구하는 것. 설정의 본문 글꼴과 별개로, 그 테마를 켜면 같이 내려받는다.
 * Celestial 의 Orbit 은 next/font 가 번들에 넣으므로 여기 없다.
 */
export const THEME_FONTS: Record<string, FontOption[]> = {
    celestial: [
        {
            key: "cinzel",
            label: "Cinzel",
            family: "'Cinzel', serif",
            // 글자만 받는다(text=) — 숫자·한글은 Orbit 그대로
            cssUrl: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap&text=" + encodeURIComponent("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&'.,-:·!?()"),
        },
        PRETENDARD,
    ],
    ocean: [
        PRETENDARD,
        {
            key: "instrument-serif",
            label: "Instrument Serif",
            family: "'Instrument Serif', serif",
            cssUrl: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
        },
        {
            key: "geist-mono",
            label: "Geist Mono",
            family: "'Geist Mono', monospace",
            cssUrl: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap",
        },
    ],
    // 본문은 Pretendard(2026-10-15 — 명조 본문은 작은 글이 흐렸다), 제목은 고운바탕, 큰 날짜 숫자는 Cormorant
    maple: [
        PRETENDARD,
        FONT_OPTIONS.find(f => f.key === "gowun-batang")!,
        CORMORANT,
    ],
    gem: [PRETENDARD, FONT_OPTIONS.find(f => f.key === "gowun-batang")!, CORMORANT],
};

export const getFontOption = (key: string | undefined) =>
    FONT_OPTIONS.find(f => f.key === key) ?? FONT_OPTIONS[0];

const loaded = new Set<string>();

export function ensureFontLoaded(option: FontOption) {
    if (typeof document === "undefined" || !option.cssUrl || loaded.has(option.key)) return;
    loaded.add(option.key);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = option.cssUrl;
    document.head.appendChild(link);
}
