/**
 * Maple 의 화면 효과 — 단풍잎이 3D 로 뒤집히며 난다 (판을 x·y 축으로 돌려 팔랑거림을 낸다).
 *   달 넘김: 넘기는 쪽으로 한 줄기 바람(잎 여럿이 가로질러 날아간다)
 *   화면 옮김: 잎 몇 장이 위에서 흔들리며 떨어진다
 *   끝냄: 누른 자리에서 잎 하나가 튀어 올랐다 팔랑 떨어진다 · 넣음: 작은 잎 셋
 *   위젯 띄움: 누른 자리에 잎 회오리가 일어 솟는다 · 테마로 바꿈: 화면 가득 잎이 진다
 */
import { Swarm, count, group, pick, rand, type FxContext, type FxModule, type Particle } from "../engine";

/** 물든 잎 색 — 흰 잎 그림에 곱해서 물들인다 */
const TONES: [number, number, number][] = [
    [0.84, 0.2, 0.12],   // 진홍
    [0.93, 0.42, 0.12],  // 주황
    [0.96, 0.66, 0.18],  // 노랑
    [0.72, 0.28, 0.12],  // 갈빛
    [0.88, 0.3, 0.16],
];

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

/** 한 장의 잎 — 3D 로 뒤집히며(rx·ry) 돈다(rz) */
const flutter = (p: Partial<Particle> & Pick<Particle, "x" | "y" | "vx" | "vy" | "size" | "life">): Particle => ({
    rx: rand(0, 6), ry: rand(0, 6), rz: rand(0, 6),
    vrx: rand(-4, 4), vry: rand(-5, 5), vrz: rand(-2.5, 2.5),
    tint: pick(TONES),
    alpha: (k) => Math.min(1, k * 8) * (k > 0.8 ? (1 - k) / 0.2 : 1),
    ...p,
});

/** 위에서 떨어지는 잎들 — fallFor 초 동안 떨어지다 사라진다 */
function fall(ctx: FxContext, n: number, area: { x: number; w: number }, fallFor: number) {
    return new Swarm(ctx, leaf(ctx), Array.from({ length: n }, () => flutter({
        x: area.x + rand(0, area.w), y: -rand(20, 80), vx: rand(-25, 35), vy: rand(80, 150),
        size: rand(26, 44), life: fallFor * rand(0.85, 1.15), delay: rand(0, 0.6),
        wobble: { amp: rand(20, 50), freq: rand(1.4, 2.6), phase: rand(0, 6) },
    })));
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
