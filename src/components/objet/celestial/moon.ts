/**
 * 달 — 바다(어두운 무늬)를 그린 공을 해가 비춘다. 해 구슬이 둘레 고리를 따라 돌면 달이 차고 기운다
 * (삭 → 상현 → 보름 → 하현). 고리에는 여덟 위상 자리의 작은 구슬.
 * 기념일이 비었을 때의 그림(되풀이되는 날들). 올리면 위상이 빨리 돈다.
 *
 * options.phase: 'today' — 오늘의 실제 위상에 멈춘 달 하나(고리 없이, 한 장만 그린다).
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput, ObjetTone } from "../types";
import { Bag, approach } from "../kit";
import { Gold } from "./gold";

const SYNODIC = 29.530588853;
/** 오늘의 위상(0 삭, 0.25 상현, 0.5 보름, 0.75 하현) — 2000-01-06 18:14 UTC 의 삭에서 센다 */
export function moonPhase(date = new Date()) {
    const days = (date.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86_400_000;
    return (((days / SYNODIC) % 1) + 1) % 1;
}

/** 달의 앞면 무늬 — 큰 바다들(대략의 셀레노 좌표)과 밝은 충돌구 몇 개. r 채널: 1 고지, 낮을수록 바다 */
function mariaTexture(size = 512) {
    const W = size, H = size / 2;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    g.fillStyle = "#fff";
    g.fillRect(0, 0, W, H);
    const at = (lat: number, lon: number) => [(0.25 + lon / 360) * W, ((90 - lat) / 180) * H] as const;
    const blob = (lat: number, lon: number, rLat: number, rLon: number, depth: number) => {
        const [x, y] = at(lat, lon);
        const rx = (rLon / 360) * W / Math.max(0.35, Math.cos((lat * Math.PI) / 180));
        const ry = (rLat / 180) * H;
        g.save();
        g.translate(x, y);
        g.scale(rx / ry, 1);
        const grad = g.createRadialGradient(0, 0, 0, 0, 0, ry);
        const v = Math.round(255 * (1 - depth));
        grad.addColorStop(0, `rgba(${v},${v},${v},1)`);
        grad.addColorStop(0.62, `rgba(${v},${v},${v},0.85)`);
        grad.addColorStop(1, `rgba(${v},${v},${v},0)`);
        g.fillStyle = grad;
        g.beginPath();
        g.arc(0, 0, ry, 0, Math.PI * 2);
        g.fill();
        g.restore();
    };
    blob(33, -16, 19, 19, 0.42);   // 비의 바다
    blob(28, 17, 10, 10, 0.44);    // 맑음의 바다
    blob(8, 31, 13, 14, 0.42);     // 고요의 바다
    blob(17, 59, 8, 9, 0.46);      // 위난의 바다
    blob(18, -57, 30, 20, 0.36);   // 폭풍의 대양
    blob(-5, -40, 16, 14, 0.3);
    blob(-21, -17, 11, 12, 0.36);  // 구름의 바다
    blob(-8, 51, 10, 9, 0.38);     // 풍요의 바다
    blob(-15, 35, 6, 6, 0.36);     // 감로의 바다
    blob(56, 1, 5, 32, 0.34);      // 추위의 바다
    blob(-24, -39, 7, 7, 0.38);    // 습기의 바다
    blob(13, 4, 4, 5, 0.32);       // 증기의 바다
    // 고운 얼룩
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 260; i++) {
        const v = 200 + Math.floor(rnd() * 55);
        g.fillStyle = `rgba(${v},${v},${v},${0.08 + rnd() * 0.1})`;
        g.beginPath();
        g.arc(rnd() * W, rnd() * H, 1 + rnd() * 3, 0, Math.PI * 2);
        g.fill();
    }
    // 밝은 충돌구 — 튀코·코페르니쿠스·케플러
    for (const [lat, lon, r] of [[-43, -11, 2.4], [10, -20, 2], [8, -38, 1.5]] as const) {
        const [x, y] = at(lat, lon);
        const grad = g.createRadialGradient(x, y, 0, x, y, r * 3);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.beginPath();
        g.arc(x, y, r * 3, 0, Math.PI * 2);
        g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.NoColorSpace;
    tex.anisotropy = 2;
    return tex;
}

const VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec2 vUv;
void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform vec3 uLight;
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec3 uRim;
uniform float uShadeAlpha;
varying vec3 vN;
varying vec3 vV;
varying vec2 vUv;
void main() {
    vec3 n = normalize(vN);
    float m = texture2D(uMap, vUv).r;
    float ndl = dot(n, normalize(uLight));
    float day = smoothstep(-0.05, 0.16, ndl);
    vec3 lit = uLit * mix(0.62, 1.0, m) * (0.8 + 0.2 * clamp(ndl * 1.6, 0.0, 1.0));
    vec3 shade = uShade * mix(0.8, 1.0, m);
    vec3 col = mix(shade, lit, day);
    // 가장자리의 가는 금빛 — 어두운 쪽에서도 달의 둥근 꼴이 보이게
    float rim = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 3.0);
    col = mix(col, uRim, rim * 0.75);
    float alpha = max(mix(uShadeAlpha, 1.0, day), rim * 0.95);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
}
`;

export const moon: ObjetDef = {
    interaction: "hover",
    create({ env, tone, options, lite }) {
        const today = options.phase === "today";
        const bag = new Bag();
        const gold = bag.add(new Gold(env, tone));
        const geo = <G extends THREE.BufferGeometry>(g: G) => bag.add(g);
        const map = bag.add(mariaTexture(lite ? 256 : 512));
        const light = new THREE.Vector3(1, 0, 0);
        const uniforms = {
            uMap: { value: map },
            uLight: { value: light },
            uLit: { value: new THREE.Color() },
            uShade: { value: new THREE.Color() },
            uRim: { value: new THREE.Color() },
            uShadeAlpha: { value: 1 },
        };
        const mat = bag.add(new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true }));
        const tint = (t: ObjetTone) => {
            const p = new THREE.Color(t.primary);
            if (t.dark) {
                uniforms.uLit.value.copy(p).lerp(new THREE.Color("#FFF6E0"), 0.62);
                uniforms.uShade.value.set("#2A3247");
                uniforms.uRim.value.copy(p);
                uniforms.uShadeAlpha.value = 0.9;
            } else {
                // 아이보리 종이 위 — 연감의 그림처럼: 빛 받는 쪽은 금빛, 그늘은 종이보다 한 톤 가라앉은 면과 금 테두리
                // (작은 자리에서 가는 초승달만 빛나도 둥근 달이 읽히게 그늘을 조금 더 세운다)
                uniforms.uLit.value.copy(p).lerp(new THREE.Color("#F2DA8E"), 0.38);
                uniforms.uShade.value.copy(p).lerp(new THREE.Color("#D8D0BC"), 0.82);
                uniforms.uRim.value.copy(p).lerp(new THREE.Color("#6E5A2A"), 0.3);
                uniforms.uShadeAlpha.value = 0.5;
            }
        };
        tint(tone);

        const scene = new THREE.Scene();
        scene.add(gold.key);
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 40);
        camera.position.set(0, today ? 0 : 1.15, today ? 5.2 : 6.2);
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();

        const R = today ? 1 : 0.62;
        const ball = new THREE.Mesh(geo(new THREE.SphereGeometry(R, lite ? 40 : 64, lite ? 28 : 44)), mat);
        scene.add(ball);

        // 둘레 고리 — 여덟 위상 구슬, 해 구슬이 고리를 따라 돈다
        const orbit = new THREE.Group();
        let sun: THREE.Mesh | null = null;
        if (!today) {
            scene.add(orbit);
            const ring = new THREE.Mesh(geo(new THREE.TorusGeometry(1.02, 0.011, 6, lite ? 96 : 160)), gold.satin);
            ring.rotation.x = Math.PI / 2;
            orbit.add(ring);
            const bead = geo(new THREE.SphereGeometry(1, 14, 10));
            for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2;
                const b = new THREE.Mesh(bead, gold.bright);
                b.scale.setScalar(k % 2 === 0 ? 0.034 : 0.024);
                b.position.set(Math.sin(a) * 1.02, 0, -Math.cos(a) * 1.02);
                orbit.add(b);
            }
            sun = new THREE.Mesh(bead, gold.sun);
            sun.scale.setScalar(0.07);
            orbit.add(sun);
        }

        // 위상 → 빛 방향: 0 삭(뒤에서), 0.25 상현(오른쪽), 0.5 보름(앞에서). 셰이더는 카메라 공간에서 본다
        const setPhase = (p: number) => {
            const a = p * Math.PI * 2;
            light.set(Math.sin(a), 0.1, -Math.cos(a)).normalize().transformDirection(camera.matrixWorldInverse);
            if (sun) sun.position.set(Math.sin(a) * 1.02, 0, -Math.cos(a) * 1.02);
        };
        let phase = today ? moonPhase() : 0.3;
        setPhase(phase);
        ball.rotation.set(0.12, 0, 0.08);

        let speed = 0.04;
        let t = 0;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                t += dt;
                if (today) return false; // 오늘의 달은 멈춘 한 장 — 위상이 곧 그림이다
                speed = approach(speed, input.hover ? 0.24 : 0.04, 2.4, dt);
                phase = (phase + speed * dt) % 1;
                setPhase(phase);
                ball.rotation.y = Math.sin(t * 0.3) * 0.1;
                return true;
            },
            setTone: (tn) => { gold.setTone(tn); tint(tn); },
            dispose: () => bag.dispose(),
        };
    },
};
