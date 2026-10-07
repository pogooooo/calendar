/**
 * Celestial 의 화면 효과 — 금빛 별과 가는 금선(연감의 선 그림).
 *   달 넘김: 넘기는 쪽으로 흐르는 별똥 줄기와, 자리 잡으며 반짝이는 별 몇 개
 *   화면 옮김: 새 화면 위쪽에 별자리 하나가 이어졌다 사라진다
 *   끝냄: 누른 자리에서 네 갈래 별이 터진다 · 넣음: 잔별이 피어오른다
 *   챌린지 칸: 별 하나가 박히고 금선 고리가 둘러 그어지며 방위로 불꽃 — 이정표면 눈금 고리·별자리 관·로마 숫자,
 *             목표를 다 채우면 혼천의 궤도와 별비까지
 *   보드 옮김: 혜성이 다음 칸 쪽으로 (되돌리면 흐린 혜성이 짧게 뒤로)
 *   프로젝트 완료: 위쪽을 가로지르는 큰 별자리, 누른 자리에 혼천의 궤도, 화면에 별비
 *   끌어 놓기: 놓은 칸의 테두리를 금선이 한 바퀴 긋고 네 귀퉁이가 반짝인다
 *   지우기: 그 자리가 옅은 금가루로 흩어져 오른다 — 축하가 아니라 조용히
 *   로그인: 화면 가운데 작은 태양계(궤도와 도는 별) · 기념일: 그 줄을 별 관이 두르고 하늘에 별똥별
 *   빠른 이동: 창 위 가장자리에 금선이 가운데서 양쪽으로 그어지고 네 귀퉁이에 별이 돋는다
 *   위젯 띄움: 누른 자리에서 오른쪽 위로 별똥별 · 테마로 바꿈: 화면 가득 별이 돋고 별자리 하나
 */
import {
    Swarm, Trail, arcPoints, byArea, count, easeOut, glyph, group, hex, inOut, inRect, itemRect, pick, rand, rectPoints, roman,
    type Effect, type FxContext, type FxModule, type Particle,
} from "../engine";
import type { FxRect } from "@/lib/fx";

/** 금빛 — 밤하늘(어두운 벌)에서는 밝은 금, 아이보리 종이(밝은 벌)에서는 짙은 금이어야 보인다 */
const GOLD_NIGHT = [[1, 1, 1], hex("#F6DC8C"), hex("#E8C25A"), hex("#FFF1C9")] as [number, number, number][];
const GOLD_DAY = [hex("#B8862B"), hex("#C99A36"), hex("#A87A22"), hex("#D4A944")] as [number, number, number][];
const gold = (ctx: FxContext) => (ctx.dark ? GOLD_NIGHT : GOLD_DAY);
/** 금선(별자리·궤도·테두리)의 색 — 밝은 벌은 화면의 금선보다 한 단만 짙게 (갈색으로 무거워지지 않게) */
const line = (ctx: FxContext) => (ctx.dark ? 0xe2c06a : 0xc39a3e);
/** 박히는 별의 색 — 하나만 또렷하게 */
const sealTint = (ctx: FxContext): [number, number, number] => (ctx.dark ? [1, 0.96, 0.84] : hex("#BE8C2A"));

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

/** 가는 고리 — 옅은 번짐 한 겹 위에 또렷한 선 (흰빛으로 그려 금빛을 곱한다) */
const ring = (ctx: FxContext) => ctx.texture("cel-ring", (g, s) => {
    const c = s / 2, r = s * 0.44;
    g.strokeStyle = "rgba(255,255,255,0.2)";
    g.lineWidth = s * 0.04;
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(255,255,255,1)";
    g.lineWidth = s * 0.01;
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
}, 256);

