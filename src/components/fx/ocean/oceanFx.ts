/**
 * 바다의 화면 효과 — 물방울·물보라·물거품·햇빛 반짝임.
 *   달 넘김: 넘기는 쪽으로 물거품 한 줄기가 쓸고 지나가며 물방울을 싣고 간다
 *   화면 옮김: 아래에서 물방울이 흔들리며 떠오른다
 *   끝냄: 누른 자리에 물결 고리가 번지고 물보라가 튄다 · 넣음: 작은 물방울이 보글보글
 *   위젯 띄움: 진주를 품은 물방울이 떠오른다 · 테마로 바꿈: 화면 가득 물방울과 수면의 반짝임
 */
import { Swarm, count, group, pick, rand, type FxContext, type FxModule, type Particle } from "../engine";

/** 물방울 색 — 밤바다에서는 하얗게, 밝은 물(옅은 유리 판 위)에서는 청록을 입혀 묻히지 않게 */
const SEA_NIGHT: [number, number, number][] = [[1, 1, 1], [0.86, 0.98, 0.97], [0.75, 0.95, 0.94]];
const SEA_DAY: [number, number, number][] = [[0.36, 0.74, 0.8], [0.3, 0.68, 0.76], [0.45, 0.82, 0.86]];
const sea = (ctx: FxContext) => (ctx.dark ? SEA_NIGHT : SEA_DAY);

/** 물방울 — 속은 비치고 가장자리가 밝으며, 왼쪽 위에 햇빛 한 점 */
const bubble = (ctx: FxContext) => ctx.texture("oc-bubble", (g, s) => {
    const c = s / 2, r = s * 0.46;
    const body = g.createRadialGradient(c, c, r * 0.55, c, c, r);
    body.addColorStop(0, "rgba(255,255,255,0.04)");
    body.addColorStop(0.75, "rgba(220,250,248,0.35)");
    body.addColorStop(0.93, "rgba(255,255,255,0.9)");
    body.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = body;
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
    const hi = g.createRadialGradient(c - r * 0.38, c - r * 0.42, 0, c - r * 0.38, c - r * 0.42, r * 0.32);
    hi.addColorStop(0, "rgba(255,255,255,0.95)");
    hi.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = hi;
    g.beginPath(); g.arc(c - r * 0.38, c - r * 0.42, r * 0.32, 0, Math.PI * 2); g.fill();
});

/** 물보라 알갱이 */
const drop = (ctx: FxContext) => ctx.texture("oc-drop", (g, s) => {
    const c = s / 2;
    const d = g.createRadialGradient(c - s * 0.1, c - s * 0.12, 0, c, c, s * 0.42);
    d.addColorStop(0, "rgba(255,255,255,1)");
    d.addColorStop(0.45, "rgba(200,246,242,0.9)");
    d.addColorStop(1, "rgba(120,220,215,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, s, s);
}, 32);

/** 물결 고리 */
const ring = (ctx: FxContext) => ctx.texture("oc-ring", (g, s) => {
    const c = s / 2;
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = s * 0.03;
    g.beginPath(); g.arc(c, c, s * 0.44, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(200,248,244,0.5)";
    g.lineWidth = s * 0.06;
    g.beginPath(); g.arc(c, c, s * 0.4, 0, Math.PI * 2); g.stroke();
});

/** 물거품 덩이 — 하얀 번짐 속에 구멍이 송송 */
const foam = (ctx: FxContext) => ctx.texture("oc-foam", (g, s) => {
    const c = s / 2;
    const f = g.createRadialGradient(c, c, 0, c, c, c);
    f.addColorStop(0, "rgba(255,255,255,0.95)");
    f.addColorStop(0.55, "rgba(255,255,255,0.6)");
    f.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = f;
    g.fillRect(0, 0, s, s);
    g.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2, rr = Math.random() * c * 0.7;
        g.fillStyle = `rgba(0,0,0,${0.25 + Math.random() * 0.4})`;
        g.beginPath(); g.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, 1 + Math.random() * s * 0.04, 0, Math.PI * 2); g.fill();
    }
});

