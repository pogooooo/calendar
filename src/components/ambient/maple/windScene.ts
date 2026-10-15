/**
 * Maple 의 바람 장면 (three.js, 투명 캔버스 한 장) — 바람 하나가 가지의 잎·지는 잎·진 잎을 모두 움직인다.
 *
 *   - 바람: 늘 부는 잔바람 + 가끔 나무 쪽(오른쪽)에서 오는 돌풍. 돌풍은 오른쪽 가장자리에서 왼쪽으로 번져, 나무가 먼저 흔들리고
 *     잎들이 차례로 쓸려 간다. 그 위에 크게 도는 소용돌이 바람(발산 없는 흐름) 한 겹 — 잎들이 같은 길을 가지 않는다.
 *   - 가지의 잎(canopyLayout 의 또렷한 잎): 잎자루 끝을 축으로 감쇠 스프링처럼 흔들린다(잎마다 제 진동수). 바람은 잎이 뻗은
 *     방향에 따라 돌림힘으로 받는다(아래로 처진 잎은 끝이 바람 쪽으로, 위로 선 잎은 반대로). 바람이 세면 잎 몸이 빠르게 비틀려
 *     옅은 뒷면과 비치는 빛이 반짝인다. 돌풍이 세면 몇 장이 떨어져 나가 지는 잎이 되고, 한참 뒤 그 자리에 잎이 다시 돋는다.
 *   - 지는 잎은 3D 자세로 움직인다 — 잎은 거의 누운 채 떨어지고 우리는 그것을 비스듬히 내려다본다(잎마다 54~74°).
 *       흔들리는 잎(대부분): 수평면의 한 방향으로 진자처럼 오가며, 끝에서 앞쪽 가장자리가 들려 멈칫했다(살짝 솟는다)
 *         반대로 미끄러진다. 가운데서 가장 빨리 내려온다. 흔들리는 방향이 화면 깊이 쪽이면 다가오며 커지고 눕혀진다.
 *       빙글 도는 잎: 긴 축(잎자루~끝)으로 공중제비를 돈다 — 옅은 뒷면이 번갈아 보인다. 돌풍 속에서는 잎 대부분이 이렇게 돈다.
 *       미끄러지는 잎: 한쪽으로 기울어 바람을 타고 길게 미끄러진다.
 *     잎은 수직축으로도 천천히 돈다. 몸짓은 가끔 바뀌고, 바뀔 때·내려앉을 때·가지에서 떨어질 때 앞 자세에서 이어 돈다(구면 보간).
 *     깊이: 가까운 잎은 크고 흐리고 빠르며 그림자가 멀리 진다. 먼 잎은 작고 느리고 종이빛으로 바래며 가지 뒤로 지나간다.
 *   - 바닥(넓은 화면): 지던 잎이 아래 가장자리에 내려앉아 눕고, 한동안 쌓였다가 천천히 사라진다. 처음부터 놓인 잎 더미
 *     (canopyLayout.ground)도 같은 잎이라, 커서로 세게 쓸면 날아오르고 한참 뒤 제자리에 다시 놓인다.
 *   - 빛: 해는 오른쪽 위 — 해 쪽 면은 밝고, 해를 등진 면은 햇빛이 비쳐 따뜻하게 빛난다(투과). 그림자는 왼쪽 아래 종이 위에.
 *   - 손(데스크톱 '풍성하게'): 커서가 지나가면 둘레의 잎이 쓸리고 가지의 잎도 흔들린다(세게 치면 한 장 떨어진다). 누르면 회오리.
 *     폰은 기기를 기울인 쪽으로 바람이 분다. 깊이마다 조금씩 어긋나 보인다(parallax).
 *
 * 그림: 수채 잎 넷을 2×2 아틀라스 두 장(또렷한 것 + 흐린 것)으로. 잎마다 색상·채도·밝기를 셰이더에서 돌려 물들인다
 * (캔버스 필터 hue-rotate·saturate·brightness 와 같은 행렬 — 멈춘 그림 canopyPaint 와 빛깔이 같다).
 * 빠르기: 화면 새로 고침마다(rAF) 시간으로 움직인다. 해상도는 화면 밀도의 1.5(폰 1.25)배까지 — 예전(0.75배)엔 수채 결이 뭉개졌다.
 * 창이 숨으면 멈추고, 프레임이 계속 늦으면 해상도와 잎 수를 한 번 낮춘다. 움직임 '잔잔하게'면 잎이 적고 느리며 돌풍이 드물고
 * 손에 반응하지 않는다('끄기'면 부르는 쪽이 이 장면을 띄우지 않고 멈춘 그림만 쓴다).
 * three 는 부르는 쪽(MapleAtmosphere·MapleAuthPanel)이 동적으로 받아 넘겨준다 — 이 파일은 타입만 가져온다.
 */
import type * as THREE_NS from "three";
import { parallax } from "@/lib/parallax";
import { STEM, canopyFade, canopyLayout, loadCanopyLeaves, type CanopyLayout, type CanopyLeaf, type LeafImage } from "./canopyPaint";
import { GUST_EVENT, type GustDetail } from "./gust";

type T = typeof THREE_NS;
type Quat = THREE_NS.Quaternion;
type Motion = "full" | "gentle" | "off";

export interface WindOptions {
    dark: boolean;
    motion: Motion;
    /** 종이 바탕색 — 먼 잎이 이 빛으로 바랜다 */
    paper: string;
    /** screen: 앱 바탕(화면 전체) · panel: 로그인 옆 그림판(판 안) */
    variant: "screen" | "panel";
    /** 첫 장을 그렸다 — 부르는 쪽이 캔버스 가지를 뒤판(햇살·먼 잎·가지 나무)만 남기게 바꾼다 */
    onReady: () => void;
}

export interface WindScene {
    dispose(): void;
    /** 바깥에서 부는 돌풍. dir: -1 왼쪽으로, 1 오른쪽으로 */
    gust(dir: number, strength?: number): void;
}

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (t: number) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 아틀라스 칸 안의 여백 — 흐린 판에서 옆 칸이 번지지 않게. 잎 그림은 칸의 가운데 (1 − 2·PAD) 만큼을 차지한다 */
const PAD = 0.07;
const QUAD = 1 / (1 - 2 * PAD);
/** 잎자루 끝의 자리 — 판(1×1, 가운데가 원점, y 위로)의 좌표 */
const PIVOT_X = PAD + STEM[0] * (1 - 2 * PAD) - 0.5;
const PIVOT_Y = 0.5 - (PAD + STEM[1] * (1 - 2 * PAD));

