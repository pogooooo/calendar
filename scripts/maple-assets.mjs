/**
 * Maple 테마 그림을 원본(PNG)에서 앱이 쓰는 WebP 로 굽는다.
 *
 *   node scripts/maple-assets.mjs            # design/themes/maple/raw → public/themes/maple
 *   node scripts/maple-assets.mjs <원본폴더>
 *
 * 원본은 이미지 모델이 뽑은 그대로다 (design/themes/maple/ASSETS.md 의 발주서, raw/README.md 의 생성 기록).
 * 모델은 투명 배경을 못 만들므로 여기서 셋 중 하나로 다듬는다:
 *
 *   cutout  크림 바탕 위의 색 그림 → 바탕색을 빼서 투명 PNG 처럼 (가장자리는 바탕색을 되섞어 테두리 얼룩을 없앤다)
 *   mask    흰 바탕 위의 검정 먹 → 먹의 진하기를 알파로 (CSS mask-image 로 쓰면 낮·밤 어느 색이든 입힌다)
 *   tile    종이 질감 → 거울 타일링(좌우·상하 뒤집어 2×2)으로 이음새를 없앤다
 *   opaque  그대로 쓰는 큰 그림 → 크기만 줄인다 (모델이 끼워 넣은 글자는 종이로 덮는다)
 *
 * 결과는 public/themes/maple/ 에 들어가 웹·데스크톱·안드로이드 번들에 실린다.
 * 안드로이드 홈 위젯(네이티브)이 쓰는 몇 장은 android-overlay 의 drawable-nodpi 로도 복사한다.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const RAW = path.resolve(root, process.argv[2] ?? "design/themes/maple/raw");
const OUT = path.join(root, "public/themes/maple");
const ANDROID = path.join(root, "src-tauri/android-overlay/app/src/main/res/drawable-nodpi");

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, "leaves"), { recursive: true });

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };

/* ── 원본 읽기 ─────────────────────────────────────────────────────────── */

async function readRGB(file, crop) {
    let img = sharp(path.join(RAW, file)).removeAlpha();
    if (crop) img = img.extract(crop);
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    return { data, w: info.width, h: info.height };
}

/** 테두리 8px 띠의 중앙값 — 바탕 종이색. 그림은 여백을 두고 그려졌으니 테두리는 거의 종이다 */
function paperColor({ data, w, h }) {
    const ch = [[], [], []];
    for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
        if (x > 8 && x < w - 8 && y > 8 && y < h - 8) continue;
        const i = (y * w + x) * 3;
        ch[0].push(data[i]); ch[1].push(data[i + 1]); ch[2].push(data[i + 2]);
    }
    return ch.map((a) => { a.sort((p, q) => p - q); return a[a.length >> 1]; });
}

/* ── 알파 만들기 ───────────────────────────────────────────────────────── */

/**
 * 크림 바탕을 뺀다. 바탕과의 색 차이가 t0 이하면 투명, t1 이상이면 불투명, 사이는 부드럽게.
 * 반투명 픽셀은 "그림색 × a + 바탕색 × (1-a)" 로 찍힌 것이니 바탕색을 되돌려 뺀다 — 안 그러면 잎 가장자리에 크림 띠가 남는다.
 */
function keyOut({ data, w, h }, bg, { t0 = 12, t1 = 56, gain = 1, linear = false } = {}) {
    const out = Buffer.alloc(w * h * 4);
    for (let p = 0, i = 0, j = 0; p < w * h; p++, i += 3, j += 4) {
        const d = Math.max(Math.abs(data[i] - bg[0]), Math.abs(data[i + 1] - bg[1]), Math.abs(data[i + 2] - bg[2]));
        const ramp = (d - t0) / (t1 - t0);
        const a = clamp01((linear ? clamp01(ramp) : smooth(ramp)) * gain);
        if (a <= 0) continue;
        for (let k = 0; k < 3; k++) {
            const c = (data[i + k] - (1 - a) * bg[k]) / a;
            out[j + k] = c < 0 ? 0 : c > 255 ? 255 : Math.round(c);
        }
        out[j + 3] = Math.round(a * 255);
    }
    return { data: out, w, h };
}

/** 흰 바탕의 먹 → 알파. lo 아래의 옅은 회색(그림자·종이결)은 버리고 hi 부터는 완전히 먹으로 */
function inkToAlpha({ data, w, h }, bg, { lo = 0.08, hi = 0.55 } = {}) {
    const out = Buffer.alloc(w * h * 4);
    const bgLum = (bg[0] * 0.299 + bg[1] * 0.587 + bg[2] * 0.114) || 255;
    for (let p = 0, i = 0, j = 0; p < w * h; p++, i += 3, j += 4) {
        const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const ink = 1 - lum / bgLum;
        const a = smooth((ink - lo) / (hi - lo));
        out[j + 3] = Math.round(a * 255);
    }
    return { data: out, w, h };
}

