import { Swarm, count, group, hex, rand, type FxContext, type FxModule, type Particle } from '../engine';

type RGB = [number, number, number];

/** Read at the moment of the gesture, so changing RGB also changes already-loaded effects. */
function hues(ctx: FxContext): { stone: RGB; gold: RGB; light: RGB } {
    const root = getComputedStyle(document.documentElement);
    const selected = root.getPropertyValue('--gem-stone').trim();
    const stone = hex(/^#[0-9a-f]{6}$/i.test(selected) ? selected : '#9268c4');
    const light = stone.map(c => c * .3 + (ctx.dark ? .7 : .45)) as RGB;
    return { stone, gold: ctx.dark ? hex('#ead3a7') : hex('#ad844b'), light };
}

const scintillation = (ctx: FxContext) => ctx.texture('gem-scintillation', (g, s) => {
    const c = s / 2;
    const halo = g.createRadialGradient(c, c, 0, c, c, c);
    halo.addColorStop(0, 'rgba(255,255,255,.8)'); halo.addColorStop(.16, 'rgba(255,255,255,.28)'); halo.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = halo; g.fillRect(0, 0, s, s);
    g.fillStyle = '#fff'; g.beginPath();
    g.moveTo(c, s * .12); g.bezierCurveTo(c + 1.8, c - 1.8, c + 1.8, c - 1.8, s * .88, c);
    g.bezierCurveTo(c + 1.8, c + 1.8, c + 1.8, c + 1.8, c, s * .88);
    g.bezierCurveTo(c - 1.8, c + 1.8, c - 1.8, c + 1.8, s * .12, c);
    g.bezierCurveTo(c - 1.8, c - 1.8, c - 1.8, c - 1.8, c, s * .12); g.fill();
}, 96);

const facet = (ctx: FxContext) => ctx.texture('gem-cut-facet', (g, s) => {
    const p = [[.5, .12], [.75, .3], [.8, .62], [.5, .87], [.2, .62], [.25, .3]];
    g.beginPath(); p.forEach(([x, y], i) => { if (i) g.lineTo(x * s, y * s); else g.moveTo(x * s, y * s); }); g.closePath();
    g.fillStyle = '#b5b5b5'; g.fill();
    g.beginPath(); g.moveTo(.5 * s, .12 * s); g.lineTo(.5 * s, .53 * s); g.lineTo(.25 * s, .3 * s); g.closePath(); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.moveTo(.5 * s, .53 * s); g.lineTo(.8 * s, .62 * s); g.lineTo(.5 * s, .87 * s); g.closePath(); g.fillStyle = '#777'; g.fill();
    g.beginPath(); g.moveTo(.5 * s, .12 * s); g.lineTo(.75 * s, .3 * s); g.lineTo(.5 * s, .53 * s); g.closePath(); g.fillStyle = '#e9e9e9'; g.fill();
}, 64);

const radiance = (ctx: FxContext) => ctx.texture('gem-refracted-radiance', (g, s) => {
    const gradient = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,.75)'); gradient.addColorStop(.15, 'rgba(255,255,255,.3)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gradient; g.fillRect(0, 0, s, s);
}, 64);

