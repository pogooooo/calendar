/**
 * Maple 의 표본 한 장 — 종이 카드에 눌러 말린 단풍잎 하나를 종이 테이프로 붙여 두었고, 그 둘레로 잎 몇 장이 지나간다.
 * 로그인 옆 그림판(sheet: 표본 대지와 이름표)과 내려받기 화면의 큰 그림(plate: 도감 한 장 H2)이 같이 쓴다.
 *
 *   - 카드: 바탕에 떨어지는 두 겹 그늘(가까이 짙게 · 멀리 옅게)로 떠 있음을 보이고, 커서·기울기 쪽으로 조금 기운다.
 *   - 잎: 꼭지만 테이프로 붙어 있어 잎몸이 살짝 들려 있고 숨 쉬듯 들썩인다. 등(왼쪽 위)이 천천히 오가며
 *     들린 면·잎맥(그림의 밝기를 높이로 삼은 결)을 따라 밝기와 윤기가 흐른다. 그늘은 잎 모양 그대로 카드에 떨어지는데,
 *     높이 뜬 끝일수록 멀리·흐리게(밉맵) 떨어진다.
 *   - 지나가는 잎: 카드 뒤(작고 옅게)와 앞(크고 흐리게)에서 천천히 진다 — 바탕 장면(mapleLeafScene)과 같은 그림·셰이더.
 *   - 기다리는 동안(busy)에는 잎이 빨리 지고 표본 잎 끝이 떤다.
 *
 * 좌표는 CSS px(카메라는 z=0 면이 화면과 1:1 인 거리), y 는 위로. 투명 캔버스라 종이 바탕은 화면(CSS)이 칠한다.
 * 무겁지 않게: 화면에 보일 때만(IntersectionObserver) 초당 30장, 창이 숨으면 멈춘다. 기기 배율은 2(폰 1.5)까지, 큰 판은 2.4MP 안으로.
 * 움직임 '끄기'는 한 장만, '잔잔하게'는 잎이 적고 느리며 커서·기울기를 따르지 않는다.
 * three 는 부르는 쪽(MapleSpecimen)이 동적으로 받아 넘겨준다 — 이 파일은 타입만 가져온다.
 */
import type * as THREE_NS from "three";
import { parallax } from "@/lib/parallax";
import { hexRGB, leafAtlas, LEAF_FRAG, LEAF_VERT, SPRITES } from "./mapleLeafScene";

type T = typeof THREE_NS;
type Motion = "full" | "gentle" | "off";
export type SpecimenVariant = "sheet" | "plate";

const ASSET = "/themes/maple";
const FOV = 38;
const TAN = Math.tan(((FOV / 2) * Math.PI) / 180);
/** 그림 속 잎꼭지(테이프 자리) — 네 장 모두 꼭지가 아래 가운데로 내려온다 */
const PIN = { u: 0.47, v: 0.17 };
/** 잎 그림마다의 학명 — 표본 이름표에 쓴다 */
const SPECIES = ["Acer palmatum", "Acer saccharum", "Acer mono", "Acer campestre"];

/* ── 셰이더 ─────────────────────────────────────────────────────────── */

/** 표본 잎의 높이(px) — 꼭지(uPin)는 붙어 있고 멀수록 들린다. 옆 갈래는 위로 말리고 끝은 떤다 */
const HEIGHT = /* glsl */ `
uniform vec2 uPin;
uniform float uLift;
uniform float uCup;
uniform float uFlutter;
uniform float uTime;
float leafHeight(vec2 p) {
    float d = length(p - uPin);
    float lift = uLift * pow(smoothstep(0.04, 0.86, d), 1.6);
    float cup = uCup * pow(abs(p.x - 0.5) * 2.0, 2.0) * smoothstep(0.18, 0.55, d);
    float fl = uFlutter * sin(uTime * 2.3 + p.x * 6.0 + p.y * 4.0) * smoothstep(0.45, 1.0, d);
    return 0.8 + lift + cup + fl;
}
`;

const LEAF_V = /* glsl */ `
${HEIGHT}
varying vec2 vUv;
varying vec3 vN;
void main() {
    vUv = uv;
    float h = leafHeight(uv);
    // 법선은 판 좌표(크기 1)로 구해 두면 normalMatrix 가 잎 크기만큼 눕혀 준다
    float e = 0.008;
    float hx = (leafHeight(uv + vec2(e, 0.0)) - leafHeight(uv - vec2(e, 0.0))) / (2.0 * e);
    float hy = (leafHeight(uv + vec2(0.0, e)) - leafHeight(uv - vec2(0.0, e))) / (2.0 * e);
    vN = normalize(normalMatrix * vec3(-hx, -hy, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, h, 1.0);
}
`;

