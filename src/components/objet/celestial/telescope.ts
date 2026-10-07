/**
 * 망원경 — 세발 받침 위 갈래 받침대에 걸린 금 경통(띠 셋, 앞 렌즈, 접안경, 작은 파인더).
 * 오른쪽 위의 작은 별 하나를 겨누고, 천천히 좌우를 훑으며 다시 그 별로 돌아온다. 별은 숨 쉬듯 반짝인다.
 * 챌린지가 비었을 때의 그림(별을 겨눈다). 올리면 별이 밝아지고 더 빨리 훑는다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput, ObjetTone } from "../types";
import { Bag, approach } from "../kit";
import { Gold } from "./gold";

export const telescope: ObjetDef = {
    interaction: "hover",
    create({ env, tone, lite }) {
        const bag = new Bag();
        const gold = bag.add(new Gold(env, tone));
        const seg = lite ? 28 : 40;
        const geo = <G extends THREE.BufferGeometry>(g: G) => bag.add(g);
        // 렌즈 — 남빛 유리에 반사광
        const lens = bag.add(new THREE.MeshStandardMaterial({ metalness: 0.2, roughness: 0.08, envMap: env }));
        const tintLens = (t: ObjetTone) => {
            lens.color.set(t.dark ? "#22305A" : "#2B3550");
            lens.envMapIntensity = t.dark ? 1.3 : 1.1;
        };
        tintLens(tone);

        const scene = new THREE.Scene();
        scene.add(gold.key);
        const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 40);
        camera.position.set(0.15, 0.55, 6.6);
        camera.lookAt(0.12, 0.02, 0);

        const root = new THREE.Group();
        root.position.set(-0.22, -0.12, 0);
        scene.add(root);

        // 세발 받침 — 머리에서 셋으로 벌어지는 다리와 가운데 고리
        const head = new THREE.Vector3(0, -0.3, 0);
        const leg = geo(new THREE.CylinderGeometry(0.018, 0.024, 1, 10));
        const feet: THREE.Vector3[] = [];
        for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 + 0.5;
            const foot = new THREE.Vector3(Math.cos(a) * 0.62, -1.3, Math.sin(a) * 0.62);
            feet.push(foot);
            const dir = foot.clone().sub(head);
            const l = new THREE.Mesh(leg, gold.satin);
            l.scale.y = dir.length();
            l.position.copy(head).addScaledVector(dir, 0.5);
            l.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
            root.add(l);
        }
        const spreader = new THREE.Mesh(geo(new THREE.TorusGeometry(0.31, 0.009, 6, 48)), gold.satin);
        spreader.rotation.x = Math.PI / 2;
        spreader.position.y = -0.8;
        root.add(spreader);
        const hub = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.1, 0.12, 0.08, seg)), gold.deep);
        hub.position.copy(head);
        root.add(hub);

        // 갈래 받침대 — 좌우로 도는 부분
        const yoke = new THREE.Group();
        yoke.position.set(0, -0.25, 0);
        root.add(yoke);
        const turntable = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.13, 0.13, 0.04, seg)), gold.satin);
        yoke.add(turntable);
        const arm = geo(new THREE.BoxGeometry(0.035, 0.36, 0.05));
        for (const s of [-1, 1]) {
            const a = new THREE.Mesh(arm, gold.satin);
            a.position.set(0, 0.18, s * 0.17);
            yoke.add(a);
        }

        // 경통 — 위아래로 기우는 부분
        const tube = new THREE.Group();
        tube.position.y = 0.33;
        yoke.add(tube);
        const axle = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 12)), gold.bright);
        axle.rotation.x = Math.PI / 2;
        tube.add(axle);
        const LEN = 1.75;
        const body = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.15, 0.115, LEN, seg)), gold.deep);
        body.rotation.z = -Math.PI / 2; // +x 가 앞
        body.position.x = 0.18;
        tube.add(body);
        const band = (x: number, r: number, w = 0.022) => {
            const b = new THREE.Mesh(geo(new THREE.TorusGeometry(r, w, 8, seg)), gold.bright);
            b.rotation.y = Math.PI / 2;
            b.position.x = x;
            tube.add(b);
        };
        const front = 0.18 + LEN / 2, back = 0.18 - LEN / 2;
        band(front - 0.01, 0.155, 0.026);
        band(front - 0.24, 0.148);
        band(0.18, 0.134);
        band(back + 0.06, 0.12, 0.02);
        const glassDisc = new THREE.Mesh(geo(new THREE.CircleGeometry(0.135, seg)), lens);
        glassDisc.rotation.y = Math.PI / 2;
        glassDisc.position.x = front - 0.02;
        tube.add(glassDisc);
        const eyepiece = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.045, 0.055, 0.22, 16)), gold.satin);
        eyepiece.rotation.z = -Math.PI / 2;
        eyepiece.position.x = back - 0.1;
        tube.add(eyepiece);
        const cap = new THREE.Mesh(geo(new THREE.TorusGeometry(0.05, 0.012, 6, 24)), gold.bright);
        cap.rotation.y = Math.PI / 2;
        cap.position.x = back - 0.21;
        tube.add(cap);
        // 파인더 — 위에 나란히 붙은 가는 통
        const finder = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.035, 0.03, 0.5, 12)), gold.satin);
        finder.rotation.z = -Math.PI / 2;
        finder.position.set(0.55, 0.21, 0);
        tube.add(finder);
        for (const x of [0.4, 0.7]) {
            const foot = new THREE.Mesh(geo(new THREE.BoxGeometry(0.02, 0.07, 0.02)), gold.satin);
            foot.position.set(x, 0.155, 0);
            tube.add(foot);
        }

        // 겨누는 별 — 가는 막대 둘을 엇갈려 만든 네 갈래 빛과 작은 심
        const star = new THREE.Group();
        star.position.set(1.32, 1.18, -0.2);
        root.add(star);
        const ray = geo(new THREE.BoxGeometry(0.5, 0.018, 0.018));
        for (const r of [0, Math.PI / 2]) {
            const b = new THREE.Mesh(ray, gold.sun);
            b.rotation.z = r;
            star.add(b);
        }
        const core = new THREE.Mesh(geo(new THREE.SphereGeometry(0.06, 12, 10)), gold.sun);
        star.add(core);

        // 처음 자세: 별을 겨눈다
        const aim = (): [number, number] => {
            const to = star.position.clone().sub(new THREE.Vector3(0, -0.25 + 0.33, 0));
            return [Math.atan2(-to.z, to.x), Math.atan2(to.y, Math.hypot(to.x, to.z))];
        };
        const [aimYaw, aimPitch] = aim();
        yoke.rotation.y = aimYaw;
        tube.rotation.z = aimPitch;

        let t = 0;
        let sweepV = 0.22;
        let shine = 0;
        root.rotation.y = 0.35;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                sweepV = approach(sweepV, input.hover ? 0.8 : 0.22, 2, dt);
                t += dt * sweepV;
                // 좌우로 훑다가 별로 돌아온다 (돌아올 때 잠깐 멈추듯 천천히)
                const s = Math.sin(t);
                yoke.rotation.y = aimYaw + s * 0.55;
                tube.rotation.z = aimPitch + Math.sin(t * 0.7 + 1) * 0.08 * Math.abs(s);
                shine = approach(shine, input.hover ? 1 : 0, 3, dt);
                const pulse = 0.82 + 0.18 * Math.sin(t * 2.4) + shine * 0.35;
                star.scale.setScalar(pulse);
                star.rotation.z = t * 0.15;
                return true;
            },
            setTone: (tn) => { gold.setTone(tn); tintLens(tn); },
            dispose: () => bag.dispose(),
        };
    },
};
