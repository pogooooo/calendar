/**
 * 진주 — 바다 유리로 빚은 가리비 한 쪽이 부채처럼 서 있고, 그 아래 경첩 앞에 진주 한 알이 놓여 있다.
 * 가리비는 경첩에서 부채꼴로 퍼지는 둥근 골(늑)과 경첩 양옆의 작은 귀, 가운데가 살짝 오목한 면.
 * 천천히 좌우로 돌아 진주에 맺힌 빛이 옮겨 간다. 빈 기념일 — "날들 가운데 귀한 하나". 올리면 빨리 돈다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput } from "../types";
import { Bag, approach } from "../kit";
import { glassMaterial, pearlMaterial } from "./glass";

/** 가리비 한 쪽 — 경첩(원점)에서 위로 부채꼴로 퍼지고, 둥근 골이 부채살처럼 진다. 경첩 양옆에 작은 귀 */
function scallop(segR: number, segA: number) {
    const span = 1.05;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= segR; i++) {
        const rho = 0.05 + (i / segR) * 0.95;
        for (let j = 0; j <= segA; j++) {
            const phi = -span + (j / segA) * span * 2;
            const side = phi / span;
            // 안쪽을 보는 오목한 접시 — 가운데가 깊고 둘레로 갈수록 앞으로 올라온다
            const dome = -0.22 * Math.sin(Math.PI * Math.min(1, rho)) * (1 - side * side * 0.6);
            const rib = 0.024 * rho * Math.pow(0.5 + 0.5 * Math.cos(phi * 13), 1.4);
            // 경첩 양옆의 귀 — 경첩 가까이에서 부채가 옆으로 넓어진다
            const ear = rho < 0.3 ? (1 - rho / 0.3) * 0.16 * Math.sign(phi) * Math.min(1, Math.abs(side) * 2) : 0;
            const r = rho * (1 + 0.025 * Math.cos(phi * 13));
            pos.push(r * Math.sin(phi) + ear, r * Math.cos(phi), dome + rib);
            uv.push(i / segR, j / segA);
        }
    }
    for (let i = 0; i < segR; i++) {
        for (let j = 0; j < segA; j++) {
            const k = i * (segA + 1) + j;
            idx.push(k, k + 1, k + segA + 1, k + 1, k + segA + 2, k + segA + 1);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
}

export const pearl: ObjetDef = {
    interaction: "hover",
    create({ tone, lite }) {
        const bag = new Bag();
        const glass = glassMaterial(tone, { thick: 0.42, opacity: 0.94, open: true });
        const nacre = pearlMaterial(tone);
        bag.add(glass.material);
        bag.add(nacre.material);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30);
        camera.position.set(0, 0.2, 5.0);
        camera.lookAt(0, -0.18, 0);

        const dish = new THREE.Group();
        // 부채는 비스듬히 뒤로 기대어 서서 오목한 안쪽을 보인다 — 진주는 그 안, 경첩 가까이에
        const fan = new THREE.Mesh(bag.add(scallop(lite ? 22 : 34, lite ? 72 : 120)), glass.material);
        fan.rotation.x = -0.62;
        fan.position.set(0, -0.66, -0.15);
        dish.add(fan);
        const ball = new THREE.Mesh(bag.add(new THREE.SphereGeometry(0.2, lite ? 32 : 48, lite ? 24 : 32)), nacre.material);
        ball.position.set(0.02, -0.36, 0.08);
        dish.add(ball);
        dish.scale.setScalar(1.2);
        scene.add(dish);

        let t = Math.random() * 10;
        let speed = 0.3;
        let phase = Math.random() * 6;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                t += dt;
                speed = approach(speed, input.hover ? 1.2 : 0.3, 2, dt);
                phase += dt * speed;
                glass.uniforms.uTime.value += dt * (0.6 + speed);
                dish.rotation.y = Math.sin(phase * 0.8) * 0.45;
                dish.rotation.x = Math.sin(t * 0.33) * 0.04;
                ball.rotation.y += dt * speed;
                return true;
            },
            setTone: (tn) => { glass.setTone(tn); nacre.setTone(tn); },
            dispose: () => bag.dispose(),
        };
    },
};
