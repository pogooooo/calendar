/**
 * Maple 의 단풍 가지 — 화면 오른쪽 위에서 단풍나무 가지가 드리우고, 그 뒤로 초점 밖의 잎(보케)과 햇살, 바닥에 진 잎.
 *
 * 배치(canopyLayout)와 그리기(paintCanopy)를 나눴다. 배치는 씨 고정 난수라 늘 같은 가지가 나오고(창 크기에 맞춰 늘고 준다),
 * 바람 장면(windScene, WebGL)이 같은 배치를 받아 또렷한 잎·가까운 잎·바닥의 잎을 움직이며 그린다 — 그때 이 캔버스는
 * 움직이지 않는 뒤판(햇살·먼 잎·가지 나무)만 그린다(backdrop). WebGL 이 없거나 움직임 '끄기'면 여기서 모두 그린 멈춘 한 장.
 *
 * 잎은 수채 단풍 넷(art.ts 가 다듬어 둔 것)을 돌리고·키우고·물들여(hue·채도·밝기) 엮는다. 그림의 잎자루 끝은
 * (0.465, 0.97) 자리 — 그 점을 가지에 붙인다. 깊이는 세 겹: 먼 잎(크고 흐리고 옅게) · 가지와 또렷한 잎(그림자) ·
 * 아주 가까운 잎 둘(크게 흐리게). 가운데로 갈수록 옅어져 글을 가리지 않는다. 해는 오른쪽 위 — 그림자는 왼쪽 아래로 진다.
 */
import { seededRandom } from "@/components/widget/seededRandom";
import { leafArt, preloadMapleArt } from "@/components/objet/maple/art";

export type LeafImage = CanvasImageSource & { width: number; height: number };

/** 수채 잎 넷(붉음·주황·노랑·갈빛) — 가장자리의 옅은 테를 지운 판(art.ts) */
export function loadCanopyLeaves(): Promise<LeafImage[]> {
    return preloadMapleArt().then(() => (["red", "orange", "yellow", "brown"] as const).map((s) => leafArt(s) as LeafImage));
}

export interface CanopyOptions {
    width: number;
    height: number;
    dpr: number;
    dark: boolean;
    /** screen: 앱 바탕(오른쪽 위 가지 + 바닥에 진 잎) · panel: 로그인 옆 그림판(가지만, 조금 크게) */
    variant: "screen" | "panel";
}

export type Pt = [number, number];
/** 그림 안의 잎자루 끝 (가로·세로 비율) */
export const STEM: Pt = [0.465, 0.97];

/** 3차 베지어 위의 점과 접선 각 */
export function bez(p: Pt[], t: number): { at: Pt; angle: number } {
    const u = 1 - t;
    const x = u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0];
    const y = u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1];
    const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]);
    const dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]);
    return { at: [x, y], angle: Math.atan2(dy, dx) };
}

/** 굵기가 끝으로 갈수록 가늘어지는 가지 (둘레를 이어 칠한다) */
function branch(g: CanvasRenderingContext2D, p: Pt[], w0: number, w1: number, color: string) {
    const N = 40;
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        const { at, angle } = bez(p, t);
        const w = (w0 + (w1 - w0) * Math.pow(t, 0.7)) / 2;
        const nx = -Math.sin(angle), ny = Math.cos(angle);
        left.push([at[0] + nx * w, at[1] + ny * w]);
        right.push([at[0] - nx * w, at[1] - ny * w]);
    }
    g.beginPath();
    g.moveTo(left[0][0], left[0][1]);
    for (const q of left) g.lineTo(q[0], q[1]);
    for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]);
    g.closePath();
    g.fillStyle = color;
    g.fill();
    const end = bez(p, 1).at;
    g.beginPath();
    g.arc(end[0], end[1], w1 / 2, 0, Math.PI * 2);
    g.fill();
}

export interface CanopyLeaf {
    img: number;
    /** 잎자루 끝(가지에 붙는 점) — 화면 px */
    at: Pt;
    /** 잎이 뻗는 쪽(캔버스 각, 아래가 +π/2) */
    dir: number;
    size: number;
    /** 물들이기: 색상 돌림(도) · 채도 · 밝기 */
    hue: number; sat: number; light: number;
    /** 흐림(px, 캔버스 필터 기준) */
    blur: number;
    alpha: number;
    flip: boolean;
}

