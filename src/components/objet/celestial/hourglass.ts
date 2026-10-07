/**
 * 모래시계 — 금 받침 둘, 기둥 셋, 얇은 유리 속에서 금모래가 가늘게 떨어진다. 천천히 돈다.
 * 할 일이 비었을 때의 그림(시간은 흐르고 있다). 올리면 조금 빨리 돈다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput, ObjetTone } from "../types";
import { Bag, approach } from "../kit";
import { Gold } from "./gold";

const GRAINS = 14;

export const hourglass: ObjetDef = {
    interaction: "hover",
    create({ env, tone, lite }) {
        const bag = new Bag();
        const gold = bag.add(new Gold(env, tone));
        const seg = lite ? 40 : 64;
        const geo = <G extends THREE.BufferGeometry>(g: G) => bag.add(g);

        // 유리 — 비치는 얇은 막(반사광만 또렷하게). 밝은 벌에서는 금빛을 조금 머금어야 테두리가 보인다
        const glass = bag.add(new THREE.MeshStandardMaterial({ metalness: 0, roughness: 0.06, envMap: env, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        // 모래 — 결이 거친 금
        const sand = bag.add(new THREE.MeshStandardMaterial({ metalness: 0.55, roughness: 0.62, envMap: env }));
        const tint = (t: ObjetTone) => {
            glass.color.set(t.dark ? "#E9F0FF" : "#C9A85A");
            glass.opacity = t.dark ? 0.16 : 0.2;
            glass.envMapIntensity = t.dark ? 1.4 : 1.1;
            sand.color.copy(new THREE.Color(t.primary).lerp(new THREE.Color(t.dark ? "#FFE3A0" : "#7A5A18"), t.dark ? 0.15 : 0.25));
            sand.envMapIntensity = t.dark ? 0.9 : 0.8;
        };
        tint(tone);

        const scene = new THREE.Scene();
        scene.add(gold.key);
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 40);
        camera.position.set(0, 1.05, 6.4);
        camera.lookAt(0, 0, 0);

        const root = new THREE.Group();
        root.rotation.z = -0.08;
        scene.add(root);

        // 받침 — 납작한 원판과 테, 가운데 꼭지
        const plate = geo(new THREE.CylinderGeometry(0.62, 0.62, 0.07, seg));
        const rim = geo(new THREE.TorusGeometry(0.62, 0.024, 8, seg));
        const bead = geo(new THREE.SphereGeometry(1, 16, 12));
        for (const s of [-1, 1]) {
            const p = new THREE.Mesh(plate, gold.deep);
            p.position.y = s * 1.12;
            root.add(p);
            for (const e of [-1, 1]) {
                const r = new THREE.Mesh(rim, gold.satin);
                r.rotation.x = Math.PI / 2;
                r.position.y = s * 1.12 + e * 0.035;
                root.add(r);
            }
            const knob = new THREE.Mesh(bead, gold.bright);
            knob.scale.set(0.09, 0.06, 0.09);
            knob.position.y = s * 1.2;
            root.add(knob);
        }

        // 기둥 셋 — 가운데에 작은 구슬
        const pillar = geo(new THREE.CylinderGeometry(0.022, 0.022, 2.16, 10));
        for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
            const x = Math.cos(a) * 0.5, z = Math.sin(a) * 0.5;
            const p = new THREE.Mesh(pillar, gold.satin);
            p.position.set(x, 0, z);
            root.add(p);
            const knot = new THREE.Mesh(bead, gold.bright);
            knot.scale.setScalar(0.04);
            knot.position.set(x, 0, z);
            root.add(knot);
        }

        // 유리 — 위아래로 부푼 두 방울(돌림체)
        const half = new THREE.SplineCurve([
            new THREE.Vector2(0.034, 0), new THREE.Vector2(0.07, 0.07), new THREE.Vector2(0.22, 0.2),
            new THREE.Vector2(0.38, 0.45), new THREE.Vector2(0.42, 0.7), new THREE.Vector2(0.36, 0.92), new THREE.Vector2(0.2, 1.06),
        ]).getPoints(lite ? 20 : 32);
        const profile = [...half.slice().reverse().map((p) => new THREE.Vector2(p.x, -p.y)), ...half.slice(1)];
        root.add(new THREE.Mesh(geo(new THREE.LatheGeometry(profile, seg)), glass));

        // 모래 — 아래에 쌓인 더미, 위에 남은 깔때기, 가는 줄기
        const pile = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.0, 0.37, 0.3, seg, 1)), sand);
        pile.position.y = -0.87;
        root.add(pile);
        const pileBase = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.37, 0.27, 0.12, seg, 1)), sand);
        pileBase.position.y = -1.08 + 0.06 + 0.02;
        root.add(pileBase);
        const left = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.31, 0.04, 0.32, seg, 1)), sand);
        left.position.y = 0.25;
        root.add(left);
        const stream = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.007, 0.007, 0.66, 6)), sand);
        stream.position.y = -0.42;
        root.add(stream);

        // 떨어지는 알갱이
        const grains = bag.add(new THREE.InstancedMesh(bead, gold.bright, GRAINS));
        const m = new THREE.Matrix4();
        const phase = Array.from({ length: GRAINS }, (_, i) => i / GRAINS);
        const jitter = Array.from({ length: GRAINS }, (_, i) => Math.sin(i * 12.9898) * 0.012);
        const placeGrains = (t: number) => {
            for (let i = 0; i < GRAINS; i++) {
                const k = (phase[i] + t) % 1;
                const y = 0.06 - k * k * 0.82;
                m.makeScale(0.013, 0.02, 0.013).setPosition(jitter[i] * k, y, jitter[(i + 3) % GRAINS] * k);
                grains.setMatrixAt(i, m);
            }
            grains.instanceMatrix.needsUpdate = true;
        };
        placeGrains(0);
        root.add(grains);

        let yawV = 0.2;
        let t = 0;
        root.rotation.y = 0.5;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                yawV = approach(yawV, input.hover ? 1 : 0.2, 2.2, dt);
                root.rotation.y += yawV * dt;
                t = (t + dt * 0.4) % 1;
                placeGrains(t);
                return true;
            },
            setTone: (tn) => { gold.setTone(tn); tint(tn); },
            dispose: () => bag.dispose(),
        };
    },
};