const LEAF_F = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform vec3 uLight;     // 등 쪽(뷰 공간)
uniform float uBump;
uniform float uDark;
varying vec2 vUv;
varying vec3 vN;
void main() {
    vec4 c = texture2D(uMap, vUv);   // 미리 곱한 알파
    vec3 base = c.rgb / max(c.a, 0.001);
    // 그림 가장자리의 옅은 크림빛 테(바탕을 따낸 자국)는 지운다 — 어두운 대지 위에서 흰 스티커 테두리처럼 보였다
    float hi = max(base.r, max(base.g, base.b));
    float sat = (hi - min(base.r, min(base.g, base.b))) / max(hi, 0.001);
    c *= 1.0 - smoothstep(0.62, 0.8, hi) * (1.0 - smoothstep(0.16, 0.34, sat)) * 0.9;
    if (c.a < 0.003) discard;
    // 잎맥의 결 — 그림의 밝기를 높이로 삼아 법선을 조금 흔든다(짙은 잎맥이 살짝 파인 듯)
    float lum = dot(base, vec3(0.3, 0.59, 0.11));
    vec3 n = normalize(normalize(vN) - vec3(dFdx(lum), dFdy(lum), 0.0) * uBump);
    if (!gl_FrontFacing) n = -n;
    float diff = max(dot(n, uLight), 0.0);
    vec3 col = base * (0.6 + 0.52 * diff);
    // 옅은 윤기 — 등이 오가면 들린 면을 따라 스친다
    vec3 hv = normalize(uLight + vec3(0.0, 0.0, 1.0));
    col += pow(max(dot(n, hv), 0.0), 26.0) * mix(0.16, 0.1, uDark);
    col *= mix(1.0, 0.92, uDark);
    gl_FragColor = vec4(col * c.a, c.a);
}
`;

/** 잎 그늘 — 같은 높이로 들린 잎을 등 반대쪽으로 카드에 눌러 그린다. 높이 뜬 자리일수록 멀리·흐리게 */
const SHADOW_V = /* glsl */ `
${HEIGHT}
uniform vec3 uLightL;    // 등 쪽(잎 자리 좌표)
uniform float uSize;     // 잎 한 변(px) — 판 좌표는 크기 1 이라 px 만큼 밀려면 나눈다
varying vec2 vUv;
varying float vH;
void main() {
    vUv = uv;
    float h = leafHeight(uv);
    vH = h;
    vec2 p = position.xy - uLightL.xy / max(uLightL.z, 0.25) * h / uSize;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.3, 1.0);
}
`;

const SHADOW_F = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
varying float vH;
void main() {
    float a = texture2D(uMap, vUv, clamp(vH / 6.0, 0.0, 4.5)).a;
    a *= uStrength * mix(1.0, 0.45, smoothstep(2.0, 36.0, vH));
    gl_FragColor = vec4(uColor * a, a);
}
`;

/** 카드 — 앞면 그림(종이·틀·이름표, 또는 도감 그림)에 종이결과 빛 웅덩이, 가장자리는 부드럽게 */
const CARD_V = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const CARD_F = /* glsl */ `
precision highp float;
uniform sampler2D uFace;
uniform vec2 uPool;      // 빛 웅덩이 자리(uv)
uniform float uDark;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
    vec3 col = texture2D(uFace, vUv).rgb;
    // 종이 섬유 — 아주 옅게
    float fib = hash(floor(vUv * vec2(420.0, 560.0))) * 0.5 + hash(floor(vUv * vec2(90.0, 1400.0))) * 0.5;
    col *= 0.985 + 0.03 * fib;
    // 등이 비추는 쪽이 조금 밝다
    float pool = 1.0 - smoothstep(0.0, 1.15, distance(vUv, uPool));
    col *= mix(0.92, 0.86, uDark) + mix(0.12, 0.22, uDark) * pool;
    // 가장자리 — 안쪽 1px 은 부드럽게, 오른쪽·아래 끝은 종이 두께의 그늘
    vec2 fw = fwidth(vUv);
    float a = smoothstep(0.0, fw.x * 1.4, vUv.x) * smoothstep(0.0, fw.x * 1.4, 1.0 - vUv.x)
            * smoothstep(0.0, fw.y * 1.4, vUv.y) * smoothstep(0.0, fw.y * 1.4, 1.0 - vUv.y);
    float rim = max(1.0 - smoothstep(0.0, fw.x * 3.0, 1.0 - vUv.x), 1.0 - smoothstep(0.0, fw.y * 3.0, vUv.y));
    col *= 1.0 - rim * 0.14;
    gl_FragColor = vec4(col * a, a);
}
`;

