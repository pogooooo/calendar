/**
 * 소라 — 바다 유리로 빚은 앵무조개(노틸러스). 관이 로그 나선을 따라 한 바퀴에 세 배씩 굵어지며 감기고,
 * 자라며 생긴 마디가 옅은 띠로 보인다. 천천히 돌아 옆모습·입구를 번갈아 보인다.
 * 빈 프로젝트 — "방을 하나씩 더하며 자란다". 올리면 빨리 돈다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput } from "../types";
import { Bag, approach } from "../kit";
import { glassMaterial } from "./glass";

/** 로그 나선을 따라 감기는 관 — u(나선)·v(관 둘레). 바깥 끝의 반지름이 1 */
function nautilus(segU: number, segV: number) {
    const turns = 2.3;
    const U = turns * Math.PI * 2;
    const b = Math.log(3) / (Math.PI * 2); // 한 바퀴에 세 배
    const a = Math.exp(-b * U);
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= segU; i++) {
        const u = (i / segU) * U;
        const R = a * Math.exp(b * u);
        const r = R * 0.52;
        const cx = R * Math.cos(u), cy = R * Math.sin(u);
        for (let j = 0; j <= segV; j++) {
            const v = (j / segV) * Math.PI * 2;
            // 단면은 납작한 타원 — 바깥쪽(나선의 반지름 방향)으로 r, 옆(z)으로 0.8r
            const out = Math.cos(v) * r, side = Math.sin(v) * r * 0.8;
            pos.push(cx + Math.cos(u) * out, cy + Math.sin(u) * out, side);
            uv.push(i / segU, j / segV);
        }
    }
    for (let i = 0; i < segU; i++) {
        for (let j = 0; j < segV; j++) {
            const k = i * (segV + 1) + j;
            idx.push(k, k + segV + 1, k + 1, k + 1, k + segV + 1, k + segV + 2);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.computeBoundingBox();
    const c = new THREE.Vector3();
    g.boundingBox!.getCenter(c);
    g.translate(-c.x, -c.y, -c.z);
    return g;
}

export const shell: ObjetDef = {
    interaction: "hover",
    create({ tone, lite }) {
        const bag = new Bag();
        const glass = glassMaterial(tone, { thick: 0.45, bands: 0.1, open: true });
        bag.add(glass.material);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30);
        camera.position.set(0, 0.2, 5.1);
        camera.lookAt(0, 0, 0);
        const body = new THREE.Mesh(bag.add(nautilus(lite ? 150 : 240, lite ? 18 : 26)), glass.material);
        body.scale.setScalar(0.92);
        const pivot = new THREE.Group();
        pivot.add(body);
        pivot.rotation.set(0.25, 0, -0.35);
        scene.add(pivot);

        let t = Math.random() * 10;
        let speed = 0.35;
        let phase = Math.random() * 6;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                t += dt;
                speed = approach(speed, input.hover ? 1.4 : 0.35, 2, dt);
                phase += dt * speed * 0.6;
                glass.uniforms.uTime.value += dt * (0.8 + speed);
                // 옆모습과 입구가 번갈아 보이도록 — 크게 흔들며 돈다
                body.rotation.y = Math.sin(phase) * 0.9;
                body.rotation.x = Math.sin(t * 0.37) * 0.12;
                return true;
            },
            setTone: (tn) => glass.setTone(tn),
            dispose: () => bag.dispose(),
        };
    },
};
