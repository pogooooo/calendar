/**
 * 화면 효과의 엔진 — 투명 캔버스 하나에 three.js 로 잠깐씩 그린다.
 *
 * 평소에는 아무것도 돌지 않는다. 효과가 들어오면 그 효과가 끝날 때까지만 rAF 를 돌리고,
 * 다 끝나면 캔버스를 비우고 멈춘다. 갈래(celestial·maple·ocean)의 효과 모듈은 여기 도구
 * (Swarm: 같은 그림을 여럿 띄우는 입자 무리, Trail: 점을 이어 긋는 선)만 써서 그린다.
 * three 는 FxStage 가 처음 효과가 필요할 때 동적으로 받아 넘겨준다 — 이 파일은 타입만 가져온다.
 *
 * 좌표는 화면 CSS px 이고 y 는 아래로 자란다(브라우저와 같게). 카메라가 뒤집어 준다.
 *
 * 폰(lite)은 가볍게: 입자 수를 줄이고(count), 계단 현상 다듬기(MSAA)를 끄고, 초당 60장까지만 그린다.
 * 쉬는 동안에는 캔버스를 숨겨(data-on 없음) 화면을 굴릴 때 합성할 겹이 하나 줄어든다.
 */
import type * as THREE_NS from "three";
import type { FxEvent, FxKind, FxRect } from "@/lib/fx";

type T = typeof THREE_NS;

export interface Effect {
    /** dt·t 는 초. false 를 돌려주면 끝난 것 — 엔진이 dispose 하고 뺀다 */
    update(dt: number): boolean;
    dispose(): void;
}

export interface FxContext {
    THREE: T;
    scene: THREE_NS.Scene;
    /** 화면 크기(CSS px) */
    W: number;
    H: number;
    /** 움직임 '잔잔하게' — 갈래 모듈은 입자 수를 줄이고 짧게 */
    gentle: boolean;
    /** 폰처럼 가벼운 기기 — count() 가 알아서 줄인다. 화면 가득한 효과는 갈래 모듈이 더 줄여도 된다 */
    lite: boolean;
    /** 어두운 벌인가 — 밝은 바탕에서는 하얀 입자가 묻히니 색을 짙게 */
    dark: boolean;
    /** 효과의 중심과 영역 (부른 쪽이 안 줬으면 엔진이 채운다: 누른 자리·화면 전체) */
    x: number;
    y: number;
    rect: FxRect;
    /** rect 를 부른 쪽(또는 무대가 찾은 항목)이 준 것인가 — 아니면 화면 전체 */
    hasRect: boolean;
    /** 캔버스 2D 로 그린 그림을 텍스처로 (key 로 한 번만 만든다) */
    texture(key: string, draw: (g: CanvasRenderingContext2D, size: number) => void, size?: number): THREE_NS.Texture;
}

export type EffectFactory = (ctx: FxContext, e: FxEvent) => Effect | null;
export interface FxModule { effects: Partial<Record<FxKind, EffectFactory>> }

/* ── 입자 무리 ──────────────────────────────────────────────────────── */

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    /** 가속(px/s²) — 중력은 ay 양수 */
    ax?: number;
    ay?: number;
    /** 초당 속도가 줄어드는 비율 (0 이면 그대로) */
    drag?: number;
    /** 한 변 크기(px) */
    size: number;
    /** 가로·세로 늘이기 (꼬리 긴 별똥별 등) */
    sx?: number;
    sy?: number;
    rx?: number;
    ry?: number;
    rz?: number;
    vrx?: number;
    vry?: number;
    vrz?: number;
    /** 사는 시간·나이(초), 늦게 나타나기 */
    life: number;
    age?: number;
    delay?: number;
    tint?: [number, number, number];
    /** 나이 비율 k(0~1) → 투명도·크기 */
    alpha?: (k: number) => number;
    scale?: (k: number) => number;
    /** 좌우로 흔들리기 */
    wobble?: { amp: number; freq: number; phase?: number };
    /** 그 밖의 움직임이 필요하면 직접 */
    step?: (p: Particle, dt: number) => void;
}

