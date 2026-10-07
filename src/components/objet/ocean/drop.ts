/**
 * 물방울 — 위가 뾰족한 눈물 모양의 액체 유리(glass.ts). 천천히 돌며 겉이 물처럼 일렁이고 살짝 떠오른다 가라앉는다.
 * 빈 할 일 — "맑은 물 한 방울". 올리면 빨리 일렁인다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput } from "../types";
import { Bag, approach } from "../kit";
import { glassMaterial } from "./glass";

/** 눈물 모양의 옆선 — 위 끝이 뾰족하고 아래가 둥근 곡선(x = sin t · sin(t/2), y = cos t) */
function dropProfile(steps: number) {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI;
        pts.push(new THREE.Vector2(Math.max(0.0005, Math.sin(t) * Math.pow(Math.sin(t / 2), 1.1)), Math.cos(t)));
    }
    return pts;
}

export const drop: ObjetDef = {
    interaction: "hover",
    create({ tone, lite }) {
        const bag = new Bag();
        const glass = glassMaterial(tone, { thick: 0.55 });
        bag.add(glass.material);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30);
        camera.position.set(0, 0.15, 5.6);
        camera.lookAt(0, 0, 0);
        const geo = bag.add(new THREE.LatheGeometry(dropProfile(lite ? 40 : 64), lite ? 40 : 64));
        const body = new THREE.Mesh(geo, glass.material);
        body.position.y = 0.12;
        body.rotation.z = 0.12;
        scene.add(body);

        let t = Math.random() * 10;
        let flow = 0.3;
        let wob = 0.006;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                t += dt;
                flow = approach(flow, input.hover ? 1.2 : 0.3, 2, dt);
                wob = approach(wob, input.hover ? 0.02 : 0.006, 2, dt);
                glass.uniforms.uTime.value += dt * flow * 3;
                glass.uniforms.uWobble.value = wob;
                body.rotation.y += dt * (0.25 + flow * 0.2);
                body.position.y = 0.12 + Math.sin(t * 0.9) * 0.04;
                return true;
            },
            setTone: (tn) => glass.setTone(tn),
            dispose: () => bag.dispose(),
        };
    },
};