/** '#RRGGBB' → 0~1 */
function hexRGB(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
    const n = parseInt(v, 16);
    return Number.isNaN(n) ? [0.96, 0.94, 0.91] : [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

const VERT = /* glsl */ `
attribute vec4 aLeaf;   // 칸, 말림, 떨림 위상, 투명도
attribute vec4 aTone;   // 색상 돌림(rad), 채도, 밝기, 흐림(0~1)
attribute vec2 aMisc;   // 바램(먼 잎 0~1), 뒤집기(0·1)
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying float vAlpha;
varying float vBlur;
varying float vFar;
varying float vLight;
varying vec3 vM0;
varying vec3 vM1;
varying vec3 vM2;

void main() {
    vec3 p = position;
    float curl = aLeaf.y;
    // 가로로 오목하게 말리고, 잎 끝이 바람에 조금 떤다
    float tip = p.y + 0.5;
    float flex = sin(uTime * 2.3 + aLeaf.z + p.y * 2.4) * 0.05;
    p.z += curl * p.x * p.x * 1.6 + flex * tip * tip;
    vec3 n = normalize(vec3(-curl * 3.2 * p.x, -flex * 2.0 * tip, 1.0));
    vNormal = normalize(mat3(instanceMatrix) * n);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);

    vec2 u = vec2(mix(uv.x, 1.0 - uv.x, aMisc.y), uv.y);
    float cell = aLeaf.x;
    vUv = vec2((u.x + mod(cell, 2.0)) * 0.5, (u.y + 1.0 - floor(cell / 2.0)) * 0.5);
    vAlpha = aLeaf.w;
    vBlur = aTone.w;
    vFar = aMisc.x;
    vLight = aTone.z;

    // 물들이기 — CSS 의 hue-rotate 뒤 saturate 와 같은 행렬 (열 우선)
    float c = cos(aTone.x), s = sin(aTone.x), k = aTone.y;
    mat3 hm = mat3(
        0.213 + c * 0.787 - s * 0.213, 0.213 - c * 0.213 + s * 0.143, 0.213 - c * 0.213 - s * 0.787,
        0.715 - c * 0.715 - s * 0.715, 0.715 + c * 0.285 + s * 0.140, 0.715 - c * 0.715 + s * 0.715,
        0.072 - c * 0.072 + s * 0.928, 0.072 - c * 0.072 - s * 0.283, 0.072 + c * 0.928 + s * 0.072);
    mat3 sm = mat3(
        0.213 + 0.787 * k, 0.213 - 0.213 * k, 0.213 - 0.213 * k,
        0.715 - 0.715 * k, 0.715 + 0.285 * k, 0.715 - 0.715 * k,
        0.072 - 0.072 * k, 0.072 - 0.072 * k, 0.072 + 0.928 * k);
    mat3 m = sm * hm;
    vM0 = vec3(m[0][0], m[1][0], m[2][0]);
    vM1 = vec3(m[0][1], m[1][1], m[2][1]);
    vM2 = vec3(m[0][2], m[1][2], m[2][2]);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform sampler2D uBlur;
uniform vec3 uPaper;
uniform vec3 uLight;
uniform float uDark;
uniform float uShadow;
uniform vec3 uShadowColor;
uniform float uShadowAlpha;
varying vec2 vUv;
varying vec3 vNormal;
varying float vAlpha;
varying float vBlur;
varying float vFar;
varying float vLight;
varying vec3 vM0;
varying vec3 vM1;
varying vec3 vM2;

void main() {
    vec4 soft = texture2D(uBlur, vUv);
    // 그림자 — 흐린 판의 모양을 종이 위에 옅게 (먼 잎은 그림자가 거의 없다)
    if (uShadow > 0.5) {
        float a = soft.a * vAlpha * uShadowAlpha * (1.0 - vFar);
        if (a < 0.002) discard;
        gl_FragColor = vec4(uShadowColor * a, a);
        return;
    }
    vec4 c = mix(texture2D(uMap, vUv), soft, vBlur);   // 미리 곱한 알파
    if (c.a < 0.004) discard;
    vec3 col = c.rgb / c.a;
    col = clamp(vec3(dot(vM0, col), dot(vM1, col), dot(vM2, col)), 0.0, 1.0) * vLight;

    vec3 N = normalize(vNormal);
    if (!gl_FrontFacing) {
        N = -N;   // 보이는 면 쪽으로
        // 뒷면은 옅고 덜 붉다
        float l = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(col, vec3(l), 0.25) * 1.05 + vec3(0.03, 0.02, 0.0);
    }
    float ndl = dot(N, uLight);
    // 해 쪽 면은 밝고, 해를 등진 면은 햇빛이 비쳐 따뜻하게 빛난다(투과)
    float diffuse = 0.78 + 0.3 * max(ndl, 0.0) - 0.12 * max(-ndl, 0.0);
    float trans = max(-ndl, 0.0);
    vec3 glow = col * vec3(1.3, 1.02, 0.66) * trans * mix(0.5, 0.62, uDark);
    col = col * diffuse + glow;
    // 잎 겉의 아주 옅은 윤
    vec3 H = normalize(uLight + vec3(0.0, 0.0, 1.0));
    col += vec3(1.0, 0.95, 0.85) * pow(max(dot(N, H), 0.0), 36.0) * 0.06;
    // 먼 잎은 종이빛으로 바랜다
    col = mix(col, uPaper, vFar * 0.45);
    float a = c.a * vAlpha * (1.0 - vFar * 0.3);
    gl_FragColor = vec4(col * a, a);
}
`;

/** 잎 넷을 2×2 아틀라스로 — 또렷한 판과 흐린 판(초점 밖의 잎·그림자) */
function atlases(THREE: T, imgs: LeafImage[], cell: number, maxAniso: number) {
    const make = (blur: number, size: number) => {
        const c = document.createElement("canvas");
        c.width = c.height = size * 2;
        const g = c.getContext("2d");
        if (!g) throw new Error("2d");
        const pad = Math.round(size * PAD);
        if (blur) g.filter = `blur(${blur}px)`;
        imgs.forEach((img, i) => g.drawImage(img, (i % 2) * size + pad, Math.floor(i / 2) * size + pad, size - pad * 2, size - pad * 2));
        const tex = new THREE.CanvasTexture(c);
        tex.premultiplyAlpha = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = Math.min(4, maxAniso);
        return tex;
    };
    const blurCell = Math.round(cell / 2);
    return { sharp: make(0, cell), soft: make(Math.max(2, Math.round(blurCell * 0.045)), blurCell) };
}

/* ── 잎들 ──────────────────────────────────────────────────────────── */

/** 잎 그림과 물들이기 — 판 한 장을 그리는 데 드는 것 */
interface Look { img: number; hue: number; sat: number; light: number; flip: boolean }

/** 가지에 붙은 잎 */
interface Hang {
    base: CanopyLeaf;
    /** 구석에서 멀어 옅어진 정도(캔버스 가림과 같은 값) */
    fade: number;
    /** 바람(가로)을 돌림힘으로 받는 팔 — 잎이 뻗은 방향의 sin */
    lever: number;
    /** 흔들림 각·각속도, 제 진동수(rad/s), 바람을 받는 정도, 위상 */
    d: number; v: number; w: number; gain: number; phase: number;
    /** 이번 장의 비틀림·기울기 (떨어져 나갈 때 이어 받는다) */
    roll: number; pitch: number;
    /** 다시 돋는 중(0~1) */
    grow: number;
    gone: boolean;
    regrowAt: number;
}

const AIR = 0, LANDING = 1, REST = 2, FADING = 3;
const FLUTTER = 0, TUMBLE = 1, GLIDE = 2;

/** 지는 잎·바닥의 잎 */
interface Leaf extends Look {
    x: number; y: number; vx: number; vy: number;
    /** 깊이: 0 가까움(크고 흐림) ~ 1 멂(작고 바램) */
    depth: number;
    size: number;
    /** 이번 장에 그릴 크기 배수 (깊이 쪽으로 흔들리면 다가오며 커진다) */
    grow: number;
    mode: number;
    phase: number; freq: number; amp: number; descent: number;
    /** 내려다보는 높이(rad) · 흔들리는 방향(수평면의 방위각) · 흔들릴 때 기우는 크기 */
    elev: number; az: number; tilt: number;
    /** 수직축 돌림과 그 빠르기 */
    yaw: number; yawRate: number;
    /** 긴 축으로 도는 각과 그 빠르기 */
    spin: number; spinRate: number;
    curl: number; flutter: number;
    alpha: number;
    /** 이번 장의 자세, 넘어오기 전 자세(이어 돌기·내려앉기) */
    q: Quat; from: Quat;
    /** 앞 자세를 이어 주는 정도(1 → 0) */
    carry: number;
    side: number;
    /** 바람을 따라잡는 데 걸리는 시간(초) — 큰 잎일수록 굼뜨다 */
    tau: number;
    state: number;
    t: number;
    restUntil: number;
    landY: number;
    /** 처음부터 놓인 잎 더미의 한 장이면 그 자리 */
    home: CanopyLeaf | null;
}

export async function createWindScene(THREE: T, canvas: HTMLCanvasElement, opts: WindOptions): Promise<WindScene> {
    const imgs = await loadCanopyLeaves();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const { motion, variant } = opts;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const gentle = motion === "gentle";
    const interactive = motion === "full";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000);
    camera.position.z = 1000;

    const { sharp, soft } = atlases(THREE, imgs, mobile ? 256 : 512, renderer.capabilities.getMaxAnisotropy());
    const time0 = Math.random() * 100;
    const makeUniforms = (shadow: boolean) => ({
        uMap: { value: sharp },
        uBlur: { value: soft },
        uTime: { value: time0 },
        uPaper: { value: new THREE.Vector3(...hexRGB(opts.paper)) },
        uLight: { value: new THREE.Vector3(0.45, 0.6, 0.66).normalize() },
        uDark: { value: opts.dark ? 1 : 0 },
        uShadow: { value: shadow ? 1 : 0 },
        uShadowColor: { value: opts.dark ? new THREE.Vector3(0, 0, 0) : new THREE.Vector3(0.32, 0.15, 0.07) },
        uShadowAlpha: { value: opts.dark ? 0.42 : 0.2 },
    });
    const leafUniforms = makeUniforms(false);
    const shadowUniforms = makeUniforms(true);
    shadowUniforms.uTime = leafUniforms.uTime;
    const material = (u: ReturnType<typeof makeUniforms>) => new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, uniforms: u,
        transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    });
    const leafMat = material(leafUniforms);
    const shadowMat = material(shadowUniforms);

    /** 한 겹(판 묶음) — 잎과 그 그림자가 같은 모양(속성)을 쓴다. order 가 작을수록 뒤 */
    const layer = (cap: number, order: number, withShadow: boolean) => {
        const geo = new THREE.PlaneGeometry(1, 1, 6, 6);
        const aLeaf = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
        const aTone = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
        const aMisc = new THREE.InstancedBufferAttribute(new Float32Array(cap * 2), 2);
        [aLeaf, aTone, aMisc].forEach((a) => a.setUsage(THREE.DynamicDrawUsage));
        geo.setAttribute("aLeaf", aLeaf);
        geo.setAttribute("aTone", aTone);
        geo.setAttribute("aMisc", aMisc);
        const mesh = new THREE.InstancedMesh(geo, leafMat, cap);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        mesh.renderOrder = order * 2 + 1;
        mesh.count = 0;
        scene.add(mesh);
        let shadow: THREE_NS.InstancedMesh | null = null;
        if (withShadow) {
            shadow = new THREE.InstancedMesh(geo, shadowMat, cap);
            shadow.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            shadow.frustumCulled = false;
            shadow.renderOrder = order * 2;
            shadow.count = 0;
            scene.add(shadow);
        }
        return { geo, aLeaf, aTone, aMisc, mesh, shadow, cap, n: 0 };
    };
    type Layer = ReturnType<typeof layer>;
    const groundL = layer(48, 0, true);
    const farL = layer(32, 1, false);
    const canopyL = layer(96, 2, true);
    const fallL = layer(64, 3, true);
    const frontL = layer(4, 4, false);
    const layers = [groundL, farL, canopyL, fallL, frontL];

    /* ── 자세 ──────────────────────────────────────────────────────── */
    const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1);
    /** 판을 눕힌다(앞면이 위로, 잎 끝이 화면 안쪽으로) */
    const FLAT = new THREE.Quaternion().setFromAxisAngle(AX, -Math.PI / 2);
    /** 잎의 긴 축을 가로로 */
    const SIDE = new THREE.Quaternion().setFromAxisAngle(AZ, -Math.PI / 2);
    const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), pose = new THREE.Quaternion();
    const axis = new THREE.Vector3();
    const e = new THREE.Euler();
    /**
     * 누운 잎 — elev 만큼 내려다보고, 수직축으로 yaw 돌리고, 수평면의 az 쪽으로 tilt 만큼 기울인다(그쪽 가장자리가 들린다).
     * 위에서 곧장 내려다보면(elev = π/2) 잎이 화면에서 캔버스 각 −yaw 로 보인다.
     */
    const flatPose = (out: Quat, elev: number, yaw: number, az = 0, tilt = 0) => {
        out.setFromAxisAngle(AX, elev);
        if (tilt) { axis.set(-Math.sin(az), 0, Math.cos(az)); out.multiply(qa.setFromAxisAngle(axis, tilt)); }
        return out.multiply(qb.setFromAxisAngle(AY, yaw)).multiply(FLAT);
    };
    /** 긴 축으로 도는 잎 — 축은 수평, 화면 가로에서 yaw 만큼 돌아 있다 */
    const tumblePose = (out: Quat, elev: number, yaw: number, spin: number) =>
        out.setFromAxisAngle(AX, elev).multiply(qb.setFromAxisAngle(AY, yaw)).multiply(qa.setFromAxisAngle(AX, spin)).multiply(SIDE);
    /** 가지의 잎 — 캔버스 각 rot 으로 그린 그림을 앞뒤(pitch)·긴 축(roll)으로 기울인다 */
    const hangPose = (out: Quat, rot: number, pitch: number, roll: number) => out.setFromEuler(e.set(pitch, roll, -rot, "ZXY"));

    /* ── 크기·배치 ─────────────────────────────────────────────────── */
    let W = 1, H = 1, K = 1;
    let L: CanopyLayout = canopyLayout(1, 1, variant, opts.dark);
    let hangs: Hang[] = [];
    const leaves: Leaf[] = [];
    let target = 10;
    let lowFactor = 1;
    /** 바닥에 내려앉는가 — 넓은 화면과 그림판만 (폰은 아래가 탭 줄이다) */
    let landing = false;
    let landFrom = 0;

    const measure = () => {
        W = Math.max(1, canvas.clientWidth || window.innerWidth);
        H = Math.max(1, canvas.clientHeight || window.innerHeight);
        K = clamp(Math.min(W, H) / 900, 0.55, 1.25);
        renderer.setSize(W, H, false);
        camera.left = 0; camera.right = W; camera.top = 0; camera.bottom = -H;
        camera.updateProjectionMatrix();
        const full = variant === "panel" ? clamp((W * H) / 60000, 7, 14) : mobile ? 7 : clamp((W * H) / 72000, 10, 18);
        target = Math.max(4, Math.round(full * (gentle ? 0.55 : 1) * lowFactor));
        landing = !mobile && (variant === "panel" || W >= 769);
        // 그림판은 왼쪽 아래에 상표가 있다 — 그 글 뒤에는 쌓지 않는다
        landFrom = variant === "panel" ? W * 0.45 : 0;
    };

    const makeHangs = () => {
        L = canopyLayout(W, H, variant, opts.dark);
        hangs = L.crisp.map((base) => ({
            base,
            fade: canopyFade(L, base.at[0], base.at[1]),
            lever: Math.sin(base.dir),
            d: 0, v: 0,
            w: TAU * rand(0.8, 1.5),
            gain: rand(0.7, 1.25) * (gentle ? 0.6 : 1),
            phase: rand(0, TAU),
            roll: 0, pitch: 0,
            grow: 1, gone: false, regrowAt: 0,
        }));
    };

    /* ── 바람 ──────────────────────────────────────────────────────── */
    let time = 0;
    type Gust = { t0: number; amp: number; a: number; h: number; r: number };
    const gusts: Gust[] = [];
    let nextGust = rand(6, 12);
    /** 돌풍이 화면을 건너가는 빠르기(px/s) */
    const GUST_SPEED = 900;
    const breeze = (t: number) => (-10 + 8 * Math.sin(t * 0.071) + 5 * Math.sin(t * 0.23 + 1.3)) * K;
    const env = (g: Gust, tt: number) => {
        if (tt <= 0) return 0;
        if (tt < g.a) return smooth(tt / g.a);
        if (tt < g.a + g.h) return 1;
        if (tt < g.a + g.h + g.r) return 1 - smooth((tt - g.a - g.h) / g.r);
        return 0;
    };
    /** 돌풍 — 왼쪽으로 부는 것은 오른쪽 가장자리에서, 오른쪽으로 부는 것은 왼쪽에서 번진다 */
    const gustAt = (x: number) => {
        let sum = 0;
        for (const g of gusts) sum += g.amp * env(g, time - g.t0 - (g.amp < 0 ? W - x : x) / GUST_SPEED);
        return sum;
    };
    const pushGust = (amp: number, a = rand(0.7, 1.1), h = rand(0.6, 1.5), r = rand(1.8, 2.6)) => {
        gusts.push({ t0: time, amp, a, h, r });
        if (gusts.length > 6) gusts.shift();
    };
    /** 크게 도는 소용돌이 바람 — 흐름 함수 두 겹의 회전(발산이 없어 잎이 한데 몰리거나 흩어지지 않는다) */
    const turb = { x: 0, y: 0 };
    const turbulence = (x: number, y: number, t: number, amp: number) => {
        const a1 = 0.0047, b1 = 0.0061, a2 = 0.0113, b2 = 0.0089, A2 = 0.45;
        const p1 = x * a1 + t * 0.21, q1 = y * b1 - t * 0.17;
        const p2 = x * a2 - t * 0.33 + 1.7, q2 = y * b2 + t * 0.29 + 0.6;
        const s = amp / b1;
        turb.x = s * (-b1 * Math.sin(p1) * Math.sin(q1) - A2 * b2 * Math.sin(p2) * Math.sin(q2));
        turb.y = s * (-a1 * Math.cos(p1) * Math.cos(q1) - A2 * a2 * Math.cos(p2) * Math.cos(q2));
    };

    /* ── 손 ────────────────────────────────────────────────────────── */
    const hand = { x: -9999, y: -9999, vx: 0, vy: 0, at: 0 };
    const local = (ev: PointerEvent): [number, number] => {
        if (variant === "screen") return [ev.clientX, ev.clientY];
        const b = canvas.getBoundingClientRect();
        return [ev.clientX - b.left, ev.clientY - b.top];
    };
    const onMove = (ev: PointerEvent) => {
        if (ev.pointerType !== "mouse" && ev.pointerType !== "pen") return;
        const [x, y] = local(ev);
        const now = performance.now();
        if (hand.at && now - hand.at < 200) {
            const s = Math.max(0.008, (now - hand.at) / 1000);
            hand.vx += ((x - hand.x) / s - hand.vx) * 0.35;
            hand.vy += ((y - hand.y) / s - hand.vy) * 0.35;
        }
        hand.x = x; hand.y = y; hand.at = now;
    };
    type Vortex = { x: number; y: number; age: number; sign: number };
    const vortices: Vortex[] = [];
    const onDown = (ev: PointerEvent) => {
        const [x, y] = local(ev);
        if (x < -40 || y < -40 || x > W + 40 || y > H + 40) return;
        if (vortices.length > 3) vortices.shift();
        vortices.push({ x, y, age: 0, sign: Math.random() < 0.5 ? -1 : 1 });
        const R = 0.24 * Math.max(W, H);
        for (const l of leaves) {
            const dx = l.x - x, dy = l.y - y;
            const r = Math.hypot(dx, dy) + 1;
            const f = Math.exp(-((r / R) ** 2));
            if (f < 0.03) continue;
            if (l.state === REST || l.state === LANDING) lift(l, (dx / r) * 160 * f, -(220 + 160 * f));
            else if (l.state === AIR) { l.vx += (dx / r) * 260 * f; l.vy += (dy / r) * 200 * f - 140 * f; }
        }
    };
    const onGust = (ev: Event) => {
        const d = (ev as CustomEvent<GustDetail>).detail;
        if (d) api.gust(d.dir, d.strength);
    };
    if (interactive) {
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
    }
    window.addEventListener(GUST_EVENT, onGust);
    const stopParallax = interactive ? parallax.start() : () => {};

    /* ── 잎 만들기 ─────────────────────────────────────────────────── */
    const pickImg = () => { const v = Math.random(); return v < 0.36 ? 0 : v < 0.68 ? 1 : v < 0.88 ? 2 : 3; };
    const blank = (): Leaf => ({
        x: 0, y: 0, vx: 0, vy: 0, depth: 0.5, size: 40, grow: 1, img: 0, hue: 0, sat: 1, light: 1, flip: false,
        mode: FLUTTER, phase: 0, freq: 2, amp: 40, descent: 50, elev: 1.1, az: 0, tilt: 0.5, yaw: 0, yawRate: 0,
        spin: 0, spinRate: 8, curl: 0.2, flutter: 0, alpha: 0,
        q: new THREE.Quaternion(), from: new THREE.Quaternion(), carry: 0,
        side: 1, tau: 1, state: AIR, t: 0, restUntil: 0, landY: 0, home: null,
    });
    /** 깊이에 따른 크기 배수 — 가까울수록 크다 */
    const depthScale = (d: number) => lerp(1.75, 0.5, d);
    /** 몸짓·빠르기를 새로 고른다 (나타나거나 날아오를 때) */
    const character = (l: Leaf) => {
        const s = depthScale(l.depth);
        const v = Math.random();
        l.mode = v < 0.62 ? FLUTTER : v < 0.85 ? TUMBLE : GLIDE;
        l.freq = TAU / rand(1.6, 2.6);
        l.amp = rand(40, 95) * K * (0.6 + 0.4 * s);
        l.descent = rand(115, 165) * K * (0.72 + 0.36 * s) * (gentle ? 0.68 : 1);
        l.elev = rand(0.95, 1.3);
        // 흔들리는 방향은 대개 화면 가로 쪽 — 깊이 쪽이면 옆으로 거의 안 가고 눕혀졌다 세워졌다만 한다
        l.az = (Math.random() < 0.5 ? 0 : Math.PI) + rand(-0.8, 0.8);
        l.tilt = rand(0.35, 0.7);
        l.yawRate = (Math.random() < 0.5 ? -1 : 1) * rand(0.12, 0.55);
        l.spinRate = (Math.random() < 0.5 ? -1 : 1) * rand(5, 8.5);
        l.curl = rand(0.12, 0.3);
        l.flutter = rand(0, TAU);
        l.side = Math.random() < 0.5 ? -1 : 1;
        l.tau = rand(0.5, 1.1) * (0.7 + 0.3 * s);
        l.phase = rand(0, TAU);
    };
    const spawn = (l: Leaf, where: "anywhere" | "top" | "right") => {
        const v = Math.random();
        l.depth = v < 0.14 ? rand(0, 0.18) : v < 0.7 ? rand(0.32, 0.6) : rand(0.72, 1);
        l.size = rand(40, 56) * K * depthScale(l.depth) * (mobile ? 0.82 : 1);
        l.img = pickImg();
        l.hue = rand(-14, 10); l.sat = rand(0.92, 1.15); l.light = opts.dark ? rand(0.68, 0.8) : rand(0.94, 1.06);
        l.flip = Math.random() < 0.5;
        character(l);
        l.yaw = rand(0, TAU);
        l.spin = rand(0, TAU);
        l.vx = breeze(time); l.vy = 0;
        l.state = AIR; l.t = 0; l.carry = 0; l.home = null; l.alpha = 1;
        if (where === "anywhere") {
            l.x = rand(-0.05, 1.05) * W; l.y = rand(-0.05, 0.9) * H;
            l.alpha = 0;   // 처음 장에서 한꺼번에 튀어나오지 않게 천천히
        } else if (where === "top") {
            l.x = (Math.random() < 0.62 ? rand(0.42, 1.05) : rand(-0.05, 0.42)) * W;
            l.y = -l.size * 0.8;
        } else {
            l.x = W + l.size;
            l.y = rand(0.02, 0.55) * H;
        }
    };
    /** 바닥의 잎이 날아오른다 */
    const lift = (l: Leaf, vx: number, vy: number) => {
        l.state = AIR;
        l.depth = clamp(l.depth, 0.32, 0.6);
        const yaw = l.yaw;
        character(l);
        l.yaw = yaw;
        l.mode = Math.random() < 0.55 ? TUMBLE : FLUTTER;
        l.from.copy(l.q); l.carry = 1;
        l.vx = vx; l.vy = vy;
        l.t = 0;
        if (l.home) { pileGoneAt.set(l.home, time); l.home = null; }
    };
    /** 가지의 잎이 떨어져 나간다 — 그 자리·자세 그대로 지는 잎이 된다 */
    const detach = (h: Hang) => {
        const b = h.base;
        const l = blank();
        const rot = b.dir + Math.PI / 2 + h.d;
        // 잎자루 끝에서 잎 가운데까지 (캔버스 좌표, y 아래로)
        const cx = (0.5 - STEM[0]) * b.size * (b.flip ? -1 : 1), cy = (0.5 - STEM[1]) * b.size;
        l.x = b.at[0] + cx * Math.cos(rot) - cy * Math.sin(rot);
        l.y = b.at[1] + cx * Math.sin(rot) + cy * Math.cos(rot);
        l.depth = 0.45;
        l.size = b.size;
        l.img = b.img; l.hue = b.hue; l.sat = b.sat; l.light = b.light; l.flip = b.flip;
        character(l);
        l.mode = Math.random() < 0.65 ? FLUTTER : TUMBLE;
        l.yaw = -rot;   // 화면에서 같은 쪽을 가리키게 (위에서 내려다본 셈)
        hangPose(l.from, rot, h.pitch, h.roll);
        l.q.copy(l.from);
        l.carry = 1;
        l.vx = (breeze(time) + gustAt(l.x)) * 0.6; l.vy = -26 * K;
        l.alpha = clamp(b.alpha * h.fade + 0.2, 0, 1);
        l.state = AIR;
        leaves.push(l);
        h.gone = true;
        h.regrowAt = time + rand(40, 90);
    };
    /** 처음부터 놓인 잎 더미의 한 장 — canopyLayout.ground 의 자리에 눕혀 */
    let pileGoneAt = new Map<CanopyLeaf, number>();
    const pile = (home: CanopyLeaf, fadeIn = false) => {
        const l = blank();
        const s = home.size;
        const rot = home.dir + Math.PI / 2;
        l.size = s; l.img = home.img; l.hue = home.hue; l.sat = home.sat; l.light = home.light; l.flip = home.flip;
        // 잎 가운데 — 잎자루 끝(home.at)에서
        const cx = (0.5 - STEM[0]) * s * (home.flip ? -1 : 1), cy = (0.5 - STEM[1]) * s;
        l.x = home.at[0] + cx * Math.cos(rot) - cy * Math.sin(rot);
        l.y = home.at[1] + cx * Math.sin(rot) + cy * Math.cos(rot);
        l.depth = 0.45; l.state = REST; l.restUntil = Infinity; l.home = home;
        l.elev = rand(1.1, 1.35); l.yaw = -rot; l.az = rand(0, TAU); l.tilt = rand(0.05, 0.2); l.curl = 0.16;
        flatPose(l.q, l.elev, l.yaw, l.az, l.tilt);
        l.alpha = fadeIn ? 0 : home.alpha;
        leaves.push(l);
    };

    const groundY = (x: number) => H - (10 + 14 * (1 + Math.sin(x * 0.013) * Math.cos(x * 0.007))) * K;

    const layout = () => {
        measure();
        makeHangs();
        for (let i = leaves.length - 1; i >= 0; i--) if (leaves[i].home) leaves.splice(i, 1);
        pileGoneAt = new Map();
        for (const g of L.ground) pile(g);
    };
    layout();
    for (let i = 0; i < target; i++) { const l = blank(); spawn(l, "anywhere"); leaves.push(l); }

    /* ── 한 걸음 ───────────────────────────────────────────────────── */
    let tilt = { x: 0, y: 0 };
    const step = (dt: number) => {
        time += dt;
        leafUniforms.uTime.value = time0 + time;

        // 돌풍 — 가끔 나무 쪽에서. 잔잔하게면 드물고 약하게
        if (time > nextGust) {
            const strong = Math.random() < 0.28;
            pushGust(-(strong ? rand(170, 240) : rand(90, 150)) * K * (gentle ? 0.55 : 1));
            nextGust = time + (gentle ? rand(30, 55) : rand(11, 26));
        }
        while (gusts.length && time - gusts[0].t0 > 14) gusts.shift();

        // 손 기운이 빠진다
        if (performance.now() - hand.at > 60) { const f = Math.exp(-dt * 10); hand.vx *= f; hand.vy *= f; }
        const handSpeed = Math.hypot(hand.vx, hand.vy);
        // 폰: 기울인 쪽으로 바람
        const tiltWind = parallax.source === "tilt" ? tilt.x * 70 * K : 0;
        const base = breeze(time) + tiltWind;

        /* 가지의 잎 — 감쇠 스프링 */
        let gone = 0;
        for (const h of hangs) if (h.gone) gone++;
        const maxGone = Math.max(2, Math.round(hangs.length * 0.15));
        for (const h of hangs) {
            if (h.gone) {
                if (time > h.regrowAt) { h.gone = false; h.grow = 0; h.d = 0; h.v = 0; gone--; }
                continue;
            }
            if (h.grow < 1) h.grow = Math.min(1, h.grow + dt / 2.6);
            const x = h.base.at[0], y = h.base.at[1];
            const g = gustAt(x);
            const wind = base * 0.35 + g;
            const mag = Math.min(1.4, Math.abs(wind) / (150 * K));
            const sway = 0.05 * Math.sin(time * 1.3 + h.phase) + 0.03 * Math.sin(time * 2.9 + h.phase * 1.7);
            const targetD = -wind * 0.0019 * h.gain * h.lever + sway * h.gain;
            let acc = h.w * h.w * (targetD - h.d) - 2 * 0.16 * h.w * h.v;
            // 센 바람 속에선 잎이 제 진동수로 파르르 떤다
            acc += (Math.random() - 0.5) * mag * mag * 60 * h.gain;
            if (handSpeed > 60) {
                const dx = x - hand.x, dy = y - hand.y;
                const f = Math.exp(-((dx * dx + dy * dy) / (130 * 130 * K * K)));
                if (f > 0.02) {
                    const torque = Math.cos(h.base.dir) * clamp(hand.vy, -1600, 1600) - h.lever * clamp(hand.vx, -1600, 1600);
                    acc += torque * f * 0.016;
                    // 세게 치면 한 장 떨어진다
                    if (f > 0.5 && handSpeed > 1300 && h.grow >= 1 && gone < maxGone && Math.random() < dt * 1.5) { detach(h); gone++; continue; }
                }
            }
            h.v += acc * dt;
            h.d = clamp(h.d + h.v * dt, -0.6, 0.6);
            if (Math.abs(h.d) === 0.6) h.v *= 0.5;
            // 비틀림: 늘 조금, 바람이 세면 빠르게 — 옅은 뒷면과 비치는 빛이 반짝인다
            h.roll = 0.16 * Math.sin(time * 1.7 + h.phase) + h.d * 0.8 + mag * 0.55 * Math.sin(time * (5.5 + (h.phase % 1.5)) + h.phase * 3);
            h.pitch = 0.06 * Math.sin(time * 1.1 + h.phase) - mag * 0.28;
            // 떨어져 나가기 — 돌풍이 셀 때 몇 장, 그리고 아주 가끔
            if (h.grow >= 1 && gone < maxGone) {
                const strength = Math.max(0, Math.abs(g) - 60 * K) / (150 * K);
                const p = dt * ((gentle ? 0 : 1 / (hangs.length * 28)) + strength * strength * 0.03);
                if (Math.random() < p) { detach(h); gone++; }
            }
        }

        /* 누른 자리의 회오리 */
        for (let k = vortices.length - 1; k >= 0; k--) {
            const v = vortices[k];
            v.age += dt;
            if (v.age > 1.4) { vortices.splice(k, 1); continue; }
            const fade = (1 - v.age / 1.4) ** 2;
            const R = 0.22 * Math.max(W, H);
            for (const l of leaves) {
                if (l.state !== AIR) continue;
                const dx = l.x - v.x, dy = l.y - v.y;
                const r = Math.hypot(dx, dy) + 1;
                const f = Math.exp(-((r / R) ** 2)) * fade;
                if (f < 0.02) continue;
                const a = 900 * f * dt;
                l.vx += (-dy / r * v.sign - dx / r * 0.3) * a;
                l.vy += (dx / r * v.sign - dy / r * 0.3) * a;
                l.spin += f * dt * 8;
            }
        }

        /* 지는 잎·바닥의 잎 */
        let air = 0, resting = 0;
        for (const l of leaves) {
            if (l.state === AIR) air++;
            else if (!l.home) resting++;
        }
        for (let i = leaves.length - 1; i >= 0; i--) {
            const l = leaves[i];
            l.t += dt;
            if (l.state === AIR) {
                const g = gustAt(l.x);
                const near = 1 - l.depth;
                turbulence(l.x, l.y, time, 12 * K * (1 + Math.abs(g) / (120 * K)));
                const wx = (base + g) * (0.75 + 0.6 * near) + turb.x;
                l.vx += (wx - l.vx) * (1 - Math.exp(-dt / l.tau));
                l.vy += (turb.y * (0.6 + 0.6 * near) - l.vy) * (1 - Math.exp(-dt * 1.2));
                if (l.alpha < 1) l.alpha = Math.min(1, l.alpha + dt * 1.2);
                // 손 — 지나가는 둘레의 잎이 손의 빠르기를 받아 쓸린다
                if (handSpeed > 40) {
                    const dx = l.x - hand.x, dy = l.y - hand.y;
                    const R = 0.15 * Math.max(W, H);
                    const f = Math.exp(-((dx * dx + dy * dy) / (R * R)));
                    if (f > 0.03) {
                        const take = Math.min(1, dt * 5) * f;
                        l.vx += (hand.vx * 0.7 - l.vx) * take * 0.6;
                        l.vy += hand.vy * 0.5 * take * 0.4;
                        l.spin += f * Math.min(1, handSpeed / 1400) * dt * 6;
                        l.yaw += f * Math.min(1, handSpeed / 1400) * dt * 3;
                    }
                }
                const gustK = Math.min(1.5, Math.abs(g) / (150 * K));
                l.grow = 1;
                if (l.mode === FLUTTER) {
                    // 진자: 가운데서 빨리 내려오고, 끝에서 앞쪽 가장자리가 들려 멈칫했다(살짝 솟는다) 반대로 미끄러진다
                    l.phase += l.freq * dt * (0.78 + 0.44 * Math.abs(Math.cos(l.phase)));
                    const c = Math.cos(l.phase), s = Math.sin(l.phase);
                    const swing = l.amp * l.freq * c;
                    l.x += (l.vx + swing * Math.cos(l.az)) * dt;
                    // 깊이 쪽으로 흔들리면 다가올 때 조금 내려와 보이고 커진다
                    l.y += (l.descent * (1.25 * c * c - 0.1) + swing * Math.sin(l.az) * 0.3 + l.vy) * dt;
                    l.grow = 1 + 0.06 * s * Math.sin(l.az);
                    l.yaw += l.yawRate * dt;
                    flatPose(pose, l.elev, l.yaw, l.az, l.tilt * s);
                } else if (l.mode === TUMBLE) {
                    l.spin += l.spinRate * (1 + gustK * 0.8) * dt;
                    l.x += (l.vx + l.side * 24 * K) * dt;
                    l.y += (l.descent * 0.72 + l.vy) * dt;
                    l.yaw += l.yawRate * 0.6 * dt;
                    // 도는 축은 화면 가로 언저리 — 축이 화면 안쪽을 향하면 잎이 옆모습으로만 돈다
                    tumblePose(pose, l.elev, 0.55 * Math.sin(l.yaw), l.spin);
                } else {
                    // 한쪽으로 기울어 길게 미끄러진다 (앞쪽 가장자리가 낮다)
                    l.phase += l.freq * 0.45 * dt;
                    l.x += (l.vx + l.side * l.descent * 0.55) * dt;
                    l.y += (l.descent * 0.32 + l.vy + 16 * K * Math.sin(l.phase)) * dt;
                    l.yaw += l.yawRate * 0.5 * dt;
                    flatPose(pose, l.elev, l.yaw, 0, -l.side * (0.38 + 0.1 * Math.sin(l.phase)));
                }
                // 앞 자세에서 이어 돈다
                if (l.carry > 0) {
                    l.carry = Math.max(0, l.carry - dt / 0.8);
                    l.q.slerpQuaternions(pose, l.from, smooth(l.carry));
                } else l.q.copy(pose);
                // 가끔(돌풍 속에선 자주) 몸짓을 바꾼다 — 흔들리다 돌기 시작하거나 그 반대
                if (Math.random() < dt * (0.05 + gustK * 0.35)) {
                    l.from.copy(l.q); l.carry = 1;
                    l.mode = gustK > 0.4 ? TUMBLE : l.mode === TUMBLE ? FLUTTER : Math.random() < 0.6 ? TUMBLE : GLIDE;
                }

                // 바닥에 내려앉기 — 가깝거나 가운데 깊이의 잎만, 반쯤
                if (landing && l.depth < 0.7 && l.y > groundY(l.x) - l.size * 0.15 && l.x > landFrom && l.x < W) {
                    if (resting < 10 && Math.random() < 0.5) {
                        l.state = LANDING; l.t = 0; l.landY = Math.min(H - l.size * 0.2, groundY(l.x));
                        l.from.copy(l.q);
                        l.elev = rand(1.1, 1.35); l.az = rand(0, TAU); l.tilt = rand(0.05, 0.2);
                        l.depth = clamp(l.depth, 0.35, 0.55);
                        air--; resting++;
                        continue;
                    }
                    l.depth = Math.max(l.depth, 0.72); // 지나쳐 화면 아래로
                }
                // 화면 밖으로 나가면 다시
                if (l.y > H + l.size || l.x < -l.size * 1.5 - W * 0.1 || l.x > W * 1.1 + l.size * 1.5 || l.y < -H * 0.6) {
                    if (air > target) { leaves.splice(i, 1); air--; continue; }
                    spawn(l, gustAt(W) < -100 * K && Math.random() < 0.6 ? "right" : "top");
                }
            } else if (l.state === LANDING) {
                // 마지막 흔들림을 멈추고 그 자리에 눕는다
                const k = smooth(l.t / 0.5);
                l.y = lerp(l.y, l.landY, Math.min(1, dt * 9));
                l.x += l.vx * dt * (1 - k);
                l.vx *= Math.exp(-dt * 4);
                l.q.slerpQuaternions(l.from, flatPose(pose, l.elev, l.yaw, l.az, l.tilt), k);
                if (l.t > 0.5) { l.state = REST; l.t = 0; l.restUntil = time + rand(35, 75); }
            } else if (l.state === REST) {
                if (l.home && l.alpha < l.home.alpha) l.alpha = Math.min(l.home.alpha, l.alpha + dt / 2);
                const g = gustAt(l.x);
                // 커서로 세게 쓸면 날아오른다
                if (handSpeed > 520 && (l.x - hand.x) ** 2 + (l.y - hand.y) ** 2 < (110 * K) ** 2) {
                    lift(l, clamp(hand.vx, -900, 900) * 0.45, -(160 + Math.min(handSpeed, 1600) * 0.22));
                }
                // 센 돌풍이면 바닥의 잎도 조금 들썩인다
                else if (Math.abs(g) > 190 * K && Math.random() < dt * 0.25) lift(l, g * 0.6, -rand(90, 160) * K);
                else if (time > l.restUntil) { l.state = FADING; l.t = 0; }
            } else {
                l.alpha -= dt / 2.6;
                if (l.alpha <= 0) leaves.splice(i, 1);
            }
        }
        // 모자라면 위에서(돌풍 중엔 나무 쪽 옆에서도) 새로
        for (let n = air; n < target; n++) {
            const l = blank();
            spawn(l, gustAt(W) < -100 * K && Math.random() < 0.5 ? "right" : "top");
            leaves.push(l);
        }
        // 날아간 더미의 잎은 한참 뒤 제자리에 다시 놓인다
        for (const [home, at] of pileGoneAt) if (time - at > 45) { pileGoneAt.delete(home); pile(home, true); }
    };

    /* ── 그리기 ───────────────────────────────────────────────────── */
    const m4 = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const off = new THREE.Vector3();
    const order: Leaf[] = [];
    const leafAlpha = opts.dark ? 0.9 : 0.96;

    /**
     * 판 한 장 놓기 — (x, y) 는 화면 px(아래로 +), q 는 자세. pivot 이면 잎자루 끝을 (x, y) 에, 아니면 잎 가운데를.
     * shadow 는 그림자를 옮길 만큼(px, 화면 방향).
     */
    const put = (ly: Layer, l: Look, size: number, x: number, y: number, q: Quat, pivot: boolean,
        alpha: number, blur: number, far: number, curl: number, flutter: number, shadow: number[] | null) => {
        const i = ly.n;
        if (i >= ly.cap || alpha <= 0.003) return;
        const s = size * QUAD;
        if (pivot) off.set((l.flip ? -PIVOT_X : PIVOT_X) * s, PIVOT_Y * s, 0).applyQuaternion(q);
        else off.set(0, 0, 0);
        pos.set(x - off.x, -y - off.y, -off.z);
        sc.set(s, s, s);
        m4.compose(pos, q, sc);
        ly.mesh.setMatrixAt(i, m4);
        if (ly.shadow && shadow) {
            pos.x += shadow[0]; pos.y -= shadow[1];
            m4.compose(pos, q, sc);
            ly.shadow.setMatrixAt(i, m4);
        }
        ly.aLeaf.setXYZW(i, l.img, curl, flutter, clamp(alpha, 0, 1));
        ly.aTone.setXYZW(i, (l.hue * Math.PI) / 180, l.sat, l.light, blur);
        ly.aMisc.setXY(i, far, l.flip ? 1 : 0);
        ly.n++;
    };

    const write = () => {
        for (const ly of layers) ly.n = 0;
        const p = tilt;
        const k = L.k;

        // 바닥 — 누운 잎
        for (const l of leaves) {
            if (l.state === AIR) continue;
            put(groundL, l, l.size, l.x, l.y, l.q, false, l.alpha * leafAlpha, 0, 0, l.curl * 0.6, l.flutter, [-2 * k, 3.5 * k]);
        }
        // 가지의 잎
        const shadowC = [-4 * k, 9 * k];
        for (const h of hangs) {
            if (h.gone) continue;
            const b = h.base;
            const grow = smooth(h.grow);
            hangPose(pose, b.dir + Math.PI / 2 + h.d, h.pitch, h.roll);
            put(canopyL, b, b.size * (0.7 + 0.3 * grow), b.at[0], b.at[1], pose, true, b.alpha * h.fade * grow, 0, 0, 0.15, h.phase, shadowC);
        }
        // 지는 잎 — 먼 잎부터. 먼 잎(0.62 넘게)은 가지 뒤 겹에
        order.length = 0;
        for (const l of leaves) if (l.state === AIR) order.push(l);
        order.sort((a, b) => b.depth - a.depth);
        for (const l of order) {
            const near = 1 - l.depth;
            const par = near * near * 14 * K;
            const blur = smooth((0.2 - l.depth) / 0.2);
            const far = smooth((l.depth - 0.6) / 0.4) * 0.9;
            const liftH = lerp(28, 8, l.depth) * K;
            put(l.depth > 0.62 ? farL : fallL, l, l.size * l.grow, l.x - p.x * par, l.y - p.y * par * 0.6, l.q, false,
                l.alpha * leafAlpha, blur, far, l.curl, l.flutter, [-0.45 * liftH, liftH]);
        }
        // 아주 가까운 잎 — 맨 앞, 크게 흐리게. 조금 흔들리고 커서 쪽으로 살짝 어긋난다
        for (const b of L.bokeh) {
            const g = gustAt(b.at[0]);
            const sway = 0.03 * Math.sin(time * 0.5 + b.size) - g * 0.0004;
            hangPose(pose, b.dir + Math.PI / 2 + sway, 0, 0.06 * Math.sin(time * 0.4));
            put(frontL, b, b.size, b.at[0] - p.x * 22 * K, b.at[1] - p.y * 12 * K, pose, true, b.alpha * canopyFade(L, b.at[0], b.at[1]), 1, 0, 0.1, 0, null);
        }

        for (const ly of layers) {
            ly.mesh.count = ly.n;
            ly.mesh.instanceMatrix.needsUpdate = true;
            if (ly.shadow) { ly.shadow.count = ly.n; ly.shadow.instanceMatrix.needsUpdate = true; }
            ly.aLeaf.needsUpdate = true;
            ly.aTone.needsUpdate = true;
            ly.aMisc.needsUpdate = true;
        }
    };

    /* ── 돌리기 ───────────────────────────────────────────────────── */
    let raf = 0;
    let disposed = false;
    let last = performance.now();
    let slow = 0, frames = 0, demoted = false;
    let boxHidden = false;
    const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (document.hidden || boxHidden || dt <= 0) return;
        // 프레임이 계속 늦으면 한 번 낮춘다 (해상도 1, 지는 잎 7할)
        if (!demoted) {
            frames++;
            if (dt > 0.026) slow++;
            if (frames >= 180) {
                if (slow > frames * 0.5) {
                    demoted = true;
                    renderer.setPixelRatio(1);
                    lowFactor = 0.7;
                    measure();
                }
                frames = 0; slow = 0;
            }
        }
        if (interactive) tilt = parallax.read();
        step(dt);
        write();
        renderer.render(scene, camera);
    };

    const onResize = () => {
        const ow = W, oh = H;
        layout();
        // 지는 잎은 비율대로 옮긴다
        for (const l of leaves) if (!l.home) { l.x *= W / ow; l.y *= H / oh; if (l.state !== AIR) l.landY *= H / oh; }
        if (motion === "off") { write(); renderer.render(scene, camera); }
    };
    let resizeTimer = 0;
    const ro = new ResizeObserver((entries) => {
        const r = entries[entries.length - 1]?.contentRect;
        // 숨겨진 상자(아주 작은 가로 화면에서 바탕을 걷는다 등)에는 그리지 않는다
        boxHidden = !r || r.width < 2 || r.height < 2;
        // 관찰을 걸면 곧바로 한 번 부른다 — 크기가 그대로면 넘긴다
        if (boxHidden || (Math.round(r.width) === W && Math.round(r.height) === H)) return;
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(onResize, 120);
    });
    ro.observe(canvas);

    const api: WindScene = {
        gust(dir: number, strength = 1) {
            if (motion === "off") return;
            pushGust(dir * rand(150, 210) * K * strength * (gentle ? 0.6 : 1), 0.45, rand(0.5, 0.9), 2);
        },
        dispose() {
            disposed = true;
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.clearTimeout(resizeTimer);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener(GUST_EVENT, onGust);
            stopParallax();
            for (const ly of layers) { ly.geo.dispose(); ly.mesh.dispose(); ly.shadow?.dispose(); }
            leafMat.dispose(); shadowMat.dispose();
            sharp.dispose(); soft.dispose();
            // 밝기·움직임을 바꾸면 같은 캔버스에 새 렌더러가 선다 — 남은 뒤집기·미리 곱하기 설정에 three 가 경고를 냈다
            const gl = renderer.getContext();
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            renderer.dispose();
        },
    };

    // 첫 장 — 그린 뒤 한 프레임 지나 알린다 (부르는 쪽이 캔버스 가지를 뒤판만 남긴다)
    step(1 / 60);
    write();
    renderer.render(scene, camera);
    requestAnimationFrame(() => { if (!disposed) opts.onReady(); });
    if (motion !== "off") {
        last = performance.now();
        raf = requestAnimationFrame(tick);
    }
    return api;
}
