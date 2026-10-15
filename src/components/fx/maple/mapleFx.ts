/**
 * Maple 의 화면 효과 — 단풍잎이 3D 로 뒤집히며 난다 (판을 x·y 축으로 돌려 팔랑거림을 낸다).
 *   달 넘김: 넘기는 쪽으로 한 줄기 바람(잎 여럿이 가로질러 날아간다)
 *   화면 옮김: 잎 몇 장이 위에서 흔들리며 떨어진다
 *   끝냄: 누른 자리에서 잎 하나가 튀어 올랐다 팔랑 떨어진다 · 넣음: 작은 잎 셋
 *   챌린지 칸: 잎 한 장이 내려와 종이에 눌려 붙고(압화) 붉은 인주 테가 찍힌다 — 이정표면 잎이 둥글게 터지며 숫자,
 *             목표를 다 채우면 화면을 가로지르는 바람과 단풍비, 빙글 도는 단풍 씨앗까지
 *   보드 옮김: 잎이 바람에 실려 다음 칸 쪽으로 (되돌리면 작은 잎 하나가 뒤로 처진다)
 *   프로젝트 완료: 화면 가득 단풍비와 씨앗, 누른 자리에서 잎 무더기가 터진다
 *   끌어 놓기: 잎 한 장이 놓은 칸으로 팔랑 내려앉아 눌린다
 *   지우기: 그 자리가 마른 잎 부스러기로 바스러져 떨어진다 — 조용히
 *   로그인: 양쪽 아래에서 바람이 올라와 잎이 엇갈려 날고 씨앗이 돌며 내려온다 · 기념일: 그 줄에서 잎·은행잎이 꽃가루처럼 솟는다
 *   빠른 이동: 창 위 귀퉁이에서 잎 두 장이 팔랑 떨어진다
 *   위젯 띄움: 누른 자리에 잎 회오리가 일어 솟는다 · 테마로 바꿈: 화면 가득 잎이 진다
 */
import {
    Swarm, byArea, count, easeOut, glyph, group, inOut, inRect, itemRect, pick, rand,
    type Effect, type FxContext, type FxModule, type Particle,
} from "../engine";

type RGB = [number, number, number];

/** 물든 잎 색 — 흰 잎 그림에 곱해서 물들인다 */
const TONES: RGB[] = [
    [0.84, 0.2, 0.12],   // 진홍
    [0.93, 0.42, 0.12],  // 주황
    [0.96, 0.66, 0.18],  // 노랑
    [0.72, 0.28, 0.12],  // 갈빛
    [0.88, 0.3, 0.16],
];
/** 붉은 잎만 — 눌러 붙이는 잎은 한 빛깔로 또렷하게 */
const REDS: RGB[] = [[0.8, 0.17, 0.1], [0.86, 0.26, 0.11], [0.74, 0.16, 0.12]];
/** 은행잎 노랑 */
const GOLDS: RGB[] = [[0.98, 0.78, 0.2], [0.95, 0.68, 0.14], [1, 0.84, 0.32]];
/** 마른 잎 부스러기 — 밝은 종이에서는 짙은 갈색, 어두운 종이에서는 옅은 가랑잎 빛 */
const dry = (ctx: FxContext): RGB[] => (ctx.dark
    ? [[0.72, 0.55, 0.38], [0.64, 0.47, 0.32], [0.78, 0.62, 0.42]]
    : [[0.52, 0.34, 0.2], [0.6, 0.42, 0.24], [0.45, 0.3, 0.19]]);
/** 인주 — 단풍 붉음 (어두운 종이에서는 잉걸 주황) — 테마의 primary(#B8452B·#E27B53)와 같은 색 */
const ink = (ctx: FxContext): RGB => (ctx.dark ? [0.89, 0.48, 0.33] : [0.72, 0.27, 0.17]);

/**
 * 단풍잎 — 다섯 갈래(위 하나·옆 둘·아래 작은 둘)를 극좌표로 빚고 가장자리를 톱니로.
 * 흰빛으로 그려 두고 입자마다 색을 곱한다. 잎맥은 조금 어둡게.
 */
