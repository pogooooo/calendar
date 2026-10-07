/**
 * Maple 오브제가 쓰는 그림 — 수채 단풍잎 넷(public/themes/maple/leaf-*.webp).
 *
 * 오브제의 create() 는 그림이 곧바로 있어야 한다: 움직임 '끄기'면 무대가 한 장만 그리고 다시 그리지 않으므로,
 * 그림이 늦게 오면 빈칸으로 남는다. 그래서 목록(index.ts)이 이 그림들을 먼저 받아 둔 뒤에 넘어간다.
 * 받으면서 그림 가장자리의 옅은 크림빛 테(바탕을 따낸 자국)를 한 번 지워 둔다 — 어두운 바탕에서 흰 테두리처럼 보였다.
 * 그림을 못 받으면 캔버스에 그린 단풍잎 실루엣으로 대신한다.
 */
export type LeafSprite = "red" | "orange" | "yellow" | "brown";
const SPRITES: LeafSprite[] = ["red", "orange", "yellow", "brown"];
const cache = new Map<LeafSprite, HTMLCanvasElement>();

const smooth = (a: number, b: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

/** 옅고 밝은(채도 낮은) 픽셀 — 따낸 바탕의 테 — 를 투명하게 */
function clean(img: HTMLImageElement) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d", { willReadFrequently: true });
    if (!g) return c;
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height);
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
        if (!p[i + 3]) continue;
        const hi = Math.max(p[i], p[i + 1], p[i + 2]);
        const lo = Math.min(p[i], p[i + 1], p[i + 2]);
        const sat = hi ? (hi - lo) / hi : 0;
        p[i + 3] = Math.round(p[i + 3] * (1 - smooth(158, 204, hi) * (1 - smooth(0.16, 0.34, sat)) * 0.9));
    }
    g.putImageData(d, 0, 0);
    return c;
}

const load = (sprite: LeafSprite) => new Promise<void>((res) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => { cache.set(sprite, clean(img)); res(); };
    img.onerror = () => res();
    img.src = `/themes/maple/leaf-${sprite}.webp`;
});

let preloading: Promise<void> | null = null;
/** 잎 그림 넷을 받아 다듬어 둔다 (한 번만) */
export function preloadMapleArt() {
    preloading ??= Promise.all(SPRITES.map(load)).then(() => undefined);
    return preloading;
}

/** 단풍잎 실루엣 — 그림을 못 받았을 때 */
function drawnLeaf() {
    const s = 256;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d");
    if (!g) return c;
    const lobes = [{ a: 0, r: 1 }, { a: -1.05, r: 0.86 }, { a: 1.05, r: 0.86 }, { a: -2.1, r: 0.52 }, { a: 2.1, r: 0.52 }];
    g.translate(s / 2, s * 0.52);
    g.beginPath();
    for (let i = 0; i <= 360; i++) {
        const t = -Math.PI + (i / 360) * Math.PI * 2;
        let r = 0.3;
        for (const l of lobes) {
            let d = Math.abs(t - l.a);
            d = Math.min(d, Math.PI * 2 - d);
            r = Math.max(r, l.r * Math.exp(-(d * d) / 0.08));
        }
        r *= s * 0.44 * (1 + 0.06 * Math.sin(t * 26));
        if (i === 0) g.moveTo(Math.sin(t) * r, -Math.cos(t) * r); else g.lineTo(Math.sin(t) * r, -Math.cos(t) * r);
    }
    g.closePath();
    g.fillStyle = "#C8502C";
    g.fill();
    return c;
}

/** 다듬어 둔 잎 그림(없으면 그린 실루엣) */
export function leafArt(sprite: LeafSprite): HTMLCanvasElement {
    return cache.get(sprite) ?? cache.get("red") ?? drawnLeaf();
}

/** 오늘의 잎 — 표본(specimenScene)과 같이 날마다 바뀐다 */
export function todaySprite(d = new Date()): LeafSprite {
    const day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86_400_000);
    return SPRITES[day % SPRITES.length];
}