/* ── 덩어리 정리·자르기 ────────────────────────────────────────────────── */

/** 알파 그림의 연결 성분. 큰 덩어리에 비해 아주 작은 것(모델이 찍은 글자·먼지)을 지운다 */
function dropSpecks(img, minRatio = 0.01) {
    const { data, w, h } = img;
    const label = new Int32Array(w * h);
    const stack = new Int32Array(w * h);
    const comps = [];
    for (let p = 0; p < w * h; p++) {
        if (data[p * 4 + 3] < 40 || label[p]) continue;
        const id = comps.length + 1;
        let sp = 0; stack[sp++] = p; label[p] = id;
        let area = 0;
        while (sp) {
            const q = stack[--sp]; area++;
            const x = q % w, y = (q / w) | 0;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                const r = ny * w + nx;
                if (!label[r] && data[r * 4 + 3] >= 40) { label[r] = id; stack[sp++] = r; }
            }
        }
        comps.push(area);
    }
    const biggest = Math.max(1, ...comps);
    const keep = comps.map((a) => a >= biggest * minRatio);
    for (let p = 0; p < w * h; p++) {
        const id = label[p];
        if (id && !keep[id - 1]) data[p * 4 + 3] = 0;
        else if (!id && data[p * 4 + 3] > 0 && data[p * 4 + 3] < 40) {
            // 덩어리에 안 붙은 아주 옅은 픽셀 — 바탕 잡음
            let near = false;
            for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) {
                const nx = (p % w) + dx, ny = ((p / w) | 0) + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                const l = label[ny * w + nx];
                if (l && keep[l - 1]) { near = true; break; }
            }
            if (!near) data[p * 4 + 3] = 0;
        }
    }
    return img;
}