function drawLeaf(g: CanvasRenderingContext2D, imgs: LeafImage[], l: CanopyLeaf, rot = 0) {
    const img = imgs[l.img];
    g.save();
    g.globalAlpha = l.alpha;
    const f = [];
    if (l.blur > 0.3) f.push(`blur(${l.blur.toFixed(1)}px)`);
    if (l.hue) f.push(`hue-rotate(${l.hue.toFixed(0)}deg)`);
    if (l.sat !== 1) f.push(`saturate(${l.sat.toFixed(2)})`);
    if (l.light !== 1) f.push(`brightness(${l.light.toFixed(2)})`);
    g.filter = f.length ? f.join(" ") : "none";
    g.translate(l.at[0], l.at[1]);
    g.rotate(l.dir + Math.PI / 2 + rot);
    if (l.flip) g.scale(-1, 1);
    g.drawImage(img, -STEM[0] * l.size, -STEM[1] * l.size, l.size, l.size);
    g.restore();
}

/** 잎 그림 고르기 — 붉음·주황이 많고 노랑·갈빛이 조금 */
export const pickImg = (r: () => number) => {
    const v = r();
    return v < 0.36 ? 0 : v < 0.68 ? 1 : v < 0.88 ? 2 : 3;
};

export interface CanopyLayout {
    W: number;
    H: number;
    k: number;
    narrow: boolean;
    dark: boolean;
    /** 가지 뿌리가 들어오는 구석(화면 오른쪽 위) */
    origin: Pt;
    /** 햇살의 가운데·반지름 */
    sun: Pt;
    sunR: number;
    far: CanopyLeaf[];
    branches: { p: Pt[]; w0: number; w1: number }[];
    /** 가지에 붙은 또렷한 잎 — 뒤에서 앞으로 */
    crisp: CanopyLeaf[];
    /** 아주 가까운 잎 — 크게 흐리게 (맨 앞) */
    bokeh: CanopyLeaf[];
    /** 바닥에 진 잎 (screen, 넓은 화면만) */
    ground: CanopyLeaf[];
    /** 구석에서 이만큼 멀어지면 옅어진다(0.62 배까지는 그대로, 1 에서 0) */
    fadeR: number;
}

