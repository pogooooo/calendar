/**
 * 화면 효과의 엔진 — 투명 캔버스 하나에 three.js 로 잠깐씩 그린다.
 *
 * 평소에는 아무것도 돌지 않는다. 효과가 들어오면 그 효과가 끝날 때까지만 rAF 를 돌리고,
 * 다 끝나면 캔버스를 비우고 멈춘다. 갈래(celestial·maple·ocean)의 효과 모듈은 여기 도구
 * (Swarm: 같은 그림을 여럿 띄우는 입자 무리, Trail: 점을 이어 긋는 선)만 써서 그린다.
 * three 는 FxStage 가 처음 효과가 필요할 때 동적으로 받아 넘겨준다 — 이 파일은 타입만 가져온다.
 *
 * 좌표는 화면 CSS px 이고 y 는 아래로 자란다(브라우저와 같게). 카메라가 뒤집어 준다.
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
    /** 어두운 벌인가 — 밝은 바탕에서는 하얀 입자가 묻히니 색을 짙게 */
    dark: boolean;
    /** 효과의 중심과 영역 (부른 쪽이 안 줬으면 엔진이 채운다: 누른 자리·화면 전체) */
    x: number;
    y: number;
    rect: FxRect;
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

/** 같은 그림을 여럿 띄운다 (InstancedMesh 한 번 그리기) */
export class Swarm implements Effect {
    private mesh: THREE_NS.InstancedMesh;
    private alphaAttr: THREE_NS.InstancedBufferAttribute;
    private tintAttr: THREE_NS.InstancedBufferAttribute;
    private m4: THREE_NS.Matrix4;
    private q: THREE_NS.Quaternion;
    private e: THREE_NS.Euler;
    private v: THREE_NS.Vector3;
    private s: THREE_NS.Vector3;

    constructor(private ctx: FxContext, map: THREE_NS.Texture, public particles: Particle[]) {
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
/** 몇 개 띄울지 — 잔잔하게면 절반쯤 */
export const count = (ctx: FxContext, n: number) => Math.max(1, Math.round(ctx.gentle ? n * 0.45 : n));

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

    constructor(private THREE: T, private canvas: HTMLCanvasElement) {
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
        this.resize();
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
            THREE: this.THREE, scene: this.scene, W: this.W, H: this.H, gentle: opts.gentle, dark: opts.dark,
            x: e.x ?? opts.x, y: e.y ?? opts.y, rect, texture: this.texture,
        };
        let effect: Effect | null = null;
        try { effect = make(ctx, e); } catch { effect = null; }
        if (!effect) return;
        // 한꺼번에 너무 쌓이지 않게 — 오래된 것부터 정리
        while (this.effects.length >= 6) this.effects.shift()?.dispose();
        this.effects.push(effect);
        if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); }
    }

    private loop = (now: number) => {
        const dt = Math.min(0.05, (now - this.last) / 1000);
        this.last = now;
        this.effects = this.effects.filter((fx) => {
            const alive = fx.update(dt);
            if (!alive) fx.dispose();
            return alive;
        });
        this.renderer.render(this.scene, this.camera);
        this.raf = this.effects.length ? requestAnimationFrame(this.loop) : 0;
        if (!this.raf) this.renderer.clear();
    };

    /** 움직임을 끄거나 창을 떠날 때 — 돌던 것을 바로 지운다 */
    stopAll() {
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.effects.forEach((fx) => fx.dispose());
        this.effects = [];
        this.renderer.clear();
    }

    dispose() {
        this.stopAll();
        this.textures.forEach((t) => t.dispose());
        this.textures.clear();
        this.renderer.dispose();
    }
}
