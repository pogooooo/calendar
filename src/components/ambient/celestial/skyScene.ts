/**
 * Celestial 바탕 하늘 — three.js 장면 (CelestialSky 가 처음 그릴 때 받아 온다).
 *
 * 카메라는 천구 한가운데에서 북쪽 하늘을 올려다본다. 천구 북극은 화면 오른쪽 위 모서리 가까이에 있고,
 * 하늘은 그 둘레를 천천히 돈다(일주운동을 빠르게). 처음 한 장은 지금 서울 하늘의 실제 자세다.
 *   - 적경·적위 눈금(별도에 새긴 선), 적도에는 1°·5°·15° 눈금, 점선 황도와 궁의 경계 눈금
 *   - 실제 밝은 별과 별자리 선(선은 별 앞에서 살짝 끊긴다), 밝은 별은 네 갈래 빛(✦), 별은 저마다 천천히 깜빡인다
 *   - 어두운 벌에서만: 은하수 띠(은하 좌표의 잡음)
 *   - 누르면: 그 자리에 금빛 고리가 번지고, 가장 가까운 별자리가 선을 차례로 그으며 밝아졌다가 이름과 함께 사라진다
 * 글을 가리지 않는다: 글·단추·판이 놓인 자리(setMask — skyMask 가 읽은 사각형)에서는 별·선·눈금·고리·이름이 모두 비킨다.
 * 눈금은 별보다 가까운 구(반지름 70)에 있어서, 시차로 카메라가 움직이면 별 위를 살짝 미끄러진다.
 */
import * as THREE from "three";
import { CONSTELLATIONS, GALACTIC_CENTER, GALACTIC_POLE, LONE_STARS, STAR_TINT } from "./skyCatalog";

const D2R = Math.PI / 180;
const R_STARS = 100;
const R_NAMES = 96;
const R_GRID = 70;
const R_RIPPLE = 66;
const R_MILK = 120;
export const MAX_CON = 32;
const LAT = 37.57; // 서울 — 천구 북극이 북쪽 지평선 위로 이만큼
const LON = 126.98;
/** 하늘이 도는 빠르기(도/초) — 실제의 50배쯤. 한 바퀴 30분 */
const SIDEREAL = 0.2;

/** 적경·적위(도) → 단위 벡터. y 가 천구 북극, 안에서 보아 동쪽이 왼쪽 */
export function radec(ra: number, dec: number, r = 1, out = new THREE.Vector3()) {
    const a = ra * D2R, d = dec * D2R;
    return out.set(Math.cos(d) * Math.cos(a) * r, Math.sin(d) * r, -Math.cos(d) * Math.sin(a) * r);
}

/** 지금 서울의 지방 항성시(도) */
function siderealDeg(date = new Date()) {
    const d = date.getTime() / 86_400_000 - 10_957.5;
    return (((280.46061837 + 360.98564736629 * d + LON) % 360) + 360) % 360;
}

