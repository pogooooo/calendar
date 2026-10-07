/**
 * 구슬 — 바다를 품은 액체 유리 공 하나(glass.ts). 안에서 빛 그물이 천천히 흐르고 공은 아주 느리게 돈다.
 * 손: 올리면(또는 active) 물이 빨리 흐르고 겉이 물처럼 일렁인다.
 *
 * options.still: 가만히 있다가 올렸을 때(active)만 흐른다 — 멈추면 그리기도 쉰다(테마 고르기 타일).
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput } from "../types";
import { Bag, approach } from "../kit";
import { glassMaterial } from "./glass";

export const orb: ObjetDef = {
    interaction: "hover",
    create({ tone, options, lite }) {
        const still = options.still === true;
        const bag = new Bag();
        const glass = glassMaterial(tone, { thick: 0.6 });
        bag.add(glass.material);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 30);
        camera.position.set(0, 0, 5.6);
        const ball = new THREE.Mesh(bag.add(new THREE.SphereGeometry(1, lite ? 48 : 72, lite ? 32 : 48)), glass.material);
        ball.rotation.set(0.2, 0.4, 0);
        scene.add(ball);

        const idle = still ? 0 : 0.25;
        let flow = idle;
        let wob = 0;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                flow = approach(flow, input.hover ? 1.2 : idle, input.hover ? 2.4 : 1.6, dt);
                wob = approach(wob, input.hover ? 0.018 : 0, 2, dt);
                glass.uniforms.uTime.value += dt * flow * 3;
                glass.uniforms.uWobble.value = wob;
                ball.rotation.y += dt * flow * 0.3;
                // 가만히 있는 구슬(still)은 다 멈추면 그리기를 쉰다
                return !still || flow > 0.003 || wob > 0.0005;
            },
            setTone: (t) => glass.setTone(t),
            dispose: () => bag.dispose(),
        };
    },
};