/** 단풍 가지의 배치 — 씨 고정 난수라 같은 크기면 늘 같다 */
export function canopyLayout(width: number, height: number, variant: CanopyOptions["variant"], dark: boolean): CanopyLayout {
    const W = Math.max(1, Math.round(width));
    const H = Math.max(1, Math.round(height));
    const r = seededRandom(`maple-canopy:${variant}`);
    const narrow = W < 769;
    // 가지 크기 — 화면에 맞춰. 폰은 가로 폭에 묶는다(가지가 머리 줄을 다 덮지 않게)
    const k = variant === "panel"
        ? Math.min(1.25, Math.max(0.6, Math.min(W, H) / 760))
        : narrow ? Math.min(0.5, W / 780) : Math.min(1.2, Math.max(0.62, Math.min(W * 0.62, H) / 880));
    // 가지가 뻗는 길이(k 단위) — 오른쪽 위 구석에 모아, 화면 머리 왼쪽의 제목·달 넘김 단추에 닿지 않게.
    // 폰은 화면 폭의 30% — 왼쪽 위의 제목, 위쪽 탭(월간·주간), 오른쪽 위의 거르개 단추를 비운다
    const span = variant === "panel" ? 600 : narrow ? (W * 0.3) / k : 400;
    const O: Pt = [W, 0];
    const at = (x: number, y: number): Pt => [O[0] + x * k, O[1] + y * k];

    /* 먼 잎 — 초점 밖, 크고 흐리고 옅게 */
    const far: CanopyLeaf[] = [];
    const farN = narrow ? 7 : 22;
    for (let i = 0; i < farN; i++) {
        const d = Math.pow(r(), 1.3);
        const ang = Math.PI * (0.5 + r() * 0.5); // 구석에서 왼쪽·아래로 부채꼴
        const dist = 80 + d * span * 1.05;
        far.push({
            img: pickImg(r),
            // 위 띠에 납작하게 — 머리 줄 아래의 글 뒤로는 내려오지 않는다
            at: at(Math.cos(ang) * dist * 1.2, Math.sin(ang) * dist * 0.34 - 30),
            dir: r() * Math.PI * 2,
            size: (150 + r() * 130) * k,
            hue: -14 + r() * 22, sat: 0.85 + r() * 0.2, light: dark ? 0.55 + r() * 0.15 : 1.02 + r() * 0.1,
            blur: (14 + r() * 10) * k,
            alpha: dark ? 0.22 + r() * 0.14 : 0.3 + r() * 0.18,
            flip: r() < 0.5,
        });
    }

    /* 가지 — 위 가장자리를 따라 드리운다. 오른쪽 가장자리로만 한 줄기가 길게 늘어진다 */
    const drop = narrow ? 150 : variant === "panel" ? 420 : 400;
    const main: Pt[] = [at(60, -44), at(-span * 0.3, -4), at(-span * 0.62, 2), at(-span, 24)];
    const armA: Pt[] = [bez(main, 0.1).at, at(-44, drop * 0.3), at(-20, drop * 0.62), at(-10, drop)];
    const armB: Pt[] = [bez(main, 0.5).at, at(-span * 0.56, -16), at(-span * 0.64, -34), at(-span * 0.72, -70)];
    const armC: Pt[] = [bez(main, 0.78).at, at(-span * 0.86, 40), at(-span * 0.93, 46), at(-span * 1.0, 50)];
    const arms: { p: Pt[]; w0: number; w1: number; n: number }[] = [
        { p: main, w0: 15 * k, w1: 3 * k, n: narrow ? 5 : 10 },
        { p: armA, w0: 6.5 * k, w1: 2 * k, n: narrow ? 3 : 6 },
        { p: armB, w0: 5.5 * k, w1: 1.8 * k, n: narrow ? 2 : 3 },
        { p: armC, w0: 5 * k, w1: 1.6 * k, n: narrow ? 1 : 3 },
    ];

    const crisp: CanopyLeaf[] = [];
    for (const b of arms) {
        for (let i = 0; i < b.n; i++) {
            const t = 0.12 + (i + r() * 0.6) / b.n * 0.9;
            const { at: p, angle } = bez(b.p, Math.min(1, t));
            const side = i % 2 === 0 ? 1 : -1;
            // 가지 옆으로 돋되 아래로 처진다
            let dir = angle + side * (0.95 + r() * 0.55);
            dir = dir + (Math.PI / 2 - dir) * 0.32;
            const tip = 1 - t * 0.35;
            crisp.push({
                img: pickImg(r), at: p, dir,
                size: (84 + r() * 50) * k * tip * (narrow ? 0.92 : 1),
                hue: -10 + r() * 16, sat: 0.95 + r() * 0.2, light: dark ? 0.68 + r() * 0.12 : 0.94 + r() * 0.12,
                blur: 0, alpha: dark ? 0.9 : 1, flip: r() < 0.5,
            });
        }
        // 가지 끝에 잎 서넛이 부채꼴로
        const end = bez(b.p, 1);
        const fan = narrow ? 2 : 3;
        for (let j = 0; j < fan; j++) {
            const dir = end.angle + (j - (fan - 1) / 2) * 0.62 + (r() - 0.5) * 0.2;
            crisp.push({
                img: pickImg(r), at: end.at, dir,
                size: (84 + r() * 40) * k, hue: -8 + r() * 14, sat: 1, light: dark ? 0.7 : 0.98 + r() * 0.08,
                blur: 0, alpha: dark ? 0.9 : 1, flip: r() < 0.5,
            });
        }
    }
    // 위에 그린 잎이 앞으로 — 가지 뿌리(오른쪽) 쪽 잎을 나중에
    crisp.sort((a, b) => a.at[0] - b.at[0]);

    /* 아주 가까운 잎 둘 — 구석에 크게, 초점 밖 */
    const bokeh: CanopyLeaf[] = narrow ? [] : [
        { img: 0, at: at(-30, drop * 0.72), dir: -Math.PI * 0.62, size: 340 * k, hue: -6, sat: 1.05, light: dark ? 0.55 : 1, blur: 20 * k, alpha: dark ? 0.35 : 0.5, flip: false },
        { img: 1, at: at(-span * 0.58, -40), dir: Math.PI * 0.58, size: 240 * k, hue: 4, sat: 1, light: dark ? 0.55 : 1.04, blur: 16 * k, alpha: dark ? 0.3 : 0.42, flip: true },
    ];

    /* 바닥에 진 잎 — 오른쪽 아래와 왼쪽 아래(사이드바 밑) */
    const ground: CanopyLeaf[] = [];
    if (variant === "screen" && !narrow) {
        for (let i = 0; i < 8; i++) {
            const d = r();
            ground.push({
                img: pickImg(r),
                at: [W - (20 + d * 440) * k, H - (10 + r() * 46) * k],
                dir: r() * Math.PI * 2,
                size: (58 + r() * 44) * k,
                hue: -12 + r() * 20, sat: 0.85 + r() * 0.2, light: dark ? 0.6 : 0.9 + r() * 0.1,
                blur: 0, alpha: dark ? 0.75 : 0.88, flip: r() < 0.5,
            });
        }
        for (let i = 0; i < 4; i++) {
            ground.push({
                img: pickImg(r),
                at: [10 + r() * 190, H - (6 + r() * 40)],
                dir: r() * Math.PI * 2,
                size: 52 + r() * 34,
                hue: -12 + r() * 20, sat: 0.85 + r() * 0.2, light: dark ? 0.6 : 0.9 + r() * 0.1,
                blur: 0, alpha: dark ? 0.7 : 0.85, flip: r() < 0.5,
            });
        }
    }

    return {
        W, H, k, narrow, dark, origin: O, sun: at(-200, -80), sunR: 900 * k,
        far, branches: arms.map(({ p, w0, w1 }) => ({ p, w0, w1 })), crisp, bokeh, ground,
        fadeR: Math.max(span * 1.55, drop * 1.2) * k,
    };
}

