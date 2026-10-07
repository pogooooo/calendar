/**
 * 바다의 화면 효과 — 수면에 번지는 물결 고리, 작은 빛 알갱이, 떠오르는 물방울. 조용하고 짧게.
 *   달 넘김: 넘기는 쪽으로 옅은 빛 한 줄기가 칸 위를 쓸고 지나간다 (물속으로 비쳐 드는 빛)
 *   화면 옮김: 누른 자리에서 큰 물결 고리 하나가 옅게 번진다
 *   끝냄: 가는 물결 고리 둘과 빛 알갱이 몇 개 · 넣음: 작은 고리 하나
 *   챌린지 칸: 물방울 하나가 떨어져 고리가 번지고 물보라 왕관이 튄다 — 이정표면 고리 셋과 떠오르는 물방울·숫자,
 *             목표를 다 채우면 화면만 한 물결과 아래에서 올라오는 물방울, 비쳐 드는 빛까지
 *   보드 옮김: 빛 알갱이가 물살을 타고 끝 쪽으로 흐른다 (되돌리면 몇 알이 뒤로 밀려난다)
 *   프로젝트 완료: 빛 한 줄기가 화면을 쓸고, 누른 자리에서 고리 셋, 아래에서 물방울이 줄지어 오른다
 *   끌어 놓기: 놓은 칸 모양 그대로 물결이 번지고 가운데 물방울이 떨어진다
 *   지우기: 그 자리가 잔 물방울로 풀려 떠오른다 — 조용히
 *   로그인: 위에서 햇살 기둥이 비쳐 들고 가운데서 고리가 번지며 물방울이 오른다 · 기념일: 그 줄에서 산호빛·물빛 방울이 샴페인처럼 오른다
 *   빠른 이동: 창 모양 그대로 옅은 물결이 한 번 번지고, 아래 가장자리에서 빛 알갱이가 오른다
 *   위젯 띄움: 고리와 함께 빛 알갱이가 위로 떠오른다 · 테마로 바꿈: 화면 가운데서 고리 셋이 차례로 번진다
 * 밝은 물에서는 청록, 밤바다에서는 옅은 물빛 — 하얀 것은 밝은 판 위에서 묻힌다.
 */
import {
    Swarm, byArea, count, easeOut, glyph, group, inOut, inRect, itemRect, pick, rand,
    type Effect, type FxContext, type FxModule, type Particle,
} from "../engine";

type RGB = [number, number, number];
const tint = (ctx: FxContext): RGB => (ctx.dark ? [0.55, 0.88, 0.83] : [0.07, 0.43, 0.43]);
/** 산호 — 바다 갈래에서 기념일의 빛 */
const coral = (ctx: FxContext): RGB => (ctx.dark ? [0.93, 0.57, 0.49] : [0.75, 0.38, 0.3]);
/** 물방울 테두리 — 밝은 물에서는 짙은 청록, 밤바다에서는 하얀 물빛 */
const foam = (ctx: FxContext): RGB => (ctx.dark ? [0.82, 0.97, 0.94] : [0.1, 0.48, 0.47]);

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

/** 햇살 기둥 — 위가 밝고 아래로 사라지는 빛 (물속으로 비쳐 드는 빛) */
const shaft = (ctx: FxContext) => ctx.texture("oc2-shaft", (g, s) => {
    const d = g.createLinearGradient(0, 0, s, 0);
    d.addColorStop(0, "rgba(255,255,255,0)");
    d.addColorStop(0.5, "rgba(255,255,255,1)");
    d.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = d;
    g.fillRect(0, 0, s, s);
    g.globalCompositeOperation = "destination-in";
    const v = g.createLinearGradient(0, 0, 0, s);
    v.addColorStop(0, "rgba(0,0,0,0.9)");
    v.addColorStop(0.35, "rgba(0,0,0,0.6)");
    v.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = v;
    g.fillRect(0, 0, s, s);
}, 128);

