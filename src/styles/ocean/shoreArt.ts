/**
 * 물가의 그림을 CSS 배경으로 — 모래알 결, 멈춘 물빛 그물, 물거품 띠, 불가사리·가리비.
 *
 * React 그림(assets/ocean/SeaLife)은 화면에 놓는 장식이고, 여기 것은 background-image 로 까는 것이다
 * (오늘 칸의 불가사리, 모래 판의 결, 위젯·움직임 끔에서 three.js 대신 쓰는 물빛 그물).
 * 아무것도 가져오지 않는 순수 함수라 node 로 바로 돌려 볼 수 있다.
 */

const uri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s{2,}/g, " "))}")`;
const f = (n: number) => n.toFixed(1);
const deg = (d: number) => (d * Math.PI) / 180;

/** 모래알 결 — 갈색 알갱이 한 겹 + 햇빛에 반짝이는 흰 알갱이 한 겹 */
export function sandGrain(dark: boolean): string {
    const ink = dark ? "0.80 0.80 0.86" : "0.47 0.34 0.20";
    const [r, g, b] = ink.split(" ");
    return uri(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
        <filter id='a' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='7' stitchTiles='stitch'/>
            <feColorMatrix values='0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 2.6 -1.38'/></filter>
        <filter id='b' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='1' seed='19' stitchTiles='stitch'/>
            <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 4 -2.55'/></filter>
        <rect width='100%' height='100%' filter='url(#a)' opacity='${dark ? 0.35 : 0.5}'/>
        <rect width='100%' height='100%' filter='url(#b)' opacity='${dark ? 0.35 : 0.85}'/>
    </svg>`);
}

/**
 * 멈춘 물빛 그물 — 난류(turbulence)가 0 에 가까운 주름만 밝게 남기면 물바닥 빛 그물처럼 보인다.
 * size 는 무늬 한 장의 크기(px), alpha 는 선의 진하기.
 */
export function causticNet({ size = 420, freq = 0.0095, alpha = 0.6, color = "255 255 255", seed = 4 }: { size?: number; freq?: number; alpha?: number; color?: string; seed?: number } = {}): string {
    const [r, g, b] = color.split(" ").map((c) => Number(c) / 255);
    // 가늘고 밝은 선 한 겹 + 그 둘레의 옅은 번짐 한 겹 + 더 잘게 갈라진 선 한 겹 — 겹치면 그물이 촘촘해진다
    const layer = (id: string, fq: number, sd: number, sharp: number, blur: number, op: number) => `
        <filter id='${id}' x='0' y='0'><feTurbulence type='turbulence' baseFrequency='${fq.toFixed(4)}' numOctaves='1' seed='${sd}' stitchTiles='stitch'/>
            <feColorMatrix values='0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  -${sharp} 0 0 0 1.04'/><feGaussianBlur stdDeviation='${blur}'/></filter>
        <rect width='100%' height='100%' filter='url(#${id})' opacity='${op.toFixed(2)}'/>`;
    return uri(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
        ${layer("g", freq, seed, 9, 2.4, alpha * 0.35)}
        ${layer("l", freq, seed, 44, 0.45, alpha)}
        ${layer("m", freq * 1.7, seed + 7, 50, 0.45, alpha * 0.5)}
    </svg>`);
}

/**
 * 물거품 띠(가로) — 위는 물 쪽, 아래는 모래 쪽. 반복해 깔면 물가 경계가 된다.
 * 거품 덩이(구멍 송송) + 물러나는 가는 레이스 + 젖은 모래 그늘. 어두운 벌은 밤바다의 푸른 빛(야광 플랑크톤)으로.
 */