/** 햇빛 반짝임 — 가는 열십자 */
const glint = (ctx: FxContext) => ctx.texture("oc-glint", (g, s) => {
    const c = s / 2;
    const glow = g.createRadialGradient(c, c, 0, c, c, c * 0.5);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.fillRect(c - 1, 4, 2, s - 8);
    g.fillRect(4, c - 1, s - 8, 2);
}, 64);

/** 진주 */
const pearl = (ctx: FxContext) => ctx.texture("oc-pearl", (g, s) => {
    const c = s / 2;
    const p = g.createRadialGradient(c - s * 0.12, c - s * 0.14, s * 0.02, c, c, s * 0.42);
    p.addColorStop(0, "#FFFFFF");
    p.addColorStop(0.5, "#F6EEF0");
    p.addColorStop(0.85, "#D9CCD6");
    p.addColorStop(1, "rgba(200,190,200,0)");
    g.fillStyle = p;
    g.beginPath(); g.arc(c, c, s * 0.42, 0, Math.PI * 2); g.fill();
}, 64);

const rise = (k: number) => Math.min(1, k * 5) * (k > 0.75 ? (1 - k) / 0.25 : 1);

/** 떠오르는 물방울 무리 */
function bubbles(ctx: FxContext, n: number, from: { x: number; w: number; y: number }, opts: { speed?: [number, number]; size?: [number, number]; life?: [number, number]; spread?: number } = {}) {
    const [s0, s1] = opts.speed ?? [150, 260];
    const [z0, z1] = opts.size ?? [8, 24];
    const [l0, l1] = opts.life ?? [1.4, 2.1];
    return new Swarm(ctx, bubble(ctx), Array.from({ length: n }, (): Particle => ({
        x: from.x + rand(0, from.w), y: from.y + rand(0, opts.spread ?? 60), vx: rand(-10, 10), vy: -rand(s0, s1),
        size: rand(z0, z1), life: rand(l0, l1), delay: rand(0, 0.5), tint: pick(sea(ctx)),
        wobble: { amp: rand(6, 16), freq: rand(3, 6), phase: rand(0, 6) }, alpha: rise,
        scale: (k) => 0.8 + k * 0.3,
    })));
}