/** 카드가 바탕에 드리운 그늘 — 둥근 네모까지의 거리로 두 겹(가까이 짙게 · 멀리 옅게) */
const DROP_V = /* glsl */ `
uniform vec2 uQuad;
varying vec2 vP;
void main() { vP = position.xy * uQuad; gl_Position = projectionMatrix * modelViewMatrix * vec4(vP, 0.0, 1.0); }
`;
const DROP_F = /* glsl */ `
precision highp float;
uniform vec2 uHalf;
uniform vec3 uColor;
uniform vec2 uAlpha;     // 가까운 그늘 · 먼 그늘
uniform vec2 uBlur;
varying vec2 vP;
void main() {
    vec2 d = abs(vP) - uHalf + 3.0;
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 3.0;
    float a = (1.0 - smoothstep(-uBlur.x, uBlur.x, dist)) * uAlpha.x + (1.0 - smoothstep(-uBlur.y, uBlur.y * 1.6, dist)) * uAlpha.y;
    gl_FragColor = vec4(uColor * a, a);
}
`;

/** 종이 테이프 — 띠 그림에서 한 토막, 끝은 손으로 뜯은 듯. 반투명이라 밑의 꼭지가 비치고, 오른쪽 아래로 옅은 그늘 */
const TAPE_F = /* glsl */ `
precision highp float;
uniform sampler2D uTape;
uniform vec3 uColor;
uniform vec3 uShade;
uniform float uAlpha;
uniform float uSeed;
varying vec2 vUv;
float tape(vec2 p) {
    float m = texture2D(uTape, vec2(uSeed + p.x * 0.26, p.y)).a;
    float jag = 0.035 * sin(p.y * 41.0 + uSeed * 17.0) + 0.025 * sin(p.y * 97.0 + uSeed * 5.0);
    return m * smoothstep(0.0, 0.05, p.x + jag) * smoothstep(0.0, 0.05, 1.0 - p.x + jag);
}
void main() {
    float m = tape(vUv);
    float sh = tape(vUv + vec2(-0.012, 0.09)) * 0.22;
    // 종이결 — 낮은 결의 얼룩만 아주 옅게, 가운데는 빛을 받아 조금 밝다
    float mottle = 0.965 + 0.035 * sin(vUv.x * 23.0 + vUv.y * 7.0 + uSeed * 9.0) * sin(vUv.y * 13.0 - vUv.x * 5.0);
    float sheen = 1.0 + 0.06 * (1.0 - abs(vUv.y - 0.55) * 2.0);
    float a = m * uAlpha;
    vec3 col = uColor * mottle * sheen * a + uShade * sh * (1.0 - a);
    gl_FragColor = vec4(col, a + sh * (1.0 - a));
}
`;

/* ── 카드 앞면 ──────────────────────────────────────────────────────── */

const loadImage = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => res(img);
    img.onerror = () => rej(new Error(src));
    img.src = src;
});

/** 오늘이 한 해의 몇째 날인가 — 표본 번호이자 오늘의 잎 */
const dayOfYear = (d: Date) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86400000);
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** 마스크 그림(검정 먹 → 알파)에 색을 입혀 그린다 */
function inkDraw(g: CanvasRenderingContext2D, mask: HTMLImageElement, color: string, alpha: number, x: number, y: number, w: number, h: number) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    const m = c.getContext("2d");
    if (!m) return;
    m.drawImage(mask, 0, 0, c.width, c.height);
    m.globalCompositeOperation = "source-in";
    m.fillStyle = color;
    m.fillRect(0, 0, c.width, c.height);
    g.save();
    g.globalAlpha = alpha;
    g.drawImage(c, x, y);
    g.restore();
}

interface FaceInput {
    variant: SpecimenVariant;
    dark: boolean;
    ink: string;
    leafIndex: number;
    frame?: HTMLImageElement;
    plate?: HTMLImageElement;
    seal?: HTMLImageElement;
}