const fadeInOut = (k: number) => Math.min(1, k * 6) * (1 - Math.max(0, (k - 0.6) / 0.4));

const VERT = /* glsl */ `
attribute float aAlpha;
attribute vec3 aTint;
varying vec2 vUv;
varying float vAlpha;
varying vec3 vTint;
void main() {
    vUv = uv;
    vAlpha = aAlpha;
    vTint = aTint;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}
`;
const FRAG = /* glsl */ `
uniform sampler2D uMap;
varying vec2 vUv;
varying float vAlpha;
varying vec3 vTint;
void main() {
    vec4 c = texture2D(uMap, vUv);
    gl_FragColor = vec4(c.rgb * vTint, c.a * vAlpha);
}
`;

/** 같은 그림을 여럿 띄운다 (InstancedMesh 한 번 그리기). glow 면 빛을 더해(가산) 어두운 바탕에서 번지게 */
export class Swarm implements Effect {
    private mesh: THREE_NS.InstancedMesh;
    private alphaAttr: THREE_NS.InstancedBufferAttribute;
    private tintAttr: THREE_NS.InstancedBufferAttribute;
    private m4: THREE_NS.Matrix4;
    private q: THREE_NS.Quaternion;
    private e: THREE_NS.Euler;
    private v: THREE_NS.Vector3;
    private s: THREE_NS.Vector3;

    constructor(private ctx: FxContext, map: THREE_NS.Texture, public particles: Particle[], opts: { glow?: boolean } = {}) {
        const { THREE } = ctx;
        const n = particles.length;
        const geo = new THREE.PlaneGeometry(1, 1);
        this.alphaAttr = new THREE.InstancedBufferAttribute(new Float32Array(n), 1);
        this.tintAttr = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3);
        geo.setAttribute("aAlpha", this.alphaAttr);
        geo.setAttribute("aTint", this.tintAttr);
        const mat = new THREE.ShaderMaterial({
            vertexShader: VERT,
            fragmentShader: FRAG,
            uniforms: { uMap: { value: map } },
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blending: opts.glow ? THREE.AdditiveBlending : THREE.NormalBlending,
        });
        this.mesh = new THREE.InstancedMesh(geo, mat, n);
        this.mesh.frustumCulled = false;
        this.m4 = new THREE.Matrix4();
        this.q = new THREE.Quaternion();
        this.e = new THREE.Euler();
        this.v = new THREE.Vector3();
        this.s = new THREE.Vector3();
        particles.forEach((p, i) => {
            p.age = p.age ?? 0;
            const c = p.tint ?? [1, 1, 1];
            this.tintAttr.setXYZ(i, c[0], c[1], c[2]);
        });
        ctx.scene.add(this.mesh);
        this.update(0);
    }

    update(dt: number): boolean {
        const { H } = this.ctx;
        let alive = false;
        this.particles.forEach((p, i) => {
            p.age = (p.age ?? 0) + dt;
            const t = p.age - (p.delay ?? 0);
            if (t < 0) { alive = true; this.hide(i); return; }
            if (t > p.life) { this.hide(i); return; }
            alive = true;
            if (dt > 0) {
                p.vx += (p.ax ?? 0) * dt;
                p.vy += (p.ay ?? 0) * dt;
                if (p.drag) { const d = Math.max(0, 1 - p.drag * dt); p.vx *= d; p.vy *= d; }
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.rx = (p.rx ?? 0) + (p.vrx ?? 0) * dt;
                p.ry = (p.ry ?? 0) + (p.vry ?? 0) * dt;
                p.rz = (p.rz ?? 0) + (p.vrz ?? 0) * dt;
                p.step?.(p, dt);
            }
            const k = t / p.life;
            const sc = p.size * (p.scale ? p.scale(k) : 1);
            const wob = p.wobble ? Math.sin(t * p.wobble.freq + (p.wobble.phase ?? 0)) * p.wobble.amp : 0;
            this.e.set(p.rx ?? 0, p.ry ?? 0, p.rz ?? 0);
            this.q.setFromEuler(this.e);
            this.v.set(p.x + wob, H - p.y, 0);
            this.s.set(sc * (p.sx ?? 1), sc * (p.sy ?? 1), 1);
            this.m4.compose(this.v, this.q, this.s);
            this.mesh.setMatrixAt(i, this.m4);
            this.alphaAttr.setX(i, Math.max(0, Math.min(1, (p.alpha ?? fadeInOut)(k))));
        });
        this.mesh.instanceMatrix.needsUpdate = true;
        this.alphaAttr.needsUpdate = true;
        return alive;
    }

    private hide(i: number) {
        this.alphaAttr.setX(i, 0);
        this.m4.makeScale(0, 0, 0);
        this.mesh.setMatrixAt(i, this.m4);
    }

    dispose() {
        this.ctx.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        (this.mesh.material as THREE_NS.Material).dispose();
        this.mesh.dispose();
    }
}