export function foamBand(dark: boolean): string {
    const foam = dark ? "#7FF5EA" : "#FFFFFF";
    const hole = dark ? "#0B3D4C" : "#BFEFEA";
    return uri(`<svg xmlns='http://www.w3.org/2000/svg' width='260' height='36' viewBox='0 0 260 36'>
        <path d='M0 22 C 30 28, 52 30, 80 26 S 130 20, 160 27 S 214 31, 260 23 L260 36 L0 36 Z' fill='${dark ? "#000000" : "#B58A55"}' opacity='${dark ? 0.18 : 0.14}'/>
        <path d='M0 12 C 18 7, 34 6, 52 10 S 86 16, 112 9 S 156 4, 182 10 S 230 15, 260 12
                 L260 19 C 236 24, 214 21, 190 18 S 140 24, 112 19 S 64 23, 40 20 S 12 18, 0 19 Z' fill='${foam}' opacity='${dark ? 0.32 : 0.96}'/>
        <path d='M0 12 C 18 7, 34 6, 52 10 S 86 16, 112 9 S 156 4, 182 10 S 230 15, 260 12' fill='none' stroke='${foam}' stroke-width='${dark ? 1.4 : 1}' opacity='${dark ? 0.9 : 0.6}'/>
        ${[[22, 13, 1.6], [47, 12, 1.1], [70, 15, 2], [96, 13, 1.2], [128, 12, 1.5], [150, 14, 1], [176, 13, 1.8], [204, 16, 1.1], [236, 15, 1.4]]
            .map(([x, y, rr]) => `<circle cx='${x}' cy='${y}' r='${rr}' fill='${hole}' opacity='${dark ? 0.6 : 0.75}'/>`).join("")}
        <path d='M0 27 C 26 23, 48 24, 70 27 S 118 31, 146 26 S 200 22, 228 26 S 252 28, 260 27' fill='none' stroke='${foam}' stroke-width='1.1' stroke-dasharray='14 5 3 6' stroke-linecap='round' opacity='${dark ? 0.55 : 0.7}'/>
        ${[[12, 4, 1.2], [64, 3, 0.9], [118, 2, 1.1], [168, 4, 0.9], [222, 3, 1.2]].map(([x, y, rr]) => `<circle cx='${x}' cy='${y}' r='${rr}' fill='${foam}' opacity='.65'/>`).join("")}
    </svg>`);
}

/* ── 물가 선 (사이드바 오른쪽) ─────────────────────────────────────────
 * 모래가 물 쪽으로 혀처럼 내밀었다 들어가는 선. 모래(마스크)와 물거품(OceanSidebarDesign)이 같은 선을 따라야
 * 어긋나지 않으므로 여기 한 곳에서 계산한다. 한 주기 SHORE_PERIOD px 마다 되풀이(마스크가 repeat-y 로 이어 붙는다). */
export const SHORE_PERIOD = 220;
/** 모래가 사이드바 오른쪽 끝에서 더 나가는 폭(px) — 이 안에서 물가 선이 오르내린다 */
export const SHORE_REACH = 26;
/** y(px) 에서 물가 선의 x — 0(사이드바 끝) ~ SHORE_REACH 사이 */
export const shoreX = (y: number) => {
    const t = (y / SHORE_PERIOD) * Math.PI * 2;
    return 13 + Math.sin(t) * 6 + Math.sin(t * 2 + 1.3) * 3 + Math.sin(t * 3 + 0.4) * 1.2;
};
/** 물가 선을 따라 그린 경로 조각들 (x 는 offset 만큼 밀어서) */
export function shorePath(height: number, offset = 0, step = 6): string {
    let d = "";
    for (let y = 0; y <= height; y += step) d += `${y === 0 ? "M" : "L"}${f(shoreX(y) + offset)} ${y} `;
    return d.trim();
}
/** 모래 판의 오른쪽 가장자리를 물가 선으로 오려 내는 마스크 한 장 (SHORE_REACH × SHORE_PERIOD) */
export function shoreMask(): string {
    return uri(`<svg xmlns='http://www.w3.org/2000/svg' width='${SHORE_REACH}' height='${SHORE_PERIOD}' viewBox='0 0 ${SHORE_REACH} ${SHORE_PERIOD}' preserveAspectRatio='none'>
        <path d='M0 0 ${shorePath(SHORE_PERIOD, 0, 4).replace(/^M/, "L")} L0 ${SHORE_PERIOD} Z' fill='#000'/>
    </svg>`);
}