/** 눈금 고리 — 아스트롤라베의 테두리 (마흔여덟 눈금, 넷째마다 길게, 동서남북에 마름모) */
const dial = (ctx: FxContext) => ctx.texture("cel-dial", (g, s) => {
    const c = s / 2, r = s * 0.42;
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = s * 0.005;
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
    g.lineWidth = s * 0.0035;
    g.beginPath(); g.arc(c, c, r * 0.86, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const long = i % 4 === 0;
        const r0 = r * (long ? 0.86 : 0.93);
        g.lineWidth = s * (long ? 0.005 : 0.003);
        g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r); g.stroke();
    }
    g.fillStyle = "rgba(255,255,255,1)";
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const x = c + Math.cos(a) * r * 1.08, y = c + Math.sin(a) * r * 1.08, d = s * 0.016;
        g.beginPath(); g.moveTo(x, y - d); g.lineTo(x + d, y); g.lineTo(x, y + d); g.lineTo(x - d, y); g.closePath(); g.fill();
    }
}, 512);

/** 로마 숫자 — 연감의 비문 글씨(Cinzel) */
const numeral = (ctx: FxContext, n: number) => glyph(ctx, roman(n), "600 {px} Cinzel, 'Cormorant Garamond', serif");

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

/** 금빛 고리가 from 에서 to 크기로 번지며 사라진다 (spin 이면 돌며) */
function halo(ctx: FxContext, x: number, y: number, from: number, to: number, life: number, delay = 0, peak = 0.9, tex = ring(ctx), spin = 0) {
    return new Swarm(ctx, tex, [{
        x, y, vx: 0, vy: 0, size: to, life, delay, rz: rand(0, 6), vrz: spin, tint: pick(gold(ctx)),
        alpha: (k) => peak * Math.min(1, k * 8) * (1 - k) ** 1.2,
        scale: (k) => from / to + (1 - from / to) * easeOut(k),
    }]);
}

/** 방위(동서남북과 그 사이)로 뻗는 가는 불꽃 */
function compass(ctx: FxContext, x: number, y: number, n: number, speed: number, life: number, delay = 0) {
    return new Swarm(ctx, dot(ctx), Array.from({ length: n }, (_, i): Particle => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const long = i % 2 === 0;
        const sp = speed * (long ? 1 : 0.6);
        return {
            x: x + Math.cos(a) * 8, y: y + Math.sin(a) * 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3.6,
            size: long ? 8 : 6, sx: 3.4, sy: 0.5, rz: -a, life, delay, tint: pick(gold(ctx)),
            alpha: (k) => Math.min(1, k * 10) * (1 - k),
        };
    }));
}

/** 박히는 별 — 작게 시작해 한 번 부풀었다 자리 잡고 사라진다 */
function seal(ctx: FxContext, x: number, y: number, size: number, life: number, delay = 0) {
    return new Swarm(ctx, star(ctx), [{
        x, y, vx: 0, vy: 0, size, life, delay, rz: 0.5, vrz: -0.6, tint: sealTint(ctx),
        alpha: (k) => inOut(k, 0.06, 0.55),
        scale: (k) => (k < 0.16 ? 0.3 + (k / 0.16) * 1.05 : 1.35 - Math.min(1, (k - 0.16) / 0.2) * 0.35),
    }]);
}

/** 원을 따라 금선을 한 바퀴 긋는다 */
function circle(ctx: FxContext, x: number, y: number, r: number, life: number, delay = 0, peak = 0.75) {
    return new Trail(ctx, arcPoints(x, y, r, r, 56, -Math.PI / 2), line(ctx), life,
        (k) => Math.min(1, k / 0.38), (k) => peak * inOut(k, 0.02, 0.55), delay);
}

