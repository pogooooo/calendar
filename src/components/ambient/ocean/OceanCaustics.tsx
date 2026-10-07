"use client";
/**
 * 물 — 화면 전체를 three.js 셰이더 한 장으로 그린다. 바다 갈래의 주인공.
 *   - 물빛: 깊은 청록·맑은 물빛·얕은 모래빛이 천천히 자리를 바꾼다 (위가 깊고 아래가 얕다)
 *   - 빛 그물(caustics): 빨강·초록·파랑을 살짝 비껴 그려 가장자리에 프리즘 같은 무지개빛, 가장 밝은 자리는 반짝인다
 *   - 햇살 기둥: 위에서 비스듬히 내려오는 옅은 빛줄기
 *   - 손: 커서 둘레의 물이 살짝 휘며 밝아지고, 누른 자리에서 물결 고리가 번진다(작은 방울도 몇 개 올라온다)
 *     폰은 커서가 없으니 기기 기울기(parallax)가 그 자리를 맡는다 — 기울이면 빛 그물이 미끄러지고 물이 휘는 자리가 옮겨 간다
 *   - 물속의 것: 떠오르는 공기 방울과 유리 구슬(oceanBubbles) — 이 물을 굴절해 비추고 빛 그물이 지나면 반짝인다
 *
 * 무겁지 않게: 무거운 물 셰이더는 화면의 약 0.6 배(폰 0.45) 렌더 타깃에 그리고, 화면에는 그것을 늘려 깔면서
 * 방울만 화면 해상도로 그린다(방울 테가 뭉개지지 않게). 같은 캔버스·같은 WebGL 하나. 초당 30장까지만, 폰은 프리즘·반짝임을 뺀다.
 * 움직임 '끄기'면 한 장만 그려 두고 멈추고, '잔잔하게'면 천천히(손·기울기 반응 없음, 방울도 적게), 창이 숨으면 멈춘다.
 * 위젯 창에서는 아예 그리지 않는다 — ThemeAtmosphere 가 위젯 창을 건너뛴다(투명 창이라 깜빡인다).
 * WebGL 이 없으면 OceanGround 의 CSS 그라데이션이 바탕으로 남는다.
 */
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import useThemeMotion from "@/hooks/useThemeMotion";
import { parallax } from "@/lib/parallax";
import * as S from "./OceanAtmosphere.styles";

const CLICKS = 4;

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uDark;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform vec3 uClicks[${CLICKS}];
uniform float uHQ;
uniform vec2 uTilt;
varying vec2 vUv;