/* ── 불가사리·가리비 (CSS 배경용) ───────────────────────────────────── */
const STAR = (() => {
    const cx = 50, cy = 52, R = 45, r = 18;
    let d = "";
    for (let i = 0; i < 5; i++) {
        const a = deg(-90 + i * 72), b = deg(-90 + i * 72 + 36), a2 = deg(-90 + (i + 1) * 72);
        const tip = [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
        const tipL = [cx + Math.cos(a - 0.1) * (R - 3.5), cy + Math.sin(a - 0.1) * (R - 3.5)];
        const tipR = [cx + Math.cos(a + 0.1) * (R - 3.5), cy + Math.sin(a + 0.1) * (R - 3.5)];
        const valley = [cx + Math.cos(b) * r, cy + Math.sin(b) * r];
        const next = [cx + Math.cos(a2 - 0.1) * (R - 3.5), cy + Math.sin(a2 - 0.1) * (R - 3.5)];
        if (i === 0) d += `M${f(tipL[0])} ${f(tipL[1])}`;
        d += ` Q${f(tip[0])} ${f(tip[1])} ${f(tipR[0])} ${f(tipR[1])} Q${f(valley[0])} ${f(valley[1])} ${f(next[0])} ${f(next[1])}`;
    }
    const dots: string[] = [];
    for (let i = 0; i < 5; i++) for (let k = 1; k <= 4; k++) {
        const a = deg(-90 + i * 72), t = 7 + k * 8;
        dots.push(`<circle cx='${f(cx + Math.cos(a) * t)}' cy='${f(cy + Math.sin(a) * t)}' r='${f(2.6 - k * 0.38)}'/>`);
    }
    return { d: d + " Z", dots: dots.join("") };
})();

export const STAR_TONES = {
    amber: ["#FFE2A8", "#F5A847", "#D4741C"],
    aqua: ["#D9FBF8", "#68D8E2", "#2A9FB6"],
    coral: ["#FFD9CC", "#F49176", "#D25A43"],
} as const;

export function starfish(tone: keyof typeof STAR_TONES = "amber", shadow = false): string {
    const [hi, mid, lo] = STAR_TONES[tone];
    return uri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <defs><radialGradient id='g' cx='46%' cy='42%' r='62%'><stop offset='0' stop-color='${hi}'/><stop offset='.55' stop-color='${mid}'/><stop offset='1' stop-color='${lo}'/></radialGradient></defs>
        ${shadow ? `<path d='${STAR.d}' transform='translate(2.5 3.5)' fill='#3A2A18' opacity='.18'/>` : ""}
        <path d='${STAR.d}' fill='url(#g)'/>
        <g fill='#FFFFFF' opacity='.5'>${STAR.dots}</g>
    </svg>`);
}

const SCALLOP = (() => {
    const hx = 50, hy = 86, rx = 42, ry = 76, n = 12;
    const at = (a: number, k = 1) => [hx + Math.sin(deg(a)) * rx * k, hy - Math.cos(deg(a)) * ry * k];
    const angles = Array.from({ length: n + 1 }, (_, i) => -60 + (120 * i) / n);
    const pts = angles.map((a) => at(a));
    let d = `M${hx} ${hy} L${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
        const [cx, cy] = at((angles[i] + angles[i + 1]) / 2, 1.07);
        d += ` Q${f(cx)} ${f(cy)} ${f(pts[i + 1][0])} ${f(pts[i + 1][1])}`;
    }
    const ribs = angles.slice(1, n).map((a) => { const [x, y] = at(a, 0.97); return `M${hx} ${hy} L${f(x)} ${f(y)}`; }).join(" ");
    return { d: d + " Z", ribs };
})();

export const SHELL_TONES = {
    peach: ["#FFF3E6", "#FBC9A0", "#E38C5B"],
    pearl: ["#FFFFFF", "#F3ECE2", "#CFC1AF"],
    coral: ["#FFE8DE", "#F6A88E", "#D86A50"],
} as const;

export function scallop(tone: keyof typeof SHELL_TONES = "peach"): string {
    const [hi, mid, lo] = SHELL_TONES[tone];
    return uri(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <defs><radialGradient id='g' cx='50%' cy='20%' r='88%'><stop offset='0' stop-color='${hi}'/><stop offset='.55' stop-color='${mid}'/><stop offset='1' stop-color='${lo}'/></radialGradient></defs>
        <path d='${SCALLOP.d}' fill='url(#g)'/>
        <path d='${SCALLOP.ribs}' stroke='${lo}' stroke-opacity='.35' stroke-width='1.6' fill='none'/>
        <path d='M38 92 Q50 84 62 92 L58 98 L42 98 Z' fill='${mid}'/>
    </svg>`);
}

/** 물방울 하나 (CSS 그라데이션만) — 가장자리가 밝고 속은 비친다 */
export const BUBBLE_FILL = `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0 9%, rgba(255,255,255,0) 24%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 56%, rgba(255,255,255,0.55) 72%, rgba(190,245,240,0.35) 100%)`;