/** 작은 태양계 — 같은 기울기의 궤도 몇 개를 안쪽부터 긋고, 궤도마다 별 하나가 돈다 */
function orbits(ctx: FxContext, cx: number, cy: number, radii: number[], squash: number, tilt: number, life: number, delay = 0) {
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    return group(...radii.map((r, i) => {
        const d = delay + i * 0.14;
        const orbit = new Trail(ctx, arcPoints(cx, cy, r, r * squash, 96, Math.PI * (0.5 + i * 0.35), Math.PI * 2, tilt), line(ctx), life,
            (k) => Math.min(1, k / 0.42), (k) => (ctx.dark ? 0.5 : 0.6) * inOut(k, 0.03, 0.6), d);
        const a0 = rand(0, Math.PI * 2), w = (i % 2 ? -1 : 1) * rand(1.4, 2.1);
        const planet = new Swarm(ctx, star(ctx), [{
            x: cx, y: cy, vx: 0, vy: 0, size: rand(12, 17), life: life - 0.15, delay: d + 0.25, tint: pick(gold(ctx)),
            alpha: (k) => inOut(k, 0.12, 0.6), rz: 0, vrz: 1.5,
            step: (p) => {
                const a = a0 + w * (p.age ?? 0);
                const ex = Math.cos(a) * r, ey = Math.sin(a) * r * squash;
                p.x = cx + ex * ct - ey * st;
                p.y = cy + ex * st + ey * ct;
            },
        }]);
        return group(orbit, planet);
    }));
}

