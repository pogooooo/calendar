/**
 * 오러리(orrery) — 금 해를 가운데 두고 세 궤도가 한 판에 비스듬히 누운 태양계 모형.
 * 행성은 안쪽일수록 빨리 돌고(케플러처럼), 가운데 행성에는 작은 달이, 바깥 행성에는 가는 고리가 있다.
 * 궤도는 저마다 몇 도씩 기울어 겹친 타원이 단조롭지 않다. 올리면(active) 모두 빨리 돈다.
 * 설정 화면 머리의 옛 궤도 그림(타원 셋)을 대신한다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput } from "../types";
import { Bag, approach } from "../kit";
import { Gold } from "./gold";

const ORBITS = [
    { r: 0.62, size: 0.05, speed: 0.42, tilt: 0.05, phase: 0.6 },
    { r: 0.98, size: 0.07, speed: 0.22, tilt: -0.07, phase: 2.5, moon: true },
    { r: 1.36, size: 0.085, speed: 0.13, tilt: 0.1, phase: 4.4, ring: true },
];

export const orrery: ObjetDef = {
    interaction: "hover",
    create({ env, tone, lite }) {
        const bag = new Bag();
        const gold = bag.add(new Gold(env, tone));
        const seg = lite ? 112 : 160;
        const geo = <G extends THREE.BufferGeometry>(g: G) => bag.add(g);
        const bead = geo(new THREE.SphereGeometry(1, 20, 14));

        const scene = new THREE.Scene();
        scene.add(gold.key);
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 40);
        camera.position.set(0, 2.55, 6.2);
        camera.lookAt(0, -0.05, 0);

        const root = new THREE.Group();
        root.rotation.z = -0.12;
        scene.add(root);

        // 해 — 가운데의 밝은 금 구슬과 가는 띠
        const sun = new THREE.Mesh(bead, gold.sun);
        sun.scale.setScalar(0.16);
        root.add(sun);
        const corona = new THREE.Mesh(geo(new THREE.TorusGeometry(0.24, 0.007, 6, 64)), gold.bright);
        corona.rotation.x = Math.PI / 2;
        root.add(corona);

        const pivots: THREE.Group[] = [];
        const moons: THREE.Group[] = [];
        for (const o of ORBITS) {
            const plane = new THREE.Group();
            plane.rotation.set(o.tilt, 0, o.tilt * 0.6);
            root.add(plane);
            const orbit = new THREE.Mesh(geo(new THREE.TorusGeometry(o.r, 0.009, 6, seg)), gold.satin);
            orbit.rotation.x = Math.PI / 2;
            plane.add(orbit);
            const pivot = new THREE.Group();
            pivot.rotation.y = o.phase;
            plane.add(pivot);
            pivots.push(pivot);
            const planet = new THREE.Mesh(bead, gold.bright);
            planet.scale.setScalar(o.size);
            planet.position.x = o.r;
            pivot.add(planet);
            if (o.ring) {
                const ring = new THREE.Mesh(geo(new THREE.TorusGeometry(o.size * 1.75, 0.006, 6, 48)), gold.satin);
                ring.position.x = o.r;
                ring.rotation.set(Math.PI / 2 - 0.45, 0, 0.3);
                pivot.add(ring);
            }
            if (o.moon) {
                const m = new THREE.Group();
                m.position.x = o.r;
                pivot.add(m);
                const tiny = new THREE.Mesh(bead, gold.satin);
                tiny.scale.setScalar(0.024);
                tiny.position.x = o.size + 0.07;
                m.add(tiny);
                moons.push(m);
            }
        }

        let k = 1;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                k = approach(k, input.hover ? 3.2 : 1, 2.2, dt);
                pivots.forEach((p, i) => { p.rotation.y += ORBITS[i].speed * k * dt; });
                moons.forEach((m) => { m.rotation.y += 1.6 * k * dt; });
                return true;
            },
            setTone: (t) => gold.setTone(t),
            dispose: () => bag.dispose(),
        };
    },
};
