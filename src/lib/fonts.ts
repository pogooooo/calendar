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
