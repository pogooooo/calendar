/**
 * Maple 의 바탕 장면 — 물든 단풍잎이 3D 로 뒤집히며 천천히 진다 (투명 캔버스 한 장, three.js).
 *
 *   - 잎: public/themes/maple 의 수채 단풍 넷(붉음·주황·노랑·갈빛)을 아틀라스 한 장으로 묶어 InstancedMesh 한 번에 그린다.
 *     판은 가로로 오목하게 말려 있고 끝이 바람에 떤다(정점 셰이더) — 돌 때 빛이 면을 따라 흘러 종잇조각이 아니라 잎으로 보인다.
 *   - 떨어짐: 진자처럼 흔들리며(끝에서 멈칫, 가운데서 빨리) 내려오고, 몇 장은 공중제비를 돈다. 뒷면은 옅다.
 *   - 깊이: 가까운 잎은 크고 흐리게(밉맵을 흐려 읽는다), 먼 잎은 작고 종이빛으로 바랜다.
 *   - 바람: parallax.read() — 데스크톱은 커서 쪽, 폰은 기운 쪽으로 잎이 밀린다. 누르면 그 둘레의 잎이 회오리친다.
 *   - 손: 커서가 지나가면 둘레의 잎이 손에 휩쓸리듯 그쪽으로 밀리며 돈다 (데스크톱 '풍성하게').
 *
 * 무겁지 않게: 잎은 화면 넓이에 맞춰 7~16 장, 초당 30장, 창이 숨으면 멈춘다. 해상도는 화면의 0.75(폰 0.6)배 —
 * 물(0.6)보다 조금 높은 것은 칠할 곳이 잎 몇 장뿐이라 값이 싸고, 낮추면 수채 잎 가장자리가 뭉개져서다.
 * 움직임 '잔잔하게'면 적고 느리게(손·기울기 반응 없음), '끄기'면 한 장만 그려 둔다.
 * three 는 부르는 쪽(MapleAtmosphere)이 동적으로 받아 넘겨준다 — 이 파일은 타입만 가져온다.
 */
import type * as THREE_NS from "three";
import { parallax } from "@/lib/parallax";

type T = typeof THREE_NS;
type Motion = "full" | "gentle" | "off";

/** 아틀라스 2×2 — 순서가 칸 번호(0~3). 표본(specimenScene)도 같은 그림을 쓴다 */
export const SPRITES = ["leaf-red", "leaf-orange", "leaf-yellow", "leaf-brown"];

const FOV = 30;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
const CAM_Z = 12;
/** 카메라에서 잎까지 거리 — 가까운·가운데·먼 띠 */
const BANDS: [number, number][] = [[5.6, 7.8], [9, 13.5], [15, 22]];

/** 잎 한 장(인스턴스)의 정점 — 표본 장면의 지나가는 잎도 같이 쓴다 */
export const LEAF_VERT = /* glsl */ `
attribute vec4 aLeaf;   // 칸, 말림, 떨림 위상, 투명도
attribute vec3 aTone;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;
varying vec3 vTone;
varying float vAlpha;

void main() {
    vec3 p = position;
    float curl = aLeaf.y;
    // 가로로 오목하게 말리고, 잎 끝이 바람에 조금 떤다
    float tip = p.y + 0.5;
    float flex = sin(uTime * 2.1 + aLeaf.z + p.y * 2.4) * 0.07;
    p.z += curl * p.x * p.x * 1.6 + flex * tip * tip;
    vec3 n = normalize(vec3(-curl * 3.2 * p.x, -flex * 2.0 * tip, 1.0));
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
    vNormal = normalize(normalMatrix * (mat3(instanceMatrix) * n));
    vDepth = -mv.z;
    float cell = aLeaf.x;
    vUv = vec2((uv.x + mod(cell, 2.0)) * 0.5, (uv.y + 1.0 - floor(cell / 2.0)) * 0.5);
    vTone = aTone;
    vAlpha = aLeaf.w;
    gl_Position = projectionMatrix * mv;
}
`;