/** 알파가 있는 곳의 상자 */
function bbox({ data, w, h }, min = 6) {
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] >= min) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return x1 < 0 ? { left: 0, top: 0, width: w, height: h } : { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

function padBox(box, w, h, pad) {
    const left = Math.max(0, box.left - pad), top = Math.max(0, box.top - pad);
    return { left, top, width: Math.min(w - left, box.width + pad * 2), height: Math.min(h - top, box.height + pad * 2) };
}

const toSharp = ({ data, w, h }) => sharp(data, { raw: { width: w, height: h, channels: 4 } });

async function writeWebp(img, name, { width, height, quality = 80, alphaQuality = 90, square = false } = {}) {
    let s = img;
    if (square) {
        // metadata() 는 잘라내기 전 원본 크기를 말하므로, 한 번 굳혀서 실제 크기를 잰다
        const { data, info: m } = await s.png().toBuffer({ resolveWithObject: true });
        const side = Math.max(m.width, m.height);
        // sharp 는 한 파이프라인에서 resize 를 extend 보다 먼저 하므로, 덧댄 결과를 굳힌 뒤에 줄인다
        s = sharp(await sharp(data).extend({
            top: Math.floor((side - m.height) / 2), bottom: Math.ceil((side - m.height) / 2),
            left: Math.floor((side - m.width) / 2), right: Math.ceil((side - m.width) / 2),
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        }).png().toBuffer());
    }
    if (width || height) s = s.resize({ width, height, fit: "inside", withoutEnlargement: true });
    const file = path.join(OUT, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const info = await s.webp({ quality, alphaQuality, effort: 6 }).toFile(file);
    report.push({ name, kb: Math.round(info.size / 1024), size: `${info.width}×${info.height}` });
}

const report = [];

/* ── 네 가지 조리법 ────────────────────────────────────────────────────── */

async function cutout(file, name, { crop, key, pad = 0.03, specks = 0.01, ...out } = {}) {
    const rgb = await readRGB(file, crop);
    const bg = paperColor(rgb);
    const img = dropSpecks(keyOut(rgb, bg, key), specks);
    const box = padBox(bbox(img), img.w, img.h, Math.round(Math.max(img.w, img.h) * pad));
    await writeWebp(toSharp(img).extract(box), name, out);
}

/** 같은 상자로 잘라야 하는 묶음 (챌린지 배지 셋 — 서로 겹쳐 보여 준다) */
async function cutoutGroup(files, { key, pad = 0.03, ...out } = {}) {
    const imgs = [];
    for (const [file] of files) { const rgb = await readRGB(file); imgs.push(dropSpecks(keyOut(rgb, paperColor(rgb), key))); }
    let box = null;
    for (const img of imgs) {
        const b = bbox(img);
        const r = { left: b.left, top: b.top, right: b.left + b.width, bottom: b.top + b.height };
        box = box ? { left: Math.min(box.left, r.left), top: Math.min(box.top, r.top), right: Math.max(box.right, r.right), bottom: Math.max(box.bottom, r.bottom) } : r;
    }
    const union = padBox({ left: box.left, top: box.top, width: box.right - box.left, height: box.bottom - box.top }, imgs[0].w, imgs[0].h, Math.round(imgs[0].w * pad));
    for (let i = 0; i < files.length; i++) await writeWebp(toSharp(imgs[i]).extract(union), files[i][1], out);
}

async function mask(file, name, { crop, ink, pad = 0.04, trim = true, specks = 0, ...out } = {}) {
    const rgb = await readRGB(file, crop);
    let img = inkToAlpha(rgb, paperColor(rgb), ink);
    if (specks) img = dropSpecks(img, specks);
    const box = trim ? padBox(bbox(img), img.w, img.h, Math.round(Math.max(img.w, img.h) * pad)) : { left: 0, top: 0, width: img.w, height: img.h };
    await writeWebp(toSharp(img).extract(box), name, out);
}

/**
 * 채운 잎(C6)에서 윤곽 잎(C5)을 만든다 — C5 는 안 뽑혔다.
 * 실루엣을 r 만큼 부풀린 것에서 r 만큼 깎은 것을 빼면 두께 2r 의 가장자리 띠가 남는다.
 */
function boxFilter(src, w, h, r, pick) {
    const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = src[y * w + x];
        for (let k = Math.max(0, x - r); k <= Math.min(w - 1, x + r); k++) v = pick(v, src[y * w + k]);
        tmp[y * w + x] = v;
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = tmp[y * w + x];
        for (let k = Math.max(0, y - r); k <= Math.min(h - 1, y + r); k++) v = pick(v, tmp[k * w + x]);
        out[y * w + x] = v;
    }
    return out;
}

async function outlineFromFilled(file, name, { stroke = 0.075, ...out } = {}) {
    const rgb = await readRGB(file);
    const img = inkToAlpha(rgb, paperColor(rgb));
    const box = padBox(bbox(img), img.w, img.h, Math.round(img.w * 0.08));
    const { data, info } = await toSharp(img).extract(box).raw().toBuffer({ resolveWithObject: true });
    const w = info.width, h = info.height, r = Math.max(1, Math.round(Math.max(w, h) * stroke / 2));
    const a = new Float32Array(w * h);
    for (let p = 0; p < w * h; p++) a[p] = data[p * 4 + 3] / 255;
    const grown = boxFilter(a, w, h, r, Math.max), shrunk = boxFilter(a, w, h, r, Math.min);
    const out4 = Buffer.alloc(w * h * 4);
    for (let p = 0; p < w * h; p++) out4[p * 4 + 3] = Math.round(clamp01(grown[p] - shrunk[p]) * 255);
    await writeWebp(toSharp({ data: out4, w, h }).blur(1.2), name, out);
}

async function tile(file, name, { base = 512, quality = 60, mirrorY = true } = {}) {
    const meta = await sharp(path.join(RAW, file)).metadata();
    const bw = base, bh = Math.round(base * meta.height / meta.width);
    // 종이의 큰 밝기 흐름(가장자리 비네트)을 빼고 결만 남긴다 — 안 그러면 거울로 이은 자리가 십자로 보인다
    const small = await sharp(path.join(RAW, file)).removeAlpha().resize(bw, bh).raw().toBuffer({ resolveWithObject: true });
    const blurred = await sharp(small.data, { raw: { width: bw, height: bh, channels: 3 } }).blur(Math.max(8, bw / 10)).raw().toBuffer();
    const flat = Buffer.alloc(bw * bh * 3);
    const mean = [0, 0, 0];
    for (let i = 0; i < flat.length; i++) mean[i % 3] += blurred[i];
    for (let k = 0; k < 3; k++) mean[k] /= bw * bh;
    for (let i = 0; i < flat.length; i++) { const v = small.data[i] - blurred[i] + mean[i % 3]; flat[i] = v < 0 ? 0 : v > 255 ? 255 : Math.round(v); }
    const one = await sharp(flat, { raw: { width: bw, height: bh, channels: 3 } }).png().toBuffer();
    const flop = await sharp(one).flop().png().toBuffer();
    const parts = [{ input: one, left: 0, top: 0 }, { input: flop, left: bw, top: 0 }];
    if (mirrorY) {
        parts.push({ input: await sharp(one).flip().png().toBuffer(), left: 0, top: bh });
        parts.push({ input: await sharp(flop).flip().png().toBuffer(), left: bw, top: bh });
    }
    const canvas = sharp({ create: { width: bw * 2, height: mirrorY ? bh * 2 : bh, channels: 3, background: "#000" } }).composite(parts);
    await writeWebp(sharp(await canvas.png().toBuffer()), name, { quality, alphaQuality: 100 });
}

/** 큰 그림. erase 는 모델이 찍은 글자 자리 — 바로 위의 종이를 복사해 덮는다 (가장자리는 섞어서) */
async function opaque(file, name, { erase, crop, ...out } = {}) {
    let img = sharp(path.join(RAW, file)).removeAlpha();
    if (crop) img = img.extract(crop);
    if (erase) {
        const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
        const w = info.width;
        const { left, top, width, height, dy } = erase;
        const feather = 20;
        for (let y = top; y < top + height; y++) for (let x = left; x < left + width; x++) {
            const ex = Math.min(x - left, left + width - 1 - x), ey = Math.min(y - top, top + height - 1 - y);
            const t = smooth(Math.min(ex, ey) / feather);
            const i = (y * w + x) * 3, s = ((y + dy) * w + x) * 3;
            for (let k = 0; k < 3; k++) data[i + k] = Math.round(data[i + k] * (1 - t) + data[s + k] * t);
        }
        img = sharp(data, { raw: { width: w, height: info.height, channels: 3 } });
    }
    await writeWebp(img, name, { alphaQuality: 100, ...out });
}

/** 격자 시트를 칸칸이 잘라 낱장으로 */
async function sheet(file, cols, rows, nameOf, { key, size = 192, specks = 0.05 } = {}) {
    const meta = await sharp(path.join(RAW, file)).metadata();
    const cw = Math.floor(meta.width / cols), chh = Math.floor(meta.height / rows);
    let n = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        n++;
        const rgb = await readRGB(file, { left: c * cw, top: r * chh, width: cw, height: chh });
        const img = dropSpecks(keyOut(rgb, paperColor(rgb), key), specks);
        const box = padBox(bbox(img), img.w, img.h, Math.round(cw * 0.03));
        await writeWebp(toSharp(img).extract(box), nameOf(n), { width: size, height: size, square: true });
    }
}

