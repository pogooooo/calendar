"use client";
/**
 * 물빛 — 맑은 물 바닥에 어른거리는 빛 그물(caustics). three.js 셰이더로 화면 전체에 그린다.
 *
 * 무겁지 않게: 화면의 절반 해상도로 그리고, 초당 30장까지만. 움직임 '끄기'면 한 장만 그려 두고 멈추고,
 * '잔잔하게'면 천천히, 창이 숨으면 멈춘다. three 는 이 판이 처음 뜰 때 따로 받는다(동적 import).
 * 위젯 창에서는 아예 그리지 않는다 — ThemeAtmosphere 가 위젯 창을 건너뛴다(투명 창이라 깜빡인다).
 */
import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import useThemeMotion from "@/hooks/useThemeMotion";
import * as S from "./OceanAtmosphere.styles";

const FRAG = /* glsl */ `
precision mediump float;
uniform float uTime;
uniform vec2 uRes;
uniform float uDark;
varying vec2 vUv;

// 겹쳐 비틀린 사인 물결의 초점 — 물바닥 빛 그물
float caustic(vec2 uv, float t) {
    vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
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
    vec2 uv = vUv * vec2(uRes.x / uRes.y, 1.0) * 1.45;
    float t = uTime;
    float a = caustic(uv, t * 0.3 + 23.0);
    float b = caustic(uv * 1.3 + vec2(0.31, 0.17), t * 0.22 + 11.0);
    float light = clamp(a * 0.85 + b * 0.45, 0.0, 1.0);
    // 빛 그물 아래 물바닥의 옅은 그늘 — 같은 무늬를 살짝 비껴 (밝은 물에서만)
    float shade = caustic(uv + vec2(0.006, 0.009), t * 0.3 + 23.0);
    // 큰 물결의 밝고 어두움 — 화면이 고르게 덮이지 않게
    float swell = 0.6 + 0.4 * sin(uv.x * 1.6 + t * 0.05) * sin(uv.y * 1.2 - t * 0.04);
    float aL = light * swell * mix(0.74, 0.2, uDark);
    float aS = shade * 0.06 * (1.0 - uDark);
    float alpha = aL + aS * (1.0 - aL);
    vec3 lightCol = mix(vec3(1.0), vec3(0.6, 0.9, 0.86), uDark);
    vec3 col = (lightCol * aL + vec3(0.12, 0.42, 0.41) * aS * (1.0 - aL)) / max(alpha, 0.0001);
    gl_FragColor = vec4(col, alpha);
}
`;

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
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
            const THREE = await import("three");
            if (disposed) return;
            let renderer: import("three").WebGLRenderer;
            try {
                renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
            } catch {
                return; // WebGL 이 없으면 CSS 물빛(정지 그림)만 남는다
            }
            const mobile = window.matchMedia("(max-width: 768px)").matches;
            // 빛 그물이 또렷해야 물로 읽힌다 — 화면의 2/3 해상도(폰은 절반)로 그리고 늘린다
            const scale = mobile ? 0.5 : 0.66;
            renderer.setPixelRatio(1);
            renderer.setClearColor(0x000000, 0);
            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const uniforms = {
                uTime: { value: (performance.now() / 1000) % 1000 },
                uRes: { value: new THREE.Vector2(1, 1) },
                uDark: { value: dark ? 1 : 0 },
            };
            const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, transparent: true, depthTest: false });
            const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
            scene.add(quad);

            const resize = () => {
                const w = Math.max(1, Math.round(window.innerWidth * scale));
                const h = Math.max(1, Math.round(window.innerHeight * scale));
                renderer.setSize(w, h, false);
                uniforms.uRes.value.set(w, h);
                renderer.render(scene, camera);
            };
            resize();
            window.addEventListener("resize", resize);

            const speed = motion === "gentle" ? 0.4 : 1;
            let last = performance.now();
            let acc = 0;
            const tick = (now: number) => {
                raf = requestAnimationFrame(tick);
                const dt = Math.min(0.1, (now - last) / 1000);
                last = now;
                if (document.hidden) return;
                acc += dt;
                if (acc < 1 / 30) return; // 초당 30장까지만
                uniforms.uTime.value += acc * speed;
                acc = 0;
                renderer.render(scene, camera);
            };
            if (motion !== "off") raf = requestAnimationFrame(tick);

            cleanup = () => {
                cancelAnimationFrame(raf);
                window.removeEventListener("resize", resize);
                material.dispose();
                quad.geometry.dispose();
                renderer.dispose();
            };
        })();

        return () => { disposed = true; cleanup(); };
    }, [dark, motion]);

    return <S.Caustics ref={ref} aria-hidden="true" />;
}
