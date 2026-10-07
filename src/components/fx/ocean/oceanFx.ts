/**
 * 바다의 화면 효과 — 수면에 번지는 물결 고리와 작은 빛 알갱이. 조용하고 짧게.
 *   달 넘김: 넘기는 쪽으로 옅은 빛 한 줄기가 칸 위를 쓸고 지나간다 (물속으로 비쳐 드는 빛)
 *   화면 옮김: 누른 자리에서 큰 물결 고리 하나가 옅게 번진다
 *   끝냄: 가는 물결 고리 둘과 빛 알갱이 몇 개 · 넣음: 작은 고리 하나
 *   위젯 띄움: 고리와 함께 빛 알갱이가 위로 떠오른다 · 테마로 바꿈: 화면 가운데서 고리 셋이 차례로 번진다
 * 밝은 물에서는 청록, 밤바다에서는 옅은 물빛 — 하얀 것은 밝은 판 위에서 묻힌다.
 */
import { Swarm, count, group, rand, type FxContext, type FxModule, type Particle } from "../engine";

type RGB = [number, number, number];
const tint = (ctx: FxContext): RGB => (ctx.dark ? [0.55, 0.88, 0.83] : [0.07, 0.43, 0.43]);

/** 가는 고리 — 크게 키워도 선이 뭉개지지 않게 넉넉한 그림으로 */
const ring = (ctx: FxContext) => ctx.texture("oc2-ring", (g, s) => {
    const c = s / 2;
    g.strokeStyle = "rgba(255,255,255,1)";
    g.lineWidth = s * 0.012;
    g.beginPath(); g.arc(c, c, s * 0.46, 0, Math.PI * 2); g.stroke();
}, 256);

/** 빛 알갱이 */
const mote = (ctx: FxContext) => ctx.texture("oc2-mote", (g, s) => {
    const c = s / 2;
    const d = g.createRadialGradient(c, c, 0, c, c, c);
    d.addColorStop(0, "rgba(255,255,255,1)");
    d.addColorStop(0.35, "rgba(255,255,255,0.55)");
    d.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, s, s);
}, 32);

/** 빛줄기 — 가운데가 밝고 가장자리로 사라지는 길쭉한 빛 */
const beam = (ctx: FxContext) => ctx.texture("oc2-beam", (g, s) => {
    const d = g.createLinearGradient(0, 0, s, 0);
    d.addColorStop(0, "rgba(255,255,255,0)");
    d.addColorStop(0.5, "rgba(255,255,255,1)");
    d.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, s, s);
    // 위아래로도 옅게
    g.globalCompositeOperation = "destination-in";
    const v = g.createLinearGradient(0, 0, 0, s);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(0.2, "rgba(0,0,0,1)");
    v.addColorStop(0.8, "rgba(0,0,0,1)");
    v.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = v;
    g.fillRect(0, 0, s, s);
}, 128);

/** 물결 고리 n 개 — 차례로 번지며 사라진다 */
function rings(ctx: FxContext, x: number, y: number, n: number, size: number, opts: { gap?: number; life?: number; alpha?: number } = {}) {
    const { gap = 0.14, life = 0.7, alpha = 0.8 } = opts;
    return new Swarm(ctx, ring(ctx), Array.from({ length: n }, (_, i): Particle => ({
        x, y, vx: 0, vy: 0, size, sy: 0.96, life, delay: i * gap, tint: tint(ctx),
        alpha: (k) => alpha * (1 - k) * (1 - k),
        scale: (k) => 0.25 + (1 - (1 - k) * (1 - k)) * 0.95,
    })));
}

/** 빛 알갱이가 흩어진다 */
function motes(ctx: FxContext, x: number, y: number, n: number, opts: { up?: boolean; spread?: number } = {}) {
    return new Swarm(ctx, mote(ctx), Array.from({ length: n }, (_, i): Particle => {
        const a = opts.up ? -Math.PI / 2 + rand(-0.6, 0.6) : (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
        const sp = rand(40, opts.spread ?? 110);
        return {
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.2,
            size: rand(4, 8), life: rand(0.55, 0.9), delay: rand(0, 0.08), tint: tint(ctx),
            alpha: (k) => Math.min(1, k * 8) * (1 - k),
        };
    }));
}

const mod: FxModule = {
    effects: {
        "month-flip": (ctx, e) => {
            const dir = e.direction ?? 1;
            const r = ctx.rect;
            const dur = 0.85;
            const from = dir > 0 ? r.x + r.w + 60 : r.x - 60;
            const to = dir > 0 ? r.x - 60 : r.x + r.w + 60;
            const sweep: Particle = {
                x: from, y: r.y + r.h / 2, vx: (to - from) / dur, vy: 0, size: r.h * 1.1, sx: 0.32, rz: dir * 0.12,
                life: dur, tint: ctx.dark ? [0.6, 0.9, 0.86] : [1, 1, 1],
                alpha: (k) => (ctx.dark ? 0.22 : 0.55) * Math.sin(k * Math.PI),
            };
            const specks = Array.from({ length: count(ctx, 10) }, (): Particle => ({
                x: r.x + rand(0.1, 0.9) * r.w, y: r.y + rand(0.1, 0.9) * r.h, vx: -dir * rand(20, 60), vy: rand(-20, -5),
                size: rand(4, 7), life: rand(0.5, 0.8), delay: rand(0.15, 0.45), tint: tint(ctx),
                alpha: (k) => Math.sin(k * Math.PI) * 0.8,
            }));
            return group(new Swarm(ctx, beam(ctx), [sweep]), new Swarm(ctx, mote(ctx), specks));
        },

        page: (ctx) => rings(ctx, ctx.x, ctx.y, 1, 420, { life: 0.9, alpha: 0.35 }),

        complete: (ctx) => group(
            rings(ctx, ctx.x, ctx.y, 2, 64, { gap: 0.12, life: 0.65 }),
            motes(ctx, ctx.x, ctx.y, count(ctx, 6)),
        ),

        add: (ctx) => rings(ctx, ctx.x, ctx.y, 1, 46, { life: 0.55, alpha: 0.7 }),

        "widget-open": (ctx) => group(
            rings(ctx, ctx.x, ctx.y, 2, 80, { gap: 0.16, life: 0.75 }),
            motes(ctx, ctx.x, ctx.y, count(ctx, 8), { up: true, spread: 160 }),
        ),

        theme: (ctx) => group(
            rings(ctx, ctx.W / 2, ctx.H / 2, 3, Math.min(ctx.W, ctx.H) * 0.9, { gap: 0.28, life: 1.3, alpha: 0.4 }),
            motes(ctx, ctx.W / 2, ctx.H / 2, count(ctx, 14), { spread: 260 }),
        ),
    },
};

export default mod;