/** 구석에서의 거리로 정하는 옅어짐 (캔버스의 destination-in 가림과 같은 식 — WebGL 쪽 잎도 이 값을 곱한다) */
export function canopyFade(L: CanopyLayout, x: number, y: number) {
    const d = Math.hypot(x - L.origin[0], y - L.origin[1]) / L.fadeR;
    return d <= 0.62 ? 1 : d >= 1 ? 0 : 1 - (d - 0.62) / 0.38;
}

/**
 * 단풍 가지를 그린다. backdrop 이면 움직이지 않는 뒤판(햇살·먼 잎·가지 나무)만 — 또렷한 잎·가까운 잎·바닥의 잎은 바람 장면이 그린다.
 */
export function paintCanopy(canvas: HTMLCanvasElement, imgs: LeafImage[], o: CanopyOptions & { backdrop?: boolean }) {
    const L = canopyLayout(o.width, o.height, o.variant, o.dark);
    const { W, H, k, dark } = L;
    canvas.width = Math.round(W * o.dpr);
    canvas.height = Math.round(H * o.dpr);
    const g = canvas.getContext("2d");
    if (!g) return;
    g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    /* 햇살 — 가지 뒤 오른쪽 위에서 */
    const glow = g.createRadialGradient(L.sun[0], L.sun[1], 0, L.sun[0], L.sun[1], L.sunR);
    if (dark) {
        glow.addColorStop(0, "rgba(255, 150, 80, 0.2)");
        glow.addColorStop(0.45, "rgba(226, 110, 60, 0.07)");
        glow.addColorStop(1, "rgba(226, 110, 60, 0)");
    } else {
        glow.addColorStop(0, "rgba(255, 214, 150, 0.6)");
        glow.addColorStop(0.4, "rgba(255, 190, 120, 0.2)");
        glow.addColorStop(1, "rgba(255, 190, 120, 0)");
    }
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);

    L.far.forEach((l) => drawLeaf(g, imgs, l));

    /* 가지 나무와 또렷한 잎 — 그림자는 왼쪽 아래로 */
    const bark = dark ? "rgba(92, 66, 52, 0.95)" : "rgba(84, 54, 38, 0.9)";
    g.save();
    g.shadowColor = dark ? "rgba(0, 0, 0, 0.45)" : "rgba(80, 36, 18, 0.22)";
    g.shadowBlur = 10 * k;
    g.shadowOffsetX = -3 * k;
    g.shadowOffsetY = 7 * k;
    for (const b of L.branches) branch(g, b.p, b.w0, b.w1, bark);
    if (!o.backdrop) L.crisp.forEach((l) => drawLeaf(g, imgs, l));
    g.restore();

    if (!o.backdrop) L.bokeh.forEach((l) => drawLeaf(g, imgs, l));

    /* 가운데로 갈수록 옅게 — 글을 가리지 않게 */
    g.save();
    g.globalCompositeOperation = "destination-in";
    const fade = g.createRadialGradient(L.origin[0], L.origin[1], 0, L.origin[0], L.origin[1], L.fadeR);
    fade.addColorStop(0, "rgba(0,0,0,1)");
    fade.addColorStop(0.62, "rgba(0,0,0,1)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = fade;
    g.fillRect(0, 0, W, H);
    g.restore();

    /* 바닥에 진 잎 */
    if (!o.backdrop && L.ground.length) {
        g.save();
        g.shadowColor = dark ? "rgba(0, 0, 0, 0.45)" : "rgba(80, 36, 18, 0.2)";
        g.shadowBlur = 8 * k;
        g.shadowOffsetX = -2 * k;
        g.shadowOffsetY = 4 * k;
        L.ground.forEach((l) => drawLeaf(g, imgs, l));
        g.restore();
    }
}

