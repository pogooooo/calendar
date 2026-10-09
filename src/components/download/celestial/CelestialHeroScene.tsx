"use client";

import * as React from "react";
import * as THREE from "three";
import { useTheme } from "styled-components";
import * as S from "./CelestialHeroScene.styles";
import useThemeMotion from '@/hooks/useThemeMotion';
import CelestialArcana from '@/assets/celestial/CelestialArcana';

type Ring = { radius: number; rot: [number, number, number]; opacity: number; planet?: { size: number; speed: number; phase: number } };

/**
 * 혼천의의 고리 — 적도환(가로), 축을 품은 자오환 둘(세로), 23.4° 기운 황도환, 안팎의 궤도.
 * 축은 늘 세로로 선다(저절로 도는 것도, 끄는 것도 축 둘레와 앞뒤 기울기뿐) — 비스듬히 기운 것은 황도환 하나다.
 * 행성은 황도환과 안팎의 궤도를 돈다.
 */
const RINGS: Ring[] = [
    { radius: 1.5, rot: [0, 0, 0], opacity: 0.42 },
    { radius: 1.5, rot: [Math.PI / 2, 0, 0], opacity: 0.34 },
    { radius: 1.5, rot: [0, 0, Math.PI / 2], opacity: 0.22 },
    { radius: 1.5, rot: [0, 0, 0.41], opacity: 0.5, planet: { size: 0.055, speed: 0.28, phase: 0 } },
    { radius: 1.98, rot: [0, 0, 0], opacity: 0.2, planet: { size: 0.045, speed: -0.14, phase: 2.6 } },
    { radius: 1.1, rot: [0, 0, 0], opacity: 0.18, planet: { size: 0.036, speed: 0.22, phase: 4.4 } },
];
/** 축의 반 길이 — 남북극 */
const POLE = 2.15;

