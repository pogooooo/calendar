/**
 * CRONOS 앱 아이콘 시안을 만든다.
 *
 *   node design/icons/build.mjs
 *
 * - design/icons/NN-이름.svg          밤(어두운 바탕) 판 — 실제 아이콘으로 쓸 원본
 * - design/icons/NN-이름.light.svg    낮(밝은 바탕) 판
 * - design/icons/board.html           여섯 시안을 크기별·마스크별로 견주는 판
 *
 * 고른 시안은 이렇게 실제 아이콘으로 굽는다 (모든 크기·ico·icns 를 만들어 준다):
 *   npx tauri icon design/icons/01-crescent.svg
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// ── 팔레트: 앱의 Celestial 테마에서 가져온다 ─────────────────────────────
const NIGHT = { ground: "#121118", ink: "#D4AF37", inkSoft: "#D4AF37" };
const DAY   = { ground: "#F4EFE3", ink: "#A8841F", inkSoft: "#B8922A" };

const round = (n) => Math.round(n * 10) / 10;
const polar = (cx, cy, r, deg) => {
    const a = (deg - 90) * Math.PI / 180;
    return [round(cx + r * Math.cos(a)), round(cy + r * Math.sin(a))];
};

/** 앱 곳곳에 쓰는 네 갈래 별 (AnniversaryIcons 의 별과 같은 곡선) */
function star4(cx, cy, size, fill) {
    const r = size / 2, k = size * 0.09;   // k: 허리를 얼마나 잘록하게
    return `<path d="M${cx} ${cy - r} C${cx + k} ${cy - k * 1.3} ${cx + k * 1.3} ${cy - k} ${cx + r} ${cy} ` +
        `C${cx + k * 1.3} ${cy + k} ${cx + k} ${cy + k * 1.3} ${cx} ${cy + r} ` +
        `C${cx - k} ${cy + k * 1.3} ${cx - k * 1.3} ${cy + k} ${cx - r} ${cy} ` +
        `C${cx - k * 1.3} ${cy - k} ${cx - k} ${cy - k * 1.3} ${cx} ${cy - r} Z" fill="${fill}"/>`;
}

function frame(p) {
    return `<rect x="0" y="0" width="512" height="512" rx="108" fill="${p.ground}"/>` +
        `<rect x="22" y="22" width="468" height="468" rx="92" fill="none" stroke="${p.ink}" stroke-opacity=".26" stroke-width="3"/>`;
}