/** 잎 한 장의 색 — 가까운·먼 거리(uNear·uFar: 카메라에서의 거리)는 장면마다 단위가 달라 밖에서 준다 */
export const LEAF_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform vec3 uPaper;
uniform vec2 uNear;
uniform vec2 uFar;
uniform float uDark;
uniform float uOpacity;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDepth;
varying vec3 vTone;
varying float vAlpha;

void main() {
    float nearK = smoothstep(uNear.x, uNear.y, vDepth); // 가까운 잎 — 초점 밖이라 흐리고 옅게
    float farK = smoothstep(uFar.x, uFar.y, vDepth);    // 먼 잎 — 종이빛으로 바랜다
    vec4 c = texture2D(uMap, vUv, nearK * 1.7);     // 미리 곱한 알파(premultiplied)
    if (c.a < 0.003) discard;
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;
    vec3 L = normalize(vec3(-0.35, 0.75, 0.55));
    float shade = 0.74 + 0.36 * max(dot(n, L), 0.0);
    vec3 rgb = c.rgb * vTone * shade;
    // 잎 뒷면은 옅고 덜 붉다
    if (!gl_FrontFacing) {
        float l = dot(rgb, vec3(0.299, 0.587, 0.114));
        rgb = mix(rgb, vec3(l), 0.32) * 1.06;
    }
    rgb *= mix(1.0, 0.88, uDark);
    rgb = mix(rgb, uPaper * c.a, farK * mix(0.6, 0.66, uDark));
    float a = uOpacity * vAlpha * (1.0 - nearK * 0.5) * (1.0 - farK * 0.3);
    gl_FragColor = vec4(rgb * a, c.a * a);
}
`;

interface Leaf {
    x: number; y: number; z: number;
    /** 바람을 따라가는 흐름 · 누름이 더한 속도(곧 잦아든다) */
    vx: number; vz: number;
    gx: number; gy: number; gz: number;
    fall: number; size: number; cell: number; tone: [number, number, number]; curl: number;
    /** 진자 흔들림 */
    phase: number; freq: number; swing: number; swingDir: number;
    roll0: number; roll: number; pitch0: number;
    yaw: number; yawRate: number; yawSwing: number;
    /** 0 이면 흔들림, 아니면 공중제비 빠르기(rad/s) */
    tumble: number; tumbleAngle: number;
    /** 누름이 더한 돌기 — 잦아든다 */
    spin: number;
    band: number;
    seed: number;
    /** 바람을 따라가는 굼뜸(초) — 가벼운 잎이 빨리 따른다 */
    tau: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** '#RRGGBB' → 0~1 (색 관리 없이 그대로 — 캔버스도 sRGB 그대로 내보낸다) */
export function hexRGB(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
    const n = parseInt(v, 16);
    return Number.isNaN(n) ? [0.95, 0.92, 0.86] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** 잎 그림 넷을 2×2 아틀라스로. 칸마다 여백을 두어 흐린 밉맵에서 옆 칸이 번지지 않게 */
export async function leafAtlas(THREE: T, cell: number) {
    const imgs = await Promise.all(SPRITES.map((name) => new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => res(img);
        img.onerror = () => rej(new Error(name));
        img.src = `/themes/maple/${name}.webp`;
    })));
    const c = document.createElement("canvas");
    c.width = c.height = cell * 2;
    const g = c.getContext("2d");
    if (!g) throw new Error("2d");
    const pad = Math.round(cell * 0.07);
    imgs.forEach((img, i) => g.drawImage(img, (i % 2) * cell + pad, Math.floor(i / 2) * cell + pad, cell - pad * 2, cell - pad * 2));
    const tex = new THREE.CanvasTexture(c);
    tex.premultiplyAlpha = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
}

export interface LeafSceneOptions {
    dark: boolean;
    motion: Motion;
    /** 종이 바탕색 — 먼 잎이 이 빛으로 바랜다 */
    paper: string;
    /** 잎 그림을 못 받았을 때 (부르는 쪽이 CSS 잎으로 물러난다) */
    onFail: () => void;
}

/** WebGL 이 없으면 여기서 바로 던진다 — 부르는 쪽이 CSS 잎으로 물러난다 */
export function createLeafScene(THREE: T, canvas: HTMLCanvasElement, opts: LeafSceneOptions) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const { motion } = opts;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const scale = mobile ? 0.6 : 0.75;
    const interactive = motion === "full";
    const speedK = motion === "gentle" ? 0.62 : 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / Math.max(1, window.innerHeight), 1, 40);
    camera.position.set(0, 0, CAM_Z);

    // 잎 수 — 화면 넓이에 맞춰. '잔잔하게'는 더 적게, '끄기'는 한 장에 몇 장만
    const area = window.innerWidth * window.innerHeight;
    const full = Math.round(Math.min(16, Math.max(7, area / 80000)));
    const count = motion === "off" ? Math.max(4, Math.round(full * 0.45)) : motion === "gentle" ? Math.max(4, Math.round(full * 0.6)) : full;
    const sizeK = mobile ? 0.86 : 1;

    const geo = new THREE.PlaneGeometry(1, 1, 6, 6);
    const aLeaf = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
    const aTone = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
    aLeaf.setUsage(THREE.DynamicDrawUsage);
    aTone.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("aLeaf", aLeaf);
    geo.setAttribute("aTone", aTone);
    const uniforms = {
        uMap: { value: null as THREE_NS.Texture | null },
        uPaper: { value: new THREE.Vector3(...hexRGB(opts.paper)) },
        uDark: { value: opts.dark ? 1 : 0 },
        uOpacity: { value: 0 },
        uTime: { value: Math.random() * 100 },
        uNear: { value: new THREE.Vector2(9, 5.8) },
        uFar: { value: new THREE.Vector2(12, 22) },
    };
    const material = new THREE.ShaderMaterial({
        vertexShader: LEAF_VERT,
        fragmentShader: LEAF_FRAG,
        uniforms,
        transparent: true,
        premultipliedAlpha: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.InstancedMesh(geo, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.visible = false;
    scene.add(mesh);

    let W = 1, H = 1;
    const halfH = (d: number) => d * TAN;
    const halfW = (d: number) => d * TAN * (W / H);

    /* ── 잎 ─────────────────────────────────────────────────────────── */
    const leaves: Leaf[] = [];
    const spawn = (l: Leaf, where: "anywhere" | "top" | "side", fromLeft = true) => {
        const [d0, d1] = BANDS[l.band];
        const d = rand(d0, d1);
        l.z = CAM_Z - d;
        l.size = rand(0.28, 0.37) * sizeK;
        l.cell = Math.floor(Math.random() * SPRITES.length);
        const warm = rand(-0.06, 0.06);
        l.tone = [1 + warm, 1 + warm * 0.4 + rand(-0.05, 0.03), 1 - warm * 0.5 + rand(-0.05, 0.03)];
        l.curl = rand(0.1, 0.32);
        l.fall = rand(0.26, 0.4);
        l.freq = rand(1.35, 2.2);
        l.phase = rand(0, Math.PI * 2);
        l.swing = rand(0.12, 0.3);
        l.swingDir = Math.random() < 0.75 ? rand(-0.5, 0.5) : rand(0.9, 1.6);
        l.roll0 = rand(-0.5, 0.5);
        l.roll = rand(0.3, 0.65);
        l.pitch0 = rand(-0.55, 0.15);
        l.yaw = rand(-0.6, 0.6);
        l.yawRate = Math.random() < 0.4 ? rand(0.35, 1) * (Math.random() < 0.5 ? -1 : 1) : 0;
        l.yawSwing = rand(0.25, 0.7);
        l.tumble = Math.random() < 0.2 ? rand(1.6, 2.8) * (Math.random() < 0.5 ? -1 : 1) : 0;
        l.tumbleAngle = rand(0, Math.PI * 2);
        l.seed = rand(0, 10);
        l.tau = rand(1.1, 2.4);
        l.gx = l.gy = l.gz = 0;
        l.spin = 0;
        const hh = halfH(d), hw = halfW(d);
        if (where === "anywhere") {
            l.x = rand(-hw, hw) * 1.05;
            l.y = rand(-hh, hh);
        } else if (where === "top") {
            l.x = rand(-hw, hw) * 1.1 - l.vx * 3;
            l.y = hh + l.size;
        } else {
            l.x = (fromLeft ? -1 : 1) * (hw + l.size);
            l.y = rand(-hh * 0.4, hh);
        }
        l.x += camera.position.x;
        l.y += camera.position.y;
    };

    for (let i = 0; i < count; i++) {
        const frac = (i + 0.5) / count;
        const band = frac < 0.12 ? 0 : frac < 0.52 ? 1 : 2;
        const l = { band, vx: 0, vz: 0 } as Leaf;
        leaves.push(l);
    }

    let shown = true;
    const resize = () => {
        // 아주 낮은 가로 화면은 장면을 통째로 숨긴다(Garden 의 display:none) — 그때는 그리지 않는다
        shown = canvas.clientWidth > 0;
        W = Math.max(1, window.innerWidth);
        H = Math.max(1, window.innerHeight);
        renderer.setSize(Math.max(1, Math.round(W * scale)), Math.max(1, Math.round(H * scale)), false);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
    };
    resize();
    leaves.forEach((l) => spawn(l, "anywhere"));

    /* ── 바람·누름 ──────────────────────────────────────────────────── */
    type Vortex = { x: number; y: number; age: number; sign: number };
    const vortices: Vortex[] = [];
    const VORTEX_LIFE = 1.5;
    /** 잎의 화면 자리(px, y 아래로)와 그 깊이에서 1px 이 몇 월드 단위인지 */
    const onScreen = (l: Leaf) => {
        const d = CAM_Z - l.z;
        const hh = halfH(d), hw = halfW(d);
        return {
            sx: ((l.x - camera.position.x) / hw * 0.5 + 0.5) * W,
            sy: (0.5 - (l.y - camera.position.y) / hh * 0.5) * H,
            u: (2 * hh) / H,
        };
    };
    const gustRadius = () => 0.3 * Math.max(W, H);

    const onDown = (e: PointerEvent) => {
        if (vortices.length > 3) vortices.shift();
        vortices.push({ x: e.clientX, y: e.clientY, age: 0, sign: Math.random() < 0.5 ? -1 : 1 });
        // 첫 숨 — 둘레의 잎을 바깥·위로 한 번 민다
        const R = gustRadius();
        for (const l of leaves) {
            const { sx, sy, u } = onScreen(l);
            const dx = sx - e.clientX, dy = e.clientY - sy; // 위가 +
            const r = Math.hypot(dx, dy) + 1;
            const f = Math.exp(-((r / R) ** 2));
            if (f < 0.03) continue;
            l.gx += (dx / r) * 100 * f * u;
            l.gy += ((dy / r) * 100 + 80) * f * u;
            l.spin += 3 * f;
        }
    };
    if (interactive) window.addEventListener("pointerdown", onDown, { passive: true });
    const stopParallax = interactive ? parallax.start() : () => {};

    // 손 — 커서의 자리와 빠르기(px/s). 지나가는 둘레의 잎이 그 빠르기를 조금 받아 함께 쓸려 간다
    const hand = { x: -9999, y: -9999, vx: 0, vy: 0, at: 0 };
    const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        const now = performance.now();
        if (hand.at) {
            const s = Math.max(0.008, (now - hand.at) / 1000);
            hand.vx += ((e.clientX - hand.x) / s - hand.vx) * 0.35;
            hand.vy += ((e.clientY - hand.y) / s - hand.vy) * 0.35;
        }
        hand.x = e.clientX;
        hand.y = e.clientY;
        hand.at = now;
    };
    // 마우스는 늘 듣는다 — 터치스크린 노트북처럼 '주 입력이 손가락'으로 잡히는 기기도 마우스를 쓰면 잎이 쓸린다
    if (interactive) window.addEventListener("pointermove", onMove, { passive: true });

    /* ── 한 걸음 ────────────────────────────────────────────────────── */
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const eu = new THREE.Euler();
    const pos = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const order = leaves.map((_, i) => i);
    let t = Math.random() * 100;

    const step = (dt: number) => {
        t += dt;
        const p = interactive ? parallax.read() : { x: 0, y: 0 };
        // 산들바람(아주 느리게 오가는 왼쪽 바람) + 기운 쪽(폰) · 커서 쪽(데스크톱은 커서가 늘 어딘가 있으니 약하게)
        const breeze = -0.05 + 0.09 * Math.sin(t * 0.071) + 0.045 * Math.sin(t * 0.23 + 1.3);
        const windX = (breeze + p.x * (parallax.source === "tilt" ? 0.6 : 0.35)) * speedK;
        const windZ = 0.05 * Math.sin(t * 0.05);
        // 아주 조금 시점이 따라 움직인다 — 가까운 잎이 더 많이 비켜 깊이가 보인다
        camera.position.x += (p.x * 0.16 - camera.position.x) * Math.min(1, dt * 3);
        camera.position.y += (-p.y * 0.1 - camera.position.y) * Math.min(1, dt * 3);

        // 누른 자리의 회오리 — 둘레를 돌게 민다
        const R = gustRadius();
        for (let k = vortices.length - 1; k >= 0; k--) {
            const v = vortices[k];
            v.age += dt;
            if (v.age > VORTEX_LIFE) { vortices.splice(k, 1); continue; }
            const fade = (1 - v.age / VORTEX_LIFE) ** 2;
            for (const l of leaves) {
                const { sx, sy, u } = onScreen(l);
                const dx = sx - v.x, dy = v.y - sy;
                const r = Math.hypot(dx, dy) + 1;
                const f = Math.exp(-((r / R) ** 2)) * fade;
                if (f < 0.02) continue;
                const acc = 520 * f * dt * u;
                l.gx += (-dy / r * v.sign - dx / r * 0.35) * acc;
                l.gy += (dx / r * v.sign - dy / r * 0.35) * acc;
            }
        }

        // 손이 지나간 자리 — 멈추면 손 기운이 곧 빠진다
        if (performance.now() - hand.at > 60) {
            const fade = Math.exp(-dt * 10);
            hand.vx *= fade;
            hand.vy *= fade;
        }
        const handSpeed = Math.hypot(hand.vx, hand.vy);
        if (handSpeed > 40) {
            const HR = 0.17 * Math.max(W, H);
            const take = Math.min(1, dt * 5);
            for (const l of leaves) {
                const { sx, sy, u } = onScreen(l);
                const dx = sx - hand.x, dy = sy - hand.y;
                const r = Math.hypot(dx, dy) + 1;
                const f = Math.exp(-((r / HR) ** 2));
                if (f < 0.03) continue;
                // 손의 빠르기를 따라 쓸리고(화면 y 는 아래로, 장면 y 는 위로), 손에서 조금 비켜난다
                l.gx += (hand.vx * 0.85 * take + (dx / r) * 70 * dt) * f * u;
                l.gy += (-hand.vy * 0.85 * take - (dy / r) * 70 * dt) * f * u;
                l.spin += f * Math.min(1, handSpeed / 1400) * dt * 7;
            }
        }

        for (const l of leaves) {
            const k = 1 - Math.exp(-dt / l.tau);
            l.vx += (windX - l.vx) * k;
            l.vz += (windZ - l.vz) * k;
            l.phase += l.freq * dt * speedK * (1 + l.spin * 0.5);
            const c = Math.cos(l.phase);
            const sv = l.swing * l.freq * c * speedK;
            const fall = l.fall * speedK * (l.tumble ? 1.15 : 0.5 + 0.85 * c * c);
            const swingK = l.tumble ? 0.4 : 1;
            l.x += (l.vx + Math.cos(l.swingDir) * sv * swingK + l.gx) * dt;
            l.z += (l.vz + Math.sin(l.swingDir) * sv * swingK * 0.6 + l.gz) * dt;
            l.y += (l.gy - fall) * dt;
            l.z = Math.min(CAM_Z - 5.2, Math.max(CAM_Z - 23, l.z));
            const g = Math.exp(-dt * 1.1);
            l.gx *= g; l.gy *= g; l.gz *= g;
            l.spin *= Math.exp(-dt * 0.9);
            if (l.tumble) l.tumbleAngle += (l.tumble + Math.sign(l.tumble) * l.spin * 3) * dt * speedK;
            l.yaw += (l.yawRate + l.spin * 2) * dt * speedK;

            // 화면 밖으로 나가면 다시 — 아래로 나가면 위에서, 바람에 옆으로 나가면 반대쪽에서
            const d = CAM_Z - l.z;
            const hh = halfH(d), hw = halfW(d);
            const rx = l.x - camera.position.x, ry = l.y - camera.position.y;
            if (ry < -hh - l.size) spawn(l, "top");
            else if (rx > hw + l.size * 1.5) spawn(l, "side", true);
            else if (rx < -hw - l.size * 1.5) spawn(l, "side", false);
        }
    };

    const write = () => {
        order.sort((a, b) => leaves[a].z - leaves[b].z); // 먼 잎부터
        order.forEach((li, slot) => {
            const l = leaves[li];
            const s = Math.sin(l.phase), c = Math.cos(l.phase);
            const pitch = l.tumble ? l.tumbleAngle : l.pitch0 + 0.38 * c;
            const yaw = l.yaw + l.yawSwing * Math.sin(l.phase * 0.5 + l.seed);
            const roll = l.roll0 + l.roll * s;
            eu.set(pitch, yaw, roll, "YXZ");
            q.setFromEuler(eu);
            m4.compose(pos.set(l.x, l.y, l.z), q, sc.set(l.size, l.size, l.size));
            mesh.setMatrixAt(slot, m4);
            aLeaf.setXYZW(slot, l.cell, l.curl, l.seed, 1);
            aTone.setXYZ(slot, l.tone[0], l.tone[1], l.tone[2]);
        });
        mesh.instanceMatrix.needsUpdate = true;
        aLeaf.needsUpdate = true;
        aTone.needsUpdate = true;
    };

    const targetOpacity = opts.dark ? 0.66 : 0.74;
    const render = () => {
        camera.updateMatrixWorld();
        renderer.render(scene, camera);
    };

    /* ── 돌리기 ─────────────────────────────────────────────────────── */
    let raf = 0;
    let disposed = false;
    let ready = false;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        if (document.hidden || !ready || !shown) return;
        acc += dt;
        if (acc < 1 / 30) return; // 초당 30장까지만
        const step_dt = Math.min(acc, 0.1);
        acc = 0;
        step(step_dt);
        uniforms.uTime.value += step_dt * speedK;
        uniforms.uOpacity.value += (targetOpacity - uniforms.uOpacity.value) * Math.min(1, step_dt * 1.6);
        write();
        render();
    };

    const onResize = () => {
        resize();
        if (motion === "off" && ready) render();
    };
    window.addEventListener("resize", onResize);
    // 맥락이 돌아오면(GPU 재시작·절전 뒤) 멈춘 한 장도 다시 그린다 — 움직이는 동안은 다음 장이 그린다
    const onRestored = () => { if (motion === "off" && ready) render(); };
    canvas.addEventListener("webglcontextrestored", onRestored);

    let texture: THREE_NS.Texture | null = null;
    leafAtlas(THREE, mobile ? 192 : 256).then((tex) => {
        if (disposed) { tex.dispose(); return; }
        texture = tex;
        uniforms.uMap.value = tex;
        mesh.visible = true;
        ready = true;
        if (motion === "off") {
            uniforms.uOpacity.value = targetOpacity;
            write();
            render();
        } else {
            last = performance.now();
            raf = requestAnimationFrame(tick);
        }
    }).catch(() => { if (!disposed) opts.onFail(); });

    return {
        dispose() {
            disposed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("webglcontextrestored", onRestored);
            stopParallax();
            texture?.dispose();
            geo.dispose();
            material.dispose();
            mesh.dispose();
            // 밝기·움직임을 바꾸면 같은 캔버스에 새 렌더러가 선다 — 남은 뒤집기·미리 곱하기 설정에 three 가 경고를 냈다
            const gl = renderer.getContext();
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            renderer.dispose();
        },
    };
}