/** 별비 — 화면 위쪽에서 별이 반짝이며 천천히 내려온다 */
function starfall(ctx: FxContext, n: number, life: number, delay = 0) {
    return new Swarm(ctx, star(ctx), Array.from({ length: n }, (): Particle => ({
        x: rand(0.04, 0.96) * ctx.W, y: rand(-0.02, 0.4) * ctx.H, vx: rand(-6, 6), vy: rand(26, 64),
        size: rand(7, 15), rz: rand(0, 1), vrz: rand(-1, 1), life: rand(life * 0.65, life), delay: delay + rand(0, 0.7), tint: pick(gold(ctx)),
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

/** 상자의 테두리를 금선이 한 바퀴 긋고, 다 그을 즈음 네 귀퉁이가 반짝인다 */
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

/** 숫자가 떠올랐다 사라진다 (위가 비좁으면 아래로) */
function rising(ctx: FxContext, x: number, y: number, n: number, size: number, delay = 0) {
    const up = y > size * 1.2;
    return new Swarm(ctx, numeral(ctx, n), [{
        x, y: up ? y - size * 0.62 : y + size * 0.62, vx: 0, vy: up ? -26 : 26, drag: 1.2, size, life: 1.6, delay, tint: ctx.dark ? hex("#F3D98E") : hex("#B8862B"),
        alpha: (k) => inOut(k, 0.14, 0.62), scale: (k) => 0.82 + 0.18 * easeOut(k * 2),
    }]);
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

        page: (ctx) => {
            const left = contentLeft(ctx);
            return constellation(ctx, { x: left, y: 70, w: ctx.W - left - 40, h: Math.min(260, ctx.H * 0.3) });
        },

        complete: (ctx) => burst(ctx, ctx.x, ctx.y, count(ctx, 10), 270),

        add: (ctx) => new Swarm(ctx, star(ctx), Array.from({ length: count(ctx, 9) }, (): Particle => ({
            x: ctx.x + rand(-14, 14), y: ctx.y + rand(-6, 6), vx: rand(-30, 30), vy: -rand(60, 140), drag: 1.2,
            size: rand(8, 14), rz: rand(0, 3), vrz: rand(-3, 3), life: rand(0.6, 0.95), delay: rand(0, 0.12), tint: pick(gold(ctx)),
            alpha: pop,
        }))),

        // 챌린지 칸 — 별이 박히고 금선 고리가 둘러 그어진다. 이정표·목표 달성은 한 단씩 더
        sticker: (ctx, e) => {
            const level = e.level ?? 0;
            const { x, y } = ctx;
            const parts: (Effect | null)[] = [
                seal(ctx, x, y, level ? 46 : 36, level ? 1.15 : 0.9),
                circle(ctx, x, y, level ? 27 : 22, 0.95),
                halo(ctx, x, y, 10, level ? 92 : 66, 0.8, 0.05),
                compass(ctx, x, y, 8, level ? 280 : 210, 0.55, 0.04),
            ];
            if (level >= 1) {
                // 눈금 고리가 돌며 열리고, 위로 작은 별자리 관이 이어진다
                parts.push(halo(ctx, x, y, 60, level >= 2 ? 190 : 150, 1.5, 0.08, ctx.dark ? 0.75 : 0.9, dial(ctx), 0.5));
                const crown = Array.from({ length: 5 }, (_, i): [number, number] => {
                    const a = -Math.PI * (0.86 - 0.72 * (i / 4));
                    const rr = (level >= 2 ? 100 : 82) * rand(0.9, 1.1);
                    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8];
                });
                parts.push(stars(ctx, crown, 0.25, 1.35, 0.8));
                if (e.count) parts.push(rising(ctx, x, y - (level >= 2 ? 84 : 70), e.count, ctx.lite ? 70 : 86, 0.3));
            }
            if (level >= 2) {
                parts.push(orbits(ctx, x, y, [96, 150, 206].map((r) => r * (ctx.lite ? 0.7 : 1)), 0.34, -0.22, 2.3, 0.15));
                parts.push(starfall(ctx, count(ctx, 28), 2.1, 0.2));
            }
            return group(...parts);
        },

        // 보드에서 옆 칸으로 — 혜성이 끝 쪽으로 날아가 내려앉는다. 되돌리면 흐린 혜성이 짧게 뒤로
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
                fwd ? halo(ctx, ex, ey, 6, 48, 0.55, dur * 0.85, 0.85) : null,
            );
        },

        // 프로젝트를 다 끝냄 — 위쪽을 가로지르는 큰 별자리, 누른 자리의 혼천의, 화면에 별비
        "project-done": (ctx) => {
            const left = contentLeft(ctx);
            const top = Math.max(60, ctx.H * 0.1);
            return group(
                burst(ctx, ctx.x, ctx.y, count(ctx, 16), 340, 1.15),
                halo(ctx, ctx.x, ctx.y, 20, 170, 1.3, 0.05, 0.75, dial(ctx), 0.6),
                orbits(ctx, ctx.x, ctx.y, [74, 124].map((r) => r * (ctx.lite ? 0.75 : 1)), 0.34, -0.22, 2.0, 0.1),
                constellation(ctx, { x: left, y: top, w: ctx.W - left - 40, h: Math.min(220, ctx.H * 0.24) }, 0.2, 2.1, ctx.lite ? 6 : 9),
                starfall(ctx, count(ctx, 26), 2.2, 0.3),
            );
        },

        // 끌어다 놓은 칸 — 테두리를 금선이 한 바퀴, 칸 위쪽에 작은 별이 박힌다
        drop: (ctx) => {
            if (!ctx.hasRect) return group(seal(ctx, ctx.x, ctx.y, 28, 0.8), halo(ctx, ctx.x, ctx.y, 8, 52, 0.6));
            const r = ctx.rect;
            const cx = r.x + r.w / 2, cy = r.y + Math.min(r.h / 2, 30);
            return group(
                frame(ctx, r, 1.0),
                seal(ctx, cx, cy, 26, 0.75, 0.05),
                halo(ctx, cx, cy, 8, Math.min(70, r.w * 0.7), 0.6, 0.05, 0.7),
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

        // 로그인 — 본문 가운데에 작은 태양계: 해가 빛나고 궤도가 그어지며 별이 돈다 (가입은 궤도 둘)
        welcome: (ctx, e) => {
            const left = contentLeft(ctx);
            const cx = left + (ctx.W - left) / 2, cy = ctx.H * 0.42;
            const R = Math.min(ctx.W - left, ctx.H) * 0.5;
            const radii = (e.level ? [0.3, 0.52, 0.76] : [0.36, 0.62]).map((f) => f * R);
            const sun: Particle = {
                x: cx, y: cy, vx: 0, vy: 0, size: 46, rz: 0, vrz: 0.5, life: 2.2, tint: sealTint(ctx),
                alpha: (k) => inOut(k, 0.1, 0.6), scale: (k) => 0.5 + easeOut(k * 3) * 0.6,
            };
            // 해 둘레의 옅은 빛무리
            const corona: Particle = {
                x: cx, y: cy, vx: 0, vy: 0, size: 150, life: 2.2, tint: pick(gold(ctx)),
                alpha: (k) => (ctx.dark ? 0.32 : 0.4) * inOut(k, 0.15, 0.55), scale: (k) => 0.6 + easeOut(k * 2) * 0.4,
            };
            const twinkles = Array.from({ length: count(ctx, 16) }, (): Particle => ({
                x: rand(left, ctx.W), y: rand(0.04, 0.9) * ctx.H, vx: 0, vy: 0, size: rand(7, 15), rz: rand(0, 1), vrz: rand(-1, 1),
                life: rand(1.0, 1.7), delay: rand(0.2, 1.0), tint: pick(gold(ctx)), alpha: twinkle, scale: (k) => 0.4 + pop(k) * 0.7,
            }));
            return group(
                new Swarm(ctx, dot(ctx), [corona]),
                new Swarm(ctx, star(ctx), [sun]),
                halo(ctx, cx, cy, 20, radii[0] * 1.3, 1.1, 0.1, 0.7),
                orbits(ctx, cx, cy, radii, 0.32, -0.16, 2.4, 0.15),
                new Swarm(ctx, star(ctx), twinkles),
            );
        },

        // 오늘이 기념일 — 그 줄을 별 관이 두르고 테두리가 빛나며, 하늘에는 별똥별이 지난다
        anniversary: (ctx) => {
            const r = ctx.hasRect ? ctx.rect : { x: ctx.W / 2 - 120, y: ctx.H * 0.3, w: 240, h: 60 };
            const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
            const n = count(ctx, 14);
            const rx = r.w / 2 + 22, ry = r.h / 2 + 18;
            const wreath = Array.from({ length: n }, (_, i): Particle => {
                const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
                return {
                    x: cx + Math.cos(a) * rx * 0.7, y: cy + Math.sin(a) * ry * 0.7, vx: Math.cos(a) * rx * 0.55, vy: Math.sin(a) * ry * 0.55, drag: 2.2,
                    size: rand(10, 16), rz: rand(0, 1), vrz: rand(-1.5, 1.5), life: 1.7, delay: 0.1 + (i / n) * 0.5, tint: pick(gold(ctx)),
                    alpha: twinkle, scale: (k) => 0.4 + pop(k) * 0.75,
                };
            });
            // 줄 아래 금선 장식 — 가운데에서 양쪽 끝으로 그어 나간다 (연감의 머리장식처럼)
            const under = r.y + r.h + 3;
            const flourish = (to: number) => new Trail(ctx, [[cx, under], [to, under]], line(ctx), 1.6,
                (k) => easeOut(k / 0.4), (k) => 0.8 * inOut(k, 0.03, 0.6), 0.15);
            return group(
                flourish(r.x + 4), flourish(r.x + r.w - 4),
                new Swarm(ctx, star(ctx), [[r.x + 4, under], [r.x + r.w - 4, under]].map(([px, py]): Particle => ({
                    x: px, y: py, vx: 0, vy: 0, size: 13, rz: 0, vrz: 1.4, life: 1.0, delay: 0.62, tint: pick(gold(ctx)), alpha: pop, scale: (k) => 0.3 + pop(k) * 0.9,
                }))),
                new Swarm(ctx, star(ctx), wreath),
                seal(ctx, cx, under, 24, 1.2, 0.1),
                meteors(ctx, ctx.lite ? 2 : 4, 0.25),
                starfall(ctx, count(ctx, 12), 1.8, 0.4),
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
