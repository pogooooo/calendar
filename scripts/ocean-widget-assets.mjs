/**
 * Ocean 홈 위젯(안드로이드, 네이티브)이 까는 빛 그물(커스틱) 타일을 굽는다.
 *
 *   node scripts/ocean-widget-assets.mjs
 *
 * 데스크톱 위젯(OceanWidgetDecor)은 SVG 의 feTurbulence 로 그 자리에서 그리지만, 홈 위젯은 Canvas 로 그린 그림이라
 * 같은 무늬를 타일 한 장으로 구워 BitmapShader 로 깐다. 무늬를 같게 하려고 SVG 명세(Filter Effects §feTurbulence)의
 * 참조 구현을 그대로 옮겼다 — 'turbulence'(|잡음| 의 합)의 알파 채널에서 낮은 값만 밝게 남기면(표 1 0.22 0 …)
 * 물바닥에 어른거리는 빛 그물이 된다. stitchTiles 로 이어 붙여도 이음새가 없다.
 *
 * 결과: src-tauri/android-overlay/app/src/main/res/drawable-nodpi/ocean_caustics.webp (흰색 + 알파, 무손실)
 * 타일은 화가의 2배 밀도 기준 384px(= 192dp). 화가는 density/2 로 줄여 깐다(Maple 종이 타일과 같은 규칙).
 */
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const OUT = path.join(root, "src-tauri/android-overlay/app/src/main/res/drawable-nodpi/ocean_caustics.webp");
const SIZE = 384;
// 데스크톱(0.022 0.03 /CSS px)을 2배 밀도로 — 가로로 조금 늘어진 그물
const FREQ = [0.011, 0.015];
const OCTAVES = 2;
const SEED = 7;
const TABLE = [1, 0.22, 0, 0, 0, 0, 0, 0];

/* ── feTurbulence 참조 구현 (SVG 1.1 / Filter Effects 명세) ─────────────────── */
const BSize = 0x100, BM = 0xff, PerlinN = 0x1000;
const RAND_m = 2147483647, RAND_a = 16807, RAND_q = 127773, RAND_r = 2836;
const lattice = new Int32Array(BSize + BSize + 2);
const gradient = Array.from({ length: 4 }, () => Array.from({ length: BSize + BSize + 2 }, () => [0, 0]));

function setupSeed(s) {
    if (s <= 0) s = -(s % (RAND_m - 1)) + 1;
    if (s > RAND_m - 1) s = RAND_m - 1;
    return s;
}
function random(s) {
    let r = RAND_a * (s % RAND_q) - RAND_r * Math.trunc(s / RAND_q);
    if (r <= 0) r += RAND_m;
    return r;
}
function init(seed) {
    let s = setupSeed(seed), i, j, k;
    for (k = 0; k < 4; k++) {
        for (i = 0; i < BSize; i++) {
            lattice[i] = i;
            for (j = 0; j < 2; j++) gradient[k][i][j] = (((s = random(s)) % (BSize + BSize)) - BSize) / BSize;
            const n = Math.sqrt(gradient[k][i][0] ** 2 + gradient[k][i][1] ** 2);
            gradient[k][i][0] /= n;
            gradient[k][i][1] /= n;
        }
    }
    while (--i) {
        k = lattice[i];
        lattice[i] = lattice[(j = (s = random(s)) % BSize)];
        lattice[j] = k;
    }
    for (i = 0; i < BSize + 2; i++) {
        lattice[BSize + i] = lattice[i];
        for (k = 0; k < 4; k++) for (j = 0; j < 2; j++) gradient[k][BSize + i][j] = gradient[k][i][j];
    }
}
const sCurve = (t) => t * t * (3 - 2 * t);
const lerp = (t, a, b) => a + t * (b - a);
function noise2(ch, vx, vy, st) {
    let t = vx + PerlinN;
    let bx0 = Math.trunc(t) & BM, bx1 = (bx0 + 1) & BM;
    const rx0 = t - Math.trunc(t), rx1 = rx0 - 1;
    t = vy + PerlinN;
    let by0 = Math.trunc(t) & BM, by1 = (by0 + 1) & BM;
    const ry0 = t - Math.trunc(t), ry1 = ry0 - 1;
    if (st) {
        if (bx0 >= st.wrapX) bx0 -= st.width;
        if (bx1 >= st.wrapX) bx1 -= st.width;
        if (by0 >= st.wrapY) by0 -= st.height;
        if (by1 >= st.wrapY) by1 -= st.height;
    }
    bx0 &= BM; bx1 &= BM; by0 &= BM; by1 &= BM;
    const i = lattice[bx0], j = lattice[bx1];
    const b00 = lattice[i + by0], b10 = lattice[j + by0], b01 = lattice[i + by1], b11 = lattice[j + by1];
    const sx = sCurve(rx0), sy = sCurve(ry0);
    const g = gradient[ch];
    let q = g[b00], u = rx0 * q[0] + ry0 * q[1];
    q = g[b10]; let v = rx1 * q[0] + ry0 * q[1];
    const a = lerp(sx, u, v);
    q = g[b01]; u = rx0 * q[0] + ry1 * q[1];
    q = g[b11]; v = rx1 * q[0] + ry1 * q[1];
    const b = lerp(sx, u, v);
    return lerp(sy, a, b);
}
function turbulence(ch, x, y, fx, fy, octaves, w, h) {
    // 이어 붙일 수 있게 주파수를 타일에 맞춘다 (stitchTiles="stitch")
    const lo = (f, n) => Math.floor(n * f) / n, hi = (f, n) => Math.ceil(n * f) / n;
    if (fx) fx = fx / lo(fx, w) < hi(fx, w) / fx ? lo(fx, w) : hi(fx, w);
    if (fy) fy = fy / lo(fy, h) < hi(fy, h) / fy ? lo(fy, h) : hi(fy, h);
    const st = { width: Math.trunc(w * fx + 0.5), height: Math.trunc(h * fy + 0.5) };
    st.wrapX = Math.trunc(PerlinN + st.width);
    st.wrapY = Math.trunc(PerlinN + st.height);
    let sum = 0, vx = x * fx, vy = y * fy, ratio = 1;
    for (let o = 0; o < octaves; o++) {
        sum += Math.abs(noise2(ch, vx, vy, st)) / ratio;
        vx *= 2; vy *= 2; ratio *= 2;
        st.width *= 2; st.wrapX = 2 * st.wrapX - PerlinN;
        st.height *= 2; st.wrapY = 2 * st.wrapY - PerlinN;
    }
    return sum;
}
/** feFuncA type="table" — 구간마다 곧게 잇는다 */
function table(c, v) {
    const n = v.length - 1;
    if (c >= 1) return v[n];
    const k = Math.floor(c * n);
    return v[k] + (c - k / n) * n * (v[k + 1] - v[k]);
}

/* ── 굽기 ──────────────────────────────────────────────────────────────── */
init(SEED);
const px = Buffer.alloc(SIZE * SIZE * 4);
for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
        const a = Math.min(1, Math.max(0, turbulence(3, x, y, FREQ[0], FREQ[1], OCTAVES, SIZE, SIZE)));
        const i = (y * SIZE + x) * 4;
        px[i] = px[i + 1] = px[i + 2] = 255;
        px[i + 3] = Math.round(table(a, TABLE) * 255);
    }
}
const info = await sharp(px, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .blur(0.5)
    .webp({ lossless: true, effort: 6 })
    .toFile(OUT);
console.log(`${path.relative(root, OUT)}  ${SIZE}x${SIZE}  ${Math.round(info.size / 1024)} KB`);
