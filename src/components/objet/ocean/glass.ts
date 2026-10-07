/**
 * Ocean 오브제의 재료 — 바닷물을 품은 액체 유리, 그리고 진주.
 *
 * 함께 쓰는 오브제 렌더러에는 진짜 물(바탕 장면)이 없다. 그래서 유리 너머의 바다를 셰이더가 직접 지어낸다:
 * 바탕의 물과 같은 빛 그물(caustic, 세 겹만)이 위는 맑고 아래는 깊은 물빛 위에서 어른거리고, 유리는 그 바다를
 * 법선만큼 휘어 비춘다(빛깔마다 조금씩 달리 — 테에 무지갯빛). 테에는 위는 수면의 빛·아래는 깊은 물이 비치고,
 * 위 왼쪽의 해(밤엔 달)가 또렷한 반짝 하나를 남긴다. 그래서 어느 모양(구슬·물방울·소라·조개)에 입혀도
 * 같은 바다를 품은 유리로 보인다.
 *
 * 색은 바다의 것(청록·물빛)으로 정해 두고, 밝은 벌·어두운 벌만 테마에서 받는다(낮 바다 / 달빛 밤바다).
 * uniform 색은 THREE.Color(선형)로 두고 끝에서 colorspace_fragment 로 내보낸다(무대의 다른 오브제와 같은 약속).
 */
import * as THREE from "three";
import type { ObjetTone } from "../types";

const VERT = /* glsl */ `
uniform float uTime;
uniform float uWobble;
varying vec3 vN;
varying vec3 vV;
varying vec2 vScreen;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec3 p = position;
    // 물처럼 일렁인다(구슬·물방울) — 법선 쪽으로 아주 조금
    float w = sin(p.y * 4.3 + uTime * 1.9) * sin(p.x * 3.7 - uTime * 1.4) + sin(p.z * 4.1 + uTime * 1.2) * 0.6;
    p += normal * w * uWobble;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = mv.xyz;
    vec4 clip = projectionMatrix * mv;
    vScreen = clip.xy / clip.w;
    gl_Position = clip;
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uThick;
uniform float uOpacity;
uniform float uBands;
uniform float uCaus;
uniform float uAiry;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uLight;
uniform vec3 uSky;
varying vec3 vN;
varying vec3 vV;
varying vec2 vScreen;
varying vec2 vUv;

// 바탕 물의 빛 그물과 같은 식(다섯 겹 — 세 겹이면 작은 자리에서 가로줄로 뭉친다) — 겹쳐 비틀린 사인 물결의 초점
float caustic(vec2 uv, float t) {
    vec2 p = mat2(0.8, -0.6, 0.6, 0.8) * uv * 6.28318 - 250.0;
    vec2 i = p;
    float c = 1.0;
    float inten = 0.005;
    for (int n = 0; n < 5; n++) {
        float tt = t * (1.0 - (3.5 / float(n + 1)));
        i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
    }
    c /= 5.0;
    c = 1.17 - pow(c, 1.4);
    return pow(abs(c), 8.0);
}

// 유리 너머의 바다 — 위는 맑고 아래는 깊으며, 빛 그물이 어른거린다
vec3 sea(vec2 q, float t) {
    vec3 col = mix(uShallow, uDeep, smoothstep(-1.0, 1.0, -q.y * 0.85));
    return col + uLight * caustic(q * 1.4 + vec2(0.37, 0.11), t) * uCaus * (1.0 - uAiry * 0.6);
}

void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    vec3 V = normalize(-vV);
    float ndv = clamp(dot(n, V), 0.0, 1.0);
    float fres = pow(1.0 - ndv, 2.6);
    float t = uTime * 0.3 + 23.0;
    vec2 q = vScreen;
    // 굴절 — 가장자리일수록 많이 휘고, 빛깔마다 조금씩 달리(무지갯빛 테)
    vec2 bend = n.xy * uThick;
    vec3 col = vec3(sea(q - bend, t).r, sea(q - bend * 1.07, t).g, sea(q - bend * 1.14, t).b);
    // 반사 — 위는 수면의 빛, 아래는 깊은 물
    vec3 R = reflect(-V, n);
    vec3 sky = mix(uDeep * 0.9, uSky, smoothstep(-0.5, 0.75, R.y));
    // 테 쪽은 조금 짙게 — 둥근 입체가 또렷하도록
    col *= 1.0 - pow(1.0 - ndv, 2.0) * 0.14;
    col = mix(col, sky, clamp(0.04 + fres * 0.6, 0.0, 0.85));
    // 공기 방울(uAiry)은 속이 맑고 테만 빛난다
    col = mix(col, mix(uShallow, uSky, 0.55), uAiry * (1.0 - fres) * 0.6);
    // 위 왼쪽의 해(밤엔 달) — 또렷한 반짝 하나와 둘레의 옅은 빛, 그리고 테의 가는 빛
    vec3 L = normalize(vec3(-0.45, 0.7, 0.55));
    float nh = max(dot(n, normalize(L + V)), 0.0);
    col += uSky * (pow(nh, 120.0) * 1.4 + pow(nh, 14.0) * 0.12);
    col += uSky * pow(1.0 - ndv, 7.0) * (0.4 + uAiry * 0.5);
    // 아래쪽 안에 모인 빛(유리를 지난 빛이 반대편에 모인다)
    col += uLight * pow(max(-n.y, 0.0), 2.0) * (1.0 - ndv) * 0.22;
    // 방 띠 — 노틸러스처럼 자라며 생긴 마디 (uv.x 를 따라)
    col *= 1.0 - uBands * smoothstep(0.82, 1.0, sin(vUv.x * 6.2831 * 9.0) * 0.5 + 0.5);
    float a = mix(0.86 + 0.14 * fres, mix(0.34, 1.0, pow(1.0 - ndv, 1.2)), uAiry);
    gl_FragColor = vec4(col, clamp(uOpacity * a, 0.0, 1.0));
    #include <colorspace_fragment>
}
`;