function polish(ctx: FxContext, strength = 1, erase = false) {
    const colors = hues(ctx);
    const x = ctx.x, y = ctx.y;
    const glints = Array.from({ length: count(ctx, 5 * strength) }, (_, i): Particle => {
        const a = i * 2.39996 + .3, radius = 9 + i * 2;
        return {
            x: x + Math.cos(a) * radius, y: y + Math.sin(a) * radius * .6,
            vx: Math.cos(a) * (erase ? 4 : 13), vy: -5 + Math.sin(a) * 9,
            drag: 2.8, size: rand(8, 14), life: ctx.gentle ? .48 : rand(.65, 1.1),
            delay: i * .035, tint: i % 3 ? colors.gold : colors.light,
            rz: .2, vrz: .08, alpha: k => Math.sin(Math.PI * k) * (erase ? .3 : .74), scale: k => .55 + Math.sin(k * Math.PI) * .55,
        };
    });
    const dust = Array.from({ length: count(ctx, 4 * strength) }, (): Particle => ({
        x: x + rand(-10, 10), y: y + rand(-6, 6), vx: rand(-9, 9), vy: erase ? rand(-17, -7) : rand(-8, 4),
        size: rand(3, 5), life: .8, delay: rand(0, .1), tint: colors.stone, vrz: .2, rz: rand(0, 3),
        alpha: k => Math.sin(k * Math.PI) * .5, scale: k => 1 - k * .3,
    }));
    return group(new Swarm(ctx, scintillation(ctx), glints, { glow: ctx.dark }), new Swarm(ctx, facet(ctx), dust));
}

function setting(ctx: FxContext, direction = 1) {
    const colors = hues(ctx), r = ctx.rect;
    if (!ctx.hasRect) return polish(ctx);
    const beam: Particle = {
        x: direction > 0 ? r.x : r.x + r.w, y: r.y + Math.min(26, r.h * .12),
        vx: direction * r.w / .7, vy: 0, size: 27, sx: .55, sy: 2.4,
        life: .7, tint: colors.light, rz: -.32 * direction,
        alpha: k => Math.sin(k * Math.PI) * (ctx.dark ? .55 : .28),
    };
    const total = count(ctx, 10);
    const particles = Array.from({ length: total }, (_, i): Particle => {
        const t = (i + .5) / total;
        return {
            x: r.x + r.w * (direction > 0 ? t : 1 - t), y: r.y + 3 + (i % 3) * 5,
            vx: direction * 5, vy: -2, size: i % 2 ? 8 : 12, life: .62, delay: t * .48,
            tint: i % 3 ? colors.gold : colors.stone, alpha: k => Math.sin(k * Math.PI) * .6, scale: k => .5 + Math.sin(k * Math.PI) * .5,
        };
    });
    return group(new Swarm(ctx, radiance(ctx), [beam], { glow: ctx.dark }), new Swarm(ctx, scintillation(ctx), particles, { glow: ctx.dark }));
}

function greeting(ctx: FxContext) {
    const colors = hues(ctx);
    const particles = Array.from({ length: count(ctx, 22) }, (_, i): Particle => {
        const right = i % 2 === 0;
        return {
            x: right ? ctx.W - rand(15, 70) : rand(15, 70), y: rand(ctx.H * .15, ctx.H * .85),
            vx: right ? -3 : 3, vy: -5, size: rand(9, 17), life: rand(.75, 1.35), delay: rand(0, .5),
            tint: i % 3 ? colors.gold : colors.light, rz: .2,
            alpha: k => Math.sin(k * Math.PI) * .75, scale: k => .3 + Math.sin(k * Math.PI) * .8,
        };
    });
    return new Swarm(ctx, scintillation(ctx), particles, { glow: ctx.dark });
}

export const gemFx: FxModule = { effects: {
    'calendar-pick': ctx => polish(ctx, .7),
    'month-flip': (ctx, e) => setting(ctx, e.direction ?? 1),
    page: () => null, // GemPageTransition already supplies a short refracted light pass.
    complete: ctx => polish(ctx, 1.4),
    add: ctx => polish(ctx, .8),
    remove: ctx => polish(ctx, .65, true),
    drop: ctx => setting(ctx),
    advance: (ctx, e) => setting(ctx, e.direction ?? 1),
    sticker: (ctx, e) => polish(ctx, e.level ? 1.8 : 1.1),
    'project-done': ctx => group(polish(ctx, 2), greeting(ctx)),
    anniversary: ctx => polish(ctx, 1.6),
    palette: ctx => setting(ctx),
    'widget-open': ctx => polish(ctx),
    welcome: ctx => greeting(ctx),
    theme: ctx => greeting(ctx),
} };

export default gemFx;
