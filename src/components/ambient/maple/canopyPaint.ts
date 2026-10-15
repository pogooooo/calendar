/**
 * Maple 의 단풍 가지 — 화면 오른쪽 위에서 단풍나무 가지가 드리우고, 그 뒤로 초점 밖의 잎(보케)과 햇살, 오른쪽 아래에 진 잎.
 * 앱 바탕(MapleAtmosphere)과 로그인 옆 그림판이 쓴다. 멈춘 그림 한 장(Canvas 2D) — 움직임은 그 위로 지는 3D 잎(mapleLeafScene)이 맡는다.
 *
 * 잎은 수채 단풍 넷(public/themes/maple/leaf-*.webp)을 돌리고·키우고·물들여(hue·채도·밝기) 엮는다. 그림 넷의 잎자루 끝은
 * 그림의 (0.465, 0.97) 자리 — 그 점을 가지에 붙인다. 자리·크기는 씨 고정 난수라 늘 같은 가지가 그려진다(창 크기에 맞춰 늘고 준다).
 * 깊이는 세 겹: 먼 잎(크고 흐리고 옅게) · 가지와 또렷한 잎(그림자) · 아주 가까운 잎 둘(크게 흐리게). 가운데로 갈수록 옅어져 글을 가리지 않는다.
 */
import { seededRandom } from "@/components/widget/seededRandom";

export const CANOPY_LEAVES = ["leaf-red", "leaf-orange", "leaf-yellow", "leaf-brown"];

/** 그림 넷을 받는다 — 지는 잎 장면(mapleLeafScene)과 같은 파일이라 이미 받아 둔 것을 다시 쓴다 */
let loading: Promise<HTMLImageElement[]> | null = null;
export function loadCanopyLeaves(): Promise<HTMLImageElement[]> {
    loading ??= Promise.all(CANOPY_LEAVES.map((name) => new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => res(img);
        img.onerror = () => rej(new Error(name));
        img.src = `/themes/maple/${name}.webp`;
    })));
    loading.catch(() => { loading = null; });
    return loading;
}

export interface CanopyOptions {
    width: number;
    height: number;
    dpr: number;
    dark: boolean;
    /** screen: 앱 바탕(오른쪽 위 가지 + 오른쪽 아래 진 잎) · panel: 로그인 옆 그림판(가지만, 조금 크게) */
    variant: "screen" | "panel";
}

type Pt = [number, number];
const STEM: Pt = [0.465, 0.97];

