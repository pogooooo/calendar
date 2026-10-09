/**
 * Celestial 의 화면 효과 — 천체 타로. 금 선화의 카드 한 장(겉테·속테·네 귀퉁이 마름모, 위에 아르카나 번호, 가운데 문장,
 * 아래 이름)과 별·별자리·별똥별. 천문 기구(아스트롤라베 눈금·궤도·태양계)는 쓰지 않는다 — 이 테마의 중심은 타로다.
 *   달 넘김: 넘기는 쪽으로 흐르는 별똥 줄기와, 자리 잡으며 반짝이는 별 몇 개
 *   화면 옮김: 효과 없음 — 화면을 옮길 때마다 새 화면 위쪽을 별자리가 가로질러, 뜨는 화면을 가렸다(사용자가 뺐다)
 *   끝냄: 누른 자리에서 네 갈래 별이 터진다 · 넣음: 잔별이 피어오른다
 *   챌린지 칸: 여덟 갈래 별 하나와 둘레의 일곱 잔별(XVII 별 카드의 그림) — 연속 이정표면 XVII · THE STAR 카드가
 *             뒤집히며 놓이고 위에 이어 온 수(로마 숫자), 목표를 다 채우면 XXI · THE WORLD
 *   보드 옮김: 별똥별이 다음 칸 쪽으로 (되돌리면 흐린 별똥별이 짧게 뒤로)
 *   프로젝트 완료: XXI · THE WORLD 카드가 누른 자리에 놓이고, 위쪽엔 큰 별자리, 별이 조금 내린다
 *   끌어 놓기: 놓은 칸의 테두리를 금선이 한 바퀴 긋고(카드의 겉테처럼) 네 귀퉁이가 반짝인다
 *   지우기: 그 자리가 옅은 금가루로 흩어져 오른다 — 축하가 아니라 조용히
 *   로그인: 석 장 펼치기 — XVIII 달 · XVII 별 · XIX 해가 한 묶음에서 부채꼴로 펼쳐졌다 사라진다 (가입은 XVII 한 장)
 *   기념일: XIX · THE SUN 카드가 그 줄 위에 놓이고, 줄 아래로 금선 장식, 하늘엔 별똥별
 *   빠른 이동: 창 위 가장자리에 금선이 가운데서 양쪽으로 그어지고 네 귀퉁이에 별이 돋는다
 *   위젯 띄움: 누른 자리에서 오른쪽 위로 별똥별 · 테마로 바꿈: 화면 가득 별이 돋고 별자리 하나
 * 카드는 작게(폰은 더 작게), 누른 자리를 가운데로, 1.6~1.8초 안에 사라진다 — 글을 오래 가리지 않는다.
 */
import {
    Swarm, Trail, byArea, count, easeOut, group, hex, inOut, inRect, itemRect, pick, rand, rectPoints, roman,
    type Effect, type FxContext, type FxModule, type Particle,
} from "../engine";
import type { FxRect } from "@/lib/fx";

type RGB = [number, number, number];

/** 금빛 — 밤하늘(어두운 벌)에서는 밝은 금, 아이보리 종이(밝은 벌)에서는 짙은 금이어야 보인다 */
const GOLD_NIGHT = [[1, 1, 1], hex("#F6DC8C"), hex("#E8C25A"), hex("#FFF1C9")] as RGB[];
const GOLD_DAY = [hex("#B8862B"), hex("#C99A36"), hex("#A87A22"), hex("#D4A944")] as RGB[];
const gold = (ctx: FxContext) => (ctx.dark ? GOLD_NIGHT : GOLD_DAY);
/** 금선(별자리·테두리)의 색 — 밝은 벌은 화면의 금선보다 한 단만 짙게 (갈색으로 무거워지지 않게) */
const line = (ctx: FxContext) => (ctx.dark ? 0xe2c06a : 0xc39a3e);
/** 박히는 별의 색 — 하나만 또렷하게 */
const sealTint = (ctx: FxContext): RGB => (ctx.dark ? [1, 0.96, 0.84] : hex("#BE8C2A"));

/** 카드 그림의 색 — 창(Dialog)의 카드와 같은 겉: 금선, 표면에 금을 아주 옅게 섞은 바탕, 이름은 옅은 먹 */
const inkOf = (dark: boolean) => (dark
    ? { gold: "#D9BD78", face: "#1E2536", name: "#A5AABD", shadow: "rgba(0,0,0,0.55)" }
    : { gold: "#BF9632", face: "#FFFBF0", name: "#626577", shadow: "rgba(70,52,12,0.22)" });

