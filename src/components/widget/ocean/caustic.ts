/**
 * 물바닥의 빛 그물(커스틱) — 앱의 물 셰이더(OceanCaustics 의 FRAG, caustic())를 그대로 옮긴 것.
 * 위젯은 셰이더를 돌리지 않는다(투명 창은 계속 그리면 깜빡인다 — BUGS 1.2.0). 같은 식으로 멈춘 한 장만 그려
 * 앱의 물과 같은 결이 되게 한다. 예전의 SVG 난류(feTurbulence)는 구겨진 비닐처럼 보였다(사용자: "물결 무늬가 부자연스러워").
 * 안드로이드 홈 위젯(OceanStyle.kt)도 같은 식을 쓴다.
 */

/** 겹쳐 비틀린 사인 물결의 초점 — 셰이더의 caustic(uv, t) 와 한 줄씩 같다 */
export function caustic(u: number, v: number, t: number): number {
    const px = u * 6.28318 - 250;
    const py = v * 6.28318 - 250;
    let ix = px;
    let iy = py;
    let c = 1;
    const inten = 0.005;
    for (let n = 0; n < 5; n++) {
        const tt = t * (1 - 3.5 / (n + 1));
        const nx = px + (Math.cos(tt - ix) + Math.sin(tt + iy));
        const ny = py + (Math.sin(tt - iy) + Math.cos(tt + ix));
        ix = nx;
        iy = ny;
        c += 1 / Math.hypot(px / (Math.sin(ix + tt) / inten), py / (Math.cos(iy + tt) / inten));
    }
    c /= 5;
    c = 1.17 - Math.pow(c, 1.4);
    return Math.pow(Math.abs(c), 8);
}

export interface CausticPaint {
    /** 멈춘 한 장의 시각 — 위젯마다 달리 주면 무늬가 다르다 */
    t: number;
    /** 무늬 한 주기(uv 1)의 폭(CSS px). 위젯 크기와 상관없이 물결 크기가 같게 */
    cell: number;
    /** 세기 배율 — 알파 = min(1, 세기 × gain) */
    gain: number;
    /** 빛의 색 */
    rgb: readonly [number, number, number];
}

/**
 * 캔버스 하나에 빛 그물을 그린다 — 반 해상도로 셈하고 부드럽게 늘려 깐다(빛 그물은 무른 무늬라 티가 안 난다).
 * 셰이더와 같은 두 겹(cg·c2)과 너울(swell). 빛은 색 하나에 세기를 알파로.
 */
export function paintCaustics(canvas: HTMLCanvasElement, cssW: number, cssH: number, p: CausticPaint) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(1, Math.round(cssW * dpr));
    const H = Math.max(1, Math.round(cssH * dpr));
    canvas.width = W;
    canvas.height = H;
    const w = Math.max(1, Math.round(cssW / 2));
    const h = Math.max(1, Math.round(cssH / 2));
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d");
    const ctx = canvas.getContext("2d");
    if (!octx || !ctx) return;
    const img = octx.createImageData(w, h);
    const d = img.data;
    const ts = p.t * 0.3 + 23;
    const t2 = p.t * 0.22 + 11;
    const [r, g, b] = p.rgb;
    for (let y = 0; y < h; y++) {
        // 셰이더처럼 위가 1 (uv 의 y 는 위로 큰다)
        const v = ((h - y) * 2) / p.cell;
        for (let x = 0; x < w; x++) {
            const u = (x * 2) / p.cell;
            const cg = caustic(u, v, ts);
            const c2 = caustic(u * 1.3 + 0.31, v * 1.3 + 0.17, t2);
            const swell = 0.62 + 0.38 * Math.sin(u * 1.1 + p.t * 0.05) * Math.sin(v * 0.9 - p.t * 0.04);
            const a = Math.min(1, (cg * 0.85 + c2 * 0.4) * swell * p.gain);
            const i = (y * w + x) * 4;
            d[i] = r;
            d[i + 1] = g;
            d[i + 2] = b;
            d[i + 3] = Math.round(a * 255);
        }
    }
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(off, 0, 0, W, H);
}
