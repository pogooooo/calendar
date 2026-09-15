/**
 * CRONOS 앱 아이콘 — "문장(Sigil)" 을 코드로 그린다.
 *
 *   node design/icons/build.mjs
 *
 * - design/icons/02-sigil.svg          밤(어두운 바탕) 판 — 실제 아이콘의 원본
 * - design/icons/02-sigil.light.svg    낮(밝은 바탕) 판
 * - design/icons/02-sigil.fg.svg       안드로이드 적응형 아이콘의 앞면(그림만)
 *
 * 실제 아이콘으로 굽기 (모든 크기·ico·icns 를 만들어 src-tauri/icons 와 gen/android 에 넣는다):
 *   npx tauri icon design/icons/02-sigil.svg
 * 안드로이드 앞면·바탕색은 src-tauri/android-overlay/app/src/main/res 에 있다 (`npm run android:overlay`).
 *
 * 처음엔 시안이 여섯(초승달·문장·궤도·별자리·그날·모래시계)이었고 문장을 골랐다. 나머지 시안과
 * 견주는 판(board.html)은 1.0.0 이전 이력에 있다 — 필요하면 git 에서 꺼내면 된다.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// ── 팔레트: 앱의 Celestial 테마에서 가져온다 ─────────────────────────────
const NIGHT = { ground: "#121118", ink: "#D4AF37" };
const DAY   = { ground: "#F4EFE3", ink: "#A8841F" };

const round = (n) => Math.round(n * 10) / 10;
const polar = (cx, cy, r, deg) => {
    const a = (deg - 90) * Math.PI / 180;
    return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))];
};

function frame(p) {
    return `<rect x="0" y="0" width="512" height="512" rx="108" fill="${p.ground}"/>` +
        `<rect x="22" y="22" width="468" height="468" rx="92" fill="none" stroke="${p.ink}" stroke-opacity=".26" stroke-width="3"/>`;
}

const wrap = (inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${inner}</svg>`;

/** 문장(Sigil): 화면 전환 때 도는 마법진 — 눈금 고리와 12각 별. 자세히 보면 앱의 눈금자 스크롤바가 있다. */
const ICON = {
    id: "02-sigil",
    draw: (p) => {
        let s = frame(p);
        s += `<circle cx="256" cy="256" r="168" fill="none" stroke="${p.ink}" stroke-width="6"/>`;
        for (let i = 0; i < 48; i++) {
            const major = i % 4 === 0;
            const [x1, y1] = polar(256, 256, 168, i * 7.5);
            const [x2, y2] = polar(256, 256, major ? 146 : 156, i * 7.5);
            s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${p.ink}" stroke-width="${major ? 5 : 3}" stroke-linecap="round"/>`;
        }
        // {12/5} 별 다각형: 한 붓으로 이어진다
        const pts = []; let k = 0;
        for (let n = 0; n < 12; n++) { pts.push(polar(256, 256, 112, k * 30).join(" ")); k = (k + 5) % 12; }
        s += `<polygon points="${pts.join(" ")}" fill="none" stroke="${p.ink}" stroke-width="4" stroke-linejoin="round"/>`;
        s += `<path d="M256 238 L274 256 L256 274 L238 256 Z" fill="${p.ink}"/>`;
        return s;
    },
};

// ── 파일로 쓴다 ─────────────────────────────────────────────────────────
fs.writeFileSync(path.join(here, `${ICON.id}.svg`), wrap(ICON.draw(NIGHT)));
fs.writeFileSync(path.join(here, `${ICON.id}.light.svg`), wrap(ICON.draw(DAY)));
// 안드로이드 적응형 아이콘의 앞면: 바탕 사각형 없이 그림만, 안전 영역(가운데 61%) 안으로 줄여서.
// 바탕색은 res/values/ic_launcher_background.xml 에 NIGHT.ground 를 넣는다.
const glyphOnly = ICON.draw({ ...NIGHT, ground: "none" })
    .replace(/<rect x="0" y="0"[^>]*\/>/, "")
    .replace(/<rect x="22" y="22"[^>]*\/>/, "");
fs.writeFileSync(path.join(here, `${ICON.id}.fg.svg`),
    wrap(`<g transform="translate(256 256) scale(0.88) translate(-256 -256)">${glyphOnly}</g>`));
console.log(`${ICON.id}: 밤·낮·앞면 세 판을 썼다`);