/**
 * 위젯 한 장의 단풍 그늘 — 위젯 위로 단풍나무가 드리워 있다고 치고, 그 잎을 지나온 햇빛이 종이에 떨어진 모습.
 * 또렷한 잎은 그리지 않는다 (2026-10-16 "위젯의 단풍이 내용을 가린다" — 구석의 수채 가지가 기념일·마감·달력 날짜를 덮었다).
 * 흐린 단풍잎 꼴의 물든 빛(붉은·주황 잎을 지나온 빛)과 옅은 그늘만 깔아, 글은 늘 평평한 종이 위에서 읽힌다 —
 * 바다 위젯의 물빛 그물과 같은 몫. 잎 꼴은 흐려도 다섯 갈래가 보일 만큼만 흐린다.
 * 해와 나무는 오른쪽 위(앱 바탕의 가지와 같은 쪽) — 빛과 그늘이 그쪽에 짙고 왼쪽 아래로 옅어진다.
 * 어두운 벌에서는 그늘이 보이지 않으므로 물든 빛만, 조금 밝게. 칸이 판을 채우는 위젯(busy)은 더 옅게.
 * 위젯 종류(seed)마다 잎의 자리·빛깔이 다르다. 잎 하나하나는 흐린 판을 미리 구워 두고(spriteCache) 옮겨 그리기만 한다 —
 * 흔들리는 2초 동안 장마다 흐림 필터를 다시 돌리지 않게.
 * sway: 커서가 들어온 뒤 지난 초 — 위의 가지가 흔들린 듯 그늘이 잎마다 조금씩 늦게 일렁였다 잦아든다(없으면 멈춘 그림).
 */
const spriteCache = new Map<string, HTMLCanvasElement>();

function leafSprite(imgs: LeafImage[], img: number, size: number, blur: number, filter: string) {
    const key = `${img}|${Math.round(size)}|${Math.round(blur * 2)}|${filter}`;
    const hit = spriteCache.get(key);
    if (hit) return hit;
    const pad = Math.ceil(blur * 2.5);
    const c = document.createElement("canvas");
    c.width = c.height = Math.ceil(size + pad * 2);
    const g = c.getContext("2d");
    if (g) {
        g.filter = `${filter} blur(${blur.toFixed(1)}px)`;
        g.drawImage(imgs[img], pad, pad, size, size);
    }
    if (spriteCache.size > 160) spriteCache.clear();
    spriteCache.set(key, c);
    return c;
}

