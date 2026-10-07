/**
 * Celestial 의 화면 효과 — 금빛 별.
 *   달 넘김: 넘기는 쪽으로 흐르는 별똥 줄기와, 자리 잡으며 반짝이는 별 몇 개
 *   화면 옮김: 새 화면 위쪽에 별자리 하나가 이어졌다 사라진다
 *   끝냄: 누른 자리에서 네 갈래 별이 터진다 · 넣음: 잔별이 피어오른다
 *   위젯 띄움: 누른 자리에서 오른쪽 위로 별똥별 · 테마로 바꿈: 화면 가득 별이 돋고 별자리 하나
 */
import { Swarm, Trail, count, group, hex, pick, rand, type FxContext, type FxModule, type Particle } from "../engine";

/** 금빛 — 밤하늘(어두운 벌)에서는 밝은 금, 아이보리 종이(밝은 벌)에서는 짙은 금이어야 보인다 */
const GOLD_NIGHT = [[1, 1, 1], hex("#F6DC8C"), hex("#E8C25A"), hex("#FFF1C9")] as [number, number, number][];
const GOLD_DAY = [hex("#B8862B"), hex("#C99A36"), hex("#A87A22"), hex("#D4A944")] as [number, number, number][];
const gold = (ctx: FxContext) => (ctx.dark ? GOLD_NIGHT : GOLD_DAY);

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

const pop = (k: number) => Math.sin(Math.min(1, k) * Math.PI);

/** 별자리 하나 — 점들을 차례로 긋고, 꼭짓점에 별이 맺혔다가 함께 사라진다 */
function constellation(ctx: FxContext, area: { x: number; y: number; w: number; h: number }, delay = 0) {
    const pts: [number, number][] = [];
    const n = 5 + Math.floor(Math.random() * 3);
    let x = area.x + rand(0.05, 0.2) * area.w;
    let y = area.y + rand(0.2, 0.8) * area.h;
    for (let i = 0; i < n; i++) {
        pts.push([x, y]);
        x += rand(0.09, 0.17) * area.w;
        y = Math.max(area.y + 10, Math.min(area.y + area.h - 10, y + rand(-0.35, 0.35) * area.h));
        if (x > area.x + area.w - 10) break;
    }
    const life = 1.5;
    const stars = new Swarm(ctx, star(ctx), pts.map(([px, py], i): Particle => ({
        x: px, y: py, vx: 0, vy: 0, size: rand(13, 21), rz: rand(0, 0.6), vrz: 0.4,
        life: life - i * 0.06, delay: delay + i * 0.08, tint: pick(gold(ctx)),
        alpha: (k) => (k < 0.12 ? k / 0.12 : k > 0.7 ? (1 - k) / 0.3 : 1),
        scale: (k) => (k < 0.12 ? 0.4 + (k / 0.12) * 0.75 : 1.15 - 0.15 * k),
    })));
    const line = new Trail(ctx, pts, ctx.dark ? 0xe2c06a : 0xb8862b, life,
        (k) => Math.min(1, k / 0.5),
        (k) => (k < 0.7 ? 0.5 : 0.5 * (1 - (k - 0.7) / 0.3)), delay + 0.04);
    return group(line, stars);
}

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

        page: (ctx) => {
            const left = ctx.W > 900 ? Math.min(300, ctx.W * 0.2) : 16;
            return constellation(ctx, { x: left, y: 70, w: ctx.W - left - 40, h: Math.min(260, ctx.H * 0.3) });
        },

        complete: (ctx) => {
            const n = count(ctx, 10);
            const burst = Array.from({ length: n }, (_, i): Particle => {
                const a = (i / n) * Math.PI * 2 + rand(-0.25, 0.25);
                const sp = rand(130, 270);
                return {
                    x: ctx.x, y: ctx.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.4,
                    size: rand(10, 18), rz: rand(0, 6), vrz: rand(-5, 5), life: rand(0.6, 0.9), tint: pick(gold(ctx)),
                    alpha: (k) => 1 - k, scale: (k) => 1 - k * 0.6,
                };
            });
            const flash: Particle = { x: ctx.x, y: ctx.y, vx: 0, vy: 0, size: 48, rz: 0, vrz: 1.6, life: 0.45, alpha: (k) => 1 - k, scale: (k) => 0.5 + k * 0.9 };
            return group(new Swarm(ctx, star(ctx), burst), new Swarm(ctx, star(ctx), [flash]));
        },

        add: (ctx) => new Swarm(ctx, star(ctx), Array.from({ length: count(ctx, 9) }, (): Particle => ({
            x: ctx.x + rand(-14, 14), y: ctx.y + rand(-6, 6), vx: rand(-30, 30), vy: -rand(60, 140), drag: 1.2,
            size: rand(8, 14), rz: rand(0, 3), vrz: rand(-3, 3), life: rand(0.6, 0.95), delay: rand(0, 0.12), tint: pick(gold(ctx)),
            alpha: pop,
        }))),

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