/** 물방울 — 가운데는 비고 가장자리가 밝으며, 왼쪽 위에 작은 반짝임 */
const bubble = (ctx: FxContext) => ctx.texture("oc2-bubble", (g, s) => {
    const c = s / 2, r = s * 0.42;
    const d = g.createRadialGradient(c, c, r * 0.55, c, c, r);
    d.addColorStop(0, "rgba(255,255,255,0.04)");
    d.addColorStop(0.8, "rgba(255,255,255,0.35)");
    d.addColorStop(1, "rgba(255,255,255,0.95)");
    g.fillStyle = d;
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = s * 0.03;
    g.beginPath(); g.arc(c, c, r * 0.68, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
}, 64);

/** 숫자 — 기울인 세리프(바다 갈래의 큰 라틴 글씨와 같은 손) */
const numeral = (ctx: FxContext, n: number) => glyph(ctx, String(n), "italic 400 {px} 'Instrument Serif', 'Cormorant Garamond', serif");

/** 물결 고리 n 개 — 차례로 번지며 사라진다 */
function rings(ctx: FxContext, x: number, y: number, n: number, size: number, opts: { gap?: number; life?: number; alpha?: number; delay?: number; color?: RGB; sx?: number; sy?: number } = {}) {
    const { gap = 0.14, life = 0.7, alpha = 0.8, delay = 0, color = tint(ctx), sx = 1, sy = 0.96 } = opts;
    return new Swarm(ctx, ring(ctx), Array.from({ length: n }, (_, i): Particle => ({
        x, y, vx: 0, vy: 0, size, sx, sy, life, delay: delay + i * gap, tint: color,
        alpha: (k) => alpha * (1 - k) * (1 - k),
        scale: (k) => 0.25 + (1 - (1 - k) * (1 - k)) * 0.95,
    })));
}

/** 빛 알갱이가 흩어진다 */
function motes(ctx: FxContext, x: number, y: number, n: number, opts: { up?: boolean; spread?: number; delay?: number; color?: RGB } = {}) {
    return new Swarm(ctx, mote(ctx), Array.from({ length: n }, (_, i): Particle => {
        const a = opts.up ? -Math.PI / 2 + rand(-0.6, 0.6) : (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
        const sp = rand(40, opts.spread ?? 110);
        return {
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.2,
            size: rand(4, 8), life: rand(0.55, 0.9), delay: (opts.delay ?? 0) + rand(0, 0.08), tint: opts.color ?? tint(ctx),
            alpha: (k) => Math.min(1, k * 8) * (1 - k),
        };
    }));
}

/** 물방울이 흔들리며 떠오른다 — 위에 가까울수록 옅어진다 */
function bubbles(ctx: FxContext, n: number, from: () => [number, number], opts: { rise?: [number, number]; size?: [number, number]; life?: [number, number]; delay?: number; spread?: number; colors?: RGB[] } = {}) {
    const { rise = [60, 120], size = [6, 14], life = [1.2, 1.8], delay = 0, spread = 0.5, colors = [foam(ctx)] } = opts;
    return new Swarm(ctx, bubble(ctx), Array.from({ length: n }, (): Particle => {
        const [x, y] = from();
        return {
            x, y, vx: rand(-8, 8), vy: -rand(rise[0], rise[1]), size: rand(size[0], size[1]), life: rand(life[0], life[1]),
            delay: delay + rand(0, spread), tint: pick(colors),
            wobble: { amp: rand(3, 8), freq: rand(3, 6), phase: rand(0, 6) },
            alpha: (k) => (ctx.dark ? 0.9 : 0.85) * Math.min(1, k * 6) * (1 - k) ** 0.8,
            scale: (k) => 0.6 + 0.4 * Math.min(1, k * 3),
        };
    }));
}

/** 물방울 하나가 떨어져 닿는 자리 — 고리 둘과 물보라 왕관 (닿는 때는 at 초) */
function splash(ctx: FxContext, x: number, y: number, big: number, at = 0.16) {
    const drop: Particle = {
        x, y: y - 46, vx: 0, vy: 120, ay: 1800, size: 9, sy: 1.5, life: at, tint: foam(ctx), alpha: (k) => Math.min(1, k * 5),
    };
    const nc = count(ctx, 9);
    const crown = Array.from({ length: nc }, (_, i): Particle => {
        const a = -Math.PI / 2 + ((i / Math.max(1, nc - 1)) - 0.5) * 2.2;
        const sp = rand(150, 230) * big;
        return {
            x, y, vx: Math.cos(a) * sp * 0.7, vy: Math.sin(a) * sp, ay: 760, drag: 0.4,
            size: rand(3.5, 6.5), life: rand(0.45, 0.65), delay: at, tint: foam(ctx),
            alpha: (k) => Math.min(1, k * 10) * (1 - k),
        };
    });
    const glow: Particle = { x, y, vx: 0, vy: 0, size: 44 * big, life: 0.5, delay: at, tint: tint(ctx), alpha: (k) => 0.45 * (1 - k), scale: (k) => 0.6 + k * 0.6 };
    return group(
        new Swarm(ctx, mote(ctx), [drop, glow]),
        new Swarm(ctx, mote(ctx), crown),
        rings(ctx, x, y, 2, 72 * big, { gap: 0.13, life: 0.75, delay: at }),
    );
}

/** 숫자가 떠올랐다 사라진다 (위가 비좁으면 아래로) */
function rising(ctx: FxContext, x: number, y: number, n: number, size: number, delay = 0) {
    const up = y > size * 1.3;
    return new Swarm(ctx, numeral(ctx, n), [{
        x, y: up ? y - size * 0.7 : y + size * 0.7, vx: 0, vy: up ? -24 : 24, drag: 1.1, size, life: 1.7, delay, tint: tint(ctx),
        alpha: (k) => inOut(k, 0.14, 0.62), scale: (k) => 0.85 + 0.15 * easeOut(k * 2),
    }]);
}

/** 화면을 가로로 쓸고 지나가는 빛 한 줄기 */
function sweep(ctx: FxContext, dir: 1 | -1, top: number, height: number, dur: number, delay = 0, peak = 1) {
    const from = dir > 0 ? -80 : ctx.W + 80;
    const to = dir > 0 ? ctx.W + 80 : -80;
    return new Swarm(ctx, beam(ctx), [{
        x: from, y: top + height / 2, vx: (to - from) / dur, vy: 0, size: height * 1.1, sx: 0.3, rz: dir * 0.12,
        life: dur, delay, tint: ctx.dark ? [0.6, 0.9, 0.86] : [1, 1, 1],
        alpha: (k) => peak * (ctx.dark ? 0.22 : 0.55) * Math.sin(k * Math.PI),
    }]);
}

/** 위에서 비스듬히 비쳐 드는 햇살 기둥 몇 개 */
function shafts(ctx: FxContext, n: number, delay = 0) {
    return new Swarm(ctx, shaft(ctx), Array.from({ length: n }, (_, i): Particle => ({
        x: ctx.W * (0.22 + (0.56 * (i + 0.5)) / n) + rand(-40, 40), y: ctx.H * 0.32, vx: rand(-10, 10), vy: 0,
        size: ctx.H * 0.8, sx: rand(0.16, 0.26), rz: rand(-0.32, -0.18), life: rand(1.8, 2.3), delay: delay + i * 0.18,
        tint: ctx.dark ? [0.66, 0.95, 0.9] : [1, 1, 0.97],
        alpha: (k) => (ctx.dark ? 0.26 : 0.5) * Math.sin(Math.min(1, k) * Math.PI),
    })));
}

const mod: FxModule = {
    effects: {
        "month-flip": (ctx, e) => {
            const dir = e.direction ?? 1;
            const r = ctx.rect;
            const dur = 0.85;
            const from = dir > 0 ? r.x + r.w + 60 : r.x - 60;
            const to = dir > 0 ? r.x - 60 : r.x + r.w + 60;
            const sweepP: Particle = {
                x: from, y: r.y + r.h / 2, vx: (to - from) / dur, vy: 0, size: r.h * 1.1, sx: 0.32, rz: dir * 0.12,
                life: dur, tint: ctx.dark ? [0.6, 0.9, 0.86] : [1, 1, 1],
                alpha: (k) => (ctx.dark ? 0.22 : 0.55) * Math.sin(k * Math.PI),
            };
            const specks = Array.from({ length: count(ctx, 10) }, (): Particle => ({
                x: r.x + rand(0.1, 0.9) * r.w, y: r.y + rand(0.1, 0.9) * r.h, vx: -dir * rand(20, 60), vy: rand(-20, -5),
                size: rand(4, 7), life: rand(0.5, 0.8), delay: rand(0.15, 0.45), tint: tint(ctx),
                alpha: (k) => Math.sin(k * Math.PI) * 0.8,
            }));
            return group(new Swarm(ctx, beam(ctx), [sweepP]), new Swarm(ctx, mote(ctx), specks));
        },

        page: (ctx) => rings(ctx, ctx.x, ctx.y, 1, 420, { life: 0.9, alpha: 0.35 }),

        complete: (ctx) => group(
            rings(ctx, ctx.x, ctx.y, 2, 64, { gap: 0.12, life: 0.65 }),
            motes(ctx, ctx.x, ctx.y, count(ctx, 6)),
        ),

        add: (ctx) => rings(ctx, ctx.x, ctx.y, 1, 46, { life: 0.55, alpha: 0.7 }),

        // 챌린지 칸 — 물방울이 떨어져 고리와 물보라 왕관. 이정표·목표 달성은 한 단씩 더
        sticker: (ctx, e) => {
            const level = e.level ?? 0;
            const { x, y } = ctx;
            const parts: (Effect | null)[] = [splash(ctx, x, y, level ? 1.25 : 1)];
            if (level >= 1) {
                parts.push(rings(ctx, x, y, 1, 150, { life: 1.1, alpha: 0.5, delay: 0.42 }));
                parts.push(bubbles(ctx, count(ctx, 9), () => [x + rand(-18, 18), y - 6], { rise: [70, 130], size: [6, 12], life: [1.1, 1.5], delay: 0.3, spread: 0.6 }));
                if (e.count) parts.push(rising(ctx, x, y - 40, e.count, ctx.lite ? 84 : 108, 0.35));
            }
            if (level >= 2) {
                parts.push(rings(ctx, x, y, 2, Math.max(ctx.W, ctx.H) * 0.9, { gap: 0.3, life: 1.5, alpha: 0.3, delay: 0.4 }));
                parts.push(bubbles(ctx, count(ctx, 24), () => [rand(0.03, 0.97) * ctx.W, ctx.H + rand(0, 30)], { rise: [130, 230], size: [7, 16], life: [2.0, 2.6], delay: 0.35, spread: 0.9 }));
                parts.push(shafts(ctx, ctx.lite ? 2 : 3, 0.3));
            }
            return group(...parts);
        },

        // 보드에서 옆 칸으로 — 빛 알갱이가 물살을 타고 끝 쪽으로. 되돌리면 몇 알이 뒤로 밀려난다
        advance: (ctx, e) => {
            const dir = e.direction ?? 1;
            const fwd = dir > 0;
            const r = ctx.hasRect ? ctx.rect : { x: ctx.x - 40, y: ctx.y - 14, w: 80, h: 28 };
            const sx = fwd ? r.x + r.w - 6 : r.x + 6, sy = r.y + r.h / 2;
            const dist = (fwd ? 1 : 0.45) * Math.min(260, ctx.W * 0.32) * dir;
            const dur = fwd ? 0.7 : 0.6;
            const n = count(ctx, fwd ? 14 : 6);
            const stream = Array.from({ length: n }, (_, i): Particle => {
                const lag = (i / n) * (fwd ? 0.32 : 0.2);
                const off = rand(-10, 10), ph = rand(0, 6);
                return {
                    x: sx, y: sy + off, vx: 0, vy: 0, size: rand(4, 8), life: dur, delay: lag, tint: tint(ctx),
                    alpha: (k) => (fwd ? 0.95 : 0.5) * Math.sin(Math.min(1, k) * Math.PI),
                    step: (p) => {
                        const f = easeOut(Math.min(1, ((p.age ?? 0) - lag) / dur));
                        p.x = sx + dist * f;
                        p.y = sy + off + Math.sin(f * 7 + ph) * 5;
                    },
                };
            });
            const streak: Particle | null = fwd ? {
                x: sx, y: sy, vx: dist / dur, vy: 0, drag: 2, size: Math.max(40, r.h * 1.4), sx: 1.6, sy: 0.22,
                life: dur, tint: ctx.dark ? [0.6, 0.9, 0.86] : tint(ctx), alpha: (k) => (ctx.dark ? 0.3 : 0.32) * Math.sin(k * Math.PI),
            } : null;
            return group(
                streak ? new Swarm(ctx, beam(ctx), [streak]) : null,
                new Swarm(ctx, mote(ctx), stream),
                fwd ? rings(ctx, sx + dist * 0.98, sy, 1, 56, { life: 0.6, alpha: 0.65, delay: dur * 0.7 }) : rings(ctx, sx, sy, 1, 34, { life: 0.5, alpha: 0.4 }),
            );
        },

        // 프로젝트를 다 끝냄 — 빛이 화면을 쓸고, 누른 자리에서 고리 셋, 아래에서 물방울이 줄지어 오른다
        "project-done": (ctx) => group(
            sweep(ctx, 1, ctx.H * 0.1, ctx.H * 0.8, 1.1, 0, 1),
            splash(ctx, ctx.x, ctx.y, 1.3, 0.1),
            rings(ctx, ctx.x, ctx.y, 3, 240, { gap: 0.2, life: 1.1, alpha: 0.5, delay: 0.2 }),
            bubbles(ctx, count(ctx, 26), () => [rand(0.03, 0.97) * ctx.W, ctx.H + rand(0, 30)], { rise: [140, 240], size: [7, 16], life: [2.0, 2.6], delay: 0.2, spread: 0.9 }),
            motes(ctx, ctx.x, ctx.y, count(ctx, 10), { spread: 200, delay: 0.1 }),
        ),

        // 끌어다 놓은 칸 — 칸 모양 그대로 물결이 번지고 가운데 물방울이 떨어진다
        drop: (ctx) => {
            if (!ctx.hasRect) return splash(ctx, ctx.x, ctx.y, 0.9);
            const r = ctx.rect;
            const m = Math.max(r.w, r.h);
            const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
            return group(
                rings(ctx, cx, cy, 2, m * 1.15, { gap: 0.16, life: 0.85, alpha: 0.6, sx: r.w / m, sy: r.h / m }),
                splash(ctx, cx, cy, 0.75, 0.12),
            );
        },

        // 지우기 — 그 자리가 잔 물방울로 풀려 떠오른다 (왼쪽부터)
        remove: (ctx) => {
            const r = itemRect(ctx);
            const n = byArea(ctx, r, 600, 12, 44);
            return group(
                new Swarm(ctx, bubble(ctx), Array.from({ length: n }, (): Particle => {
                    const [x, y] = inRect(r, 3);
                    return {
                        x, y, vx: rand(-8, 8), vy: -rand(18, 50), size: rand(4, 9), life: rand(0.75, 1.1),
                        delay: ((x - r.x) / Math.max(1, r.w)) * 0.26 + rand(0, 0.08), tint: foam(ctx),
                        wobble: { amp: rand(2, 5), freq: rand(4, 7), phase: rand(0, 6) },
                        alpha: (k) => 0.7 * Math.min(1, k * 6) * (1 - k), scale: (k) => 0.7 + 0.3 * Math.min(1, k * 3),
                    };
                })),
                new Swarm(ctx, mote(ctx), Array.from({ length: count(ctx, Math.round(n * 0.4)) }, (): Particle => {
                    const [x, y] = inRect(r, 3);
                    return {
                        x, y, vx: rand(-6, 6), vy: -rand(10, 26), size: rand(5, 9), life: rand(0.6, 0.9),
                        delay: ((x - r.x) / Math.max(1, r.w)) * 0.26, tint: tint(ctx), alpha: (k) => 0.4 * Math.sin(k * Math.PI),
                    };
                })),
            );
        },

        // 로그인 — 위에서 햇살 기둥이 비쳐 들고, 가운데서 고리가 번지며 물방울이 오른다 (가입은 조금 작게)
        welcome: (ctx, e) => {
            const cx = ctx.W / 2, cy = ctx.H * 0.45;
            return group(
                shafts(ctx, e.level ? (ctx.lite ? 2 : 4) : 2),
                rings(ctx, cx, cy, e.level ? 3 : 2, Math.min(ctx.W, ctx.H) * 0.85, { gap: 0.3, life: 1.4, alpha: 0.38, delay: 0.15 }),
                bubbles(ctx, count(ctx, e.level ? 18 : 10), () => [rand(0.08, 0.92) * ctx.W, ctx.H + rand(0, 20)], { rise: [120, 210], size: [7, 15], life: [2.0, 2.6], delay: 0.2, spread: 1.0 }),
                motes(ctx, cx, cy, count(ctx, 12), { spread: 240, delay: 0.25 }),
            );
        },

        // 오늘이 기념일 — 그 줄에서 산호빛·물빛 방울이 샴페인처럼 오르고, 산호 고리가 번진다
        anniversary: (ctx) => {
            const r = ctx.hasRect ? ctx.rect : { x: ctx.W / 2 - 120, y: ctx.H * 0.4, w: 240, h: 50 };
            const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
            const colors = [coral(ctx), coral(ctx), foam(ctx)];
            return group(
                rings(ctx, cx, cy, 2, Math.max(120, Math.min(360, r.w * 1.2)), { gap: 0.22, life: 1.2, alpha: 0.55, color: coral(ctx), sx: 1, sy: Math.max(0.35, Math.min(1, (r.h + 60) / (r.w + 60))) }),
                bubbles(ctx, count(ctx, 26), () => [r.x + rand(0.08, 0.92) * r.w, r.y + r.h * rand(0.3, 0.9)], { rise: [90, 170], size: [5, 12], life: [1.4, 2.0], delay: 0.1, spread: 1.0, colors }),
                new Swarm(ctx, mote(ctx), Array.from({ length: count(ctx, 14) }, (): Particle => {
                    const [x, y] = inRect({ x: r.x - 20, y: r.y - 24, w: r.w + 40, h: r.h + 48 });
                    return {
                        x, y, vx: 0, vy: -rand(4, 14), size: rand(5, 9), life: rand(0.8, 1.3), delay: rand(0.1, 1.0), tint: pick(colors),
                        alpha: (k) => Math.sin(Math.min(1, k) * Math.PI) * (0.7 + 0.3 * Math.sin(k * 24)),
                    };
                })),
            );
        },

        // 빠른 이동 — 창 모양 그대로 옅은 물결이 한 번, 아래 가장자리에서 빛 알갱이
        palette: (ctx) => {
            if (!ctx.hasRect) return null;
            const r = ctx.rect;
            const m = Math.max(r.w, r.h);
            return group(
                rings(ctx, r.x + r.w / 2, r.y + r.h / 2, 1, m * 1.3, { life: 0.85, alpha: 0.3, sx: r.w / m, sy: r.h / m }),
                new Swarm(ctx, mote(ctx), Array.from({ length: count(ctx, 7) }, (): Particle => ({
                    x: r.x + rand(0.1, 0.9) * r.w, y: r.y + r.h, vx: rand(-6, 6), vy: -rand(14, 30), size: rand(4, 7), life: rand(0.6, 0.9), delay: rand(0.05, 0.3),
                    tint: tint(ctx), alpha: (k) => 0.7 * Math.sin(k * Math.PI),
                }))),
            );
        },

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
