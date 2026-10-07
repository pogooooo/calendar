/**
 * 방울 — 바다 유리 방울 몇 개가 크기대로 천천히 떠오르며 지그재그로 흔들린다. 위에 닿으면 작아져 사라지고 아래에서 다시 맺힌다.
 * 빈 챌린지 — "하루하루 위로 오른다". 올리면 빨리 오른다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput } from "../types";
import { Bag, approach } from "../kit";
import { glassMaterial } from "./glass";

const SET = [
    { r: 0.42, x: -0.12, phase: 0.05, sway: 0.1 },
    { r: 0.28, x: 0.34, phase: 0.42, sway: 0.13 },
    { r: 0.2, x: -0.38, phase: 0.66, sway: 0.15 },
    { r: 0.14, x: 0.2, phase: 0.86, sway: 0.18 },
    { r: 0.1, x: -0.05, phase: 0.3, sway: 0.2 },
];

export const bubbles: ObjetDef = {
    interaction: "hover",
    create({ tone, lite }) {
        const bag = new Bag();
        const glass = glassMaterial(tone, { thick: 0.34, airy: true });
        bag.add(glass.material);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30);
        camera.position.set(0, 0, 6);
        const ball = bag.add(new THREE.SphereGeometry(1, lite ? 32 : 48, lite ? 24 : 32));
        const items = SET.map((b) => {
            const m = new THREE.Mesh(ball, glass.material);
            scene.add(m);
            return { ...b, m, k: b.phase };
        });

        let t = Math.random() * 10;
        let speed = 0.12;
        const place = () => {
            for (const it of items) {
                // 아래(-1.3)에서 위(1.3)로 — 끝에서는 작아져 사라지고 다시 맺힌다
                const y = -1.3 + it.k * 2.6;
                const fade = Math.min(1, it.k / 0.12, (1 - it.k) / 0.14);
                it.m.position.set(it.x + Math.sin(t * 2.1 + it.phase * 9) * it.sway * 0.5, y, 0);
                it.m.scale.setScalar(it.r * Math.max(0.001, fade));
            }
        };
        place();
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                t += dt;
                speed = approach(speed, input.hover ? 0.4 : 0.12, 2, dt);
                // 큰 방울이 빨리 오른다
                for (const it of items) it.k = (it.k + dt * speed * (0.6 + it.r * 1.6)) % 1;
                glass.uniforms.uTime.value += dt * (0.6 + speed * 2);
                place();
                return true;
            },
            setTone: (tn) => glass.setTone(tn),
            dispose: () => bag.dispose(),
        };
    },
};