/** sheet: 표본 대지(먹 틀 + 이름표·밀랍 도장), plate: 도감 한 장(H2) */
function drawFace({ variant, dark, ink, leafIndex, frame, plate, seal }: FaceInput) {
    const c = document.createElement("canvas");
    if (variant === "plate") {
        c.width = 1024; c.height = 576;
        const g = c.getContext("2d");
        if (!g || !plate) return c;
        const s = Math.max(c.width / plate.width, c.height / plate.height);
        g.drawImage(plate, (c.width - plate.width * s) / 2, (c.height - plate.height * s) / 2, plate.width * s, plate.height * s);
        if (dark) { g.fillStyle = "rgba(20, 12, 8, 0.14)"; g.fillRect(0, 0, c.width, c.height); }
        g.strokeStyle = ink; g.globalAlpha = 0.3; g.lineWidth = 2;
        g.strokeRect(1, 1, c.width - 2, c.height - 2);
        return c;
    }
    c.width = 768; c.height = 1024;
    const g = c.getContext("2d");
    if (!g) return c;
    g.fillStyle = dark ? "#3A2C23" : "#F6EEDD";
    g.fillRect(0, 0, c.width, c.height);
    if (frame) inkDraw(g, frame, ink, dark ? 0.22 : 0.3, 34, 34, c.width - 68, c.height - 68);

    // 이름표 — 오른쪽 아래, 가는 두 줄 틀 안에 학명·번호·날짜
    const now = new Date();
    const lw = 330, lh = 132, lx = c.width - 78 - lw, ly = c.height - 122 - lh;
    g.save();
    g.strokeStyle = ink;
    g.globalAlpha = dark ? 0.42 : 0.5;
    g.lineWidth = 1.5;
    g.strokeRect(lx, ly, lw, lh);
    g.lineWidth = 0.8;
    g.strokeRect(lx + 6, ly + 6, lw - 12, lh - 12);
    g.globalAlpha = dark ? 0.78 : 0.82;
    g.fillStyle = ink;
    g.font = "600 25px 'Cormorant Garamond', 'Times New Roman', serif";
    // 글자 사이를 띄운 대문자 — 캔버스 letterSpacing 이 없는 곳도 있어 한 자씩 놓는다
    let x = lx + 24;
    for (const ch of SPECIES[leafIndex % SPECIES.length].toUpperCase()) { g.fillText(ch, x, ly + 46); x += g.measureText(ch).width + 3.2; }
    g.font = "500 21px 'Cormorant Garamond', 'Times New Roman', serif";
    g.globalAlpha = dark ? 0.62 : 0.66;
    g.fillText("Herbarium Cronos", lx + 24, ly + 80);
    g.fillText(`No. ${dayOfYear(now)}  —  ${now.getDate()} · ${ROMAN[now.getMonth()]} · ${now.getFullYear()}`, lx + 24, ly + 108);
    g.restore();
    if (seal) {
        g.save();
        g.translate(lx - 10, ly + 10);
        g.rotate(-0.22);
        g.globalAlpha = dark ? 0.82 : 0.92;
        g.drawImage(seal, -38, -38, 76, 76);
        g.restore();
    }
    return c;
}

/* ── 장면 ───────────────────────────────────────────────────────────── */

export interface SpecimenOptions {
    variant: SpecimenVariant;
    dark: boolean;
    motion: Motion;
    /** 먹·테이프 색·바탕(지나가는 먼 잎이 이 빛으로 바랜다) */
    colors: { ink: string; accent: string; paper: string };
    /** 카드가 덮지 말아야 할 것(로그인 옆 상표 묶음) — 있으면 카드를 비켜 놓는다 */
    avoid?: () => HTMLElement | null;
    onReady: () => void;
    onFail: () => void;
}