// 겹쳐 비틀린 사인 물결의 초점 — 물바닥 빛 그물. mod 로 접지 않는다(접힌 자리에 세로 이음매가 보였다)
float caustic(vec2 uv, float t) {
    vec2 p = uv * 6.28318 - 250.0;
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

void main() {
    float aspect = uRes.x / uRes.y;
    vec2 st = vUv;
    vec2 P = vec2(st.x * aspect, st.y);
    float t = uTime;

    // 손이 닿은 물 — 커서(폰은 기울기) 둘레가 살짝 휘고, 누른 자리에서 물결 고리가 번진다
    vec2 dm = P - vec2(uMouse.x * aspect, uMouse.y);
    float dist = length(dm);
    vec2 warp = normalize(dm + 1e-5) * sin(dist * 38.0 - t * 5.0) * 0.005 * exp(-dist * 7.0) * uMouseOn;
    float ringGlow = 0.0;
    for (int k = 0; k < ${CLICKS}; k++) {
        vec3 c = uClicks[k];
        float age = t - c.z;
        if (age > 0.0 && age < 2.4) {
            vec2 dc = P - vec2(c.x * aspect, c.y);
            float d = length(dc);
            float band = exp(-pow((d - age * 0.42) * 20.0, 2.0)) * (1.0 - age / 2.4);
            warp += normalize(dc + 1e-5) * band * 0.012;
            ringGlow += band;
        }
    }
    // 기울이면 빛 그물이 미끄러진다 — 수면이 기운 만큼 물바닥의 빛이 옮겨 간다
    vec2 uv = (P + warp) * 1.45 + uTilt;

    // 물빛 — 위가 깊고 아래가 얕으며, 깊은 곳·얕은 곳이 천천히 옮겨 다닌다
    float drift = 0.5 + 0.5 * sin(P.x * 1.3 + t * 0.03) * sin(P.y * 1.7 - t * 0.025 + 1.2);
    float depth = mix(drift, 1.0 - st.y, 0.55);
    vec3 deep    = mix(vec3(0.15, 0.60, 0.63), vec3(0.025, 0.12, 0.14), uDark);
    vec3 mid     = mix(vec3(0.46, 0.80, 0.78), vec3(0.04, 0.19, 0.21), uDark);
    vec3 shallow = mix(vec3(0.82, 0.92, 0.89), vec3(0.06, 0.15, 0.16), uDark);
    vec3 sand    = mix(vec3(0.94, 0.91, 0.84), vec3(0.06, 0.10, 0.11), uDark);
    vec3 water = mix(shallow, mid, smoothstep(0.2, 0.62, depth));
    water = mix(water, deep, smoothstep(0.62, 1.0, depth));
    water = mix(sand, water, smoothstep(0.0, 0.42, st.y + 0.1 * drift));

    // 빛 그물 — 세 빛깔을 살짝 비껴 그려 가장자리에 프리즘 무지개빛 (폰은 한 겹)
    float ts = t * 0.3 + 23.0;
    float cg = caustic(uv, ts);
    float cr = cg;
    float cb = cg;
    if (uHQ > 0.5) {
        cr = caustic(uv + vec2(0.004, 0.0), ts);
        cb = caustic(uv - vec2(0.004, 0.0), ts);
    }
    float c2 = caustic(uv * 1.3 + vec2(0.31, 0.17), t * 0.22 + 11.0);
    float swell = 0.62 + 0.38 * sin(uv.x * 1.1 + t * 0.05) * sin(uv.y * 0.9 - t * 0.04);
    vec3 lightCol = mix(vec3(1.0, 1.0, 0.97), vec3(0.5, 0.95, 0.87), uDark);
    vec3 caus = (vec3(cr, cg, cb) * 0.85 + c2 * 0.4) * swell;
    // 깊은 물일수록 빛 그물이 또렷하다 (모래 위는 옅게)
    float lightAmt = mix(0.62, 0.3, uDark) * mix(0.55, 1.0, smoothstep(0.1, 0.7, depth));
    vec3 col = water + caus * lightCol * lightAmt;

    // 햇살 기둥 — 위에서 비스듬히 내려오는 옅은 빛줄기 (밤에는 거의 없다). 기울이면 해 자리도 조금 옮겨 간다
    vec2 rp = st - vec2(0.28 + uTilt.x * 0.5, 1.25);
    float ang = atan(rp.x, -rp.y);
    float rays = pow(0.5 + 0.5 * sin(ang * 24.0 + t * 0.11), 6.0) * 0.6 + pow(0.5 + 0.5 * sin(ang * 11.0 - t * 0.07 + 1.7), 8.0) * 0.4;
    rays *= smoothstep(0.05, 1.0, st.y) * (1.0 - uDark * 0.8);
    col += rays * 0.08 * lightCol;

    // 햇빛 반짝임 — 빛 그물이 가장 밝은 자리에서 반짝 (칸으로 나눠 반짝이면 네모난 조각이 보여서, 매끈한 물결로)
    float peak = smoothstep(0.8, 1.0, cg) * uHQ;
    float tw = 0.5 + 0.5 * sin(t * 5.0 + uv.x * 37.0 + uv.y * 53.0);
    col += peak * tw * tw * mix(0.4, 0.22, uDark) * lightCol;

    // 커서 둘레는 물이 조금 더 밝고, 누른 물결 고리는 빛난다
    col += exp(-dist * 4.5) * 0.07 * uMouseOn * lightCol;
    col += ringGlow * 0.16 * lightCol;

    // 알파 칸에는 이 자리의 빛 그물 세기를 적어 둔다 — 방울이 읽어 반짝인다 (화면에 깔 때는 버린다)
    gl_FragColor = vec4(col, clamp((cg * 0.8 + c2 * 0.4) * swell * 1.3, 0.0, 1.0));
}
`;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

/** 낮은 해상도로 그린 물을 화면 크기로 깐다 */
const BLIT = /* glsl */ `
precision highp float;
uniform sampler2D uWater;
varying vec2 vUv;
void main() { gl_FragColor = vec4(texture2D(uWater, vUv).rgb, 1.0); }
`;

export default function OceanCaustics() {
    const ref = useRef<HTMLCanvasElement>(null);
    const theme = useTheme();
    const motion = useThemeMotion();
    const dark = theme.mode === "dark";

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        let disposed = false;
        let raf = 0;
        let cleanup = () => {};

        (async () => {
            let THREE: typeof import("three");
            let createBubbles: typeof import("./oceanBubbles").createBubbles;
            try {
                [THREE, { createBubbles }] = await Promise.all([import("three"), import("./oceanBubbles")]);
            } catch {
                return;
            }
            if (disposed) return;
            let renderer: import("three").WebGLRenderer;
            try {
                renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
            } catch {
                return; // WebGL 이 없으면 CSS 물빛(OceanGround 의 그라데이션)만 남는다
            }
            const mobile = window.matchMedia("(max-width: 768px)").matches;
            // 물은 낮게, 화면(방울)은 CSS 픽셀 그대로 — 아주 큰 창은 화면도 조금 줄인다
            const waterScale = mobile ? 0.45 : 0.6;
            renderer.setPixelRatio(1);
            renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const target = new THREE.WebGLRenderTarget(1, 1, {
                depthBuffer: false,
                stencilBuffer: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                generateMipmaps: false,
            });
            const uniforms = {
                uTime: { value: 20 + ((performance.now() / 1000) % 600) },
                uRes: { value: new THREE.Vector2(1, 1) },
                uDark: { value: dark ? 1 : 0 },
                uMouse: { value: new THREE.Vector2(0.5, 0.5) },
                uMouseOn: { value: 0 },
                uClicks: { value: Array.from({ length: CLICKS }, () => new THREE.Vector3(0, 0, -100)) },
                uHQ: { value: mobile ? 0 : 1 },
                uTilt: { value: new THREE.Vector2(0, 0) },
            };
            const plane = new THREE.PlaneGeometry(2, 2);
            const waterMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
            const waterScene = new THREE.Scene();
            waterScene.add(new THREE.Mesh(plane, waterMat));
            const blitMat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: BLIT, uniforms: { uWater: { value: target.texture } }, depthTest: false, depthWrite: false });
            const viewScene = new THREE.Scene();
            const blit = new THREE.Mesh(plane, blitMat);
            blit.frustumCulled = false;
            viewScene.add(blit);
            const bubbles = createBubbles(THREE, { mobile, motion, dark, water: target.texture });
            viewScene.add(bubbles.mesh);

            const draw = () => {
                renderer.setRenderTarget(target);
                renderer.render(waterScene, camera);
                renderer.setRenderTarget(null);
                renderer.render(viewScene, camera);
            };

            const resize = () => {
                const W = Math.max(1, window.innerWidth), H = Math.max(1, window.innerHeight);
                const viewScale = Math.min(1, Math.sqrt(2_400_000 / (W * H)));
                const w = Math.max(1, Math.round(W * waterScale));
                const h = Math.max(1, Math.round(H * waterScale));
                target.setSize(w, h);
                uniforms.uRes.value.set(w, h);
                renderer.setSize(Math.max(1, Math.round(W * viewScale)), Math.max(1, Math.round(H * viewScale)), false);
                bubbles.resize(W, H);
                if (motion === "off") bubbles.still();
                draw();
            };
            resize();
            window.addEventListener("resize", resize);

            // 손 — 커서를 따라 물이 휘고, 누르면 물결 고리와 방울. 폰은 커서 대신 기울기. '잔잔하게'·끄기면 손에 반응하지 않는다
            const interactive = motion === "full";
            const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
            const aim = { x: 0.5, y: 0.5 };
            let lastMove = -10;
            let nextClick = 0;
            const onMove = (e: PointerEvent) => {
                aim.x = e.clientX / window.innerWidth;
                aim.y = 1 - e.clientY / window.innerHeight;
                lastMove = performance.now();
            };
            const onDown = (e: PointerEvent) => {
                const slot = uniforms.uClicks.value[nextClick];
                slot.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight, uniforms.uTime.value);
                nextClick = (nextClick + 1) % CLICKS;
                bubbles.release(e.clientX, e.clientY);
            };
            const stopParallax = interactive ? parallax.start() : () => {};
            if (interactive) {
                // 손가락이 끄는 것은 화면 굴리기다 — 물을 휘는 것은 마우스만
                if (finePointer) window.addEventListener("pointermove", onMove, { passive: true });
                window.addEventListener("pointerdown", onDown, { passive: true });
            }

            const speed = motion === "gentle" ? 0.4 : 1;
            const still = { x: 0, y: 0 };
            let last = performance.now();
            let acc = 0;
            const tick = (now: number) => {
                raf = requestAnimationFrame(tick);
                const dt = Math.min(0.1, (now - last) / 1000);
                last = now;
                if (document.hidden) return;
                acc += dt;
                if (acc < 1 / 30) return; // 초당 30장까지만
                const step = Math.min(acc, 0.1);
                acc = 0;
                uniforms.uTime.value += step * speed;
                const p = interactive ? parallax.read() : still;
                const tilted = interactive && parallax.source === "tilt";
                if (tilted) {
                    // 기울기가 커서 자리를 맡는다 — 기운 쪽으로 물이 휘는 자리가 옮겨 가고, 기울수록 또렷하다
                    aim.x = 0.5 + p.x * 0.34;
                    aim.y = 0.5 - p.y * 0.34;
                }
                // 커서는 부드럽게 따라가고, 2초 가만히 있으면 손 기운이 빠진다
                const m = uniforms.uMouse.value;
                m.x += (aim.x - m.x) * Math.min(1, step * 6);
                m.y += (aim.y - m.y) * Math.min(1, step * 6);
                const on = tilted ? Math.min(1, Math.hypot(p.x, p.y) * 2.5) * 0.85 : interactive && now - lastMove < 2000 ? 1 : 0;
                uniforms.uMouseOn.value += (on - uniforms.uMouseOn.value) * Math.min(1, step * 3);
                const tk = tilted ? 0.2 : 0.04;
                uniforms.uTilt.value.set(p.x * tk, -p.y * tk);
                bubbles.step(step, p, tilted ? p.x * 0.4 : 0);
                draw();
            };
            if (motion !== "off") raf = requestAnimationFrame(tick);

            cleanup = () => {
                cancelAnimationFrame(raf);
                window.removeEventListener("resize", resize);
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerdown", onDown);
                stopParallax();
                bubbles.dispose();
                waterMat.dispose();
                blitMat.dispose();
                plane.dispose();
                target.dispose();
                renderer.dispose();
            };
        })();

        return () => { disposed = true; cleanup(); };
    }, [dark, motion]);

    return <S.Caustics ref={ref} aria-hidden="true" />;
}