export default function HeroScene() {
    const mountRef = React.useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const gold = theme.colors.primary;
    const motion = useThemeMotion();
    // WebGL 이 없으면(막힌 GPU·WebGL2 가 없는 옛 기기) 움직임 끔과 같은 그림으로 — 렌더러가 던지면 내려받기 화면 전체가 오류 화면이 됐다
    const [flat, setFlat] = React.useState(false);

    React.useEffect(() => {
        const mount = mountRef.current;
        if (!mount || motion === 'off' || flat) return;

        const reduced = motion === 'gentle';
        const color = new THREE.Color(gold);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
        camera.position.z = 5.4;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch {
            setFlat(true);
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.domElement.style.display = "block";
        renderer.domElement.style.touchAction = "pan-y";
        renderer.domElement.style.cursor = "grab";
        mount.appendChild(renderer.domElement);

        const root = new THREE.Group();
        root.rotation.set(0.3, -0.5, 0);
        scene.add(root);

        const disposables: { dispose: () => void }[] = [];

        const starCount = 460;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const t = (i + 0.5) / starCount;
            const phi = Math.acos(1 - 2 * t);
            const th = Math.PI * (1 + Math.sqrt(5)) * i;
            const r = 2.4 + ((i * 37) % 100) / 100 * 0.9;
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(th);
            starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(th);
            starPos[i * 3 + 2] = r * Math.cos(phi);
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({
            color,
            size: 0.024,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        disposables.push(starGeo, starMat);
        root.add(new THREE.Points(starGeo, starMat));

        const planetPivots: { pivot: THREE.Group; speed: number }[] = [];

        RINGS.forEach(cfg => {
            const tilt = new THREE.Group();
            tilt.rotation.set(...cfg.rot);
            root.add(tilt);

            const segs = 128;
            const ringPos = new Float32Array(segs * 3);
            for (let i = 0; i < segs; i++) {
                const a = (i / segs) * Math.PI * 2;
                ringPos[i * 3] = Math.cos(a) * cfg.radius;
                ringPos[i * 3 + 1] = 0;
                ringPos[i * 3 + 2] = Math.sin(a) * cfg.radius;
            }
            const ringGeo = new THREE.BufferGeometry();
            ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
            const ringMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: cfg.opacity });
            disposables.push(ringGeo, ringMat);
            tilt.add(new THREE.LineLoop(ringGeo, ringMat));

            if (!cfg.planet) return;
            const pivot = new THREE.Group();
            pivot.rotation.y = cfg.planet.phase;
            tilt.add(pivot);
            planetPivots.push({ pivot, speed: cfg.planet.speed });

            const planetGeo = new THREE.SphereGeometry(cfg.planet.size, 14, 14);
            const planetMat = new THREE.MeshBasicMaterial({ color });
            const haloGeo = new THREE.SphereGeometry(cfg.planet.size * 2.1, 14, 14);
            const haloMat = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.16,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            disposables.push(planetGeo, planetMat, haloGeo, haloMat);

            const planet = new THREE.Mesh(planetGeo, planetMat);
            planet.position.x = cfg.radius;
            const halo = new THREE.Mesh(haloGeo, haloMat);
            halo.position.x = cfg.radius;
            pivot.add(planet, halo);
        });

        // 축 — 남북극을 잇는 곧은 선, 끝에 작은 구슬
        const axisGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -POLE, 0), new THREE.Vector3(0, POLE, 0)]);
        const axisMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
        const poleGeo = new THREE.SphereGeometry(0.034, 10, 10);
        const poleMat = new THREE.MeshBasicMaterial({ color });
        disposables.push(axisGeo, axisMat, poleGeo, poleMat);
        root.add(new THREE.Line(axisGeo, axisMat));
        [-POLE, POLE].forEach(y => {
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.y = y;
            root.add(pole);
        });

        // 가운데 — 작은 구(땅)와 옅은 빛 (예전의 삼각 철망 구 대신)
        const coreGeo = new THREE.SphereGeometry(0.15, 24, 24);
        const coreMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
        disposables.push(coreGeo, coreMat);
        root.add(new THREE.Mesh(coreGeo, coreMat));

        const glowGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        disposables.push(glowGeo, glowMat);
        root.add(new THREE.Mesh(glowGeo, glowMat));

        let targetRX = 0.3;
        let targetRY = -0.5;
        let velX = 0;
        let velY = 0;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let raf = 0;
        let running = true;
        let inView = true;
        const clock = new THREE.Clock();

        const onDown = (e: PointerEvent) => {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            velX = 0;
            velY = 0;
            renderer.domElement.style.cursor = "grabbing";
        };

        const onMove = (e: PointerEvent) => {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            velY = dx * 0.005;
            velX = dy * 0.005;
            targetRY += velY;
            targetRX = Math.max(-1.2, Math.min(1.2, targetRX + velX));
        };

        const onUp = () => {
            dragging = false;
            renderer.domElement.style.cursor = "grab";
        };

        renderer.domElement.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        // 폰에서 세로로 끌면 브라우저가 스크롤로 가져가며 pointerup 대신 pointercancel 을 준다 — 예전엔 쥔 채로 남아 저절로 돌지 않고, 그 뒤 화면 어디를 문질러도 장면이 돌았다
        window.addEventListener("pointercancel", onUp);

        const render = () => {
            const dt = Math.min(clock.getDelta(), 0.05);

            if (!dragging) {
                velX *= 0.94;
                velY *= 0.94;
                targetRY += velY;
                targetRX = Math.max(-1.2, Math.min(1.2, targetRX + velX));
                if (!reduced) targetRY += dt * 0.12;
            }

            root.rotation.x += (targetRX - root.rotation.x) * 0.08;
            root.rotation.y += (targetRY - root.rotation.y) * 0.08;

            if (!reduced) {
                planetPivots.forEach(({ pivot, speed }) => {
                    pivot.rotation.y += speed * dt;
                });
            }

            renderer.render(scene, camera);
            if (running) raf = requestAnimationFrame(render);
        };

        // 탭이 숨었거나 스크롤로 화면 밖에 나가면 쉰다 — 예전엔 아래 내용을 읽는 내내 보이지 않는 장면을 매 프레임 그렸다
        const sync = () => {
            const want = inView && !document.hidden;
            if (!want && running) {
                running = false;
                cancelAnimationFrame(raf);
            } else if (want && !running) {
                running = true;
                clock.getDelta();
                raf = requestAnimationFrame(render);
            }
        };
        document.addEventListener("visibilitychange", sync);
        const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
        io.observe(mount);

        const resize = () => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(mount);

        raf = requestAnimationFrame(render);

        return () => {
            running = false;
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            document.removeEventListener("visibilitychange", sync);
            renderer.domElement.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            disposables.forEach(d => d.dispose());
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, [gold,motion,flat]);

    return <S.Mount ref={mountRef} aria-hidden="true">{(motion === 'off' || flat) && <CelestialArcana />}</S.Mount>;
}

