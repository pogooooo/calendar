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
    vec2 uv = vUv * vec2(uRes.x / uRes.y, 1.0) * 0.9;
    float a = caustic(uv, uTime * 0.45 + 23.0);
    float b = caustic(uv * 1.35 + vec2(0.31, 0.17), uTime * 0.33 + 11.0);
    float light = clamp(a * 0.75 + b * 0.45, 0.0, 1.0);
    // 위쪽(먼 물)은 옅게, 가운데가 가장 밝게
    float fade = smoothstep(0.0, 0.35, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y) * 0.5);
    float alpha = light * fade * mix(0.62, 0.26, uDark);
    gl_FragColor = vec4(mix(vec3(1.0, 1.0, 0.96), vec3(0.62, 1.0, 0.96), uDark), alpha);
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
            const scale = mobile ? 0.35 : 0.5;
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