/**
 * 점을 차례로 잇는 선 (별자리 긋기 등). draw 는 0~1 로 얼마나 그었는지, alpha 는 진하기 — 나이 비율 k 의 함수.
 */
export class Trail implements Effect {
    private line: THREE_NS.Line;
    private age = 0;
    private n: number;

    constructor(private ctx: FxContext, points: [number, number][], color: number, private life: number,
        private draw: (k: number) => number, private alpha: (k: number) => number, private delay = 0) {
        const { THREE, H } = ctx;
        const geo = new THREE.BufferGeometry().setFromPoints(points.map(([x, y]) => new THREE.Vector3(x, H - y, 0)));
        this.n = points.length;
        const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
        this.line = new THREE.Line(geo, mat);
        this.line.frustumCulled = false;
        geo.setDrawRange(0, 0);
        ctx.scene.add(this.line);
    }

    update(dt: number): boolean {
        this.age += dt;
        const t = this.age - this.delay;
        if (t < 0) return true;
        const k = Math.min(1, t / this.life);
        const count = Math.max(0, Math.min(this.n, Math.ceil(this.draw(k) * this.n)));
        this.line.geometry.setDrawRange(0, count);
        (this.line.material as THREE_NS.LineBasicMaterial).opacity = Math.max(0, Math.min(1, this.alpha(k)));
        return t < this.life;
    }

    dispose() {
        this.ctx.scene.remove(this.line);
        this.line.geometry.dispose();
        (this.line.material as THREE_NS.Material).dispose();
    }
}

/** 여러 효과를 하나로 묶는다 — 모두 끝나야 끝 */
export const group = (...parts: (Effect | null | undefined)[]): Effect => {
    const list = parts.filter(Boolean) as Effect[];
    const done = new Set<Effect>();
    return {
        update(dt) {
            list.forEach((p) => { if (!done.has(p) && !p.update(dt)) done.add(p); });
            return done.size < list.length;
        },
        dispose() { list.forEach((p) => p.dispose()); },
    };
};

/* ── 작은 도구 ──────────────────────────────────────────────────────── */
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <V,>(arr: readonly V[]) => arr[Math.floor(Math.random() * arr.length)];
export const hex = (c: string): [number, number, number] => {
    const n = parseInt(c.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
/** 몇 개 띄울지 — 잔잔하게면 절반쯤, 폰이면 6할쯤 */
export const count = (ctx: FxContext, n: number) => Math.max(1, Math.round(n * (ctx.gentle ? 0.45 : 1) * (ctx.lite ? 0.62 : 1)));

/** 원·타원 위의 점들 — a0 에서 sweep 만큼 (화면 좌표라 y 는 아래로, 각도는 시계 방향), tilt 만큼 기운다 */
export function arcPoints(cx: number, cy: number, rx: number, ry: number, n: number, a0 = -Math.PI / 2, sweep = Math.PI * 2, tilt = 0): [number, number][] {
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    return Array.from({ length: n + 1 }, (_, i) => {
        const a = a0 + (i / n) * sweep;
        const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
        return [cx + x * ct - y * st, cy + x * st + y * ct];
    });
}

/** 상자 둘레를 도는 점들 — 왼쪽 위 모서리 조금 아래에서 시작해 시계 방향으로 한 바퀴 (모서리는 r 만큼 둥글게) */
export function rectPoints(r: FxRect, inset = 0, radius = 0, step = 6): [number, number][] {
    const x0 = r.x + inset, y0 = r.y + inset, x1 = r.x + r.w - inset, y1 = r.y + r.h - inset;
    const rad = Math.max(0, Math.min(radius, (x1 - x0) / 2, (y1 - y0) / 2));
    const pts: [number, number][] = [];
    const line = (ax: number, ay: number, bx: number, by: number) => {
        const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
        for (let i = 0; i < n; i++) pts.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n]);
    };
    const corner = (cx: number, cy: number, a0: number) => {
        if (rad < 1) return;
        for (let i = 0; i < 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); }
    };
    corner(x0 + rad, y0 + rad, Math.PI);
    line(x0 + rad, y0, x1 - rad, y0);
    corner(x1 - rad, y0 + rad, -Math.PI / 2);
    line(x1, y0 + rad, x1, y1 - rad);
    corner(x1 - rad, y1 - rad, 0);
    line(x1 - rad, y1, x0 + rad, y1);
    corner(x0 + rad, y1 - rad, Math.PI / 2);
    line(x0, y1 - rad, x0, y0 + rad);
    pts.push(pts[0]);
    return pts;
}