/** 3차 베지어 위의 점과 접선 각 */
function bez(p: Pt[], t: number): { at: Pt; angle: number } {
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

interface Leaf {
    img: number;
    /** 잎자루 끝(가지에 붙는 점) */
    at: Pt;
    /** 잎이 뻗는 쪽(캔버스 각, 아래가 +π/2) */
    dir: number;
    size: number;
    hue: number; sat: number; light: number;
    blur: number;
    alpha: number;
    flip: boolean;
}

function drawLeaf(g: CanvasRenderingContext2D, imgs: HTMLImageElement[], l: Leaf) {
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
    g.rotate(l.dir + Math.PI / 2);
    if (l.flip) g.scale(-1, 1);
    g.drawImage(img, -STEM[0] * l.size, -STEM[1] * l.size, l.size, l.size);
    g.restore();
}

/** 잎 그림 고르기 — 붉음·주황이 많고 노랑·갈빛이 조금 */
const pickImg = (r: () => number) => {
    const v = r();
    return v < 0.36 ? 0 : v < 0.68 ? 1 : v < 0.88 ? 2 : 3;
};

/**
 * 위젯 한 장의 단풍 가지 — 오른쪽 아래 구석에서 비스듬히 올라오는 작은 가지와 바닥에 진 잎 둘.
 * 위젯은 머리 줄(오른쪽 위에 단추)이 있어 구석 아래에 둔다. 칸이 판을 채우는 위젯(busy)은 작고 옅게, 진 잎 없이.
 * 위젯 종류(seed)마다 잎의 빛깔·각도가 조금씩 다르다.
 */
export function paintTwig(canvas: HTMLCanvasElement, imgs: HTMLImageElement[], o: { width: number; height: number; dpr: number; dark: boolean; busy: boolean; seed: string }) {
    const W = Math.max(1, Math.round(o.width));
    const H = Math.max(1, Math.round(o.height));
    canvas.width = Math.round(W * o.dpr);
    canvas.height = Math.round(H * o.dpr);
    const g = canvas.getContext("2d");
    if (!g) return;
    g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const r = seededRandom(`maple-twig:${o.seed}`);
    // 가지 크기 — 칸이 가득한 위젯은 구석에 작게, 작은 위젯(짧은 변 260 미만)은 한 단 작게
    const short = Math.min(W, H);
    const m = short * (o.busy ? 0.4 : short < 260 ? 0.82 : 1);
    const dark = o.dark;
    const at = (x: number, y: number): Pt => [W + x * m, H + y * m];

    const twig: Pt[] = [at(0.06, -0.1), at(-0.2, -0.14), at(-0.38, -0.3), at(-0.52, -0.46)];
    g.save();
    g.globalAlpha = o.busy ? 0.5 : 1;
    g.shadowColor = dark ? "rgba(0, 0, 0, 0.45)" : "rgba(80, 36, 18, 0.2)";
    g.shadowBlur = 0.04 * m;
    g.shadowOffsetX = 0.012 * m;
    g.shadowOffsetY = 0.03 * m;
    branch(g, twig, 0.034 * m, 0.008 * m, dark ? "rgba(92, 66, 52, 0.95)" : "rgba(84, 54, 38, 0.9)");
    const leaves: Leaf[] = [];
    const n = 5;
    for (let i = 0; i < n; i++) {
        const t = 0.18 + (i / n) * 0.78 + r() * 0.05;
        const { at: p, angle } = bez(twig, Math.min(1, t));
        const side = i % 2 === 0 ? 1 : -1;
        let dir = angle + side * (0.8 + r() * 0.5);
        dir = dir + (-Math.PI / 2 - dir) * 0.15; // 위로 조금 선다
        leaves.push({
            img: pickImg(r), at: p, dir,
            size: (0.27 + r() * 0.1) * m * (1 - t * 0.25),
            hue: -10 + r() * 16, sat: 0.95 + r() * 0.2, light: dark ? 0.72 + r() * 0.1 : 0.95 + r() * 0.1,
            blur: 0, alpha: 1, flip: r() < 0.5,
        });
    }
    const end = bez(twig, 1);
    for (let j = 0; j < 2; j++) {
        leaves.push({
            img: pickImg(r), at: end.at, dir: end.angle + (j - 0.5) * 0.7,
            size: (0.24 + r() * 0.06) * m, hue: -8 + r() * 14, sat: 1, light: dark ? 0.74 : 1,
            blur: 0, alpha: 1, flip: r() < 0.5,
        });
    }
    leaves.sort((a, b) => a.at[0] - b.at[0]).forEach((l) => drawLeaf(g, imgs, l));

    // 바닥에 진 잎 둘
    if (!o.busy) {
        for (let i = 0; i < 2; i++) {
            drawLeaf(g, imgs, {
                img: pickImg(r),
                at: [W * (0.18 + i * 0.3 + r() * 0.12), H - 0.02 * m - r() * 0.03 * m],
                dir: r() * Math.PI * 2,
                size: (0.15 + r() * 0.05) * m,
                hue: -12 + r() * 20, sat: 0.9, light: dark ? 0.62 : 0.94,
                blur: 0, alpha: dark ? 0.7 : 0.8, flip: r() < 0.5,
            });
        }
    }
    g.restore();
}

export function paintCanopy(canvas: HTMLCanvasElement, imgs: HTMLImageElement[], o: CanopyOptions) {
    const W = Math.max(1, Math.round(o.width));
    const H = Math.max(1, Math.round(o.height));
    canvas.width = Math.round(W * o.dpr);
    canvas.height = Math.round(H * o.dpr);
    const g = canvas.getContext("2d");
    if (!g) return;
    g.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    const r = seededRandom(`maple-canopy:${o.variant}`);
    const narrow = W < 769;
    // 가지 크기 — 화면에 맞춰. 폰은 가로 폭에 묶는다(가지가 머리 줄을 다 덮지 않게)
    const k = o.variant === "panel"
        ? Math.min(1.25, Math.max(0.6, Math.min(W, H) / 760))
        : narrow ? Math.min(0.5, W / 780) : Math.min(1.2, Math.max(0.62, Math.min(W * 0.62, H) / 880));
    // 가지가 뻗는 길이(k 단위) — 오른쪽 위 구석에 모아, 화면 머리 왼쪽의 제목·달 넘김 단추에 닿지 않게.
    // 폰은 화면 폭의 30% — 왼쪽 위의 제목, 위쪽 탭(월간·주간), 오른쪽 위의 거르개 단추를 비운다
    const span = o.variant === "panel" ? 600 : narrow ? (W * 0.3) / k : 400;
    const dark = o.dark;
    const O: Pt = [W, 0];
    const at = (x: number, y: number): Pt => [O[0] + x * k, O[1] + y * k];

    /* ── 햇살 — 가지 뒤 오른쪽 위에서 ── */
    const sun = at(-200, -80);
    const glow = g.createRadialGradient(sun[0], sun[1], 0, sun[0], sun[1], 900 * k);
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

    /* ── 먼 잎 — 초점 밖, 크고 흐리고 옅게 ── */
    const far: Leaf[] = [];
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
    far.forEach((l) => drawLeaf(g, imgs, l));

    /* ── 가지와 또렷한 잎 ── */
    const bark = dark ? "rgba(92, 66, 52, 0.95)" : "rgba(84, 54, 38, 0.9)";
    // 가지는 위 가장자리를 따라 드리운다 — 잎이 머리 줄 아래(날짜 띠)까지 내려오지 않게. 오른쪽 가장자리로만 한 줄기가 길게 늘어진다
    const drop = narrow ? 150 : o.variant === "panel" ? 420 : 400; // 오른쪽 가장자리로 늘어지는 줄기의 끝
    const main: Pt[] = [at(60, -44), at(-span * 0.3, -4), at(-span * 0.62, 2), at(-span, 24)];
    const armA: Pt[] = [bez(main, 0.1).at, at(-44, drop * 0.3), at(-20, drop * 0.62), at(-10, drop)];
    const armB: Pt[] = [bez(main, 0.5).at, at(-span * 0.56, -16), at(-span * 0.64, -34), at(-span * 0.72, -70)];
    const armC: Pt[] = [bez(main, 0.78).at, at(-span * 0.86, 40), at(-span * 0.93, 46), at(-span * 1.0, 50)];
    const branches: { p: Pt[]; w0: number; w1: number; n: number }[] = [
        { p: main, w0: 15 * k, w1: 3 * k, n: narrow ? 5 : 10 },
        { p: armA, w0: 6.5 * k, w1: 2 * k, n: narrow ? 3 : 6 },
        { p: armB, w0: 5.5 * k, w1: 1.8 * k, n: narrow ? 2 : 3 },
        { p: armC, w0: 5 * k, w1: 1.6 * k, n: narrow ? 1 : 3 },
    ];

    g.save();
    g.shadowColor = dark ? "rgba(0, 0, 0, 0.45)" : "rgba(80, 36, 18, 0.22)";
    g.shadowBlur = 10 * k;
    g.shadowOffsetX = 3 * k;
    g.shadowOffsetY = 7 * k;
    for (const b of branches) branch(g, b.p, b.w0, b.w1, bark);

    const near: Leaf[] = [];
    for (const b of branches) {
        for (let i = 0; i < b.n; i++) {
            const t = 0.12 + (i + r() * 0.6) / b.n * 0.9;
            const { at: p, angle } = bez(b.p, Math.min(1, t));
            const side = i % 2 === 0 ? 1 : -1;
            // 가지 옆으로 돋되 아래로 처진다
            let dir = angle + side * (0.95 + r() * 0.55);
            dir = dir + (Math.PI / 2 - dir) * 0.32;
            const tip = 1 - t * 0.35;
            near.push({
                img: pickImg(r),
                at: p,
                dir,
                size: (84 + r() * 50) * k * tip * (narrow ? 0.92 : 1),
                hue: -10 + r() * 16, sat: 0.95 + r() * 0.2, light: dark ? 0.68 + r() * 0.12 : 0.94 + r() * 0.12,
                blur: 0,
                alpha: dark ? 0.9 : 1,
                flip: r() < 0.5,
            });
        }
        // 가지 끝에 잎 서넛이 부채꼴로
        const end = bez(b.p, 1);
        const fan = narrow ? 2 : 3;
        for (let j = 0; j < fan; j++) {
            const dir = end.angle + (j - (fan - 1) / 2) * 0.62 + (r() - 0.5) * 0.2;
            near.push({
                img: pickImg(r), at: end.at, dir,
                size: (84 + r() * 40) * k, hue: -8 + r() * 14, sat: 1, light: dark ? 0.7 : 0.98 + r() * 0.08,
                blur: 0, alpha: dark ? 0.9 : 1, flip: r() < 0.5,
            });
        }
    }
    // 위에 그린 잎이 앞으로 — 가지 뿌리(오른쪽) 쪽 잎을 나중에
    near.sort((a, b) => a.at[0] - b.at[0]);
    near.forEach((l) => drawLeaf(g, imgs, l));
    g.restore();

    /* ── 아주 가까운 잎 둘 — 구석에 크게, 초점 밖 ── */
    if (!narrow) {
        drawLeaf(g, imgs, { img: 0, at: at(-30, drop * 0.72), dir: -Math.PI * 0.62, size: 340 * k, hue: -6, sat: 1.05, light: dark ? 0.55 : 1, blur: 20 * k, alpha: dark ? 0.35 : 0.5, flip: false });
        drawLeaf(g, imgs, { img: 1, at: at(-span * 0.58, -40), dir: Math.PI * 0.58, size: 240 * k, hue: 4, sat: 1, light: dark ? 0.55 : 1.04, blur: 16 * k, alpha: dark ? 0.3 : 0.42, flip: true });
    }

    /* ── 가운데로 갈수록 옅게 — 글을 가리지 않게 ── */
    g.save();
    g.globalCompositeOperation = "destination-in";
    const fade = g.createRadialGradient(O[0], O[1], 0, O[0], O[1], Math.max(span * 1.55, drop * 1.2) * k);
    fade.addColorStop(0, "rgba(0,0,0,1)");
    fade.addColorStop(0.62, "rgba(0,0,0,1)");
    fade.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = fade;
    g.fillRect(0, 0, W, H);
    g.restore();

    /* ── 오른쪽 아래에 진 잎 ── */
    if (o.variant === "screen" && !narrow) {
        g.save();
        g.shadowColor = dark ? "rgba(0, 0, 0, 0.45)" : "rgba(80, 36, 18, 0.2)";
        g.shadowBlur = 8 * k;
        g.shadowOffsetY = 4 * k;
        for (let i = 0; i < 8; i++) {
            const d = r();
            drawLeaf(g, imgs, {
                img: pickImg(r),
                at: [W - (20 + d * 440) * k, H - (10 + r() * 46) * k],
                dir: r() * Math.PI * 2,
                size: (58 + r() * 44) * k,
                hue: -12 + r() * 20, sat: 0.85 + r() * 0.2, light: dark ? 0.6 : 0.9 + r() * 0.1,
                blur: 0, alpha: dark ? 0.75 : 0.88, flip: r() < 0.5,
            });
        }
        // 왼쪽 아래(사이드바 밑)에도 몇 장 — 바탕을 비운 사이드바로 비친다
        for (let i = 0; i < 4; i++) {
            drawLeaf(g, imgs, {
                img: pickImg(r),
                at: [10 + r() * 190, H - (6 + r() * 40)],
                dir: r() * Math.PI * 2,
                size: 52 + r() * 34,
                hue: -12 + r() * 20, sat: 0.85 + r() * 0.2, light: dark ? 0.6 : 0.9 + r() * 0.1,
                blur: 0, alpha: dark ? 0.7 : 0.85, flip: r() < 0.5,
            });
        }
        g.restore();
    }
}