/* ── 목록 ─────────────────────────────────────────────────────────────── */

// A. 바탕
// 종이 네 장은 모델이 아주 고르게 뽑아 밝기 편차가 1~3/255 뿐이다 — 얼룩(큰 흐름)만 살리고 결은 CSS 의 잡음으로 얹는다
await tile("A1_paper-light.png", "paper-light.webp", { base: 512, quality: 85 });
await tile("A2_paper-dark.png", "paper-dark.webp", { base: 512, quality: 85 });
await tile("G1_widget-paper-light.png", "widget-paper-light.webp", { base: 384, quality: 85 });
await tile("G2_widget-paper-dark.png", "widget-paper-dark.webp", { base: 384, quality: 85 });
await tile("A3_wash-band-light.png", "wash-light.webp", { base: 1024, quality: 70, mirrorY: false });
await tile("A3_wash-band-dark.png", "wash-dark.webp", { base: 1024, quality: 70, mirrorY: false });
await mask("A4_tape-tile.png", "tape.webp", { trim: false, width: 512, ink: { lo: 0.1, hi: 0.5 } });
await mask("A5_card-frame.png", "card-frame.webp", { pad: 0.02, width: 512, ink: { lo: 0.12, hi: 0.5 } });

// B. 잎
await cutout("B1_hero-branch.png", "hero-branch.webp", { height: 1024, quality: 82 });
const leafCrop = { left: 0, top: 0, width: 1024, height: 1000 }; // 맨 아래 줄에 모델이 학명 비슷한 글자를 찍었다
await cutout("B2_leaf-red.png", "leaf-red.webp", { crop: leafCrop, width: 512, height: 512, square: true });
await cutout("B3_leaf-orange.png", "leaf-orange.webp", { crop: leafCrop, width: 512, height: 512, square: true });
await cutout("B4_leaf-yellow.png", "leaf-yellow.webp", { crop: leafCrop, width: 512, height: 512, square: true });
await sheet("B6_leaf-sprites.png", 4, 2, (n) => `leaves/leaf-${n}.webp`, { size: 192, key: { t0: 22, t1: 84 } });