export function paintDapple(canvas: HTMLCanvasElement, imgs: LeafImage[], o: { width: number; height: number; dpr: number; dark: boolean; busy: boolean; seed: string; sway?: number }) {
    const W = Math.max(1, Math.round(o.width));
    const H = Math.max(1, Math.round(o.height));
    if (canvas.width !== Math.round(W * o.dpr) || canvas.height !== Math.round(H * o.dpr)) {
        canvas.width = Math.round(W * o.dpr);
        canvas.height = Math.round(H * o.dpr);
    }
    const g = canvas.getContext("2d");
    if (!g) return;
    g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const r = seededRandom(`maple-dapple:${o.seed}`);
    const dark = o.dark;
    const short = Math.min(W, H), long = Math.max(W, H);
    const k = o.busy ? 0.6 : 1;
    // 흔들림 — 바람이 나무(오른쪽 위)에서 번지듯 먼 잎일수록 조금 늦게
    const sway = (i: number, lag: number) => {
        if (o.sway === undefined) return 0;
        const t = Math.max(0, o.sway - lag);
        return Math.exp(-t * 2.2) * Math.sin(t * (7 + (i % 4) * 1.3) + i * 1.7) * Math.min(1, t * 6);
    };

    // 잎 자리 — 어긋난 격자로 판을 고르게 덮되, 오른쪽 위(해·나무)에 가까울수록 짙게
    const cell = Math.max(64, Math.min(150, short * 0.46));
    const cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
    type Spot = { x: number; y: number; near: number; size: number; rot: number; img: number; shade: boolean; hue: number; sat: number; light: number; flip: boolean };
    const spots: Spot[] = [];
    for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
            const x = (gx - 0.2 + r() * 0.85) * cell;
            const y = (gy - 0.2 + r() * 0.85) * cell;
            const d = Math.hypot((W - x) / long, (y / long) * 1.2);
            spots.push({
                x, y,
                near: Math.max(0, 1 - d),
                size: cell * (0.95 + r() * 0.55),
                rot: r() * Math.PI * 2,
                img: pickImg(r),
                shade: r() < 0.42,
                hue: -14 + r() * 22, sat: 1 + r() * 0.2, light: 0.95 + r() * 0.15,
                flip: r() < 0.5,
            });
        }
    }

    const draw = (s: Spot, i: number, sprite: HTMLCanvasElement, alpha: number) => {
        const lag = (1 - s.near) * 0.3;
        const w = sway(i, lag);
        g.save();
        g.globalAlpha = alpha;
        g.translate(s.x + w * s.size * 0.07, s.y + w * s.size * 0.03);
        g.rotate(s.rot + w * 0.16);
        if (s.flip) g.scale(-1, 1);
        const sz = sprite.width / o.dpr;
        g.drawImage(sprite, -sz / 2, -sz / 2, sz, sz);
        g.restore();
    };

    // 그늘 — 잎이 해를 가린 자리 (밝은 종이에서만). 그늘이 더 흐리다
    if (!dark) {
        spots.forEach((s, i) => {
            if (!s.shade) return;
            const blur = s.size * 0.075;
            const sprite = leafSprite(imgs, s.img, s.size * o.dpr, blur * o.dpr, "hue-rotate(-10deg) saturate(1.15) brightness(0.5)");
            draw(s, i, sprite, (0.022 + 0.06 * s.near) * k);
        });
    }
    // 물든 빛 — 붉은·주황 잎을 지나온 햇빛
    spots.forEach((s, i) => {
        if (s.shade && !dark) return;
        const blur = s.size * 0.05;
        const filter = `hue-rotate(${s.hue.toFixed(0)}deg) saturate(${s.sat.toFixed(2)}) brightness(${(dark ? s.light * 1.15 : s.light).toFixed(2)})`;
        const sprite = leafSprite(imgs, s.img, s.size * o.dpr, blur * o.dpr, filter);
        draw(s, i, sprite, (dark ? 0.045 + 0.11 * s.near : 0.06 + 0.17 * s.near) * k);
    });
}