/** 시드 난수 — 별 자리가 열 때마다 같다 */
function rng(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

/** 등급 → 점 크기(CSS px) */
const sizeFor = (mag: number) => Math.max(1.1, Math.min(6, 4.6 - 0.62 * mag));
/** 등급 → 밝기(0~1) */
const lumFor = (mag: number) => Math.max(0.2, Math.min(1, 1.02 - mag * 0.135));

/* ── 셰이더 ──────────────────────────────────────────────────────────── */

/**
 * 글을 가리지 않게 — Celestial 은 글이 하늘 위에 바로 앉는다(유리 판이 없다).
 *   clear(): 글·단추·판이 놓인 자리(skyMask 가 모은 사각형을 흐리게 칠한 지도 uMask)에서는 0 — 하늘이 아예 비킨다.
 *   calm():  빈 자리라도 화면 위쪽 띠와 바깥 가장자리(사이드바 옆선·오른쪽·아래)에서만 온전하고, 가운데는 바닥값(uFloor)만큼.
 * gl_FragCoord 는 캔버스 px(= 화면 CSS px, 왼쪽 아래가 원점).
 */
const CALM = /* glsl */ `
uniform sampler2D uMask;
uniform vec2 uRes;
uniform float uLeft;
uniform float uEdge;
uniform vec2 uTop;
uniform float uFloor;
float calm() {
    vec2 p = gl_FragCoord.xy;
    float fromTop = (uRes.y - p.y) / uRes.y;
    float top = 1.0 - smoothstep(uTop.x, uTop.y, fromTop);
    float d = min(min(p.x - uLeft, uRes.x - p.x), p.y);
    float edge = uEdge > 0.0 ? 1.0 - smoothstep(uEdge * 0.18, uEdge, d) : 0.0;
    return mix(uFloor, 1.0, max(top, edge));
}
float clear() {
    // 칠한 자리는 알파에 담긴다(흐린 가장자리까지)
    return 1.0 - smoothstep(0.06, 0.5, texture2D(uMask, gl_FragCoord.xy / uRes).a);
}
`;

const STAR_VERT = /* glsl */ `
attribute float aSize;
attribute float aLum;
attribute float aSeed;
attribute float aCon;
attribute float aWarm;
uniform float uTime;
uniform float uTwinkle;
uniform float uScale;
uniform float uGlow[${MAX_CON}];
varying float vAlpha;
varying float vWarm;
varying float vGlint;
varying float vLit;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    float glow = aCon >= 0.0 ? uGlow[int(aCon + 0.5)] : 0.0;
    float tw = 0.5 + 0.5 * sin(uTime * (0.7 + fract(aSeed * 13.7) * 1.9) + aSeed * 61.0);
    // 어두운 별일수록 더 깜빡인다
    float depth = mix(0.55, 0.16, clamp((aSize - 1.2) / 2.8, 0.0, 1.0));
    vAlpha = aLum * (1.0 - uTwinkle * depth * tw) * (1.0 + glow * 0.9);
    vLit = glow;
    vWarm = aWarm;
    vGlint = step(3.9, aSize);
    float s = aSize * (1.0 + glow * 0.6);
    gl_PointSize = s * uScale * (vGlint > 0.5 ? 4.2 : 2.4);
}
`;

const STAR_FRAG = /* glsl */ `
${CALM}
uniform vec3 uCore;
uniform vec3 uWarm;
uniform vec3 uCool;
uniform float uHalo;
uniform float uOpacity;
varying float vAlpha;
varying float vWarm;
varying float vGlint;
varying float vLit;
void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r = length(p);
    float a;
    if (vGlint > 0.5) {
        // 네 갈래 빛(✦) — 오목한 별 모양 + 작은 심
        vec2 q = abs(p);
        float d = sqrt(q.x) + sqrt(q.y);
        float star = 1.0 - smoothstep(0.7, 0.8, d);
        float core = 1.0 - smoothstep(0.12, 0.24, r);
        a = max(star * 0.9, core) + (1.0 - smoothstep(0.0, 0.85, r)) * uHalo * 0.4;
    } else {
        float core = 1.0 - smoothstep(0.3, 0.5, r);
        a = core + (1.0 - smoothstep(0.0, 1.0, r)) * uHalo * 0.3;
    }
    vec3 tint = vWarm > 0.0 ? mix(uCore, uWarm, vWarm) : mix(uCore, uCool, -vWarm);
    float alpha = a * vAlpha * uOpacity * mix(calm(), 1.0, vLit) * clear();
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(tint, min(alpha, 1.0));
    #include <colorspace_fragment>
}
`;

const LINE_VERT = /* glsl */ `
attribute float aCon;
attribute float aT;
uniform float uGlow[${MAX_CON}];
uniform float uDraw[${MAX_CON}];
varying float vT;
varying float vGlow;
varying float vDraw;
void main() {
    int i = int(aCon + 0.5);
    vGlow = uGlow[i];
    vDraw = uDraw[i];
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const LINE_FRAG = /* glsl */ `
${CALM}
uniform vec3 uColor;
uniform float uBase;
uniform float uHigh;
uniform float uOpacity;
varying float vT;
varying float vGlow;
varying float vDraw;
void main() {
    float drawn = step(vT, vDraw);
    float base = uBase * calm();
    float a = (base + (uHigh - base) * vGlow * drawn) * clear();
    gl_FragColor = vec4(uColor, a * uOpacity);
    #include <colorspace_fragment>
}
`;

const GRID_VERT = /* glsl */ `
attribute float aAlpha;
attribute float aDash;
varying float vAlpha;
varying float vDash;
void main() {
    vAlpha = aAlpha;
    vDash = aDash;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GRID_FRAG = /* glsl */ `
${CALM}
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
varying float vDash;
void main() {
    // 점선(황도): vDash 가 0 보다 크면 그 값의 소수부로 끊는다
    if (vDash > 0.0 && fract(vDash) > 0.5) discard;
    gl_FragColor = vec4(uColor, vAlpha * uOpacity * calm() * clear());
    #include <colorspace_fragment>
}
`;

const MILK_VERT = /* glsl */ `
attribute float aB;
varying float vB;
varying vec3 vDir;
void main() {
    vB = aB;
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MILK_FRAG = /* glsl */ `
${CALM}
uniform vec3 uColor;
uniform float uOpacity;
uniform vec3 uCenter;
varying float vB;
varying vec3 vDir;
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
void main() {
    vec3 p = vDir * 7.0;
    float n = noise(p) * 0.55 + noise(p * 2.3) * 0.3 + noise(p * 5.1) * 0.15;
    float band = exp(-pow(vB / 8.0, 2.0));
    float wide = exp(-pow(vB / 18.0, 2.0)) * 0.35;
    // 은하 중심 쪽(궁수·전갈)이 더 밝고, 가운데로 어두운 먼지 띠가 지난다
    float bulge = 0.55 + 0.6 * pow(max(dot(vDir, uCenter), 0.0), 3.0);
    float rift = 1.0 - 0.6 * exp(-pow((vB - 0.8) / 1.8, 2.0)) * smoothstep(0.35, 0.75, noise(p * 1.6 + 3.0));
    float I = (band * (0.35 + 0.9 * n) + wide * n) * bulge * rift;
    gl_FragColor = vec4(uColor, I * uOpacity * calm() * clear());
    #include <colorspace_fragment>
}
`;

const NAME_VERT = /* glsl */ `
uniform vec2 uSize;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mv.xy += position.xy * uSize;
    gl_Position = projectionMatrix * mv;
}
`;

const NAME_FRAG = /* glsl */ `
${CALM}
uniform sampler2D uMap;
uniform float uOpacity;
varying vec2 vUv;
void main() {
    vec4 c = texture2D(uMap, vUv);
    float a = c.a * uOpacity * clear();
    if (a < 0.004) discard;
    gl_FragColor = vec4(c.rgb, a);
    #include <colorspace_fragment>
}
`;

const RIPPLE_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const RIPPLE_FRAG = /* glsl */ `
${CALM}
uniform vec3 uColor;
uniform float uAge;
uniform float uOpacity;
varying vec2 vUv;
void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float e = 1.0 - pow(1.0 - uAge, 3.0);
    float w = fwidth(r);
    // 바깥 고리 — 가는 실선
    float r1 = mix(0.06, 0.96, e);
    float ring1 = 1.0 - smoothstep(0.0, w * 1.6, abs(r - r1) - 0.006);
    // 안쪽 고리 — 24 칸 눈금처럼 끊긴 선, 조금 늦게
    float r2 = mix(0.02, 0.66, e);
    float ang = atan(p.y, p.x) / 6.2831853;
    float dash = step(0.42, fract(ang * 24.0));
    float ring2 = (1.0 - smoothstep(0.0, w * 1.6, abs(r - r2) - 0.004)) * dash;
    // 처음 한순간 가운데 네 갈래 빛
    vec2 q = abs(p) * mix(9.0, 4.5, uAge);
    float star = (1.0 - smoothstep(0.55, 0.75, sqrt(q.x) + sqrt(q.y))) * (1.0 - smoothstep(0.0, 0.35, uAge));
    float fade = pow(1.0 - uAge, 1.5);
    float a = ((ring1 * 0.95 + ring2 * 0.6) * fade + star) * clear();
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a * uOpacity);
    #include <colorspace_fragment>
}
`;

/* ── 빛깔 ──────────────────────────────────────────────────────────── */

interface Palette {
    grid: THREE.Color; gridOpacity: number;
    line: THREE.Color; lineBase: number; lineHigh: number;
    core: THREE.Color; warm: THREE.Color; cool: THREE.Color; halo: number; starOpacity: number;
    label: THREE.Color; labelOpacity: number;
    milk: THREE.Color; milkOpacity: number;
    ripple: THREE.Color;
    blending: THREE.Blending;
}

function palette(dark: boolean, primary: string): Palette {
    const gold = new THREE.Color(primary);
    if (dark) {
        return {
            grid: gold.clone(), gridOpacity: 1,
            line: gold.clone().lerp(new THREE.Color("#FFF3D0"), 0.2), lineBase: 0.17, lineHigh: 0.85,
            core: new THREE.Color("#FFF6E2"), warm: new THREE.Color("#FFCF8A"), cool: new THREE.Color("#D8E4FF"), halo: 1, starOpacity: 1,
            label: gold.clone(), labelOpacity: 0.4,
            milk: new THREE.Color("#B9C6EA"), milkOpacity: 0.3,
            ripple: gold.clone().lerp(new THREE.Color("#FFF1C4"), 0.25),
            blending: THREE.AdditiveBlending,
        };
    }
    // 아이보리 종이 위 — 먹이 섞인 금으로, 낮은 대비
    const ink = gold.clone().lerp(new THREE.Color("#5C4614"), 0.42);
    return {
        grid: ink.clone(), gridOpacity: 0.82,
        line: ink.clone(), lineBase: 0.13, lineHigh: 0.7,
        core: gold.clone().lerp(new THREE.Color("#4E3A0E"), 0.38), warm: gold.clone().lerp(new THREE.Color("#6B3C0C"), 0.45), cool: gold.clone().lerp(new THREE.Color("#3E4256"), 0.4), halo: 0, starOpacity: 0.85,
        label: ink.clone(), labelOpacity: 0.42,
        milk: ink.clone(), milkOpacity: 0,
        ripple: gold.clone().lerp(new THREE.Color("#7A5A16"), 0.25),
        blending: THREE.NormalBlending,
    };
}

/* ── 장면 ──────────────────────────────────────────────────────────── */

export interface SkyOptions {
    dark: boolean;
    primary: string;
    lite: boolean;
    /** 화면 px 당 그리는 px — 캔버스를 줄여 그리면 점 크기도 같이 */
    scale: number;
}

/** 오래 남는 하늘의 자세(바퀴 수) — 테마를 바꿔 장면을 새로 만들어도 하늘이 튀지 않게 */
const persisted = { angle: NaN };

export function createSky(renderer: THREE.WebGLRenderer, opts: SkyOptions) {
    const { dark, lite } = opts;
    const pal = palette(dark, opts.primary);
    const disposables: { dispose(): void }[] = [];
    const keep = <T extends { dispose(): void }>(x: T) => { disposables.push(x); return x; };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 400);
    const sky = new THREE.Group();
    scene.add(sky);

    // 천구 북극(sky +Y)을 북쪽 지평선 위 LAT 도로 — 그다음 북극 둘레로 돈다
    const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -(90 - LAT) * D2R);
    const spinQ = new THREE.Quaternion();
    const Y = new THREE.Vector3(0, 1, 0);
    if (Number.isNaN(persisted.angle)) persisted.angle = (270 - siderealDeg()) * D2R;
    const setSpin = () => {
        spinQ.setFromAxisAngle(Y, persisted.angle);
        sky.quaternion.copy(tilt).multiply(spinQ);
    };
    setSpin();

    const glow = new Float32Array(MAX_CON);
    const draw = new Float32Array(MAX_CON);
    const uScale = { value: opts.scale };
    const uTime = { value: (performance.now() / 1000) % 1000 };
    const uTwinkle = { value: 1 };
    // 글 자리 지도(setMask 가 칠한다) — 화면의 1/4 크기, 처음에는 비어 있다
    const maskCanvas = document.createElement("canvas");
    const maskSharp = document.createElement("canvas");
    maskCanvas.width = maskSharp.width = 4;
    maskCanvas.height = maskSharp.height = 4;
    const maskTex = keep(new THREE.CanvasTexture(maskCanvas));
    maskTex.colorSpace = THREE.NoColorSpace;
    maskTex.generateMipmaps = false;
    maskTex.minFilter = THREE.LinearFilter;
    maskTex.magFilter = THREE.LinearFilter;
    // 고요한 자리(CALM) — 모든 재질이 같은 값을 나눠 쓴다
    const calmU = {
        uMask: { value: maskTex },
        uRes: { value: new THREE.Vector2(1, 1) },
        uLeft: { value: 0 },
        uEdge: { value: 160 },
        uTop: { value: new THREE.Vector2(0.12, 0.3) },
        uFloor: { value: 0.5 },
    };

    /* 은하수 (어두운 벌만) */
    if (dark && pal.milkOpacity > 0) {
        const zg = radec(GALACTIC_POLE[0], GALACTIC_POLE[1]);
        const xg = radec(GALACTIC_CENTER[0], GALACTIC_CENTER[1]);
        xg.addScaledVector(zg, -zg.dot(xg)).normalize();
        const yg = new THREE.Vector3().crossVectors(zg, xg);
        const L = lite ? 90 : 160, B = lite ? 10 : 14, BMAX = 28;
        const pos: number[] = [], bAttr: number[] = [], idx: number[] = [];
        const v = new THREE.Vector3();
        for (let i = 0; i <= L; i++) {
            const l = (i / L) * Math.PI * 2;
            for (let j = 0; j <= B; j++) {
                const b = (-BMAX + (2 * BMAX * j) / B) * D2R;
                v.set(0, 0, 0)
                    .addScaledVector(xg, Math.cos(b) * Math.cos(l))
                    .addScaledVector(yg, Math.cos(b) * Math.sin(l))
                    .addScaledVector(zg, Math.sin(b))
                    .multiplyScalar(R_MILK);
                pos.push(v.x, v.y, v.z);
                bAttr.push(b / D2R);
                if (i < L && j < B) {
                    const a = i * (B + 1) + j, c = a + B + 1;
                    idx.push(a, c, a + 1, a + 1, c, c + 1);
                }
            }
        }
        const g = keep(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("aB", new THREE.Float32BufferAttribute(bAttr, 1));
        g.setIndex(idx);
        const m = keep(new THREE.ShaderMaterial({
            vertexShader: MILK_VERT, fragmentShader: MILK_FRAG,
            uniforms: { ...calmU, uColor: { value: pal.milk }, uOpacity: { value: pal.milkOpacity }, uCenter: { value: radec(GALACTIC_CENTER[0], GALACTIC_CENTER[1]) } },
            transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
        }));
        const milk = new THREE.Mesh(g, m);
        milk.frustumCulled = false;
        milk.renderOrder = 0;
        sky.add(milk);
    }

    /* 눈금 — 적위 원(10°마다), 시권(1시간마다, 적위 80°까지), 적도 눈금, 점선 황도 */
    {
        const pos: number[] = [], alpha: number[] = [], dash: number[] = [];
        const a = new THREE.Vector3(), b = new THREE.Vector3();
        const seg = (p: THREE.Vector3, q: THREE.Vector3, al: number, da = 0, db = 0) => {
            pos.push(p.x, p.y, p.z, q.x, q.y, q.z);
            alpha.push(al, al);
            dash.push(da, db);
        };
        const g0 = 0.07, gRa = 0.05, gEq = 0.15;
        for (let dec = -30; dec <= 80; dec += 10) {
            const n = 180;
            const al = dec === 0 ? gEq : dec === 80 ? 0.1 : g0;
            for (let i = 0; i < n; i++) {
                radec((i / n) * 360, dec, R_GRID, a);
                radec(((i + 1) / n) * 360, dec, R_GRID, b);
                seg(a, b, al);
            }
        }
        for (let h = 0; h < 24; h++) {
            const ra = h * 15, n = 44;
            const al = h % 6 === 0 ? 0.08 : gRa;
            for (let i = 0; i < n; i++) {
                radec(ra, -40 + (120 * i) / n, R_GRID, a);
                radec(ra, -40 + (120 * (i + 1)) / n, R_GRID, b);
                seg(a, b, al);
            }
        }
        // 적도 눈금 — 1° 짧게, 5° 중간, 15°(한 시간) 길게
        for (let d = 0; d < 360; d++) {
            const len = d % 15 === 0 ? 1.5 : d % 5 === 0 ? 0.8 : 0.4;
            radec(d, 0, R_GRID, a);
            radec(d, len, R_GRID, b);
            seg(a, b, d % 5 === 0 ? 0.2 : 0.13);
        }
        // 북극 둘레(80°) 눈금 — 10°마다
        for (let d = 0; d < 360; d += 10) {
            radec(d, 80, R_GRID, a);
            radec(d, 81.2, R_GRID, b);
            seg(a, b, 0.12);
        }
        // 황도 — 점선(2°마다 끊김), 30°마다 궁의 경계 눈금
        const eps = 23.44 * D2R;
        const ecl = (lam: number, beta: number, out: THREE.Vector3) => {
            const l = lam * D2R, bb = beta * D2R;
            const x = Math.cos(bb) * Math.cos(l), y = Math.cos(bb) * Math.sin(l), z = Math.sin(bb);
            const ra = Math.atan2(y * Math.cos(eps) - z * Math.sin(eps), x) / D2R;
            const dec = Math.asin(z * Math.cos(eps) + y * Math.sin(eps)) / D2R;
            return radec(ra, dec, R_GRID, out);
        };
        for (let i = 0; i < 360; i++) {
            ecl(i, 0, a);
            ecl(i + 1, 0, b);
            seg(a, b, 0.14, i / 1.5 + 0.0001, (i + 1) / 1.5 - 0.0001);
        }
        for (let lam = 0; lam < 360; lam += 30) {
            ecl(lam, -1.2, a);
            ecl(lam, 1.2, b);
            seg(a, b, 0.16);
        }
        const g = keep(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("aAlpha", new THREE.Float32BufferAttribute(alpha, 1));
        g.setAttribute("aDash", new THREE.Float32BufferAttribute(dash, 1));
        const m = keep(new THREE.ShaderMaterial({
            vertexShader: GRID_VERT, fragmentShader: GRID_FRAG,
            uniforms: { ...calmU, uColor: { value: pal.grid }, uOpacity: { value: pal.gridOpacity } },
            transparent: true, depthTest: false, depthWrite: false, blending: pal.blending,
        }));
        const grid = new THREE.LineSegments(g, m);
        grid.frustumCulled = false;
        grid.renderOrder = 1;
        sky.add(grid);
    }

    /* 별자리 선 — 별 앞에서 살짝 끊긴다 */
    const conStars: THREE.Vector3[][] = [];
    const conCenter: THREE.Vector3[] = [];
    {
        const pos: number[] = [], con: number[] = [], tAttr: number[] = [];
        const a = new THREE.Vector3(), b = new THREE.Vector3();
        CONSTELLATIONS.forEach((c, ci) => {
            const pts = c.stars.map(([ra, dec]) => radec(ra, dec));
            conStars.push(pts);
            const center = new THREE.Vector3();
            pts.forEach((p) => center.add(p));
            conCenter.push(center.normalize());
            const n = c.lines.length;
            c.lines.forEach(([i, j], k) => {
                const p = pts[i], q = pts[j];
                const ang = p.angleTo(q);
                const trim = Math.min(0.55 * D2R, ang * 0.18) / Math.max(ang, 1e-6);
                a.copy(p).lerp(q, trim).normalize().multiplyScalar(R_STARS);
                b.copy(q).lerp(p, trim).normalize().multiplyScalar(R_STARS);
                pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
                con.push(ci, ci);
                tAttr.push(k / n, (k + 1) / n);
            });
        });
        const g = keep(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("aCon", new THREE.Float32BufferAttribute(con, 1));
        g.setAttribute("aT", new THREE.Float32BufferAttribute(tAttr, 1));
        const m = keep(new THREE.ShaderMaterial({
            vertexShader: LINE_VERT, fragmentShader: LINE_FRAG,
            uniforms: {
                ...calmU,
                uColor: { value: pal.line }, uBase: { value: pal.lineBase }, uHigh: { value: pal.lineHigh }, uOpacity: { value: 1 },
                uGlow: { value: glow }, uDraw: { value: draw },
            },
            transparent: true, depthTest: false, depthWrite: false, blending: pal.blending,
        }));
        const lines = new THREE.LineSegments(g, m);
        lines.frustumCulled = false;
        lines.renderOrder = 2;
        sky.add(lines);
    }

    /* 별 — 별자리의 별 + 홀로 뜬 밝은 별 + 시드로 흩뿌린 잔별(은하 쪽에 조금 더) */
    {
        const pos: number[] = [], size: number[] = [], lum: number[] = [], seed: number[] = [], con: number[] = [], warm: number[] = [];
        const rand = rng(1907);
        const v = new THREE.Vector3();
        const tintOf = (ra: number, dec: number) => STAR_TINT.find(([r, d]) => Math.abs(r - ra) < 0.05 && Math.abs(d - dec) < 0.05)?.[2] ?? (rand() - 0.4) * 0.5;
        const push = (ra: number, dec: number, mag: number, ci: number) => {
            radec(ra, dec, R_STARS, v);
            pos.push(v.x, v.y, v.z);
            size.push(sizeFor(mag));
            lum.push(lumFor(mag));
            seed.push(rand());
            con.push(ci);
            warm.push(tintOf(ra, dec));
        };
        CONSTELLATIONS.forEach((c, ci) => c.stars.forEach(([ra, dec, mag]) => { if (mag < 8) push(ra, dec, mag, ci); }));
        LONE_STARS.forEach(([ra, dec, mag]) => push(ra, dec, mag, -1));
        const zg = radec(GALACTIC_POLE[0], GALACTIC_POLE[1]);
        const xg = radec(GALACTIC_CENTER[0], GALACTIC_CENTER[1]);
        xg.addScaledVector(zg, -zg.dot(xg)).normalize();
        const yg = new THREE.Vector3().crossVectors(zg, xg);
        const N = lite ? 1400 : 3200;
        for (let i = 0; i < N; i++) {
            let x: number, y: number, z: number;
            if (rand() < (dark ? 0.4 : 0.25)) {
                // 은하 띠 쪽 — 은위가 좁게 몰린다
                const l = rand() * Math.PI * 2;
                const g1 = rand() + rand() + rand() - 1.5;
                const b = g1 * 9 * D2R;
                const t = new THREE.Vector3()
                    .addScaledVector(xg, Math.cos(b) * Math.cos(l))
                    .addScaledVector(yg, Math.cos(b) * Math.sin(l))
                    .addScaledVector(zg, Math.sin(b));
                x = t.x; y = t.y; z = t.z;
            } else {
                const u = rand() * 2 - 1, th = rand() * Math.PI * 2, s = Math.sqrt(1 - u * u);
                x = s * Math.cos(th); y = u; z = s * Math.sin(th);
            }
            const mag = 6.6 - 2.7 * Math.pow(rand(), 3.2);
            pos.push(x * R_STARS, y * R_STARS, z * R_STARS);
            size.push(sizeFor(mag));
            lum.push(dark ? Math.max(0.34, lumFor(mag)) : lumFor(mag) * 0.9);
            seed.push(rand());
            con.push(-1);
            warm.push((rand() - 0.45) * 0.6);
        }
        const g = keep(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
        g.setAttribute("aLum", new THREE.Float32BufferAttribute(lum, 1));
        g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
        g.setAttribute("aCon", new THREE.Float32BufferAttribute(con, 1));
        g.setAttribute("aWarm", new THREE.Float32BufferAttribute(warm, 1));
        const m = keep(new THREE.ShaderMaterial({
            vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
            uniforms: {
                ...calmU,
                uTime, uScale, uTwinkle, uGlow: { value: glow },
                uCore: { value: pal.core }, uWarm: { value: pal.warm }, uCool: { value: pal.cool },
                uHalo: { value: pal.halo }, uOpacity: { value: pal.starOpacity },
            },
            transparent: true, depthTest: false, depthWrite: false, blending: pal.blending,
        }));
        const stars = new THREE.Points(g, m);
        stars.frustumCulled = false;
        stars.renderOrder = 3;
        sky.add(stars);
    }

    /* 누른 자리의 고리 (셋을 돌려 쓴다) */
    const rippleGeo = keep(new THREE.PlaneGeometry(2, 2));
    const ripples = Array.from({ length: 3 }, () => {
        const mat = keep(new THREE.ShaderMaterial({
            vertexShader: RIPPLE_VERT, fragmentShader: RIPPLE_FRAG,
            uniforms: { ...calmU, uColor: { value: pal.ripple }, uAge: { value: 1 }, uOpacity: { value: dark ? 0.9 : 0.85 } },
            transparent: true, depthTest: false, depthWrite: false, blending: pal.blending,
        }));
        const mesh = new THREE.Mesh(rippleGeo, mat);
        mesh.visible = false;
        mesh.frustumCulled = false;
        mesh.renderOrder = 5;
        sky.add(mesh);
        return { mesh, mat, age: 1 };
    });
    let nextRipple = 0;

    /* 밝아진 별자리의 이름 */
    let nameFont = "serif";
    const names = new Map<number, { sprite: THREE.Mesh; mat: THREE.ShaderMaterial; tex: THREE.CanvasTexture }>();
    const nameGeo = keep(new THREE.PlaneGeometry(1, 1));
    const nameSprite = (ci: number) => {
        let n = names.get(ci);
        if (n) return n;
        const text = CONSTELLATIONS[ci].name;
        const canvas = document.createElement("canvas");
        const px = 44, spacing = 12;
        const g2 = canvas.getContext("2d")!;
        g2.font = `500 ${px}px ${nameFont}`;
        const w = Math.ceil([...text].reduce((s, ch) => s + g2.measureText(ch).width + spacing, 0)) + 24;
        canvas.width = w;
        canvas.height = 72;
        g2.font = `500 ${px}px ${nameFont}`;
        g2.fillStyle = "#" + pal.label.getHexString();
        g2.textAlign = "center";
        g2.textBaseline = "middle";
        spaced(g2, text, w / 2, 36, spacing);
        const tex = keep(new THREE.CanvasTexture(canvas));
        tex.colorSpace = THREE.SRGBColorSpace;
        const hWorld = 1.85;
        const mat = keep(new THREE.ShaderMaterial({
            vertexShader: NAME_VERT, fragmentShader: NAME_FRAG,
            uniforms: { ...calmU, uMap: { value: tex }, uOpacity: { value: 0 }, uSize: { value: new THREE.Vector2((hWorld * w) / 72, hWorld) } },
            transparent: true, depthTest: false, depthWrite: false,
        }));
        const sprite = new THREE.Mesh(nameGeo, mat);
        sprite.frustumCulled = false;
        // 한가운데보다 조금 아래(적위 쪽으로), 글자 높이 약 13px
        const c = conCenter[ci];
        const below = new THREE.Vector3(0, 1, 0).addScaledVector(c, -c.y).normalize();
        sprite.position.copy(c).addScaledVector(below, -0.075).normalize().multiplyScalar(R_NAMES);
        sprite.renderOrder = 6;
        sprite.visible = false;
        sky.add(sprite);
        n = { sprite, mat, tex };
        names.set(ci, n);
        return n;
    };

    /* 별자리 밝히기 — 나이(초)로 밝기·긋기를 정한다 */
    const lit = new Map<number, number>();
    const GLOW_IN = 0.35, HOLD = 2.6, GLOW_OUT = 1.3, DRAW = 1.25;

    /* 시점 — 북극을 화면 오른쪽 위에 둔다 */
    const ncp = new THREE.Vector3(0, Math.sin(LAT * D2R), -Math.cos(LAT * D2R));
    let W = 1, H = 1;
    const look = { yaw: 0, pitch: 0 };
    const placeCamera = () => {
        const aspect = W / H;
        const phone = aspect < 0.8;
        camera.fov = phone ? 72 : 62;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        const tanV = Math.tan((camera.fov * D2R) / 2), tanH = tanV * aspect;
        const px = phone ? 0.52 : 0.8, py = phone ? 0.82 : 0.8;
        camera.position.set(0, 0, 0);
        camera.up.set(0, 1, 0);
        camera.lookAt(ncp);
        camera.rotateY(Math.atan(px * tanH) + look.yaw);
        camera.rotateX(-Math.atan(py * tanV) + look.pitch);
    };

    const resize = (w: number, h: number) => {
        W = Math.max(1, w);
        H = Math.max(1, h);
        const phone = W / H < 0.8 || W <= 768;
        calmU.uRes.value.set(W, H);
        calmU.uEdge.value = phone ? 0 : 150;
        calmU.uTop.value.set(phone ? 0.1 : 0.12, phone ? 0.27 : 0.32);
        placeCamera();
    };
    /** 글 자리 지도를 칠한다 — 사각형(CSS px)을 넉넉히 키워 칠하고 흐리게 */
    const setMask = (rects: { x: number; y: number; w: number; h: number; pad: number }[]) => {
        const k = 0.25;
        const mw = Math.max(4, Math.round(W * k)), mh = Math.max(4, Math.round(H * k));
        if (maskCanvas.width !== mw || maskCanvas.height !== mh) {
            maskCanvas.width = maskSharp.width = mw;
            maskCanvas.height = maskSharp.height = mh;
        }
        const sharp = maskSharp.getContext("2d");
        const soft = maskCanvas.getContext("2d");
        if (!sharp || !soft) return;
        sharp.clearRect(0, 0, mw, mh);
        sharp.fillStyle = "#fff";
        for (const r of rects) sharp.fillRect((r.x - r.pad) * k, (r.y - r.pad) * k, (r.w + r.pad * 2) * k, (r.h + r.pad * 2) * k);
        soft.clearRect(0, 0, mw, mh);
        soft.filter = "blur(3px)";
        soft.drawImage(maskSharp, 0, 0);
        soft.filter = "none";
        maskTex.needsUpdate = true;
    };
    /** 하늘이 보이기 시작하는 왼쪽 끝(px) — 데스크톱은 사이드바 옆선 */
    const setLeft = (px: number) => { calmU.uLeft.value = px; };

    /** 한 장 — dt 는 초(움직임이 없으면 0), par 는 시차(-1~1) */
    const frame = (dt: number, par: { x: number; y: number }, twinkle: number) => {
        persisted.angle -= SIDEREAL * D2R * dt;
        setSpin();
        uTime.value += dt;
        uTwinkle.value = twinkle;

        // 시차 — 카메라를 살짝 돌리고(전체가 함께) 옮긴다(가까운 눈금이 별 위를 미끄러진다)
        look.yaw = -par.x * 0.022;
        look.pitch = par.y * 0.016;
        placeCamera();
        camera.position.set(par.x * 0.9, -par.y * 0.6, 0);

        // 별자리 밝기·긋기
        glow.fill(0);
        draw.fill(0);
        for (const [ci, age0] of lit) {
            const age = age0 + dt;
            if (age > GLOW_IN + HOLD + GLOW_OUT) {
                lit.delete(ci);
                const n = names.get(ci);
                if (n) n.sprite.visible = false;
                continue;
            }
            lit.set(ci, age);
            const k = age < GLOW_IN ? age / GLOW_IN : age < GLOW_IN + HOLD ? 1 : 1 - (age - GLOW_IN - HOLD) / GLOW_OUT;
            const e = Math.min(1, age / DRAW);
            glow[ci] = Math.max(glow[ci], k * k * (3 - 2 * k));
            draw[ci] = e * e * (3 - 2 * e);
            const n = names.get(ci);
            if (n) {
                const s = Math.max(0, Math.min(1, (age - 0.45) / 0.6)) * k;
                n.mat.uniforms.uOpacity.value = s * (dark ? 0.85 : 0.9);
                n.sprite.visible = s > 0.003;
            }
        }
        for (const r of ripples) {
            if (r.age >= 1) { r.mesh.visible = false; continue; }
            r.age = Math.min(1, r.age + dt / 2.2);
            r.mat.uniforms.uAge.value = r.age;
            r.mesh.visible = r.age < 1;
        }
        renderer.render(scene, camera);
        return lit.size > 0 || ripples.some((r) => r.age < 1);
    };

    /** 화면 좌표(0~1, 위가 0)를 누름 — 고리를 띄우고 가장 가까운 별자리를 밝힌다 */
    const ray = new THREE.Vector3();
    const inv = new THREE.Quaternion();
    const tap = (nx: number, ny: number) => {
        ray.set(nx * 2 - 1, 1 - ny * 2, 0.5).unproject(camera).sub(camera.position).normalize();
        inv.copy(sky.quaternion).invert();
        const local = ray.clone().applyQuaternion(inv);
        const r = ripples[nextRipple];
        nextRipple = (nextRipple + 1) % ripples.length;
        r.age = 0;
        r.mesh.position.copy(local).multiplyScalar(R_RIPPLE);
        r.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), local.clone().negate());
        const half = R_RIPPLE * Math.tan(8 * D2R);
        r.mesh.scale.set(half, half, 1);
        r.mesh.visible = true;
        let best = -1, bestAng = Infinity;
        conStars.forEach((pts, ci) => {
            for (const p of pts) {
                const ang = p.angleTo(local);
                if (ang < bestAng) { bestAng = ang; best = ci; }
            }
        });
        if (best >= 0) {
            lit.set(best, 0);
            nameSprite(best);
        }
    };

    return {
        resize,
        setLeft,
        setMask,
        frame,
        tap,
        /** Cinzel 이 준비되면 별자리 이름을 그 글꼴로 새긴다 */
        fontReady(font: string) {
            nameFont = font;
        },
        dispose() {
            names.forEach((n) => sky.remove(n.sprite));
            disposables.forEach((d) => d.dispose());
        },
    };
}

/** 글자 사이를 띄워 가운데 맞춰 쓴다 (canvas 의 letterSpacing 이 없는 웹뷰도 있다) */
function spaced(g: CanvasRenderingContext2D, text: string, cx: number, cy: number, spacing: number) {
    const chars = [...text];
    const widths = chars.map((c) => g.measureText(c).width);
    const total = widths.reduce((s, w) => s + w, 0) + spacing * (chars.length - 1);
    let x = cx - total / 2;
    const align = g.textAlign;
    g.textAlign = "left";
    chars.forEach((c, i) => {
        g.fillText(c, x, cy);
        x += widths[i] + spacing;
    });
    g.textAlign = align;
}