const mod: FxModule = {
    effects: {
        "month-flip": (ctx, e) => {
            const dir = e.direction ?? 1;
            const r = ctx.rect;
            const dur = 0.95;
            const startX = dir > 0 ? r.x + r.w + 40 : r.x - 40;
            const v = (-dir * (r.w + 80)) / dur;
            // 물거품 줄기 — 세로로 늘어선 거품 덩이가 한 몸처럼 쓸고 간다
            const nb = count(ctx, 12);
            const band = Array.from({ length: nb }, (_, i): Particle => ({
                x: startX + rand(-14, 14), y: r.y + ((i + 0.5) / nb) * r.h, vx: v, vy: rand(-6, 6),
                size: rand(70, 120), sx: 0.55, rz: rand(0, 6), vrz: rand(-0.6, 0.6), life: dur, tint: [1, 1, 1],
                alpha: (k) => 0.75 * Math.sin(Math.min(1, k) * Math.PI),
            }));
            const carried = Array.from({ length: count(ctx, 22) }, (): Particle => ({
                x: startX + rand(-30, 60) * dir, y: r.y + rand(0, r.h), vx: v * rand(0.6, 0.9), vy: -rand(20, 70), drag: 0.6,
                size: rand(6, 16), life: rand(0.8, 1.2), delay: rand(0.05, 0.3), tint: pick(sea(ctx)),
                wobble: { amp: 5, freq: 7, phase: rand(0, 6) }, alpha: rise,
            }));
            const sparkle = Array.from({ length: count(ctx, 8) }, (): Particle => ({
                x: r.x + rand(0.05, 0.95) * r.w, y: r.y + rand(0.05, 0.9) * r.h, vx: 0, vy: 0, size: rand(14, 24), rz: 0.4,
                life: 0.6, delay: rand(0.25, 0.7), alpha: (k) => Math.sin(k * Math.PI), scale: (k) => 0.5 + Math.sin(k * Math.PI) * 0.6,
            }));
            return group(new Swarm(ctx, foam(ctx), band), new Swarm(ctx, bubble(ctx), carried), new Swarm(ctx, glint(ctx), sparkle));
        },

        page: (ctx) => {
            const left = ctx.W > 900 ? 260 : 0;
            return bubbles(ctx, count(ctx, 16), { x: left, w: ctx.W - left, y: ctx.H + 10 }, { speed: [200, 330], life: [1.6, 2.4] });
        },

        complete: (ctx) => {
            const rings = [0, 0.16].map((d): Particle => ({
                x: ctx.x, y: ctx.y, vx: 0, vy: 0, size: 64, sy: 0.92, life: 0.8, delay: d, tint: ctx.dark ? [1, 1, 1] : [0.3, 0.7, 0.78],
                alpha: (k) => (1 - k) * 0.9, scale: (k) => 0.25 + k * 1.6,
            }));
            const n = count(ctx, 13);
            const splash = Array.from({ length: n }, (_, i): Particle => {
                const a = -Math.PI / 2 + ((i / (n - 1)) - 0.5) * 2.4 + rand(-0.15, 0.15);
                const sp = rand(170, 320);
                return {
                    x: ctx.x, y: ctx.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ay: 900, size: rand(5, 9),
                    life: rand(0.55, 0.8), tint: pick(sea(ctx)), alpha: (k) => 1 - k * k,
                };
            });
            return group(
                new Swarm(ctx, ring(ctx), rings),
                new Swarm(ctx, drop(ctx), splash),
                bubbles(ctx, count(ctx, 4), { x: ctx.x - 12, w: 24, y: ctx.y }, { speed: [70, 130], size: [6, 12], life: [0.8, 1.1], spread: 4 }),
            );
        },

        add: (ctx) => bubbles(ctx, count(ctx, 7), { x: ctx.x - 14, w: 28, y: ctx.y }, { speed: [80, 160], size: [5, 13], life: [0.8, 1.2], spread: 6 }),

        "widget-open": (ctx) => {
            const cx = ctx.x, cy = ctx.y, up = 230, dur = 1.5;
            const ph = rand(0, 6);
            const path = (p: Particle) => {
                const t = p.age ?? 0;
                p.y = cy - (up * Math.min(t, dur)) / dur;
                p.x = cx + Math.sin(t * 5 + ph) * 8;
            };
            const shell: Particle = { x: cx, y: cy, vx: 0, vy: 0, size: 40, life: dur, tint: ctx.dark ? [1, 1, 1] : [0.42, 0.8, 0.85], alpha: rise, step: path };
            const inner: Particle = { x: cx, y: cy, vx: 0, vy: 0, size: 15, life: dur, alpha: rise, step: path };
            return group(
                new Swarm(ctx, pearl(ctx), [inner]),
                new Swarm(ctx, bubble(ctx), [shell]),
                bubbles(ctx, count(ctx, 10), { x: cx - 10, w: 20, y: cy }, { speed: [90, 170], size: [4, 9], life: [0.9, 1.4], spread: 8 }),
            );
        },

        theme: (ctx) => group(
            bubbles(ctx, count(ctx, 32), { x: 0, w: ctx.W, y: ctx.H + 10 }, { speed: [220, 380], size: [8, 28], life: [2, 3] }),
            new Swarm(ctx, glint(ctx), Array.from({ length: count(ctx, 14) }, (): Particle => ({
                x: rand(0, ctx.W), y: rand(0, ctx.H * 0.5), vx: 0, vy: 0, size: rand(14, 30), rz: rand(0, 0.8),
                life: rand(0.6, 1.0), delay: rand(0, 1.2), alpha: (k) => Math.sin(k * Math.PI), scale: (k) => 0.4 + Math.sin(k * Math.PI) * 0.7,
            }))),
        ),
    },
};

export default mod;