/**
 * 위젯에 잎 몇 장이 한 번 진다 — 커서가 위젯에 들어올 때(데스크톱 위젯, MapleWidgetDecor). 나무가 있는 오른쪽 위에서 떨어져
 * 진자처럼 오가며(가운데서 빠르고 끝에서 멈칫) 왼쪽 아래로 흘러 나가고, 긴 축으로 뒤집히며 폭이 줄었다 는다(옆에서 본 3D 흉내).
 * 다 떨어지면 캔버스를 비우고 멈춘다 — 위젯은 투명 창이라 끝없이 움직이면 깜빡인다(BUGS 1.2.0). 내용 위를 지나가지만 3초쯤뿐이다.
 * 돌려주는 함수를 부르면 곧바로 멈춘다(onDone 은 부르지 않는다).
 */
export function playLeafFall(canvas: HTMLCanvasElement, imgs: LeafImage[], o: { width: number; height: number; dpr: number; dark: boolean; gentle: boolean; onDone: () => void }) {
    const W = Math.max(1, Math.round(o.width));
    const H = Math.max(1, Math.round(o.height));
    canvas.width = Math.round(W * o.dpr);
    canvas.height = Math.round(H * o.dpr);
    const g = canvas.getContext("2d");
    if (!g) { o.onDone(); return () => {}; }
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const short = Math.min(W, H);
    const n = o.gentle ? 2 : Math.max(3, Math.min(5, Math.round((W * H) / 40000) + 2));
    const dur = o.gentle ? 4.4 : 3.4;
    const leaves = Array.from({ length: n }, (_, i) => {
        const size = Math.max(15, Math.min(28, short * 0.11)) * rand(0.8, 1.25);
        return {
            img: pickImg(Math.random), size,
            x0: W * rand(0.42, 1.02), y0: -size * rand(0.8, 1.4),
            drift: -W * rand(0.12, 0.34),
            amp: size * rand(0.7, 1.5), w: rand(2.2, 3.4), ph: rand(0, Math.PI * 2),
            rot0: rand(-0.6, 0.6), spin: rand(-0.9, 0.9), roll: rand(1.4, 2.6),
            delay: i * rand(0.16, 0.34),
            flip: Math.random() < 0.5,
        };
    });
    let raf = 0;
    let stopped = false;
    const start = performance.now();
    const frame = (now: number) => {
        if (stopped) return;
        const t = (now - start) / 1000;
        g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        g.filter = o.dark ? "brightness(0.82)" : "none";
        g.shadowColor = o.dark ? "rgba(0, 0, 0, 0.4)" : "rgba(80, 36, 18, 0.2)";
        g.shadowBlur = 4;
        g.shadowOffsetX = -2;
        g.shadowOffsetY = 5;
        let alive = false;
        for (const l of leaves) {
            const tt = t - l.delay;
            if (tt < 0) { alive = true; continue; }
            const k = tt / dur;
            if (k >= 1) continue;
            alive = true;
            const ph = l.w * tt + l.ph;
            // 가운데서 빨리 내려오고 끝에서 멈칫 — 오감에 맞춰 떨어지는 빠르기가 출렁인다
            const x = l.x0 + l.drift * k + l.amp * Math.sin(ph);
            const y = l.y0 + (H + l.size * 2.6) * k - l.size * 0.3 * Math.cos(2 * ph);
            const roll = Math.cos(l.roll * tt + l.ph);
            g.save();
            g.globalAlpha = Math.min(1, k / 0.08) * Math.min(1, (1 - k) / 0.18) * 0.96;
            g.translate(x, y);
            g.rotate(l.rot0 + l.spin * tt + 0.45 * Math.sin(ph));
            g.scale((l.flip ? -1 : 1) * Math.max(0.12, Math.abs(roll)), 0.9 + 0.1 * Math.sin(ph * 1.3));
            g.drawImage(imgs[l.img], -l.size / 2, -l.size / 2, l.size, l.size);
            g.restore();
        }
        if (alive) raf = requestAnimationFrame(frame);
        else { g.clearRect(0, 0, W, H); stopped = true; o.onDone(); }
    };
    raf = requestAnimationFrame(frame);
    return () => { stopped = true; cancelAnimationFrame(raf); };
}