const leaf = (ctx: FxContext) => ctx.texture("maple-leaf", (g, s) => {
    const c = s / 2;
    const R = s * 0.46;
    const lobes = [
        { a: 0, r: 1 }, { a: -1.05, r: 0.86 }, { a: 1.05, r: 0.86 }, { a: -2.1, r: 0.52 }, { a: 2.1, r: 0.52 },
    ];
    const radius = (t: number) => {
        let r = 0.3;
        for (const l of lobes) {
            let d = Math.abs(t - l.a);
            d = Math.min(d, Math.PI * 2 - d);
            r = Math.max(r, l.r * Math.exp(-(d * d) / (2 * 0.2 * 0.2)));
        }
        const back = Math.abs(Math.abs(t) - Math.PI);
        if (back < 0.35) r = Math.min(r, 0.16 + back * 0.4);
        return r * (1 + 0.07 * Math.sin(t * 28)) ;
    };
    g.save();
    g.translate(c, c + s * 0.04);
    g.beginPath();
    for (let i = 0; i <= 360; i++) {
        const t = -Math.PI + (i / 360) * Math.PI * 2;
        const r = radius(t) * R;
        const x = Math.sin(t) * r, y = -Math.cos(t) * r;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    const fill = g.createRadialGradient(0, -R * 0.1, R * 0.05, 0, 0, R);
    fill.addColorStop(0, "#FFFFFF");
    fill.addColorStop(0.7, "#EDEDED");
    fill.addColorStop(1, "#C9C9C9");
    g.fillStyle = fill;
    g.fill();
    // 잎맥
    g.strokeStyle = "rgba(120,120,120,0.55)";
    g.lineWidth = s * 0.012;
    for (const l of lobes) {
        g.beginPath();
        g.moveTo(0, R * 0.12);
        g.lineTo(Math.sin(l.a) * R * l.r * 0.85, -Math.cos(l.a) * R * l.r * 0.85);
        g.stroke();
    }
    // 꼭지
    g.strokeStyle = "rgba(110,110,110,0.9)";
    g.lineWidth = s * 0.02;
    g.beginPath();
    g.moveTo(0, R * 0.1);
    g.quadraticCurveTo(R * 0.04, R * 0.4, -R * 0.05, R * 0.55);
    g.stroke();
    g.restore();
}, 128);

/** 은행잎 — 부채꼴에 가운데가 살짝 갈라지고 가는 잎맥이 퍼진다 */
const ginkgo = (ctx: FxContext) => ctx.texture("maple-ginkgo", (g, s) => {
    const c = s / 2;
    const R = s * 0.44;
    g.save();
    g.translate(c, c + R * 0.42);
    g.beginPath();
    g.moveTo(0, 0);
    const a0 = -Math.PI / 2 - 1.05, a1 = -Math.PI / 2 + 1.05;
    for (let i = 0; i <= 60; i++) {
        const a = a0 + ((a1 - a0) * i) / 60;
        const notch = 1 - 0.16 * Math.exp(-(((a + Math.PI / 2) / 0.08) ** 2));
        const wave = 1 + 0.025 * Math.sin(i * 1.7);
        g.lineTo(Math.cos(a) * R * notch * wave, Math.sin(a) * R * notch * wave);
    }
    g.closePath();
    const fill = g.createRadialGradient(0, 0, R * 0.1, 0, -R * 0.4, R);
    fill.addColorStop(0, "#DADADA");
    fill.addColorStop(0.6, "#FFFFFF");
    fill.addColorStop(1, "#F0F0F0");
    g.fillStyle = fill;
    g.fill();
    g.strokeStyle = "rgba(140,140,140,0.35)";
    g.lineWidth = s * 0.006;
    for (let i = 0; i < 9; i++) {
        const a = a0 + 0.12 + ((a1 - a0 - 0.24) * i) / 8;
        g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9); g.stroke();
    }
    g.strokeStyle = "rgba(120,120,120,0.85)";
    g.lineWidth = s * 0.018;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(R * 0.04, R * 0.42); g.stroke();
    g.restore();
}, 128);