const wrap = (inner) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${inner}</svg>`;

// ── 시안 여섯 ───────────────────────────────────────────────────────────
const ICONS = [
    {
        id: "01-crescent",
        name: "초승달과 별",
        concept: "옆 메뉴의 초승달을 그대로 가져왔다. 가장 즉시 읽히고, 16px 에서도 달 모양이 남는다.",
        draw: (p) => frame(p) +
            `<path d="M232 118 A138 138 0 1 0 232 394 A172 172 0 0 1 232 118 Z" fill="${p.ink}"/>` +
            star4(358, 196, 126, p.ink),
    },
    {
        id: "02-sigil",
        name: "문장 (Sigil)",
        concept: "화면 전환 때 도는 마법진 — 눈금 고리와 12각 별. 자세히 보면 앱의 눈금자 스크롤바가 있다.",
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
    },
    {
        id: "03-orbit-c",
        name: "궤도의 C",
        concept: "CRONOS 의 C 를 궤도로. 열린 끝에 행성 하나. 글자라서 앱 서랍에서 이름과 함께 기억된다.",
        draw: (p) => {
            const [sx, sy] = polar(256, 256, 148, 135);   // 오른쪽 아래
            const [ex, ey] = polar(256, 256, 148, 45);    // 오른쪽 위
            return frame(p) +
                `<path d="M${sx} ${sy} A148 148 0 1 1 ${ex} ${ey}" fill="none" stroke="${p.ink}" stroke-width="46" stroke-linecap="round"/>` +
                `<circle cx="${ex}" cy="${ey}" r="40" fill="${p.ground}"/>` +
                `<circle cx="${ex}" cy="${ey}" r="30" fill="${p.ink}"/>`;
        },
    },
    {
        id: "04-constellation",
        name: "별자리",
        concept: "\"일정과 목표를 하나의 별자리처럼\" 을 글자 그대로. 이어진 별 다섯이 한 주의 오르내림처럼 놓인다.",
        draw: (p) => {
            const P = [[128, 352], [212, 206], [288, 292], [356, 148], [420, 240]];
            let s = frame(p);
            s += `<polyline points="${P.map(q => q.join(",")).join(" ")}" fill="none" stroke="${p.ink}" stroke-opacity=".7" stroke-width="5" stroke-linejoin="round"/>`;
            s += `<circle cx="128" cy="352" r="11" fill="${p.ink}"/>`;
            s += `<circle cx="288" cy="292" r="11" fill="${p.ink}"/>`;
            s += `<circle cx="420" cy="240" r="11" fill="${p.ink}"/>`;
            s += star4(212, 206, 52, p.ink);
            s += star4(356, 148, 96, p.ink);
            return s;
        },
    },
    {
        id: "05-the-day",
        name: "그 날",
        concept: "달력 아홉 칸을 마름모로. 그중 한 칸만 별 — 오늘, 혹은 기다리는 날. 앱의 마름모 표시와 같은 말이다.",
        draw: (p) => {
            let s = frame(p);
            const C = [166, 256, 346];
            for (const cy of C) for (const cx of C) {
                if (cx === 346 && cy === 166) continue;
                s += `<path d="M${cx} ${cy - 21} L${cx + 21} ${cy} L${cx} ${cy + 21} L${cx - 21} ${cy} Z" fill="none" stroke="${p.ink}" stroke-opacity=".85" stroke-width="5" stroke-linejoin="round"/>`;
            }
            s += star4(346, 166, 104, p.ink);
            return s;
        },
    },
    {
        id: "06-hourglass",
        name: "모래시계 XIII",
        concept: "되돌릴 수 없는 일을 물을 때 뜨는 XIII 카드의 모래시계. 크로노스는 시간의 신이니 가장 이름에 가깝다.",
        draw: (p) => frame(p) +
            `<path d="M160 146 H352" stroke="${p.ink}" stroke-width="9" stroke-linecap="round"/>` +
            `<path d="M160 366 H352" stroke="${p.ink}" stroke-width="9" stroke-linecap="round"/>` +
            `<path d="M184 150 L328 150 L256 256 Z" fill="none" stroke="${p.ink}" stroke-width="8" stroke-linejoin="round"/>` +
            `<path d="M256 256 L184 362 L328 362 Z" fill="${p.ink}" fill-opacity=".28" stroke="${p.ink}" stroke-width="8" stroke-linejoin="round"/>` +
            `<path d="M226 362 L286 362 L256 318 Z" fill="${p.ink}"/>` +
            star4(256, 196, 40, p.ink),
    },
];

// ── 파일로 쓴다 ─────────────────────────────────────────────────────────
for (const ic of ICONS) {
    fs.writeFileSync(path.join(here, `${ic.id}.svg`), wrap(ic.draw(NIGHT)));
    fs.writeFileSync(path.join(here, `${ic.id}.light.svg`), wrap(ic.draw(DAY)));
    // 안드로이드 적응형 아이콘의 앞면: 바탕 사각형 없이 그림만, 안전 영역(가운데 61%) 안으로 줄여서.
    // 바탕색은 res/values/ic_launcher_background.xml 에 NIGHT.ground 를 넣는다.
    const glyphOnly = ic.draw({ ...NIGHT, ground: "none" })
        .replace(/<rect x="0" y="0"[^>]*\/>/, "")
        .replace(/<rect x="22" y="22"[^>]*\/>/, "");
    fs.writeFileSync(path.join(here, `${ic.id}.fg.svg`),
        wrap(`<g transform="translate(256 256) scale(0.88) translate(-256 -256)">${glyphOnly}</g>`));
}

// ── 견주는 판 ─────────────────────────────────────────────────────────────
const data = ICONS.map(ic => ({
    id: ic.id, name: ic.name, concept: ic.concept,
    night: wrap(ic.draw(NIGHT)), day: wrap(ic.draw(DAY)),
}));

const html = `<title>CRONOS 아이콘 시안</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Orbit&family=IBM+Plex+Sans+KR:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
  :root {
    --bg: #F3EFE6;
    --panel: #FBF9F4;
    --fg: #1E1B14;
    --muted: #6E6756;
    --line: #DAD2BD;
    --accent: #A8841F;
    --tile-night: #121118;
    --tile-day: #F4EFE3;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg: #131218; --panel: #1A1822; --fg: #ECE6D6; --muted: #9B947F; --line: #2C2935; --accent: #D4AF37;
    }
  }
  :root[data-theme="dark"] {
    --bg: #131218; --panel: #1A1822; --fg: #ECE6D6; --muted: #9B947F; --line: #2C2935; --accent: #D4AF37;
  }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font-family: "IBM Plex Sans KR", "Noto Sans KR", system-ui, sans-serif; font-size: 15px; line-height: 1.6;
  }
  .page { max-width: 1120px; margin: 0 auto; padding: 40px 28px 64px; }
  header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 18px 32px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
  h1 { font-family: "Orbit", "IBM Plex Sans KR", sans-serif; font-weight: 400; font-size: 1.9rem; letter-spacing: .22em; margin: 0; text-wrap: balance; }
  h1 small { display: block; font-family: "IBM Plex Sans KR", sans-serif; font-size: .95rem; letter-spacing: 0; color: var(--muted); margin-top: 6px; }
  .controls { display: flex; flex-wrap: wrap; gap: 10px 22px; }
  .ctl { display: flex; align-items: center; gap: 8px; }
  .ctl .lbl { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); font-family: "IBM Plex Mono", monospace; }
  .seg { display: inline-flex; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
  .seg button { appearance: none; background: transparent; color: var(--fg); border: 0; padding: 6px 12px; font: inherit; font-size: .86rem; cursor: pointer; }
  .seg button + button { border-left: 1px solid var(--line); }
  .seg button[aria-pressed="true"] { background: var(--accent); color: #fff; }
  .seg button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }

  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 22px; margin-top: 26px; }
  @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
  .cand { display: grid; grid-template-columns: 200px 1fr; gap: 22px; background: var(--panel); border: 1px solid var(--line); padding: 22px; }
  @media (max-width: 560px) { .cand { grid-template-columns: 1fr; } }
  .tile { position: relative; width: 200px; height: 200px; overflow: hidden; }
  .tile svg { width: 100%; height: 100%; display: block; }
  .tile.mask-circle { border-radius: 50%; }
  .tile.mask-squircle { border-radius: 27%; }
  .tile .safe { position: absolute; inset: 17%; border: 1px dashed rgba(212,175,55,.55); border-radius: 50%; pointer-events: none; display: none; }
  .tile.mask-circle .safe, .tile.mask-squircle .safe { display: block; }
  .meta { min-width: 0; display: flex; flex-direction: column; gap: 10px; }
  .meta h2 { font-family: "Orbit", "IBM Plex Sans KR", sans-serif; font-weight: 400; font-size: 1.2rem; letter-spacing: .1em; margin: 0; display: flex; align-items: baseline; gap: 12px; }
  .meta h2 .no { font-family: "IBM Plex Mono", monospace; font-size: .8rem; color: var(--accent); letter-spacing: .1em; }
  .meta p { margin: 0; color: var(--fg); max-width: 40ch; }
  .sizes { display: flex; align-items: flex-end; gap: 18px; margin-top: 4px; }
  .sz { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .sz .box { overflow: hidden; display: block; }
  .sz .box svg { display: block; width: 100%; height: 100%; }
  .sz .box.mask-circle { border-radius: 50%; } .sz .box.mask-squircle { border-radius: 27%; }
  .sz .lbl { font-family: "IBM Plex Mono", monospace; font-size: .7rem; color: var(--muted); font-variant-numeric: tabular-nums; }
  .file { font-family: "IBM Plex Mono", monospace; font-size: .74rem; color: var(--muted); margin-top: auto; }

  .note { margin-top: 34px; padding-top: 22px; border-top: 1px solid var(--line); color: var(--muted); font-size: .92rem; max-width: 72ch; }
  .note code { font-family: "IBM Plex Mono", monospace; font-size: .86em; color: var(--fg); background: var(--panel); border: 1px solid var(--line); padding: 1px 6px; border-radius: 3px; }
  .note ul { padding-left: 1.2em; margin: 8px 0 0; }
</style>

<div class="page">
  <header>
    <h1>CRONOS 아이콘 시안
      <small>여섯 방향. 아래 크기 줄은 작업 표시줄(32)·탭(24)·알림(16)에서 어떻게 보이는지다.</small>
    </h1>
    <div class="controls">
      <div class="ctl"><span class="lbl">바탕</span>
        <div class="seg" role="group" aria-label="아이콘 바탕">
          <button type="button" data-ground="night" aria-pressed="true">밤</button>
          <button type="button" data-ground="day" aria-pressed="false">낮</button>
        </div>
      </div>
      <div class="ctl"><span class="lbl">마스크</span>
        <div class="seg" role="group" aria-label="아이콘 마스크">
          <button type="button" data-mask="none" aria-pressed="true">없음</button>
          <button type="button" data-mask="squircle" aria-pressed="false">둥근 사각</button>
          <button type="button" data-mask="circle" aria-pressed="false">원</button>
        </div>
      </div>
    </div>
  </header>

  <div class="grid" id="grid"></div>

  <div class="note">
    <strong style="color:var(--fg)">고른 뒤에 할 일</strong>
    <ul>
      <li>원본은 <code>design/icons/NN-이름.svg</code>. <code>npx tauri icon design/icons/01-crescent.svg</code> 한 줄이면 데스크톱(ico·icns·png)과 안드로이드(mipmap 전부) 아이콘을 다 만들어 <code>src-tauri/icons</code> 와 <code>gen/android</code> 에 넣는다.</li>
      <li>마스크 안의 점선 원이 안드로이드가 보장하는 안전 영역이다. 원 마스크에서도 그림이 잘리지 않게 여섯 시안 모두 그 안에 넣었다.</li>
      <li>둘을 섞어도 된다 — 예: 데스크톱은 문장, 폰은 초승달. 다만 한 이름 아래 두 얼굴이 되니 하나로 가는 쪽을 권한다.</li>
    </ul>
  </div>
</div>

<script>
  const DATA = ${JSON.stringify(data)};
  const state = { ground: "night", mask: "none" };
  const grid = document.getElementById("grid");

  function render() {
    grid.innerHTML = DATA.map((d, i) => {
      const svg = d[state.ground];
      const maskCls = state.mask === "none" ? "" : " mask-" + state.mask;
      const sizes = [64, 32, 24, 16].map(s =>
        '<div class="sz"><span class="box' + maskCls + '" style="width:' + s + 'px;height:' + s + 'px">' + svg + '</span><span class="lbl">' + s + '</span></div>'
      ).join("");
      return '<article class="cand">' +
        '<div class="tile' + maskCls + '">' + svg + '<span class="safe"></span></div>' +
        '<div class="meta">' +
          '<h2><span class="no">0' + (i + 1) + '</span>' + d.name + '</h2>' +
          '<p>' + d.concept + '</p>' +
          '<div class="sizes">' + sizes + '</div>' +
          '<div class="file">design/icons/' + d.id + '.svg</div>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  document.querySelectorAll("[data-ground]").forEach(b => b.addEventListener("click", () => {
    state.ground = b.dataset.ground;
    document.querySelectorAll("[data-ground]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    render();
  }));
  document.querySelectorAll("[data-mask]").forEach(b => b.addEventListener("click", () => {
    state.mask = b.dataset.mask;
    document.querySelectorAll("[data-mask]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    render();
  }));
  render();
</script>
`;
fs.writeFileSync(path.join(here, "board.html"), html);
console.log(`아이콘 ${ICONS.length}종 × 2 판, board.html 생성`);