/** 지울 것의 자리 — 상자를 받았으면 그것, 아니면 누른 자리 둘레의 한 줄만큼 */
export const itemRect = (ctx: FxContext): FxRect =>
    ctx.hasRect ? ctx.rect : { x: ctx.x - Math.min(160, ctx.W * 0.35), y: ctx.y - 18, w: Math.min(320, ctx.W * 0.7), h: 36 };

/** 0~1 사이로 자르기·부드럽게 들어가고 나가기 */
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeOut = (k: number) => 1 - (1 - clamp01(k)) ** 3;
/** k 가 a 까지 차오르고 b 부터 빠진다 */
export const inOut = (k: number, a: number, b: number) => (k < a ? k / a : k > b ? Math.max(0, (1 - k) / (1 - b)) : 1);

/** 로마 숫자 (1~3999) — 연감의 이정표 */
export function roman(n: number) {
    const map: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let out = "";
    let v = Math.max(1, Math.min(3999, Math.floor(n)));
    for (const [k, s] of map) while (v >= k) { out += s; v -= k; }
    return out;
}

/** 글자 한 줄을 흰 그림으로 — 입자 색을 곱해 물들인다. 글꼴이 아직 안 들어왔으면 비슷한 글꼴로 그려진다 */
export const glyph = (ctx: FxContext, text: string, font: string, size = 256) => ctx.texture(`glyph:${font}:${text}`, (g, s) => {
    g.clearRect(0, 0, s, s);
    g.fillStyle = "#FFFFFF";
    g.textAlign = "center";
    g.textBaseline = "middle";
    let px = s * 0.42;
    g.font = font.replace("{px}", `${px}px`);
    // 긴 글자(CCCLXV)는 판에 들어가게 줄인다
    const w = g.measureText(text).width;
    if (w > s * 0.9) { px *= (s * 0.9) / w; g.font = font.replace("{px}", `${px}px`); }
    g.fillText(text, s / 2, s / 2);
}, size);

/** 상자 안의 아무 자리 */
export const inRect = (r: FxRect, pad = 0): [number, number] => [r.x + pad + Math.random() * Math.max(0, r.w - pad * 2), r.y + pad + Math.random() * Math.max(0, r.h - pad * 2)];

/** 상자 넓이에 맞춘 입자 수 — 작은 줄은 몇 개, 큰 판은 lo~hi 사이에서 */
export const byArea = (ctx: FxContext, r: FxRect, per: number, lo: number, hi: number) =>
    count(ctx, Math.max(lo, Math.min(hi, Math.round((r.w * r.h) / per))));

/* ── 엔진 ───────────────────────────────────────────────────────────── */

export class FxEngine {
    private renderer: THREE_NS.WebGLRenderer;
    private scene: THREE_NS.Scene;
    private camera: THREE_NS.OrthographicCamera;
    private effects: Effect[] = [];
    private textures = new Map<string, THREE_NS.Texture>();
    private raf = 0;
    private last = 0;
    private W = 1;
    private H = 1;