/** 단풍 씨앗(시과) — 씨 한 알에 얇은 날개 한 장. 떨어질 때 빙글빙글 돈다 */
const seed = (ctx: FxContext) => ctx.texture("maple-seed", (g, s) => {
    const c = s / 2;
    g.save();
    g.translate(c, c);
    g.rotate(-0.5);
    // 날개
    g.beginPath();
    g.moveTo(-s * 0.3, 0);
    g.bezierCurveTo(-s * 0.1, -s * 0.2, s * 0.32, -s * 0.2, s * 0.42, -s * 0.04);
    g.bezierCurveTo(s * 0.3, s * 0.06, 0, s * 0.08, -s * 0.3, 0);
    g.fillStyle = "rgba(255,255,255,0.82)";
    g.fill();
    g.strokeStyle = "rgba(150,150,150,0.45)";
    g.lineWidth = s * 0.008;
    for (let i = 0; i < 6; i++) {
        g.beginPath(); g.moveTo(-s * 0.26, 0); g.quadraticCurveTo(0, -s * 0.06 - i * s * 0.012, s * (0.1 + i * 0.05), -s * (0.12 - i * 0.012)); g.stroke();
    }
    // 씨
    g.beginPath();
    g.ellipse(-s * 0.3, s * 0.005, s * 0.085, s * 0.06, 0.2, 0, Math.PI * 2);
    g.fillStyle = "#E6E6E6";
    g.fill();
    g.restore();
}, 96);

/** 마른 잎 부스러기 — 들쭉날쭉한 조각 */
const crumb = (ctx: FxContext) => ctx.texture("maple-crumb", (g, s) => {
    const c = s / 2;
    g.beginPath();
    const n = 7;
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = s * (0.3 + ((i * 37) % 11) / 11 * 0.16);
        const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r * 0.8;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    g.fillStyle = "#FFFFFF";
    g.fill();
    g.strokeStyle = "rgba(120,120,120,0.5)";
    g.lineWidth = s * 0.03;
    g.beginPath(); g.moveTo(c - s * 0.2, c + s * 0.05); g.lineTo(c + s * 0.22, c - s * 0.04); g.stroke();
}, 48);

/** 붉은 인주 테 — 붓이 고르지 않게 지나간 원 (낙관을 찍은 듯) */
const stampRing = (ctx: FxContext) => ctx.texture("maple-stamp", (g, s) => {
    const c = s / 2, R = s * 0.4;
    g.strokeStyle = "rgba(255,255,255,0.95)";
    for (let pass = 0; pass < 3; pass++) {
        g.lineWidth = s * (0.018 + pass * 0.006);
        g.globalAlpha = 0.55 - pass * 0.15;
        g.beginPath();
        for (let i = 0; i <= 120; i++) {
            const a = (i / 120) * Math.PI * 2;
            const r = R * (1 + 0.012 * Math.sin(a * 7 + pass) + 0.008 * Math.sin(a * 19 + pass * 2));
            const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
            if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
    }
    g.globalAlpha = 1;
}, 256);

/** 부드러운 먼지 한 알 */
const mote = (ctx: FxContext) => ctx.texture("maple-mote", (g, s) => {
    const c = s / 2;
    const d = g.createRadialGradient(c, c, 0, c, c, c);
    d.addColorStop(0, "rgba(255,255,255,0.9)");
    d.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, s, s);
}, 32);

/** 숫자 — 고운 기울인 세리프, 인주 빛 */
const numeral = (ctx: FxContext, n: number) => glyph(ctx, String(n), "italic 600 {px} 'Cormorant Garamond', 'Gowun Batang', serif");

/** 한 장의 잎 — 3D 로 뒤집히며(rx·ry) 돈다(rz) */
const flutter = (p: Partial<Particle> & Pick<Particle, "x" | "y" | "vx" | "vy" | "size" | "life">): Particle => ({
    rx: rand(0, 6), ry: rand(0, 6), rz: rand(0, 6),
    vrx: rand(-4, 4), vry: rand(-5, 5), vrz: rand(-2.5, 2.5),
    tint: pick(TONES),
    alpha: (k) => Math.min(1, k * 8) * (k > 0.8 ? (1 - k) / 0.2 : 1),
    ...p,
});