interface Drift {
    x: number; y: number; z: number; size: number; cell: number; tone: [number, number, number]; curl: number; seed: number;
    fall: number; freq: number; phase: number; swing: number; vx: number;
    roll0: number; roll: number; pitch0: number; yaw: number; yawRate: number; tumble: number; tumbleAngle: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** WebGL 이 없으면 여기서 바로 던진다 — 부르는 쪽이 예전 그림으로 물러난다 */
export function createSpecimenScene(THREE: T, canvas: HTMLCanvasElement, opts: SpecimenOptions) {
    const { variant, motion, dark } = opts;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const interactive = motion === "full";
    const speedK = motion === "gentle" ? 0.6 : 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 6000);
    const ink = hexRGB(opts.colors.ink);
    const shade: [number, number, number] = dark ? [0, 0, 0] : ink;
    const disposables: { dispose(): void }[] = [];
    const track = <D extends { dispose(): void }>(d: D) => { disposables.push(d); return d; };
    const material = (vertexShader: string, fragmentShader: string, uniforms: Record<string, THREE_NS.IUniform>, side: THREE_NS.Side = THREE.FrontSide) =>
        track(new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, premultipliedAlpha: true, depthTest: false, depthWrite: false, side }));
    const quad = track(new THREE.PlaneGeometry(1, 1));

    /* 카드 · 그늘 · 잎 · 테이프 — 깊이 버퍼 없이 그리는 차례(renderOrder)로 겹침을 정한다 */
    const card = new THREE.Group();
    scene.add(card);
    const light = new THREE.Vector3(-0.5, 0.62, 0.75).normalize();
    const pool = new THREE.Vector2(0.3, 0.75);

    const dropU = {
        uQuad: { value: new THREE.Vector2(1, 1) },
        uHalf: { value: new THREE.Vector2(1, 1) },
        uColor: { value: new THREE.Vector3(...shade) },
        uAlpha: { value: new THREE.Vector2(dark ? 0.5 : 0.2, dark ? 0.32 : 0.12) },
        uBlur: { value: new THREE.Vector2(3, 26) },
    };
    const drop = new THREE.Mesh(quad, material(DROP_V, DROP_F, dropU));
    drop.renderOrder = 2;
    scene.add(drop);

    const cardU = { uFace: { value: null as THREE_NS.Texture | null }, uPool: { value: pool }, uDark: { value: dark ? 1 : 0 } };
    const cardMesh = new THREE.Mesh(quad, material(CARD_V, CARD_F, cardU));
    cardMesh.renderOrder = 3;
    card.add(cardMesh);

    const shapeU = {
        uPin: { value: new THREE.Vector2(PIN.u, PIN.v) },
        uLift: { value: 16 },
        uCup: { value: 7 },
        uFlutter: { value: 0.4 },
        uTime: { value: Math.random() * 50 },
    };
    const leafMap = { value: null as THREE_NS.Texture | null };
    const leafGeo = track(new THREE.PlaneGeometry(1, 1, 48, 48));
    const leafU = { ...shapeU, uMap: leafMap, uLight: { value: light.clone() }, uBump: { value: 2.2 }, uDark: { value: dark ? 1 : 0 } };
    const leafMesh = new THREE.Mesh(leafGeo, material(LEAF_V, LEAF_F, leafU, THREE.DoubleSide));
    leafMesh.renderOrder = 5;
    const shadowU = { ...shapeU, uMap: leafMap, uSize: { value: 300 }, uLightL: { value: new THREE.Vector3(0, 0, 1) }, uColor: { value: new THREE.Vector3(...shade) }, uStrength: { value: dark ? 0.55 : 0.3 } };
    const shadowMesh = new THREE.Mesh(leafGeo, material(SHADOW_V, SHADOW_F, shadowU));
    shadowMesh.renderOrder = 4;
    const leafPivot = new THREE.Group();
    leafPivot.add(shadowMesh, leafMesh);
    card.add(leafPivot);

    // 테이프 — 잎꼭지 위에 하나(잎과 같이 움직인다), 도감 한 장(plate)은 위 두 귀에도
    const tapeMap = { value: null as THREE_NS.Texture | null };
    const tapeColor = { value: new THREE.Vector3(...hexRGB(opts.colors.accent)) };
    const tapeShade = { value: new THREE.Vector3(...shade) };
    const makeTape = (seed: number, parent: THREE_NS.Object3D) => {
        const mesh = new THREE.Mesh(quad, material(CARD_V, TAPE_F, { uTape: tapeMap, uColor: tapeColor, uShade: tapeShade, uAlpha: { value: dark ? 0.5 : 0.72 }, uSeed: { value: seed } }));
        mesh.renderOrder = 6;
        parent.add(mesh);
        return mesh;
    };
    const stemTape = makeTape(0.08, leafPivot);
    const cornerTapes = variant === "plate" ? [makeTape(0.41, card), makeTape(0.67, card)] : [];

    /* 지나가는 잎 — 카드 뒤 한 무리, 앞 한 무리 (같은 그림·셰이더, 따로 그려 차례를 지킨다) */
    const nDrift = motion === "off" || motion === "gentle" ? 3 : variant === "sheet" ? (mobile ? 4 : 6) : 6;
    const driftU = {
        uMap: { value: null as THREE_NS.Texture | null },
        uPaper: { value: new THREE.Vector3(...hexRGB(opts.colors.paper)) },
        uDark: { value: dark ? 1 : 0 },
        uOpacity: { value: dark ? 0.8 : 0.88 },
        uTime: shapeU.uTime,
        uNear: { value: new THREE.Vector2(1, 0) },
        uFar: { value: new THREE.Vector2(2, 3) },
    };
    const driftMat = material(LEAF_VERT, LEAF_FRAG, driftU, THREE.DoubleSide);
    const layer = (n: number, order: number, front: boolean) => {
        const geo = track(new THREE.PlaneGeometry(1, 1, 5, 5));
        const aLeaf = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4);
        const aTone = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
        aLeaf.setUsage(THREE.DynamicDrawUsage);
        aTone.setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute("aLeaf", aLeaf);
        geo.setAttribute("aTone", aTone);
        const mesh = new THREE.InstancedMesh(geo, driftMat, n);
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        mesh.frustumCulled = false;
        mesh.renderOrder = order;
        scene.add(mesh);
        return { mesh, aLeaf, aTone, front, leaves: Array.from({ length: n }, () => ({ vx: 0 }) as Drift) };
    };
    const layers = [layer(Math.ceil(nDrift / 2), 1, false), layer(Math.floor(nDrift / 2), 7, true)];

    /* ── 자리 ─────────────────────────────────────────────────────── */
    let W = 1, H = 1, D = 1000;
    const L = { cx: 0, cy: 0, cw: 1, ch: 1, rot: 0, leaf: { x: 0, y: 0, size: 1, rot: 0 } };
    const halfH = (z: number) => (D - z) * TAN;
    const halfW = (z: number) => (D - z) * TAN * (W / H);

    const spawnDrift = (l: Drift, front: boolean, anywhere: boolean) => {
        l.z = front ? rand(60, Math.min(260, D * 0.35)) : rand(-340, -70);
        l.size = (variant === "sheet" ? rand(34, 52) : rand(32, 48)) * (mobile ? 0.85 : 1);
        l.cell = Math.floor(Math.random() * SPRITES.length);
        const warm = rand(-0.06, 0.06);
        l.tone = [1 + warm, 1 + warm * 0.4 + rand(-0.05, 0.03), 1 - warm * 0.5 + rand(-0.05, 0.03)];
        l.curl = rand(0.1, 0.3);
        l.seed = rand(0, 10);
        l.fall = rand(24, 40) * (variant === "sheet" ? H / 900 : H / 420);
        l.freq = rand(1.3, 2.1);
        l.phase = rand(0, Math.PI * 2);
        l.swing = rand(14, 30);
        l.roll0 = rand(-0.5, 0.5);
        l.roll = rand(0.3, 0.6);
        l.pitch0 = rand(-0.5, 0.15);
        l.yaw = rand(-0.6, 0.6);
        l.yawRate = Math.random() < 0.4 ? rand(0.3, 0.9) * (Math.random() < 0.5 ? -1 : 1) : 0;
        l.tumble = Math.random() < 0.2 ? rand(1.4, 2.4) * (Math.random() < 0.5 ? -1 : 1) : 0;
        l.tumbleAngle = rand(0, Math.PI * 2);
        const hh = halfH(l.z), hw = halfW(l.z);
        l.x = rand(-hw, hw) * 0.95 - l.vx * 2;
        l.y = anywhere ? rand(-hh, hh) : hh + l.size;
    };

    /** 판 크기에 맞춰 카드·잎·테이프·그늘 자리를 잡는다 */
    const place = () => {
        if (variant === "sheet") {
            let ch = Math.min(H * 0.64, (W * 0.54) / 0.75);
            let cw = ch * 0.75;
            let cx = W * 0.6, cy = H * 0.41;
            // 상표 묶음(왼쪽 아래)을 덮지 않게 — 오른쪽으로, 그래도 겹치면 위로, 그래도 겹치면 줄인다
            const el = opts.avoid?.();
            if (el) {
                const a = el.getBoundingClientRect(), c = canvas.getBoundingClientRect();
                const top = a.top - c.top - 30, right = a.right - c.left + 20; // 상표는 떠오르며 들어온다(14px) — 그만큼 넉넉히
                const hits = () => cy + ch / 2 > top && cx - cw / 2 < right;
                if (hits()) cx = Math.max(cx, Math.min(W - cw / 2 - 28, right + cw / 2));
                if (hits()) cy = Math.max(ch / 2 + H * 0.05, top - ch / 2);
                if (hits()) { ch = Math.max(H * 0.34, top - H * 0.05); cw = ch * 0.75; cy = H * 0.05 + ch / 2; }
            }
            Object.assign(L, { cx, cy, cw, ch, rot: -0.045 });
            L.leaf = { x: 0, y: ch * 0.07, size: cw * 0.86, rot: -0.08 };
        } else {
            const cw = Math.min(W * 0.8, H * 0.74 * (16 / 9));
            const ch = cw * (9 / 16);
            Object.assign(L, { cx: W * 0.5, cy: H * 0.56, cw, ch, rot: -0.022 });
            L.leaf = { x: cw * 0.01, y: -ch * 0.02, size: ch * 0.92, rot: 0.14 };
        }
        card.position.set(L.cx - W / 2, H / 2 - L.cy, 0);
        cardMesh.scale.set(L.cw, L.ch, 1);
        leafPivot.position.set(L.leaf.x, L.leaf.y, 0);
        leafMesh.scale.set(L.leaf.size, L.leaf.size, 1);
        shadowMesh.scale.set(L.leaf.size, L.leaf.size, 1);
        shadowU.uSize.value = L.leaf.size;
        shapeU.uCup.value = L.leaf.size * 0.022;
        stemTape.position.set((PIN.u - 0.5) * L.leaf.size, (PIN.v - 0.5) * L.leaf.size + L.leaf.size * 0.01, 2);
        stemTape.rotation.z = -0.16;
        stemTape.scale.set(L.leaf.size * 0.3, L.leaf.size * 0.085, 1);
        cornerTapes.forEach((tp, i) => {
            const side = i === 0 ? -1 : 1;
            tp.position.set(side * (L.cw / 2 - L.cw * 0.04), L.ch / 2 - L.ch * 0.01, 2);
            tp.rotation.z = side * -0.48;
            tp.scale.set(L.cw * 0.2, L.cw * 0.058, 1);
        });
        const blur = Math.max(18, L.cw * 0.07);
        dropU.uHalf.value.set(L.cw / 2, L.ch / 2);
        dropU.uBlur.value.set(3, blur);
        dropU.uQuad.value.set(L.cw + blur * 5, L.ch + blur * 5);
        // 지나가는 잎의 흐림(앞)·바램(뒤) — 카메라에서의 거리로
        driftU.uNear.value.set(D - 30, D - 240);
        driftU.uFar.value.set(D + 40, D + 380);
    };

    const resize = () => {
        const r = canvas.getBoundingClientRect();
        W = Math.max(1, Math.round(r.width));
        H = Math.max(1, Math.round(r.height));
        // 기기 배율 2(폰 1.5)까지 — 다만 큰 판(로그인 옆)은 2.4 메가픽셀을 넘지 않게
        const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2, Math.sqrt(2_400_000 / (W * H)));
        renderer.setPixelRatio(dpr);
        renderer.setSize(W, H, false);
        D = (H / 2) / TAN;
        camera.aspect = W / H;
        camera.position.set(0, 0, D);
        camera.near = Math.max(10, D * 0.1);
        camera.far = D * 3;
        camera.updateProjectionMatrix();
        leafU.uBump.value = 2.2 * dpr;
        place();
    };

    /* ── 움직임 ─────────────────────────────────────────────────────── */
    let busy = false;
    let t = Math.random() * 100;
    const stopParallax = interactive ? parallax.start() : () => {};
    const qInv = new THREE.Quaternion();
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const eu = new THREE.Euler();
    const pos = new THREE.Vector3();
    const sc = new THREE.Vector3();

    const step = (dt: number) => {
        t += dt;
        const p = interactive ? parallax.read() : { x: 0, y: 0 };
        // 카드는 커서·기울기 쪽으로 조금 기운다
        card.rotation.set(p.y * 0.07, p.x * 0.09, L.rot);
        // 등은 천천히 오가고 커서 쪽으로 조금 옮겨 간다 — 빛이 잎 위를 흐른다
        const sway = Math.sin(t * 0.16) * 0.22 + Math.sin(t * 0.07 + 1.3) * 0.12;
        light.set(-0.5 + sway + p.x * 0.3, 0.62 + sway * 0.4 - p.y * 0.25, 0.78).normalize();
        pool.set(0.5 + light.x * 0.55, 0.5 + light.y * 0.55);
        leafU.uLight.value.copy(light);
        // 잎은 숨 쉬듯 들썩이고, 기다리는 동안에는 끝이 떤다
        const breathe = 0.78 + 0.22 * Math.sin(t * 0.55) + 0.08 * Math.sin(t * 1.3 + 0.7);
        shapeU.uLift.value = L.leaf.size * 0.05 * breathe * (busy ? 1.35 : 1);
        shapeU.uFlutter.value += ((busy ? 2.6 : 0.45) - shapeU.uFlutter.value) * Math.min(1, dt * 2);
        shapeU.uTime.value += dt * speedK * (busy ? 2.2 : 1);
        leafPivot.rotation.z = L.leaf.rot + Math.sin(t * 0.21) * 0.012;

        // 카드의 그늘 — 등 반대쪽으로, 기운 만큼 조금 더 멀리
        const elev = 14 + Math.abs(p.x) * 6 + Math.abs(p.y) * 4;
        drop.position.set(card.position.x - (light.x / light.z) * elev, card.position.y - (light.y / light.z) * elev - 4, -elev);
        drop.rotation.z = L.rot;

        // 잎 그늘이 드리울 쪽 — 잎 자리 좌표로 옮긴 등
        leafMesh.updateWorldMatrix(true, false);
        leafMesh.getWorldQuaternion(qInv).invert();
        shadowU.uLightL.value.copy(light).applyQuaternion(qInv);

        // 지나가는 잎 — 바람은 아주 느리게 오가고 커서·기울기 쪽으로 조금
        const windX = (Math.sin(t * 0.09) * 10 - 6 + p.x * 26) * speedK;
        const fast = busy ? 3 : 1;
        for (const lay of layers) {
            for (const l of lay.leaves) {
                l.vx += (windX - l.vx) * Math.min(1, dt * 0.8);
                l.phase += l.freq * dt * speedK * (busy ? 1.6 : 1);
                const c = Math.cos(l.phase);
                l.x += (l.vx + l.swing * l.freq * c * speedK) * dt * fast;
                l.y -= l.fall * speedK * (l.tumble ? 1.1 : 0.5 + 0.85 * c * c) * dt * fast;
                if (l.tumble) l.tumbleAngle += l.tumble * dt * speedK * fast;
                l.yaw += l.yawRate * dt * speedK;
                const hh = halfH(l.z), hw = halfW(l.z);
                if (l.y < -hh - l.size || l.x > hw + l.size * 2 || l.x < -hw - l.size * 2) spawnDrift(l, lay.front, false);
            }
        }
    };

    const render = () => {
        for (const lay of layers) {
            lay.leaves.forEach((l, i) => {
                const s = Math.sin(l.phase), c = Math.cos(l.phase);
                eu.set(l.tumble ? l.tumbleAngle : l.pitch0 + 0.38 * c, l.yaw + 0.5 * Math.sin(l.phase * 0.5 + l.seed), l.roll0 + l.roll * s, "YXZ");
                q.setFromEuler(eu);
                m4.compose(pos.set(l.x, l.y, l.z), q, sc.set(l.size, l.size, l.size));
                lay.mesh.setMatrixAt(i, m4);
                lay.aLeaf.setXYZW(i, l.cell, l.curl, l.seed, 1);
                lay.aTone.setXYZ(i, l.tone[0], l.tone[1], l.tone[2]);
            });
            lay.mesh.instanceMatrix.needsUpdate = true;
            lay.aLeaf.needsUpdate = true;
            lay.aTone.needsUpdate = true;
        }
        renderer.render(scene, camera);
    };

    /* ── 돌리기: 화면에 보이고 창이 떠 있을 때만 ─────────────────────── */
    let raf = 0;
    let disposed = false;
    let ready = false;
    let onScreen = true;
    let last = 0;
    let acc = 0;
    const tick = (now: number) => {
        raf = 0;
        if (disposed || !ready || !onScreen || document.hidden) return;
        raf = requestAnimationFrame(tick);
        const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
        last = now;
        acc += dt;
        if (acc < 1 / 30) return; // 초당 30장까지만
        const d = Math.min(acc, 0.1);
        acc = 0;
        step(d);
        render();
    };
    const run = () => {
        if (motion === "off" || raf || disposed || !ready || !onScreen || document.hidden) return;
        last = 0;
        raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
        onScreen = entries.some((e) => e.isIntersecting);
        if (onScreen) run();
    });
    io.observe(canvas);
    const onVis = () => { if (!document.hidden) run(); };
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(() => {
        resize();
        if (ready && !raf) { step(0); render(); }
    });
    ro.observe(canvas);

    /* ── 그림 받기 → 시작 ───────────────────────────────────────────── */
    const leafIndex = dayOfYear(new Date()) % SPRITES.length;
    const texFrom = (img: HTMLImageElement | HTMLCanvasElement, mip = true) => {
        const tex = track(new THREE.Texture(img));
        tex.premultiplyAlpha = true;
        tex.generateMipmaps = mip;
        tex.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
        tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        tex.needsUpdate = true;
        return tex;
    };
    // 이름표 글꼴(Cormorant)을 기다리되, 늦으면 기다리지 않는다
    const fontsReady = variant === "sheet" && document.fonts
        ? Promise.race([
            Promise.all([document.fonts.load("600 25px 'Cormorant Garamond'"), document.fonts.load("500 21px 'Cormorant Garamond'")]),
            new Promise((r) => setTimeout(r, 1500)),
        ]).catch(() => undefined)
        : Promise.resolve();
    Promise.all([
        loadImage(`${ASSET}/${SPRITES[leafIndex]}.webp`),
        loadImage(`${ASSET}/tape.webp`),
        variant === "sheet" ? loadImage(`${ASSET}/card-frame.webp`) : Promise.resolve(undefined),
        variant === "sheet" ? loadImage(`${ASSET}/wax-seal.webp`) : Promise.resolve(undefined),
        variant === "plate" ? loadImage(`${ASSET}/landing-hero.webp`) : Promise.resolve(undefined),
        leafAtlas(THREE, mobile ? 128 : 192),
        fontsReady,
    ]).then(([leafImg, tapeImg, frame, seal, plate, atlas]) => {
        if (disposed) { atlas.dispose(); return; }
        track(atlas);
        const leafTex = texFrom(leafImg);
        leafMap.value = leafTex;
        const tapeTex = texFrom(tapeImg, false);
        tapeTex.wrapS = THREE.RepeatWrapping;
        tapeMap.value = tapeTex;
        cardU.uFace.value = texFrom(drawFace({ variant, dark, ink: opts.colors.ink, leafIndex, frame, seal, plate }));
        driftU.uMap.value = atlas;
        for (const lay of layers) lay.leaves.forEach((l) => spawnDrift(l, lay.front, true));
        ready = true;
        resize();
        step(0);
        render();
        opts.onReady();
        run();
    }).catch(() => { if (!disposed) opts.onFail(); });

    resize();

    return {
        /** 기다리는 동안 — 잎이 빨리 지고 표본 잎 끝이 떤다 */
        setBusy(b: boolean) {
            busy = b;
            if (ready && !raf) { step(0); render(); }
        },
        dispose() {
            disposed = true;
            if (raf) cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
            document.removeEventListener("visibilitychange", onVis);
            stopParallax();
            disposables.forEach((d) => d.dispose());
            layers.forEach((lay) => lay.mesh.dispose());
            renderer.dispose();
        },
    };
}
