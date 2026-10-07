/**
 * 아스트롤라베 — 금판(mater) 위에 새긴 고도선, 그 앞에서 천천히 도는 성좌판(rete: 황도 고리와 별 바늘),
 * 맨 앞의 가늠자(alidade)는 반대로 돈다. 판 전체는 좌우로 천천히 갸웃해 두께가 보인다.
 * 프로젝트가 비었을 때의 그림(계획을 재는 기구). 올리면 성좌판이 빨리 돈다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput, ObjetTone } from "../types";
import { Bag, approach } from "../kit";
import { Gold } from "./gold";

export const astrolabe: ObjetDef = {
    interaction: "hover",
    create({ env, tone, lite }) {
        const bag = new Bag();
        const gold = bag.add(new Gold(env, tone));
        const seg = lite ? 96 : 144;
        const geo = <G extends THREE.BufferGeometry>(g: G) => bag.add(g);
        const ring = (r: number, tube: number, mat: THREE.Material) => new THREE.Mesh(geo(new THREE.TorusGeometry(r, tube, 6, seg)), mat);
        // 판 — 테마의 종이·밤 빛을 머금은 칠 (금 새김이 그 위에서 또렷하게: 금빛 선 그림 그대로)
        const plate = bag.add(new THREE.MeshStandardMaterial({ metalness: 0.3, roughness: 0.55, envMap: env }));
        const tintPlate = (t: ObjetTone) => {
            plate.color.set(t.dark ? "#1A2132" : "#EAE0C6");
            plate.envMapIntensity = t.dark ? 0.6 : 0.5;
        };
        tintPlate(tone);

        const scene = new THREE.Scene();
        scene.add(gold.key);
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 40);
        camera.position.set(0, 0.25, 6.3);
        camera.lookAt(0, 0.08, 0);

        const root = new THREE.Group();
        root.rotation.x = -0.12;
        scene.add(root);

        // 몸판 — 두께 있는 원판(면은 깊은 금), 도드라진 테
        const mater = new THREE.Mesh(geo(new THREE.CylinderGeometry(1, 1, 0.08, seg)), plate);
        mater.rotation.x = Math.PI / 2;
        root.add(mater);
        const limb = ring(0.97, 0.045, gold.satin);
        limb.position.z = 0.03;
        root.add(limb);

        // 고리걸이(throne) — 위에 작은 받침과 고리
        const throne = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.07, 0.19, 0.16, 24)), gold.satin);
        throne.position.y = 1.03;
        root.add(throne);
        const shackle = ring(0.11, 0.024, gold.bright);
        shackle.position.y = 1.24;
        root.add(shackle);

        // 테 눈금 — 5° 마다, 15° 마다 길게
        const ticks = bag.add(new THREE.InstancedMesh(geo(new THREE.BoxGeometry(1, 0.012, 0.01)), gold.bright, 72));
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const Z = new THREE.Vector3(0, 0, 1);
        for (let i = 0; i < 72; i++) {
            const a = (i / 72) * Math.PI * 2;
            const len = i % 3 === 0 ? 0.11 : 0.055;
            const r = 0.9 - len / 2;
            q.setFromAxisAngle(Z, a);
            m.compose(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.045), q, new THREE.Vector3(len, 1, 1));
            ticks.setMatrixAt(i, m);
        }
        root.add(ticks);

        // 판에 새긴 선 — 회귀선·적도(가운데 원), 고도선(위로 치우친 원), 지평선
        const engrave = (r: number, cy: number, tube = 0.0075) => {
            const c = ring(r, tube, gold.satin);
            c.position.set(0, cy, 0.043);
            root.add(c);
        };
        engrave(0.74, 0, 0.008);
        engrave(0.46, 0);
        engrave(0.28, 0);
        engrave(0.6, 0.1, 0.007);
        engrave(0.43, 0.2);
        engrave(0.29, 0.28);
        engrave(0.16, 0.33);
        const cross = new THREE.Mesh(geo(new THREE.BoxGeometry(1.48, 0.008, 0.006)), gold.satin);
        cross.position.z = 0.043;
        root.add(cross);
        const crossV = cross.clone();
        crossV.rotation.z = Math.PI / 2;
        root.add(crossV);

        // 성좌판 — 황도 고리(치우친 원), 바깥 고리, 살 넷, 별 바늘
        const rete = new THREE.Group();
        rete.position.z = 0.075;
        root.add(rete);
        const ecl = ring(0.5, 0.018, gold.bright);
        ecl.position.y = 0.18;
        rete.add(ecl);
        rete.add(ring(0.74, 0.016, gold.bright));
        const strut = geo(new THREE.BoxGeometry(0.018, 1, 0.012));
        for (const a of [0.4, 1.9, 3.5, 5.0]) {
            // 바깥 고리에서 황도 고리까지
            const outer = new THREE.Vector2(Math.cos(a) * 0.74, Math.sin(a) * 0.74);
            const inner = new THREE.Vector2(Math.cos(a) * 0.5, Math.sin(a) * 0.5 + 0.18);
            const len = outer.distanceTo(inner);
            const s = new THREE.Mesh(strut, gold.bright);
            s.scale.y = len;
            s.position.set((outer.x + inner.x) / 2, (outer.y + inner.y) / 2, 0);
            s.rotation.z = Math.atan2(outer.y - inner.y, outer.x - inner.x) - Math.PI / 2;
            rete.add(s);
        }
        const flame = geo(new THREE.ConeGeometry(0.03, 0.13, 8));
        const bead = geo(new THREE.SphereGeometry(1, 12, 10));
        for (const [a, r] of [[0.9, 0.62], [2.4, 0.66], [3.1, 0.3], [4.3, 0.64], [5.6, 0.58], [1.5, 0.82]]) {
            const f = new THREE.Mesh(flame, gold.bright);
            f.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
            f.rotation.z = a - Math.PI / 2;
            rete.add(f);
            const tip = new THREE.Mesh(bead, gold.bright);
            tip.scale.setScalar(0.022);
            tip.position.set(Math.cos(a) * (r + 0.075), Math.sin(a) * (r + 0.075), 0);
            rete.add(tip);
        }

        // 가늠자 — 가운데를 지나는 가는 자, 끝이 뾰족
        const rule = new THREE.Group();
        rule.position.z = 0.11;
        root.add(rule);
        const bar = new THREE.Mesh(geo(new THREE.BoxGeometry(1.62, 0.05, 0.016)), gold.satin);
        rule.add(bar);
        for (const s of [-1, 1]) {
            const tipCone = new THREE.Mesh(flame, gold.satin);
            tipCone.scale.set(0.9, 1.3, 0.5);
            tipCone.position.x = s * 0.89;
            tipCone.rotation.z = -s * Math.PI / 2;
            rule.add(tipCone);
        }
        const pin = new THREE.Mesh(bead, gold.bright);
        pin.scale.set(0.05, 0.05, 0.03);
        pin.position.z = 0.13;
        root.add(pin);

        let reteV = 0.14;
        let t = 0;
        rete.rotation.z = 0.6;
        rule.rotation.z = -0.5;
        root.rotation.y = -0.32;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                reteV = approach(reteV, input.hover ? 1.1 : 0.14, 2.4, dt);
                rete.rotation.z += reteV * dt;
                rule.rotation.z -= reteV * 0.35 * dt;
                t += dt;
                root.rotation.y = -0.32 + Math.sin(t * 0.22) * 0.26;
                return true;
            },
            setTone: (tn) => { gold.setTone(tn); tintPlate(tn); },
            dispose: () => bag.dispose(),
        };
    },
};