/** 낮 바다 / 달빛 밤바다의 빛깔 */
function palette(dark: boolean) {
    return dark
        ? { deep: "#021417", shallow: "#0B4448", light: "#7FEBDC", sky: "#BFF3EC", caus: 0.45 }
        : { deep: "#0E7377", shallow: "#8FDCD3", light: "#FFFFF0", sky: "#F4FFFD", caus: 0.75 };
}

export interface GlassLook {
    /** 굴절 세기 — 두꺼운 유리일수록 크게 */
    thick?: number;
    opacity?: number;
    /** 노틸러스의 방 띠 세기(0 이면 없음) */
    bands?: number;
    /** 공기 방울 — 속이 맑고 테만 빛난다 */
    airy?: boolean;
    /** 열린 모양(소라 입구·조개 한 쪽)은 안쪽 면도 그린다. 닫힌 모양에 켜면 줄 무늬가 진다(앞뒤 면이 겹쳐 섞인다) */
    open?: boolean;
}

/** 바다를 품은 액체 유리 — uTime·uWobble 은 오브제가 움직인다 */
export function glassMaterial(tone: ObjetTone, look: GlassLook = {}) {
    const uniforms = {
        uTime: { value: Math.random() * 40 },
        uWobble: { value: 0 },
        uThick: { value: look.thick ?? 0.5 },
        uOpacity: { value: look.opacity ?? 0.96 },
        uBands: { value: look.bands ?? 0 },
        uCaus: { value: 0.5 },
        uAiry: { value: look.airy ? 1 : 0 },
        uDeep: { value: new THREE.Color() },
        uShallow: { value: new THREE.Color() },
        uLight: { value: new THREE.Color() },
        uSky: { value: new THREE.Color() },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, side: look.open ? THREE.DoubleSide : THREE.FrontSide });
    const setTone = (t: ObjetTone) => {
        const p = palette(t.dark);
        uniforms.uDeep.value.set(p.deep);
        uniforms.uShallow.value.set(p.shallow);
        uniforms.uLight.value.set(p.light);
        uniforms.uSky.value.set(p.sky);
        uniforms.uCaus.value = p.caus;
    };
    setTone(tone);
    return { material, uniforms, setTone };
}

const PEARL_FRAG = /* glsl */ `
uniform vec3 uBody;
uniform vec3 uEdge;
uniform vec3 uSky;
varying vec3 vN;
varying vec3 vV;
varying vec2 vScreen;
varying vec2 vUv;
void main() {
    vec3 n = normalize(vN);
    vec3 V = normalize(-vV);
    float ndv = clamp(dot(n, V), 0.0, 1.0);
    // 진주의 결 — 가운데는 크림빛, 테로 갈수록 은빛, 그 사이에 옅은 무지개(오리엔트)
    vec3 col = mix(uEdge, uBody, smoothstep(0.0, 0.9, ndv));
    vec3 orient = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + ndv * 1.3 + n.y * 0.25));
    col += (orient - 0.5) * 0.12 * (1.0 - ndv);
    vec3 L = normalize(vec3(-0.45, 0.7, 0.55));
    float nh = max(dot(n, normalize(L + V)), 0.0);
    col += uSky * (pow(nh, 140.0) * 1.2 + pow(nh, 10.0) * 0.1);
    col *= 0.86 + 0.14 * max(dot(n, L), 0.0);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
}
`;

/** 진주 — 크림빛 몸에 은빛 테와 옅은 무지개 결 */
export function pearlMaterial(tone: ObjetTone) {
    const uniforms = {
        uTime: { value: 0 },
        uWobble: { value: 0 },
        uBody: { value: new THREE.Color() },
        uEdge: { value: new THREE.Color() },
        uSky: { value: new THREE.Color() },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: PEARL_FRAG, uniforms });
    const setTone = (t: ObjetTone) => {
        uniforms.uBody.value.set(t.dark ? "#E9E4DA" : "#FBF6EC");
        uniforms.uEdge.value.set(t.dark ? "#7E9A9A" : "#B9C6C4");
        uniforms.uSky.value.set(t.dark ? "#DDF7F2" : "#FFFFFF");
    };
    setTone(tone);
    return { material, uniforms, setTone };
}