// C. 먹 장식 (마스크)
await mask("C1_divider-vine.png", "divider-vine.webp", { width: 1024, pad: 0.01 });
await mask("C2_divider-short.png", "divider-short.webp", { width: 512, pad: 0.01 });
await mask("C3_corner-flourish.png", "corner.webp", { width: 256, height: 256, pad: 0.01 });
await mask("C4_crest.png", "crest.webp", { width: 128, height: 128, square: true });
await outlineFromFilled("C6_bullet-filled.png", "bullet-outline.webp", { width: 96, height: 96, square: true });
await mask("C6_bullet-filled.png", "bullet-filled.webp", { width: 96, height: 96, square: true });
await mask("C7_check-stamp.png", "check.webp", { width: 96, height: 96, square: true });
await mask("C8_spinner-leaf.png", "spinner.webp", { width: 96, height: 96, square: true });
await mask("C9_ribbon-banner.png", "ribbon.webp", { width: 768, pad: 0.015 });
await mask("C10_label-frame.png", "label-frame.webp", { width: 512, pad: 0.015 });
// 스티커 둘은 모델이 회색 그림자를 깔았다 — lo 를 높여 그림자를 버린다
await mask("C11_sticker-leaf-outline.png", "sticker-outline.webp", { width: 256, height: 256, square: true, ink: { lo: 0.45, hi: 0.7 } });
await mask("C12_sticker-leaf-filled.png", "sticker-filled.webp", { width: 256, height: 256, square: true, ink: { lo: 0.45, hi: 0.7 } });

// E. 화면 그림
await opaque("E1_auth-panel-light.png", "auth-light.webp", { width: 720, quality: 78, erase: { left: 395, top: 1858, width: 360, height: 70, dy: -110 } });
await opaque("E2_auth-panel-dark.png", "auth-dark.webp", { width: 720, quality: 78 });
await cutout("E3_gauge-dial.png", "gauge-dial.webp", { width: 1024, quality: 82, pad: 0.01 });
for (const [f, n] of [["E4a_empty-todos.png", "empty-todos.webp"], ["E4b_empty-projects.png", "empty-projects.webp"], ["E4c_empty-challenges.png", "empty-challenges.webp"], ["E4d_empty-anniversaries.png", "empty-anniversaries.webp"]]) {
    await mask(f, n, { width: 480, height: 480, square: true, ink: { lo: 0.1, hi: 0.5 } });
}
await opaque("E5_theme-preview-light.png", "preview-light.webp", { width: 640, quality: 74 });
await opaque("E5_theme-preview-dark.png", "preview-dark.webp", { width: 640, quality: 74 });
await cutout("E6_sidebar-branch.png", "sidebar-branch.webp", { height: 640, quality: 82 });

// F. 배지·표식
await cutout("F1_wax-seal.png", "wax-seal.webp", { width: 256, height: 256, square: true });
await cutoutGroup([["F2a_medal-empty.png", "medal-empty.webp"], ["F2b_medal-half.png", "medal-half.webp"], ["F2c_medal-full.png", "medal-full.webp"]], { width: 256, height: 256, square: true });
// 원본이 이미 25% 로 연해진 그림이라, 알파를 색 차이에 비례시켜 잎 색을 되살리고 연함은 알파로 남긴다
await cutout("F3_today-marker.png", "today-marker.webp", { width: 256, height: 256, square: true, key: { t0: 2, t1: 120, linear: true }, specks: 0.002 });
await mask("F4_acorn.png", "acorn.webp", { width: 96, height: 96, square: true });

// H. 선택
await cutout("H1_app-icon-maple.png", "app-icon.webp", { width: 512, height: 512, square: true, key: { t0: 10, t1: 40 } });
await opaque("H2_landing-hero.png", "landing-hero.webp", { width: 1600, quality: 74 });

/* ── 안드로이드 위젯이 쓰는 것 ────────────────────────────────────────── */
fs.mkdirSync(ANDROID, { recursive: true });
for (const n of ["widget-paper-light", "widget-paper-dark", "crest", "bullet-filled", "bullet-outline", "check", "acorn", "today-marker", "spinner"]) {
    fs.copyFileSync(path.join(OUT, `${n}.webp`), path.join(ANDROID, `maple_${n.replace(/-/g, "_")}.webp`));
}

/* ── 보고 ─────────────────────────────────────────────────────────────── */
let total = 0;
for (const r of report) { total += r.kb; console.log(`${r.name.padEnd(30)} ${r.size.padStart(10)} ${String(r.kb).padStart(5)} KB`); }
console.log(`\n${report.length}장, 모두 ${Math.round(total / 1024 * 10) / 10} MB`);
if (total > 4096) { console.error("전체가 4MB 를 넘는다 — 품질이나 크기를 낮출 것"); process.exit(1); }
