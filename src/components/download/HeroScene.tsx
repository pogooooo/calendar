"use client";

import * as React from "react";
import * as THREE from "three";
import styled, { useTheme } from "styled-components";

const RINGS = [
    { radius: 1.55, tiltX: 1.25, tiltZ: -0.3, speed: 0.28, size: 0.052, phase: 0 },
    { radius: 1.15, tiltX: 0.5, tiltZ: 0.45, speed: -0.2, size: 0.04, phase: 2.1 },
    { radius: 1.95, tiltX: 0.9, tiltZ: 0.9, speed: 0.14, size: 0.045, phase: 4.4 },
];

export default function HeroScene() {
    const mountRef = React.useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const gold = theme?.colors?.primary ?? "#D4AF37";

    React.useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const color = new THREE.Color(gold);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
        camera.position.z = 5.4;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
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

        const planetPivots: THREE.Group[] = [];

        RINGS.forEach(cfg => {
            const tilt = new THREE.Group();
            tilt.rotation.set(cfg.tiltX, 0, cfg.tiltZ);
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
            const ringMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.32 });
            disposables.push(ringGeo, ringMat);
            tilt.add(new THREE.LineLoop(ringGeo, ringMat));

            const pivot = new THREE.Group();
            pivot.rotation.y = cfg.phase;
            tilt.add(pivot);
            planetPivots.push(pivot);

            const planetGeo = new THREE.SphereGeometry(cfg.size, 14, 14);
            const planetMat = new THREE.MeshBasicMaterial({ color });
            const haloGeo = new THREE.SphereGeometry(cfg.size * 2.1, 14, 14);
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

        const coreGeo = new THREE.IcosahedronGeometry(0.36, 1);
        const coreWire = new THREE.WireframeGeometry(coreGeo);
        const coreMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 });
        const core = new THREE.LineSegments(coreWire, coreMat);
        disposables.push(coreGeo, coreWire, coreMat);
        root.add(core);

        const glowGeo = new THREE.SphereGeometry(0.14, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.5,
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
                planetPivots.forEach((p, i) => {
                    p.rotation.y += RINGS[i].speed * dt;
                });
                core.rotation.y += dt * 0.25;
                core.rotation.x += dt * 0.1;
            }

            renderer.render(scene, camera);
            if (running) raf = requestAnimationFrame(render);
        };

        const onVisibility = () => {
            if (document.hidden) {
                running = false;
                cancelAnimationFrame(raf);
            } else if (!running) {
                running = true;
                clock.getDelta();
                raf = requestAnimationFrame(render);
            }
        };
        document.addEventListener("visibilitychange", onVisibility);

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
            document.removeEventListener("visibilitychange", onVisibility);
            renderer.domElement.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            disposables.forEach(d => d.dispose());
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, [gold]);

    return <Mount ref={mountRef} aria-hidden="true" />;
}

const Mount = styled.div`
    width: 100%;
    height: 100%;

    canvas {
        width: 100% !important;
        height: 100% !important;
    }
`;