/** 위에서 떨어지는 잎들 — fallFor 초 동안 떨어지다 사라진다 */
function fall(ctx: FxContext, n: number, area: { x: number; w: number }, fallFor: number, tex = leaf(ctx), tones = TONES) {
    return new Swarm(ctx, tex, Array.from({ length: n }, () => flutter({
        x: area.x + rand(0, area.w), y: -rand(20, 80), vx: rand(-25, 35), vy: rand(80, 150),
        size: rand(26, 44), life: fallFor * rand(0.85, 1.15), delay: rand(0, 0.6), tint: pick(tones),
        wobble: { amp: rand(20, 50), freq: rand(1.4, 2.6), phase: rand(0, 6) },
    })));
}

/** 단풍 씨앗 — 빙글빙글 돌며 천천히 내려온다 */
function seeds(ctx: FxContext, n: number, area: { x: number; w: number }, life: number, delay = 0) {
    return new Swarm(ctx, seed(ctx), Array.from({ length: n }, (): Particle => ({
        x: area.x + rand(0, area.w), y: -rand(10, 60), vx: rand(-14, 14), vy: rand(70, 110),
        size: rand(32, 42), rz: rand(0, 6), vrz: (Math.random() < 0.5 ? -1 : 1) * rand(6, 9), rx: rand(-0.4, 0.4),
        life: life * rand(0.85, 1.1), delay: delay + rand(0, 0.8), tint: ctx.dark ? [0.86, 0.66, 0.42] : [0.72, 0.5, 0.3],
        wobble: { amp: rand(8, 18), freq: rand(1.2, 2), phase: rand(0, 6) },
        alpha: (k) => Math.min(1, k * 8) * (k > 0.8 ? (1 - k) / 0.2 : 1),
    })));
}

/** 잎 한 장이 위에서 내려와 종이에 눌려 붙는다(압화) — 내려앉으면 뒤집힘이 풀려 납작해진다 */
function press(ctx: FxContext, x: number, y: number, size: number, life: number, delay = 0, drop = 70): Particle {
    const rx0 = rand(0.9, 1.3), ry0 = rand(-1.1, -0.7), rz0 = rand(0.5, 1.1), rzEnd = rand(-0.35, 0.35);
    const land = 0.34;
    return {
        x, y: y - drop, vx: 0, vy: 0, size, life, delay, tint: pick(REDS), rx: rx0, ry: ry0, rz: rz0,
        alpha: (k) => inOut(k, 0.05, 0.7),
        scale: (k) => { const t = k * life; return t < land ? 1.45 - 0.45 * easeOut(t / land) : 1; },
        step: (p) => {
            const t = (p.age ?? 0) - (p.delay ?? 0);
            const f = easeOut(Math.min(1, t / land));
            p.y = y - drop * (1 - f);
            p.x = x + Math.sin((1 - f) * 3) * 10 * (1 - f);
            p.rx = rx0 * (1 - f);
            p.ry = ry0 * (1 - f);
            p.rz = rz0 * (1 - f) + rzEnd * f;
        },
    };
}

/** 눌린 자리에 붉은 인주 테가 찍힌다 — 크게 닿았다 제자리로 */
function seal(ctx: FxContext, x: number, y: number, size: number, life: number, delay = 0, peak = 0.55) {
    return new Swarm(ctx, stampRing(ctx), [{
        x, y, vx: 0, vy: 0, size, life, delay, rz: rand(0, 6), tint: ink(ctx),
        alpha: (k) => peak * inOut(k, 0.04, 0.55), scale: (k) => (k < 0.1 ? 1.25 - (k / 0.1) * 0.25 : 1),
    }]);
}

/** 잎이 둥글게 터져 나갔다가 팔랑 떨어진다 */
function wreath(ctx: FxContext, x: number, y: number, n: number, speed: number, delay = 0) {
    return new Swarm(ctx, leaf(ctx), Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rand(-0.15, 0.15);
        const sp = speed * rand(0.8, 1.1);
        return flutter({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, ay: 380, drag: 2.2,
            size: rand(18, 28), life: rand(1.2, 1.6), delay: delay + rand(0, 0.06),
        });
    }));
}