/** 네 갈래 빛살이 있는 별 (가운데는 하얗고 둘레는 금빛 번짐) */
const star = (ctx: FxContext) => ctx.texture("cel-star", (g, s) => {
    const c = s / 2;
    const glow = g.createRadialGradient(c, c, 0, c, c, c);
    glow.addColorStop(0, "rgba(255,250,230,1)");
    glow.addColorStop(0.16, "rgba(255,232,170,0.9)");
    glow.addColorStop(0.42, "rgba(232,192,96,0.22)");
    glow.addColorStop(1, "rgba(232,192,96,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);
    g.fillStyle = "rgba(255,246,218,0.95)";
    g.beginPath();
    g.moveTo(c, 3);
    g.quadraticCurveTo(c + 4, c - 4, s - 3, c);
    g.quadraticCurveTo(c + 4, c + 4, c, s - 3);
    g.quadraticCurveTo(c - 4, c + 4, 3, c);
    g.quadraticCurveTo(c - 4, c - 4, c, 3);
    g.fill();
});

/** 여덟 갈래 별 — XVII 별 카드의 큰 별 (긴 빛살 넷·짧은 빛살 넷, 둘레는 옅은 번짐) */
const star8 = (ctx: FxContext) => ctx.texture("cel-star8", (g, s) => {
    const c = s / 2;
    const glow = g.createRadialGradient(c, c, 0, c, c, c);
    glow.addColorStop(0, "rgba(255,248,226,0.9)");
    glow.addColorStop(0.22, "rgba(240,206,120,0.32)");
    glow.addColorStop(1, "rgba(240,206,120,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);
    g.fillStyle = "rgba(255,246,218,1)";
    eightPoint(g, c, c, s * 0.48, s * 0.27, s * 0.07);
    g.fill();
}, 128);

/** 둥근 빛 알갱이 (늘이면 별똥 꼬리) */
const dot = (ctx: FxContext) => ctx.texture("cel-dot", (g, s) => {
    const c = s / 2;
    const glow = g.createRadialGradient(c, c, 0, c, c, c);
    glow.addColorStop(0, "rgba(255,248,224,1)");
    glow.addColorStop(0.35, "rgba(240,206,120,0.55)");
    glow.addColorStop(1, "rgba(240,206,120,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);
}, 64);

/* ── 타로 카드 그리기 ───────────────────────────────────────────────── */

type ArcanumId = "star" | "moon" | "sun" | "world";
/** 갈래가 쓰는 대(大)아르카나 넷 — 하늘의 카드(별·달·해)와 다 이룸(세계). 번호는 고정이다(창의 아르카나와 같은 생각) */
const ARCANA: Record<ArcanumId, { num: string; name: string }> = {
    star: { num: "XVII", name: "THE STAR" },
    moon: { num: "XVIII", name: "THE MOON" },
    sun: { num: "XIX", name: "THE SUN" },
    world: { num: "XXI", name: "THE WORLD" },
};

/** 그림 판(정사각형)에서 카드가 차지하는 높이 — 나머지는 그림자 자리. 카드 너비는 높이의 0.6 */
const CARD_H = 0.86;
const CARD_RATIO = 0.6;
const LATIN = "Cinzel, 'Cormorant Garamond', serif";

/** 라틴 글꼴(Cinzel)이 들어왔는가 — 아직이면 그림 이름을 달리해 들어온 뒤 다시 그린다 */
const fontReady = () => {
    try { return typeof document === "undefined" || document.fonts.check(`600 24px ${LATIN}`); } catch { return true; }
};
if (typeof document !== "undefined") document.fonts?.load?.(`600 24px ${LATIN}`).catch(() => {});

/** 여덟 갈래 별의 길 — 긴 빛살(위·아래·옆) rLong, 사이 빛살 rShort, 골 rIn */
function eightPoint(g: CanvasRenderingContext2D, cx: number, cy: number, rLong: number, rShort: number, rIn: number) {
    g.beginPath();
    for (let i = 0; i < 16; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 8;
        const r = i % 2 ? rIn : (i / 2) % 2 ? rShort : rLong;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
}

/** 네 갈래 별의 길 */
function fourPoint(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, rIn = r * 0.28) {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 4;
        const rr = i % 2 ? rIn : r;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
}

/** 자간을 벌린 한 줄 (캔버스의 letterSpacing 은 오래된 웹뷰에 없다) */
function spaced(g: CanvasRenderingContext2D, text: string, cx: number, cy: number, font: string, color: string, gap: number) {
    g.font = font;
    g.fillStyle = color;
    g.textAlign = "left";
    g.textBaseline = "middle";
    const chars = [...text];
    const widths = chars.map((ch) => g.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
    let x = cx - total / 2;
    chars.forEach((ch, i) => { g.fillText(ch, x, cy); x += widths[i] + gap; });
}

/** 가운데 문장 — 카드마다 하나. R 은 문장의 반지름, lw 는 선 굵기 */
const EMBLEM: Record<ArcanumId, (g: CanvasRenderingContext2D, cx: number, cy: number, R: number, lw: number, ink: ReturnType<typeof inkOf>) => void> = {
    // XVII 별 — 큰 여덟 갈래 별(겉선) 둘레에 일곱 잔별
    star: (g, cx, cy, R, lw, ink) => {
        eightPoint(g, cx, cy, R, R * 0.56, R * 0.17);
        g.globalAlpha = 0.14; g.fillStyle = ink.gold; g.fill(); g.globalAlpha = 1;
        g.lineWidth = lw; g.strokeStyle = ink.gold; g.stroke();
        fourPoint(g, cx, cy, R * 0.22); g.fillStyle = ink.gold; g.fill();
        for (let i = 0; i < 7; i++) {
            const a = -Math.PI / 2 + Math.PI / 7 + (i * Math.PI * 2) / 7;
            fourPoint(g, cx + Math.cos(a) * R * 1.3, cy + Math.sin(a) * R * 1.3, R * (i % 2 ? 0.08 : 0.11));
            g.fill();
        }
    },
    // XVIII 달 — 초승달(채움)과 보름의 옅은 테, 둘레에 잔별 셋
    moon: (g, cx, cy, R, lw, ink) => {
        const r1 = R * 0.7;
        g.save();
        g.beginPath(); g.arc(cx, cy, r1, 0, Math.PI * 2); g.clip();
        g.fillStyle = ink.gold; g.fill();
        g.fillStyle = ink.face;
        g.beginPath(); g.arc(cx + r1 * 0.42, cy - r1 * 0.16, r1 * 0.86, 0, Math.PI * 2); g.fill();
        g.restore();
        g.globalAlpha = 0.4; g.lineWidth = lw * 0.8; g.strokeStyle = ink.gold;
        g.beginPath(); g.arc(cx, cy, r1, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
        g.fillStyle = ink.gold;
        ([[0.95, -0.85, 0.12], [1.15, 0.35, 0.08], [-0.2, 1.2, 0.09]] as const).forEach(([dx, dy, r]) => { fourPoint(g, cx + dx * R, cy + dy * R, R * r); g.fill(); });
    },
    // XIX 해 — 둥근 해와 길고 짧은 빛살 열여섯
    sun: (g, cx, cy, R, lw, ink) => {
        g.strokeStyle = ink.gold;
        g.beginPath(); g.arc(cx, cy, R * 0.46, 0, Math.PI * 2);
        g.globalAlpha = 0.14; g.fillStyle = ink.gold; g.fill(); g.globalAlpha = 1;
        g.lineWidth = lw; g.stroke();
        g.globalAlpha = 0.5; g.lineWidth = lw * 0.8;
        g.beginPath(); g.arc(cx, cy, R * 0.3, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
        g.lineCap = "round";
        for (let i = 0; i < 16; i++) {
            const a = -Math.PI / 2 + (i * Math.PI) / 8;
            const long = i % 2 === 0;
            g.lineWidth = long ? lw : lw * 0.75;
            g.beginPath();
            g.moveTo(cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6);
            g.lineTo(cx + Math.cos(a) * R * (long ? 1.08 : 0.84), cy + Math.sin(a) * R * (long ? 1.08 : 0.84));
            g.stroke();
        }
        g.fillStyle = ink.gold;
        g.beginPath(); g.arc(cx, cy, R * 0.09, 0, Math.PI * 2); g.fill();
    },
    // XXI 세계 — 엮은 화환(두 겹 타원과 빗금), 위아래 매듭, 가운데 별, 네 귀퉁이 잔별
    world: (g, cx, cy, R, lw, ink) => {
        const rx = R * 0.66, ry = R * 1.0;
        g.strokeStyle = ink.gold;
        g.lineWidth = lw;
        g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.stroke();
        g.globalAlpha = 0.55; g.lineWidth = lw * 0.75;
        g.beginPath(); g.ellipse(cx, cy, rx * 0.84, ry * 0.9, 0, 0, Math.PI * 2); g.stroke();
        for (let i = 0; i < 40; i++) {
            const t = (i / 40) * Math.PI * 2;
            if (Math.abs(Math.cos(t)) > 0.97) continue; // 매듭 자리는 비운다
            g.beginPath();
            g.moveTo(cx + Math.cos(t) * rx * 0.84, cy + Math.sin(t) * ry * 0.9);
            g.lineTo(cx + Math.cos(t + 0.1) * rx, cy + Math.sin(t + 0.1) * ry);
            g.stroke();
        }
        g.globalAlpha = 1;
        g.lineWidth = lw;
        ([-1, 1] as const).forEach((side) => {
            const y = cy + side * ry * 0.95, d = R * 0.09;
            g.beginPath(); g.moveTo(cx - d, y - d); g.lineTo(cx + d, y + d); g.moveTo(cx + d, y - d); g.lineTo(cx - d, y + d); g.stroke();
        });
        g.fillStyle = ink.gold;
        fourPoint(g, cx, cy, R * 0.3); g.fill();
        ([[-1, -1], [1, -1], [1, 1], [-1, 1]] as const).forEach(([sx, sy]) => { fourPoint(g, cx + sx * R * 1.08, cy + sy * R * 1.1, R * 0.09); g.fill(); });
    },
};

/** 카드 한 장 — 창(Dialog)의 카드와 같은 문법: 겉테·속테·네 귀퉁이 마름모·위 번호·가운데 문장·아래 이름판 */
const cardTex = (ctx: FxContext, id: ArcanumId) => {
    const ready = fontReady();
    return ctx.texture(`cel-card:${id}:${ctx.dark ? "d" : "l"}:${ready ? 1 : 0}`, (g, s) => {
        const ink = inkOf(ctx.dark);
        const h = s * CARD_H, w = h * CARD_RATIO;
        const x0 = (s - w) / 2, y0 = (s - h) / 2, cx = s / 2;
        const lw = s * 0.0052;
        const r = s * 0.012;
        const roundRect = (x: number, y: number, ww: number, hh: number, rr: number) => {
            g.beginPath();
            g.moveTo(x + rr, y); g.lineTo(x + ww - rr, y); g.quadraticCurveTo(x + ww, y, x + ww, y + rr);
            g.lineTo(x + ww, y + hh - rr); g.quadraticCurveTo(x + ww, y + hh, x + ww - rr, y + hh);
            g.lineTo(x + rr, y + hh); g.quadraticCurveTo(x, y + hh, x, y + hh - rr);
            g.lineTo(x, y + rr); g.quadraticCurveTo(x, y, x + rr, y); g.closePath();
        };
        // 바탕과 그림자
        g.save();
        g.shadowColor = ink.shadow; g.shadowBlur = s * 0.03; g.shadowOffsetY = s * 0.012;
        roundRect(x0, y0, w, h, r); g.fillStyle = ink.face; g.fill();
        g.restore();
        // 겉테·속테
        g.strokeStyle = ink.gold; g.lineWidth = lw;
        roundRect(x0, y0, w, h, r); g.stroke();
        const ins = w * 0.07;
        g.globalAlpha = 0.42; g.lineWidth = lw * 0.8;
        g.strokeRect(x0 + ins, y0 + ins, w - ins * 2, h - ins * 2);
        g.globalAlpha = 1;
        // 네 귀퉁이 마름모 (창의 핍)
        const d = s * 0.011;
        ([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]] as const).forEach(([px, py]) => {
            g.beginPath(); g.moveTo(px, py - d); g.lineTo(px + d, py); g.lineTo(px, py + d); g.lineTo(px - d, py); g.closePath();
            g.fillStyle = ink.face; g.fill(); g.lineWidth = lw * 0.8; g.strokeStyle = ink.gold; g.stroke();
        });
        // 위 번호와 그 아래 가는 줄
        spaced(g, ARCANA[id].num, cx, y0 + h * 0.125, `600 ${w * 0.118}px ${LATIN}`, ink.gold, w * 0.03);
        g.globalAlpha = 0.5; g.lineWidth = lw * 0.7; g.strokeStyle = ink.gold;
        g.beginPath(); g.moveTo(cx - w * 0.14, y0 + h * 0.185); g.lineTo(cx + w * 0.14, y0 + h * 0.185); g.stroke();
        g.globalAlpha = 1;
        // 문장
        EMBLEM[id](g, cx, y0 + h * 0.49, w * 0.25, lw, ink);
        // 이름판 — 가는 줄 위에 작은 대문자
        g.globalAlpha = 0.5; g.lineWidth = lw * 0.7;
        g.beginPath(); g.moveTo(cx - w * 0.3, y0 + h * 0.8); g.lineTo(cx + w * 0.3, y0 + h * 0.8); g.stroke();
        g.globalAlpha = 1;
        spaced(g, ARCANA[id].name, cx, y0 + h * 0.875, `600 ${w * 0.074}px ${LATIN}`, ink.name, w * 0.022);
    }, 512);
};

/**
 * 이어 온 수 — 로마 숫자를 양쪽 금선과 마름모 사이에 (연감의 장 번호처럼). 카드 위 번호(아르카나)와 헷갈리지 않게
 * 카드 밖에서 더 크게, 줄을 달아 다른 글자로 읽히게 한다.
 */
const tallyTex = (ctx: FxContext, n: number) => {
    const ready = fontReady();
    return ctx.texture(`cel-tally:${n}:${ctx.dark ? "d" : "l"}:${ready ? 1 : 0}`, (g, s) => {
        const ink = inkOf(ctx.dark);
        const text = roman(n);
        const cy = s / 2;
        let px = s * 0.17;
        const widthAt = (size: number) => { g.font = `600 ${size}px ${LATIN}`; return [...text].reduce((a, ch) => a + g.measureText(ch).width, 0) + size * 0.14 * (text.length - 1); };
        let tw = widthAt(px);
        // 줄과 마름모 자리를 남기고 판에 들어가게
        if (tw > s * 0.56) { px *= (s * 0.56) / tw; tw = widthAt(px); }
        spaced(g, text, s / 2, cy, `600 ${px}px ${LATIN}`, ink.gold, px * 0.14);
        const lw = s * 0.006, gap = px * 0.42, len = Math.min(s * 0.13, (s - tw) / 2 - gap - s * 0.05);
        const d = s * 0.013;
        g.strokeStyle = ink.gold; g.fillStyle = ink.gold; g.lineWidth = lw;
        ([-1, 1] as const).forEach((side) => {
            const x0 = s / 2 + side * (tw / 2 + gap), x1 = x0 + side * len;
            g.globalAlpha = 0.75;
            g.beginPath(); g.moveTo(x0, cy); g.lineTo(x1, cy); g.stroke();
            g.globalAlpha = 1;
            g.beginPath(); g.moveTo(x1 + side * d, cy); g.lineTo(x1, cy - d); g.lineTo(x1 - side * d, cy); g.lineTo(x1, cy + d); g.closePath(); g.fill();
        });
    }, 512);
};

/** 카드의 화면 크기 — 높이(px). 폰은 작게 */
const cardHeight = (ctx: FxContext, big = false) => (ctx.lite ? (big ? 132 : 120) : (big ? 172 : 156));

/** 카드가 화면 밖으로 나가지 않게 가운데 자리를 다듬는다 — 폰은 아래 탭바 자리도 비킨다 */
function fit(ctx: FxContext, x: number, y: number, h: number): [number, number] {
    const w = h * CARD_RATIO;
    const bottom = ctx.lite ? 84 : 12;
    return [
        Math.max(w / 2 + 10, Math.min(ctx.W - w / 2 - 10, x)),
        Math.max(h / 2 + 12, Math.min(ctx.H - h / 2 - bottom, y)),
    ];
}

interface Deal {
    x: number;
    y: number;
    /** 카드 높이(px) */
    h: number;
    life: number;
    delay?: number;
    /** 놓인 뒤의 기울기 (rad) */
    tilt?: number;
    /** 펼칠 때: 묶음 자리(x,y)에서 이만큼 옮겨 놓인다 */
    to?: [number, number];
    /** 들어오는 데 걸리는 시간 */
    inFor?: number;
}

/**
 * 카드 한 장이 놓인다 — 옆으로 선 채(뒤집히는 중) 조금 아래에서 들어와 똑바로 서고, 잠깐 떠 있다가 위로 옅어진다.
 * (창의 카드가 들어오는 deal 과 같은 손: 아래에서·살짝 기울어·조금 작게)
 */
function deal(o: Deal): Particle {
    const inFor = o.inFor ?? 0.3;
    const outFor = 0.4;
    const tilt = o.tilt ?? 0;
    const [tx, ty] = o.to ?? [0, 0];
    return {
        x: o.x, y: o.y + 14, vx: 0, vy: 0, size: o.h / CARD_H, life: o.life, delay: o.delay ?? 0, tint: [1, 1, 1],
        rx: 0, ry: 1.25, rz: -0.12,
        alpha: (k) => {
            const t = k * o.life;
            return t < inFor * 0.6 ? t / (inFor * 0.6) : t > o.life - outFor ? Math.max(0, (o.life - t) / outFor) : 1;
        },
        scale: (k) => {
            const t = k * o.life;
            if (t < inFor) return 0.86 + 0.14 * easeOut(t / inFor);
            return t > o.life - outFor ? 1 + 0.03 * ((t - (o.life - outFor)) / outFor) : 1;
        },
        step: (p) => {
            const t = (p.age ?? 0) - (p.delay ?? 0);
            const f = easeOut(Math.min(1, t / inFor));
            p.ry = 1.25 * (1 - f);
            p.rz = -0.12 * (1 - f) + tilt * f;
            const lift = t > inFor ? -Math.min(t - inFor, 1.2) * 6 : 0;
            p.x = o.x + tx * f;
            p.y = o.y + 14 * (1 - f) + ty * f + lift;
        },
    };
}

/** 카드 뒤의 옅은 빛 — 밤에는 금빛으로 번지고, 낮에는 거의 안 보이게 */
function aura(ctx: FxContext, x: number, y: number, h: number, life: number, delay = 0) {
    return new Swarm(ctx, dot(ctx), [{
        x, y, vx: 0, vy: 0, size: h * 1.7, life, delay, tint: ctx.dark ? hex("#E8C25A") : hex("#F2D98E"),
        alpha: (k) => (ctx.dark ? 0.32 : 0.3) * inOut(k, 0.15, 0.6), scale: (k) => 0.8 + 0.2 * easeOut(k * 3),
    }]);
}

/** 카드 둘레에 흩어져 반짝이는 잔별 */
function glints(ctx: FxContext, x: number, y: number, h: number, n: number, delay = 0.2, life = 1.1) {
    const w = h * CARD_RATIO;
    return new Swarm(ctx, star(ctx), Array.from({ length: n }, (_, i): Particle => {
        const a = (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
        const rx = w * rand(0.62, 0.9), ry = h * rand(0.56, 0.72);
        return {
            x: x + Math.cos(a) * rx, y: y + Math.sin(a) * ry, vx: 0, vy: -rand(4, 12), size: rand(8, 15), rz: rand(0, 1), vrz: rand(-1, 1),
            life: life * rand(0.7, 1), delay: delay + rand(0, 0.35), tint: pick(gold(ctx)), alpha: twinkle, scale: (k) => 0.4 + pop(k) * 0.7,
        };
    }));
}

/** 이어 온 수가 카드 위에 떠오른다 (위가 비좁으면 아래에) */
function tally(ctx: FxContext, n: number, x: number, cardTop: number, cardBottom: number, life: number, delay = 0.22) {
    const size = ctx.lite ? 150 : 176;
    const up = cardTop > size * 0.2 + 8;
    const y = up ? cardTop - size * 0.13 : cardBottom + size * 0.13;
    // 양쪽 금선까지 화면 안에 들게 (카드가 화면 끝에 붙으면 수는 조금 안쪽으로)
    const half = size * 0.42;
    const tx = Math.max(half + 6, Math.min(ctx.W - half - 6, x));
    return new Swarm(ctx, tallyTex(ctx, n), [{
        x: tx, y, vx: 0, vy: up ? -10 : 10, drag: 1.4, size, life: life - delay, delay, tint: [1, 1, 1],
        alpha: (k) => inOut(k, 0.18, 0.62), scale: (k) => 0.85 + 0.15 * easeOut(k * 2.5),
    }]);
}

/** 카드 한 장의 장면 — 뒤 빛·카드·(이어 온 수)·둘레 잔별 */
function arcanum(ctx: FxContext, id: ArcanumId, x0: number, y0: number, opts: { big?: boolean; life?: number; tally?: number; glints?: number } = {}) {
    const h = cardHeight(ctx, opts.big);
    const life = opts.life ?? 1.6;
    const [x, y] = fit(ctx, x0, y0, h);
    return group(
        aura(ctx, x, y, h, life),
        new Swarm(ctx, cardTex(ctx, id), [deal({ x, y, h, life })]),
        opts.tally ? tally(ctx, opts.tally, x, y - h / 2, y + h / 2, life) : null,
        glints(ctx, x, y, h, count(ctx, opts.glints ?? 6)),
    );
}

/* ── 별 ─────────────────────────────────────────────────────────────── */

const pop = (k: number) => Math.sin(Math.min(1, k) * Math.PI);
/** 반짝임 — 차오르고 빠지는 동안 가늘게 떤다 */
const twinkle = (k: number) => pop(k) * (0.72 + 0.28 * Math.sin(k * 26));

/** 별자리 — 점들을 차례로 긋고, 꼭짓점에 별이 맺혔다가 함께 사라진다 */
function stars(ctx: FxContext, pts: [number, number][], delay = 0, life = 1.5, big = 1): Effect {
    const s = new Swarm(ctx, star(ctx), pts.map(([px, py], i): Particle => ({
        x: px, y: py, vx: 0, vy: 0, size: rand(13, 21) * big, rz: rand(0, 0.6), vrz: 0.4,
        life: life - i * 0.06, delay: delay + i * 0.08, tint: pick(gold(ctx)),
        alpha: (k) => (k < 0.12 ? k / 0.12 : k > 0.7 ? (1 - k) / 0.3 : 1),
        scale: (k) => (k < 0.12 ? 0.4 + (k / 0.12) * 0.75 : 1.15 - 0.15 * k),
    })));
    const l = new Trail(ctx, pts, line(ctx), life,
        (k) => Math.min(1, k / 0.5),
        (k) => (k < 0.7 ? 0.5 : 0.5 * (1 - (k - 0.7) / 0.3)), delay + 0.04);
    return group(l, s);
}

/** 영역을 가로지르는 별자리 하나 */
function constellation(ctx: FxContext, area: FxRect, delay = 0, life = 1.5, n = 5 + Math.floor(Math.random() * 3)) {
    const pts: [number, number][] = [];
    let x = area.x + rand(0.05, 0.2) * area.w;
    let y = area.y + rand(0.2, 0.8) * area.h;
    const stepX = (area.w * 0.85) / n;
    for (let i = 0; i < n; i++) {
        pts.push([x, y]);
        x += stepX * rand(0.75, 1.2);
        y = Math.max(area.y + 10, Math.min(area.y + area.h - 10, y + rand(-0.35, 0.35) * area.h));
        if (x > area.x + area.w - 10) break;
    }
    return stars(ctx, pts, delay, life);
}

/** 박히는 별 — 작게 시작해 한 번 부풀었다 자리 잡고 사라진다 */
function seal(ctx: FxContext, x: number, y: number, size: number, life: number, delay = 0, tex = star(ctx)) {
    return new Swarm(ctx, tex, [{
        x, y, vx: 0, vy: 0, size, life, delay, rz: 0.5, vrz: -0.6, tint: sealTint(ctx),
        alpha: (k) => inOut(k, 0.06, 0.55),
        scale: (k) => (k < 0.16 ? 0.3 + (k / 0.16) * 1.05 : 1.35 - Math.min(1, (k - 0.16) / 0.2) * 0.35),
    }]);
}

/** XVII 별 카드의 그림 — 여덟 갈래 별 하나가 박히고, 둘레에 일곱 잔별이 차례로 돋는다 */
function sevenStars(ctx: FxContext, x: number, y: number, r: number, life: number, delay = 0) {
    return group(
        seal(ctx, x, y, 44, life, delay, star8(ctx)),
        new Swarm(ctx, star(ctx), Array.from({ length: 7 }, (_, i): Particle => {
            const a = -Math.PI / 2 + Math.PI / 7 + (i * Math.PI * 2) / 7;
            return {
                x: x + Math.cos(a) * r * 0.55, y: y + Math.sin(a) * r * 0.55, vx: Math.cos(a) * r * 1.4, vy: Math.sin(a) * r * 1.4, drag: 4.2,
                size: i % 2 ? 10 : 13, rz: rand(0, 1), vrz: rand(-1, 1), life: life * 0.85, delay: delay + 0.08 + i * 0.035, tint: pick(gold(ctx)),
                alpha: (k) => inOut(k, 0.1, 0.55), scale: (k) => 0.4 + pop(Math.min(1, k * 1.6)) * 0.7,
            };
        })),
    );
}

/** 별비 — 화면 위쪽에서 별이 반짝이며 천천히 내려온다 */
function starfall(ctx: FxContext, n: number, life: number, delay = 0) {
    return new Swarm(ctx, star(ctx), Array.from({ length: n }, (): Particle => ({
        x: rand(0.04, 0.96) * ctx.W, y: rand(-0.02, 0.4) * ctx.H, vx: rand(-6, 6), vy: rand(26, 64),
        size: rand(7, 15), rz: rand(0, 1), vrz: rand(-1, 1), life: rand(life * 0.65, life), delay: delay + rand(0, 0.35), tint: pick(gold(ctx)),
        alpha: twinkle, scale: (k) => 0.45 + pop(k) * 0.65,
    })));
}

/** 하늘을 비스듬히 가르는 별똥별 n 개 */
function meteors(ctx: FxContext, n: number, delay = 0) {
    return new Swarm(ctx, dot(ctx), Array.from({ length: n }, (_, i): Particle => {
        const a = rand(0.32, 0.55);
        const sp = rand(760, 1050);
        return {
            x: rand(0.08, 0.7) * ctx.W, y: rand(0.03, 0.2) * ctx.H, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 0.6,
            size: rand(9, 12), sx: rand(7, 10), sy: 0.42, rz: -a, life: rand(0.5, 0.7), delay: delay + i * 0.32 + rand(0, 0.12), tint: pick(gold(ctx)),
            alpha: (k) => Math.min(1, k * 7) * (1 - k),
        };
    }));
}

/** 상자의 테두리를 금선이 한 바퀴 긋고(카드의 겉테처럼), 다 그을 즈음 네 귀퉁이가 반짝인다 */
function frame(ctx: FxContext, r: FxRect, life: number, delay = 0, peak = 0.85) {
    const trace = new Trail(ctx, rectPoints(r, 1.5, 4, 5), line(ctx), life,
        (k) => Math.min(1, k / 0.42), (k) => peak * inOut(k, 0.03, 0.62), delay);
    const corners = new Swarm(ctx, star(ctx), ([[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]] as const).map(([x, y], i): Particle => ({
        x, y, vx: 0, vy: 0, size: 15, rz: 0, vrz: 1.2, life: life * 0.62, delay: delay + life * 0.26 + i * 0.06, tint: pick(gold(ctx)),
        alpha: pop, scale: (k) => 0.3 + pop(k) * 0.9,
    })));
    return group(trace, corners);
}

/** 누른 자리에서 네 갈래 별이 사방으로 */
function burst(ctx: FxContext, x: number, y: number, n: number, speed: number, size = 1) {
    const b = Array.from({ length: n }, (_, i): Particle => {
        const a = (i / n) * Math.PI * 2 + rand(-0.25, 0.25);
        const sp = rand(speed * 0.5, speed);
        return {
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.4,
            size: rand(10, 18) * size, rz: rand(0, 6), vrz: rand(-5, 5), life: rand(0.6, 0.9), tint: pick(gold(ctx)),
            alpha: (k) => 1 - k, scale: (k) => 1 - k * 0.6,
        };
    });
    const flash: Particle = { x, y, vx: 0, vy: 0, size: 48 * size, rz: 0, vrz: 1.6, life: 0.45, alpha: (k) => 1 - k, scale: (k) => 0.5 + k * 0.9 };
    return group(new Swarm(ctx, star(ctx), b), new Swarm(ctx, star(ctx), [flash]));
}

/** 화면 왼쪽에 사이드바가 있으면 그만큼 비킨 본문 가운데 */
const contentLeft = (ctx: FxContext) => (ctx.W > 900 ? Math.min(300, ctx.W * 0.2) : 16);

const mod: FxModule = {
    effects: {
        "month-flip": (ctx, e) => {
            const dir = e.direction ?? 1;
            const r = ctx.rect;
            const streaks = Array.from({ length: count(ctx, 20) }, (): Particle => {
                const speed = rand(800, 1400);
                return {
                    x: dir > 0 ? r.x + r.w + rand(0, 60) : r.x - rand(0, 60),
                    y: r.y + rand(0.04, 0.96) * r.h,
                    vx: -dir * speed, vy: rand(-24, 24), drag: 0.9,
                    size: rand(7, 13), sx: rand(4, 7), sy: 0.45,
                    life: rand(0.5, 0.85), delay: rand(0, 0.2), tint: pick(gold(ctx)),
                    alpha: (k) => Math.min(1, k * 6) * (1 - k),
                };
            });
            const settle = Array.from({ length: count(ctx, 6) }, (): Particle => ({
                x: r.x + rand(0.08, 0.92) * r.w, y: r.y + rand(0.1, 0.9) * r.h, vx: 0, vy: 0,
                size: rand(14, 24), rz: rand(0, 1), vrz: rand(-1.2, 1.2),
                life: rand(0.7, 1.0), delay: rand(0.22, 0.45), tint: pick(gold(ctx)),
                alpha: pop, scale: (k) => 0.4 + pop(k) * 0.8,
            }));
            return group(new Swarm(ctx, dot(ctx), streaks), new Swarm(ctx, star(ctx), settle));
        },

        complete: (ctx) => burst(ctx, ctx.x, ctx.y, count(ctx, 10), 270),

        add: (ctx) => new Swarm(ctx, star(ctx), Array.from({ length: count(ctx, 9) }, (): Particle => ({
            x: ctx.x + rand(-14, 14), y: ctx.y + rand(-6, 6), vx: rand(-30, 30), vy: -rand(60, 140), drag: 1.2,
            size: rand(8, 14), rz: rand(0, 3), vrz: rand(-3, 3), life: rand(0.6, 0.95), delay: rand(0, 0.12), tint: pick(gold(ctx)),
            alpha: pop,
        }))),

        // 챌린지 칸 — 여덟 갈래 별과 일곱 잔별. 연속 이정표는 XVII 별 카드, 목표를 다 채우면 XXI 세계 카드
        sticker: (ctx, e) => {
            const level = e.level ?? 0;
            if (level === 0) return sevenStars(ctx, ctx.x, ctx.y, 34, 0.95);
            if (level === 1) return group(
                sevenStars(ctx, ctx.x, ctx.y, 30, 0.8),
                arcanum(ctx, "star", ctx.x, ctx.y, { tally: e.count, life: 1.6 }),
            );
            return group(
                burst(ctx, ctx.x, ctx.y, count(ctx, 12), 300),
                arcanum(ctx, "world", ctx.x, ctx.y, { big: true, tally: e.count, life: 1.75, glints: 9 }),
                starfall(ctx, count(ctx, 14), 1.25, 0.2),
            );
        },

        // 보드에서 옆 칸으로 — 별똥별이 끝 쪽으로 날아가 별로 내려앉는다. 되돌리면 흐린 별똥별이 짧게 뒤로
        advance: (ctx, e) => {
            const dir = e.direction ?? 1;
            const fwd = dir > 0;
            const r = ctx.hasRect ? ctx.rect : { x: ctx.x - 40, y: ctx.y - 14, w: 80, h: 28 };
            const sx = fwd ? r.x + r.w - 8 : r.x + 8, sy = r.y + r.h / 2;
            const dist = (fwd ? 1 : 0.5) * Math.min(260, ctx.W * 0.32) * dir;
            const dur = fwd ? 0.62 : 0.5;
            const dim = fwd ? 1 : 0.5;
            const path = (f: number): [number, number] => [sx + dist * easeOut(f), sy - Math.sin(f * Math.PI) * 16];
            const n = count(ctx, fwd ? 20 : 9);
            const tail = Array.from({ length: n }, (_, i): Particle => {
                const f = i / n;
                const [px, py] = path(f);
                return {
                    x: px, y: py, vx: rand(-12, 12), vy: rand(-12, 12), size: rand(4, 8), life: 0.45, delay: f * dur,
                    tint: pick(gold(ctx)), alpha: (k) => dim * (1 - k),
                };
            });
            const head: Particle = {
                x: sx, y: sy, vx: 0, vy: 0, size: fwd ? 24 : 15, rz: 0, vrz: 3 * dir, life: dur + 0.25, tint: pick(gold(ctx)),
                alpha: (k) => dim * inOut(k, 0.08, 0.72),
                step: (p) => { const [px, py] = path(Math.min(1, (p.age ?? 0) / dur)); p.x = px; p.y = py; },
            };
            const [ex, ey] = path(1);
            return group(
                new Swarm(ctx, dot(ctx), tail),
                new Swarm(ctx, star(ctx), [head]),
                fwd ? seal(ctx, ex, ey, 30, 0.55, dur * 0.85) : null,
            );
        },

        // 프로젝트를 다 끝냄 — XXI 세계 카드가 누른 자리에 놓이고, 위쪽을 큰 별자리가 가로지르고, 별이 조금 내린다
        "project-done": (ctx) => {
            const left = contentLeft(ctx);
            const top = Math.max(60, ctx.H * 0.1);
            return group(
                burst(ctx, ctx.x, ctx.y, count(ctx, 14), 320, 1.1),
                arcanum(ctx, "world", ctx.x, ctx.y, { big: true, life: 1.8, glints: 9 }),
                constellation(ctx, { x: left, y: top, w: ctx.W - left - 40, h: Math.min(200, ctx.H * 0.22) }, 0.15, 1.5, ctx.lite ? 6 : 8),
                starfall(ctx, count(ctx, 16), 1.25, 0.25),
            );
        },

        // 끌어다 놓은 칸 — 테두리를 금선이 한 바퀴(카드의 겉테처럼), 칸 위쪽에 작은 별이 박힌다
        drop: (ctx) => {
            if (!ctx.hasRect) return seal(ctx, ctx.x, ctx.y, 28, 0.8);
            const r = ctx.rect;
            const cx = r.x + r.w / 2, cy = r.y + Math.min(r.h / 2, 30);
            return group(
                frame(ctx, r, 1.0),
                seal(ctx, cx, cy, 26, 0.75, 0.05),
            );
        },

        // 지우기 — 그 자리가 옅은 금가루로 흩어져 오른다. 테두리 그림자가 잠깐 남았다 사라진다
        remove: (ctx) => {
            const r = itemRect(ctx);
            const n = byArea(ctx, r, 700, 12, 46);
            const dust = new Swarm(ctx, dot(ctx), Array.from({ length: n }, (): Particle => {
                const [x, y] = inRect(r, 2);
                return {
                    x, y, vx: rand(-12, 12), vy: -rand(14, 42), drag: 0.7, size: rand(3, 6.5),
                    life: rand(0.7, 1.05), delay: rand(0, 0.12) + ((x - r.x) / Math.max(1, r.w)) * 0.25,
                    tint: ctx.dark ? [0.88, 0.8, 0.6] : [0.55, 0.45, 0.28],
                    alpha: (k) => 0.7 * Math.min(1, k * 6) * (1 - k) ** 1.3, scale: (k) => 1 - k * 0.5,
                };
            }));
            const ghost = new Trail(ctx, rectPoints(r, 1, 4, 6), line(ctx), 0.6, () => 1, (k) => 0.32 * (1 - k));
            return group(ghost, dust);
        },

        // 로그인 — 석 장 펼치기: XVIII 달 · XVII 별 · XIX 해가 한 묶음에서 부채꼴로 펼쳐졌다 사라진다. 가입은 XVII 한 장
        welcome: (ctx, e) => {
            const left = contentLeft(ctx);
            const cx = left + (ctx.W - left) / 2, cy = ctx.H * 0.44;
            const h = cardHeight(ctx);
            if (!e.level) return arcanum(ctx, "star", cx, cy, { life: 1.7 });
            const w = h * CARD_RATIO;
            const gap = ctx.lite ? w * 0.86 : w * 1.02;
            const [x, y] = fit(ctx, cx, cy, h);
            const life = 1.8;
            // 가운데 카드가 맨 위에 오도록 마지막에 놓는다
            const side = (id: ArcanumId, dir: 1 | -1, delay: number) => new Swarm(ctx, cardTex(ctx, id), [deal({
                x, y, h, life: life - delay, delay, tilt: -dir * 0.16, to: [dir * gap, 10], inFor: 0.5,
            })]);
            return group(
                aura(ctx, x, y, h * 1.25, life),
                side("moon", -1, 0.08),
                side("sun", 1, 0.08),
                new Swarm(ctx, cardTex(ctx, "star"), [deal({ x, y, h, life })]),
                glints(ctx, x, y, h * 1.3, count(ctx, 8), 0.35),
            );
        },

        // 오늘이 기념일 — XIX 해 카드가 그 줄 위에 놓이고, 줄 아래로 금선 장식이 양쪽으로, 하늘엔 별똥별
        anniversary: (ctx) => {
            const r = ctx.hasRect ? ctx.rect : { x: ctx.W / 2 - 120, y: ctx.H * 0.3, w: 240, h: 60 };
            const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
            const under = r.y + r.h + 3;
            const flourish = (to: number) => new Trail(ctx, [[cx, under], [to, under]], line(ctx), 1.6,
                (k) => easeOut(k / 0.4), (k) => 0.8 * inOut(k, 0.03, 0.6), 0.15);
            return group(
                ctx.hasRect ? flourish(r.x + 4) : null,
                ctx.hasRect ? flourish(r.x + r.w - 4) : null,
                arcanum(ctx, "sun", cx, cy, { life: 1.7, glints: 8 }),
                meteors(ctx, ctx.lite ? 2 : 3, 0.3),
            );
        },

        // 빠른 이동 — 창 위 가장자리에 금선이 가운데서 양쪽으로, 네 귀퉁이에 별
        palette: (ctx) => {
            if (!ctx.hasRect) return null;
            const r = ctx.rect;
            const top = r.y - 7, cx = r.x + r.w / 2;
            const edge = (to: number) => new Trail(ctx, [[cx, top], [to, top]], line(ctx), 0.95,
                (k) => easeOut(k / 0.45), (k) => 0.7 * inOut(k, 0.04, 0.55));
            const corners = new Swarm(ctx, star(ctx), ([[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]] as const).map(([px, py], i): Particle => ({
                x: px, y: py, vx: 0, vy: 0, size: 14, rz: 0, vrz: 1.4, life: 0.75, delay: 0.14 + i * 0.05, tint: pick(gold(ctx)),
                alpha: pop, scale: (k) => 0.3 + pop(k) * 0.9,
            })));
            return group(edge(r.x + 12), edge(r.x + r.w - 12), corners, seal(ctx, cx, top, 18, 0.7));
        },

        "widget-open": (ctx) => {
            const tx = ctx.W - 70, ty = 56, dur = 0.85;
            const n = count(ctx, 26);
            const trail = Array.from({ length: n }, (_, i): Particle => {
                const f = i / n;
                return {
                    x: ctx.x + (tx - ctx.x) * f, y: ctx.y + (ty - ctx.y) * f, vx: rand(-18, 18), vy: rand(-18, 18),
                    size: rand(5, 10), life: 0.55, delay: f * dur, tint: pick(gold(ctx)), alpha: (k) => 1 - k,
                };
            });
            const head: Particle = {
                x: ctx.x, y: ctx.y, vx: (tx - ctx.x) / dur, vy: (ty - ctx.y) / dur, size: 28, rz: 0, vrz: 4,
                life: dur + 0.25, alpha: (k) => (k < 0.75 ? 1 : (1 - k) / 0.25),
                step: (p) => { if ((p.age ?? 0) > dur) { p.vx = 0; p.vy = 0; } },
            };
            return group(new Swarm(ctx, dot(ctx), trail), new Swarm(ctx, star(ctx), [head]));
        },

        theme: (ctx) => {
            const twinkles = Array.from({ length: count(ctx, 22) }, (): Particle => ({
                x: rand(0, ctx.W), y: rand(0, ctx.H * 0.85), vx: 0, vy: 0, size: rand(8, 20), rz: rand(0, 1), vrz: rand(-1, 1),
                life: rand(0.9, 1.6), delay: rand(0, 0.7), tint: pick(gold(ctx)), alpha: pop, scale: (k) => 0.3 + pop(k) * 0.9,
            }));
            const left = ctx.W > 900 ? 280 : 16;
            return group(new Swarm(ctx, star(ctx), twinkles), constellation(ctx, { x: left, y: 80, w: ctx.W - left - 40, h: Math.min(280, ctx.H * 0.32) }, 0.3));
        },
    },
};

export default mod;
