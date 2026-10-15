/**
 * Maple 테마 그림을 원본(PNG)에서 앱이 쓰는 WebP 로 굽는다.
 *
 *   node scripts/maple-assets.mjs            # design/themes/maple/raw → public/themes/maple
 *   node scripts/maple-assets.mjs <원본폴더>
 *
 * 2026-10-15 Maple 을 다시 그리며("가을 노트" — 깨끗한 카드와 벡터 단풍잎) 이미지 모델이 그린 먹 그림
 * (도장 틀·찢은 종이·테이프·먹 테·붓 밑줄·아이콘 시트·놋쇠 판·화환·종이결·안드로이드 위젯 그림…)은 모두 걷었다.
 * 남은 것은 수채 단풍잎 넷뿐이다 — 앱 바탕에 지는 3D 잎(ambient/maple/mapleLeafScene)과 테마 고르기의 잎 오브제(objet/maple)가 쓴다.
 * 걷은 그림을 굽던 조리법(mask·tile·opaque·sheet …)은 git 기록에 있다(이 파일의 2026-10-15 이전 판).
 *
 * 원본은 이미지 모델이 뽑은 그대로다 (raw/README.md 에 생성 기록). 모델은 투명 배경을 못 만들므로
 * 크림 바탕 위의 색 그림에서 바탕색을 빼서(cutout) 투명 그림처럼 만든다 — 가장자리는 바탕색을 되섞어 테두리 얼룩을 없앤다.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const RAW = path.resolve(root, process.argv[2] ?? "design/themes/maple/raw");
const OUT = path.join(root, "public/themes/maple");

fs.mkdirSync(OUT, { recursive: true });

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

/* ── 조리법 ────────────────────────────────────────────────────────────── */

async function cutout(file, name, { crop, key, pad = 0.03, specks = 0.01, ...out } = {}) {
    const rgb = await readRGB(file, crop);
    const bg = paperColor(rgb);
    const img = dropSpecks(keyOut(rgb, bg, key), specks);
    const box = padBox(bbox(img), img.w, img.h, Math.round(Math.max(img.w, img.h) * pad));
    await writeWebp(toSharp(img).extract(box), name, out);
}

/* ── 목록 ─────────────────────────────────────────────────────────────── */

// 수채 단풍잎 넷 — 앱 바탕에 지는 잎의 아틀라스(mapleLeafScene)와 잎 오브제(objet/maple/art.ts)
const leafCrop = { left: 0, top: 0, width: 1024, height: 1000 }; // 맨 아래 줄에 모델이 학명 비슷한 글자를 찍었다
await cutout("B2_leaf-red.png", "leaf-red.webp", { crop: leafCrop, width: 512, height: 512, square: true });
await cutout("B3_leaf-orange.png", "leaf-orange.webp", { crop: leafCrop, width: 512, height: 512, square: true });
await cutout("B4_leaf-yellow.png", "leaf-yellow.webp", { crop: leafCrop, width: 512, height: 512, square: true });
await cutout("B5_leaf-brown.png", "leaf-brown.webp", { crop: leafCrop, width: 512, height: 512, square: true });

/* ── 보고 ─────────────────────────────────────────────────────────────── */
let total = 0;
for (const r of report) { total += r.kb; console.log(`${r.name.padEnd(30)} ${r.size.padStart(10)} ${String(r.kb).padStart(5)} KB`); }
console.log(`\n${report.length}장, 모두 ${Math.round(total / 1024 * 10) / 10} MB`);