    /** lite: 폰 — 계단 다듬기 없이, 초당 60장까지, 한꺼번에 넷까지 */
    constructor(private THREE: T, private canvas: HTMLCanvasElement, private lite = false) {
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lite, powerPreference: "low-power" });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
        this.resize();
    }

    /** 그리는 동안만 캔버스를 보인다 — 쉬는 동안 숨겨 두면 굴릴 때 합성할 화면 한 겹이 준다 */
    private show(on: boolean) {
        this.canvas.toggleAttribute("data-on", on);
    }

    resize = () => {
        this.W = Math.max(1, window.innerWidth);
        this.H = Math.max(1, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.setSize(this.W, this.H, false);
        this.camera.left = 0;
        this.camera.right = this.W;
        this.camera.top = this.H;
        this.camera.bottom = 0;
        this.camera.updateProjectionMatrix();
    };

    get busy() { return this.effects.length > 0; }

    private texture = (key: string, draw: (g: CanvasRenderingContext2D, size: number) => void, size = 128) => {
        const hit = this.textures.get(key);
        if (hit) return hit;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const g = c.getContext("2d")!;
        draw(g, size);
        const tex = new this.THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        this.textures.set(key, tex);
        return tex;
    };

    play(mod: FxModule, e: FxEvent, opts: { gentle: boolean; dark: boolean; x: number; y: number }) {
        const make = mod.effects[e.kind];
        if (!make) return;
        if (window.innerWidth !== this.W || window.innerHeight !== this.H) this.resize();
        const rect = e.rect ?? { x: 0, y: 0, w: this.W, h: this.H };
        const ctx: FxContext = {
            THREE: this.THREE, scene: this.scene, W: this.W, H: this.H, gentle: opts.gentle, lite: this.lite, dark: opts.dark,
            x: e.x ?? opts.x, y: e.y ?? opts.y, rect, hasRect: !!e.rect, texture: this.texture,
        };
        let effect: Effect | null = null;
        try { effect = make(ctx, e); } catch { effect = null; }
        if (!effect) return;
        // '잔잔하게'는 입자만 줄이는 게 아니라 조금 천천히 흐른다
        if (opts.gentle) { const inner = effect; effect = { update: (dt) => inner.update(dt * 0.75), dispose: () => inner.dispose() }; }
        // 한꺼번에 너무 쌓이지 않게 — 오래된 것부터 정리
        while (this.effects.length >= (this.lite ? 4 : 6)) this.effects.shift()?.dispose();
        this.effects.push(effect);
        this.show(true);
        if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); }
    }

    private loop = (now: number) => {
        // 폰은 초당 60장까지만 — 120Hz 화면에서 두 배로 그리지 않는다
        if (this.lite && now - this.last < 15) { this.raf = requestAnimationFrame(this.loop); return; }
        const dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        this.effects = this.effects.filter((fx) => {
            const alive = fx.update(dt);
            if (!alive) fx.dispose();
            return alive;
        });
        this.renderer.render(this.scene, this.camera);
        this.raf = this.effects.length ? requestAnimationFrame(this.loop) : 0;
        if (!this.raf) { this.renderer.clear(); this.show(false); }
    };

    /** 움직임을 끄거나 창을 떠날 때 — 돌던 것을 바로 지운다 */
    stopAll() {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.effects.forEach((fx) => fx.dispose());
        this.effects = [];
        this.renderer.clear();
        this.show(false);
    }

    dispose() {
        this.stopAll();
        this.textures.forEach((t) => t.dispose());
        this.textures.clear();
        // 다음 엔진이 같은 캔버스(같은 맥락)에 선다 — 그림을 올리며 켜 둔 뒤집기·미리 곱하기가 남아 있으면
        // three 가 빈 3D 텍스처를 만들다 경고를 냈다(쉬었다 다시 그릴 때마다). 기본값으로 돌려 둔다
        const gl = this.renderer.getContext();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        this.renderer.dispose();
    }
}