/** 바람 한 줄기 — 왼쪽에서 오른쪽으로 화면을 가로지른다 */
function gust(ctx: FxContext, n: number, delay = 0, y0 = 0.15, y1 = 0.65, dir = 1) {
    return new Swarm(ctx, leaf(ctx), Array.from({ length: n }, () => {
        const sway = rand(1.5, 3);
        const ph = rand(0, 6);
        return flutter({
            x: dir > 0 ? -rand(20, 120) : ctx.W + rand(20, 120), y: rand(y0, y1) * ctx.H,
            vx: dir * rand(420, 680), vy: rand(-40, 20), ay: 90, drag: 0.3,
            size: rand(26, 44), life: rand(1.8, 2.4), delay: delay + rand(0, 0.5),
            step: (p, dt) => { p.vy += Math.sin((p.age ?? 0) * sway * 3 + ph) * 220 * dt; },
        });
    }));
}

/** 숫자가 떠올랐다 사라진다 (위가 비좁으면 아래로) */
function rising(ctx: FxContext, x: number, y: number, n: number, size: number, delay = 0) {
    const up = y > size * 1.3;
    return new Swarm(ctx, numeral(ctx, n), [{
        x: x + size * 0.15, y: up ? y - size * 0.7 : y + size * 0.7, vx: 0, vy: up ? -22 : 22, drag: 1.2, size, life: 1.7, delay, tint: ink(ctx),
        rz: -0.08, alpha: (k) => inOut(k, 0.14, 0.62), scale: (k) => 0.85 + 0.15 * easeOut(k * 2),
    }]);
}

const mod: FxModule = {
    effects: {
        "month-flip": (ctx, e) => {
            const dir = e.direction ?? 1;
            const r = ctx.rect;
            return new Swarm(ctx, leaf(ctx), Array.from({ length: count(ctx, 10) }, () => {
                const sway = rand(1.5, 3);
                const ph = rand(0, 6);
                return flutter({
                    x: dir > 0 ? r.x + r.w + rand(0, 120) : r.x - rand(0, 120),
                    y: r.y + rand(0, 0.75) * r.h,
                    vx: -dir * rand(520, 900), vy: rand(-50, 20), ay: 140, drag: 0.45,
                    size: rand(30, 52), life: rand(1.3, 1.9), delay: rand(0, 0.25),
                    // 바람결 — 위아래로 출렁이며 간다
                    step: (p, dt) => { p.vy += Math.sin((p.age ?? 0) * sway * 3 + ph) * 260 * dt; },
                });
            }));
        },

        page: (ctx) => {
            const left = ctx.W > 900 ? 260 : 0;
            return fall(ctx, count(ctx, 5), { x: left, w: ctx.W - left }, 2.2);
        },

        complete: (ctx) => {
            const big = flutter({ x: ctx.x, y: ctx.y, vx: rand(-70, 70), vy: -rand(300, 380), ay: 560, drag: 0.6, size: 46, life: 1.35 });
            const small = Array.from({ length: count(ctx, 4) }, () => flutter({
                x: ctx.x, y: ctx.y, vx: rand(-160, 160), vy: -rand(180, 300), ay: 620, drag: 0.8, size: rand(16, 24), life: rand(0.9, 1.2), delay: rand(0, 0.08),
            }));
            return new Swarm(ctx, leaf(ctx), [big, ...small]);
        },

        add: (ctx) => new Swarm(ctx, leaf(ctx), Array.from({ length: count(ctx, 3) }, () => flutter({
            x: ctx.x, y: ctx.y, vx: rand(-90, 90), vy: -rand(160, 240), ay: 520, drag: 0.8, size: rand(16, 24), life: rand(0.8, 1.1),
        }))),

        // 챌린지 칸 — 잎 한 장이 눌려 붙고 인주 테가 찍힌다. 이정표·목표 달성은 한 단씩 더
        sticker: (ctx, e) => {
            const level = e.level ?? 0;
            const { x, y } = ctx;
            const parts: (Effect | null)[] = [
                new Swarm(ctx, leaf(ctx), [press(ctx, x, y, level ? 50 : 40, level ? 1.5 : 1.15)]),
                seal(ctx, x, y, level ? 86 : 70, level ? 1.3 : 1.0, 0.3),
                new Swarm(ctx, leaf(ctx), Array.from({ length: count(ctx, 3) }, () => flutter({
                    x, y, vx: rand(-150, 150), vy: -rand(150, 240), ay: 600, drag: 0.8, size: rand(14, 20), life: rand(0.8, 1.05), delay: 0.32,
                }))),
            ];
            if (level >= 1) {
                parts.push(wreath(ctx, x, y, count(ctx, 12), 300, 0.34));
                if (e.count) parts.push(rising(ctx, x, y - 30, e.count, ctx.lite ? 70 : 84, 0.4));
            }
            if (level >= 2) {
                parts.push(gust(ctx, count(ctx, 12), 0.3));
                parts.push(fall(ctx, count(ctx, 14), { x: 0, w: ctx.W }, 2.8));
                parts.push(seeds(ctx, count(ctx, 6), { x: 0, w: ctx.W }, 3.0, 0.4));
            }
            return group(...parts);
        },

        // 보드에서 옆 칸으로 — 잎이 바람에 실려 끝 쪽으로. 되돌리면 작은 잎 하나가 뒤로 처진다
        advance: (ctx, e) => {
            const dir = e.direction ?? 1;
            const r = ctx.hasRect ? ctx.rect : { x: ctx.x - 40, y: ctx.y - 14, w: 80, h: 28 };
            const sx = dir > 0 ? r.x + r.w - 10 : r.x + 10, sy = r.y + r.h / 2;
            if (dir < 0) {
                return new Swarm(ctx, leaf(ctx), [flutter({
                    x: sx, y: sy, vx: -rand(120, 160), vy: -rand(40, 80), ay: 260, drag: 1.2, size: 20, life: 1.0, tint: pick(dry(ctx)),
                    alpha: (k) => 0.75 * Math.min(1, k * 8) * (k > 0.6 ? (1 - k) / 0.4 : 1),
                })]);
            }
            const dist = Math.min(260, ctx.W * 0.32);
            const dur = 0.85;
            const path = (f: number, lag: number): [number, number] => {
                const g = easeOut(f);
                return [sx + dist * g - lag * 26, sy - Math.sin(f * Math.PI) * (30 - lag * 8) + lag * 6];
            };
            return new Swarm(ctx, leaf(ctx), [0, 1, 2].slice(0, ctx.gentle ? 1 : 3).map((lag) => flutter({
                x: sx, y: sy, vx: 0, vy: 0, size: lag ? rand(20, 24) : 38, life: dur + 0.5, delay: lag * 0.08,
                rx: rand(-0.5, 0.5), ry: rand(-0.5, 0.5), vrx: rand(-1.6, 1.6), vry: rand(-1.6, 1.6), vrz: rand(-3, -1.5),
                tint: lag ? pick(TONES) : pick(REDS),
                alpha: (k) => Math.min(1, k * 10) * (k > 0.7 ? (1 - k) / 0.3 : 1),
                step: (p) => {
                    const t = (p.age ?? 0) - (p.delay ?? 0);
                    if (t <= dur) { const [px, py] = path(t / dur, lag); p.x = px; p.y = py; }
                    else { p.vx = 30; p.vy = 60; }
                },
            })));
        },

        // 프로젝트를 다 끝냄 — 화면 가득 단풍비와 씨앗, 누른 자리에서 잎 무더기
        "project-done": (ctx) => group(
            wreath(ctx, ctx.x, ctx.y, count(ctx, 14), 360),
            new Swarm(ctx, leaf(ctx), [press(ctx, ctx.x, ctx.y, 54, 1.4, 0, 50)]),
            seal(ctx, ctx.x, ctx.y, 96, 1.2, 0.28),
            fall(ctx, count(ctx, 20), { x: 0, w: ctx.W }, 3.0),
            new Swarm(ctx, ginkgo(ctx), Array.from({ length: count(ctx, 6) }, () => flutter({
                x: rand(0, ctx.W), y: -rand(20, 80), vx: rand(-20, 30), vy: rand(80, 140), size: rand(24, 34), life: rand(2.6, 3.2), delay: rand(0.2, 0.9), tint: pick(GOLDS),
                wobble: { amp: rand(20, 40), freq: rand(1.4, 2.4), phase: rand(0, 6) },
            }))),
            seeds(ctx, count(ctx, 6), { x: 0, w: ctx.W }, 3.0, 0.3),
        ),

        // 끌어다 놓은 칸 — 잎 한 장이 팔랑 내려앉아 눌린다
        drop: (ctx) => {
            const r = ctx.hasRect ? ctx.rect : { x: ctx.x - 30, y: ctx.y - 30, w: 60, h: 60 };
            const cx = r.x + r.w / 2, cy = r.y + Math.min(r.h / 2, 34);
            const size = Math.max(26, Math.min(40, Math.min(r.w, r.h) * 0.5));
            return group(
                new Swarm(ctx, leaf(ctx), [press(ctx, cx, cy, size, 1.0, 0, 80)]),
                seal(ctx, cx, cy, size * 1.7, 0.8, 0.3, 0.45),
                new Swarm(ctx, leaf(ctx), Array.from({ length: count(ctx, 2) }, () => flutter({
                    x: cx, y: cy, vx: rand(-110, 110), vy: -rand(90, 150), ay: 520, drag: 1, size: rand(12, 16), life: 0.8, delay: 0.32,
                }))),
            );
        },

        // 지우기 — 마른 잎 부스러기로 바스러져 떨어진다 (왼쪽부터 차례로)
        remove: (ctx) => {
            const r = itemRect(ctx);
            const n = byArea(ctx, r, 650, 12, 40);
            const crumbs = new Swarm(ctx, crumb(ctx), Array.from({ length: n }, (): Particle => {
                const [x, y] = inRect(r, 2);
                return {
                    x, y, vx: rand(-30, 30), vy: -rand(0, 40), ay: rand(300, 420), drag: 0.6,
                    size: rand(8, 15), rx: rand(-0.6, 0.6), ry: rand(-0.6, 0.6), rz: rand(0, 6), vrx: rand(-2.5, 2.5), vry: rand(-2.5, 2.5), vrz: rand(-4, 4),
                    life: rand(0.75, 1.05), delay: ((x - r.x) / Math.max(1, r.w)) * 0.28 + rand(0, 0.08), tint: pick(dry(ctx)),
                    alpha: (k) => 0.85 * Math.min(1, k * 8) * (1 - k) ** 1.2,
                };
            }));
            const dust = new Swarm(ctx, mote(ctx), Array.from({ length: count(ctx, Math.round(n * 0.5)) }, (): Particle => {
                const [x, y] = inRect(r, 4);
                return {
                    x, y, vx: rand(-10, 10), vy: -rand(8, 24), size: rand(4, 8), life: rand(0.6, 0.9),
                    delay: ((x - r.x) / Math.max(1, r.w)) * 0.28, tint: pick(dry(ctx)), alpha: (k) => 0.35 * Math.sin(k * Math.PI),
                };
            }));
            return group(dust, crumbs);
        },

        // 로그인 — 양쪽 아래에서 바람이 올라와 잎이 엇갈려 날고, 씨앗이 돌며 내려온다 (가입은 한쪽만)
        welcome: (ctx, e) => {
            const side = (dir: 1 | -1, n: number, delay: number) => new Swarm(ctx, leaf(ctx), Array.from({ length: n }, () => {
                const sway = rand(1.4, 2.4);
                const ph = rand(0, 6);
                return flutter({
                    x: dir > 0 ? -rand(20, 80) : ctx.W + rand(20, 80), y: ctx.H * rand(0.7, 1.02),
                    vx: dir * rand(380, 560), vy: -rand(260, 380), ay: 170, drag: 0.55,
                    size: rand(28, 46), life: rand(2.2, 2.8), delay: delay + rand(0, 0.45),
                    step: (p, dt) => { p.vx += Math.sin((p.age ?? 0) * sway * 2.6 + ph) * 160 * dt; },
                });
            }));
            const n = count(ctx, 10);
            return group(
                side(1, n, 0),
                e.level ? side(-1, n, 0.25) : null,
                seeds(ctx, count(ctx, e.level ? 7 : 4), { x: ctx.W * 0.1, w: ctx.W * 0.8 }, 3.0, 0.3),
            );
        },

        // 오늘이 기념일 — 그 줄에서 잎·은행잎이 꽃가루처럼 솟았다 팔랑 내려오고, 위에서도 몇 장
        anniversary: (ctx) => {
            const r = ctx.hasRect ? ctx.rect : { x: ctx.W / 2 - 120, y: ctx.H * 0.35, w: 240, h: 50 };
            const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
            const shoot = (tex: ReturnType<typeof leaf>, n: number, tones: RGB[]) => new Swarm(ctx, tex, Array.from({ length: n }, () => {
                const a = -Math.PI / 2 + rand(-0.9, 0.9);
                const sp = rand(240, 380);
                return flutter({
                    x: cx + rand(-r.w * 0.4, r.w * 0.4), y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 300, drag: 1.6,
                    size: rand(18, 30), life: rand(1.9, 2.5), delay: rand(0, 0.3), tint: pick(tones),
                    wobble: { amp: rand(10, 24), freq: rand(1.6, 2.6), phase: rand(0, 6) },
                });
            }));
            // 줄 양끝 바로 바깥에 — 글자(이름·D-day)를 가리지 않게
            const ends = ctx.hasRect ? [Math.max(14, r.x - 12), Math.min(ctx.W - 14, r.x + r.w + 12)] : [];
            return group(
                ends.length ? new Swarm(ctx, leaf(ctx), ends.map((ex, i) => press(ctx, ex, cy, Math.min(34, r.h * 0.9), 1.9, 0.1 + i * 0.12, 50))) : null,
                ...ends.map((ex, i) => seal(ctx, ex, cy, Math.min(58, r.h * 1.5), 1.6, 0.38 + i * 0.12, 0.42)),
                shoot(leaf(ctx), count(ctx, 14), TONES),
                shoot(ginkgo(ctx), count(ctx, 8), GOLDS),
                fall(ctx, count(ctx, 8), { x: 0, w: ctx.W }, 2.6, ginkgo(ctx), GOLDS),
            );
        },

        // 빠른 이동 — 창 위 귀퉁이에서 잎 두 장이 팔랑 떨어진다
        palette: (ctx) => {
            if (!ctx.hasRect) return null;
            const r = ctx.rect;
            return new Swarm(ctx, leaf(ctx), [
                flutter({ x: r.x + r.w - 22, y: r.y - 8, vx: rand(24, 44), vy: rand(50, 80), ay: 50, size: 26, life: 1.5, tint: pick(REDS),
                    wobble: { amp: rand(14, 22), freq: rand(1.8, 2.4), phase: rand(0, 6) } }),
                flutter({ x: r.x + 26, y: r.y - 4, vx: -rand(18, 36), vy: rand(40, 70), ay: 50, size: 18, life: 1.3, delay: 0.14,
                    wobble: { amp: rand(10, 18), freq: rand(1.8, 2.6), phase: rand(0, 6) } }),
            ]);
        },

        "widget-open": (ctx) => {
            const cx = ctx.x, cy = ctx.y;
            const n = count(ctx, 14);
            return new Swarm(ctx, leaf(ctx), Array.from({ length: n }, (_, i) => {
                const a0 = (i / n) * Math.PI * 2;
                const w = rand(5, 7.5);
                const rise = rand(90, 150);
                return flutter({
                    x: cx, y: cy, vx: 0, vy: 0, size: rand(20, 34), life: rand(1.5, 1.9), delay: rand(0, 0.15),
                    // 회오리 — 도는 반지름이 커지며 위로 솟는다 (옆에서 본 듯 납작한 타원)
                    step: (p) => {
                        const t = p.age ?? 0;
                        const a = a0 + w * t;
                        const rr = 14 + t * 70;
                        p.x = cx + Math.cos(a) * rr;
                        p.y = cy - rise * t + Math.sin(a) * rr * 0.32;
                    },
                });
            }));
        },

        theme: (ctx) => group(
            fall(ctx, count(ctx, 12), { x: 0, w: ctx.W }, 3.2),
            new Swarm(ctx, leaf(ctx), Array.from({ length: count(ctx, 6) }, () => flutter({
                x: -40, y: rand(0.1, 0.6) * ctx.H, vx: rand(380, 620), vy: rand(-30, 30), ay: 90, drag: 0.3, size: rand(30, 46), life: rand(1.8, 2.4), delay: rand(0.2, 0.8),
            }))),
        ),
    },
};

export default mod;
