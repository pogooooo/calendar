/**
 * 혼천의(armillary sphere) — 금 고리로 엮은 하늘 공.
 *   정면의 자오환과 극축은 서 있고, 안쪽 천구(적도·두 분지경선·회귀선·극권·23.44° 기운 황도대)가 극축을 따라 천천히 돈다.
 *   황도대에는 5° 마다 잔눈금, 30° 마다 긴 눈금(황도 12궁의 경계), 그리고 오늘 해가 있는 자리에 작은 해 구슬.
 *   한가운데에는 작은 지구.
 * 손: 올리면(또는 active) 천구가 빨리 돌고, 가로로 끌면 혼천의 전체가 돌아간다(놓으면 관성으로 조금 더).
 *
 * options
 *   detail: 'emblem'(기본 — 사이드바처럼 작은 자리) | 'hero'(큰 자리 — 지평환과 자오환 눈금까지)
 *   tilt:   극축이 기운 각(라디안, 화면 안에서). 0 이면 곧게 선다(사이드바의 세로선과 한 줄)
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput } from "../types";
import { Bag, Spin, approach, clamp } from "../kit";
import { Gold } from "./gold";

const OBLIQUITY = THREE.MathUtils.degToRad(23.44);

/** 오늘 해의 황경(라디안) — 해 구슬을 황도 위 제자리에 둔다 (천문 연감의 낮은 정밀 식, 1° 안쪽) */
export function sunLongitude(date = new Date()) {
    const d = date.getTime() / 86_400_000 - 10_957.5; // J2000.0 부터 지난 날
    const g = THREE.MathUtils.degToRad(357.529 + 0.98560028 * d);
    const L = 280.459 + 0.98564736 * d + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
    return THREE.MathUtils.degToRad(((L % 360) + 360) % 360);
}

const BASE_SPIN = 0.18;
const FAST_SPIN = 1.6;

export const armillary: ObjetDef = {
    interaction: "drag",
    create({ env, tone, options, lite }) {
        const hero = options.detail === "hero";
        const tilt = typeof options.tilt === "number" ? options.tilt : 0;
        const bag = new Bag();
        const gold = bag.add(new Gold(env, tone));
        const seg = lite ? 112 : 180;
        const tubeSeg = lite ? 6 : 10;
        const geo = <G extends THREE.BufferGeometry>(g: G) => bag.add(g);
        const ring = (r: number, tube: number, mat: THREE.Material) =>
            new THREE.Mesh(geo(new THREE.TorusGeometry(r, tube, tubeSeg, seg)), mat);

        const scene = new THREE.Scene();
        scene.add(gold.key);
        const camera = new THREE.PerspectiveCamera(hero ? 25 : 26, 1, 0.1, 40);
        camera.position.set(0, hero ? 1.55 : 1.45, hero ? 7.3 : 7.0);
        camera.lookAt(0, hero ? -0.06 : 0, 0);

        const root = new THREE.Group();   // 끌기: 좌우로 돌고 위아래로 살짝 숙인다
        const frame = new THREE.Group();  // 자오환 + 극축 — 화면 안에서 tilt 만큼 기운다
        const sphere = new THREE.Group(); // 극축을 따라 도는 천구
        scene.add(root);
        root.add(frame);
        frame.add(sphere);
        frame.rotation.z = -tilt;

        /* ── 서 있는 것: 자오환·극축 ── */
        frame.add(ring(1.17, 0.022, gold.satin));
        const axis = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.012, 0.012, 3.02, 8)), gold.satin);
        frame.add(axis);
        const bead = geo(new THREE.SphereGeometry(1, 16, 12));
        for (const s of [-1, 1]) {
            const tip = new THREE.Mesh(bead, gold.bright);
            tip.scale.setScalar(0.048);
            tip.position.y = s * 1.53;
            frame.add(tip);
            const collar = ring(0.034, 0.011, gold.bright);
            collar.rotation.x = Math.PI / 2;
            collar.position.y = s * 1.17;
            frame.add(collar);
        }

        /* ── 도는 것: 천구 ── */
        const equator = ring(1, 0.017, gold.satin);
        equator.rotation.x = Math.PI / 2;
        sphere.add(equator);
        for (const yaw of [0, Math.PI / 2]) {
            const colure = ring(1, 0.012, gold.satin);
            colure.rotation.y = yaw;
            sphere.add(colure);
        }
        for (const s of [-1, 1]) {
            const tropic = ring(Math.cos(OBLIQUITY), 0.009, gold.satin);
            tropic.rotation.x = Math.PI / 2;
            tropic.position.y = s * Math.sin(OBLIQUITY);
            sphere.add(tropic);
            const polar = ring(Math.sin(OBLIQUITY), 0.008, gold.satin);
            polar.rotation.x = Math.PI / 2;
            polar.position.y = s * Math.cos(OBLIQUITY);
            sphere.add(polar);
        }

        // 황도대 — 기운 띠: 가는 테 둘 사이에 눈금이 사다리처럼(면은 아주 옅게), 그리고 해 구슬
        const ecliptic = new THREE.Group();
        ecliptic.rotation.x = OBLIQUITY;
        sphere.add(ecliptic);
        const BAND = 0.1;
        ecliptic.add(new THREE.Mesh(geo(new THREE.CylinderGeometry(0.998, 0.998, BAND, seg, 1, true)), gold.veil));
        for (const s of [-1, 1]) {
            const rim = ring(1, 0.0085, gold.satin);
            rim.rotation.x = Math.PI / 2;
            rim.position.y = (s * BAND) / 2;
            ecliptic.add(rim);
        }
        const TICKS = 72;
        const ticks = bag.add(new THREE.InstancedMesh(geo(new THREE.BoxGeometry(0.012, 1, 0.007)), gold.bright, TICKS));
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        for (let i = 0; i < TICKS; i++) {
            const a = (i / TICKS) * Math.PI * 2;
            const long = i % 6 === 0;
            const h = long ? BAND : BAND * 0.45;
            q.setFromAxisAngle(up, a);
            m.compose(new THREE.Vector3(Math.cos(a) * 1.003, BAND / 2 - h / 2, -Math.sin(a) * 1.003), q, new THREE.Vector3(1, h, 1));
            ticks.setMatrixAt(i, m);
        }
        ecliptic.add(ticks);
        const sun = new THREE.Mesh(bead, gold.sun);
        const lambda = sunLongitude();
        sun.scale.setScalar(0.062);
        sun.position.set(Math.cos(lambda) * 1.03, 0, -Math.sin(lambda) * 1.03);
        ecliptic.add(sun);

        // 가운데 작은 지구
        const earth = new THREE.Mesh(bead, gold.deep);
        earth.scale.setScalar(0.12);
        sphere.add(earth);
        const belt = ring(0.127, 0.006, gold.bright);
        belt.rotation.x = Math.PI / 2;
        sphere.add(belt);

        /* ── 큰 자리에서만: 지평환(눕힌 넓은 고리, 눈금)과 자오환 눈금 ── */
        if (hero) {
            const profile = [
                new THREE.Vector2(1.3, -0.02), new THREE.Vector2(1.44, -0.02),
                new THREE.Vector2(1.44, 0.02), new THREE.Vector2(1.3, 0.02), new THREE.Vector2(1.3, -0.02),
            ];
            const horizon = new THREE.Mesh(geo(new THREE.LatheGeometry(profile, seg)), gold.satin);
            root.add(horizon);
            const hTicks = bag.add(new THREE.InstancedMesh(geo(new THREE.BoxGeometry(1, 0.008, 0.012)), gold.bright, 72));
            for (let i = 0; i < 72; i++) {
                const a = (i / 72) * Math.PI * 2;
                const len = i % 6 === 0 ? 0.12 : 0.05;
                q.setFromAxisAngle(up, a);
                m.compose(new THREE.Vector3(Math.cos(a) * (1.44 - len / 2), 0.024, -Math.sin(a) * (1.44 - len / 2)), q, new THREE.Vector3(len, 1, 1));
                hTicks.setMatrixAt(i, m);
            }
            root.add(hTicks);
            const mTicks = bag.add(new THREE.InstancedMesh(geo(new THREE.BoxGeometry(1, 0.01, 0.01)), gold.bright, 72));
            const fwd = new THREE.Vector3(0, 0, 1);
            for (let i = 0; i < 72; i++) {
                const a = (i / 72) * Math.PI * 2;
                const len = i % 9 === 0 ? 0.09 : 0.045;
                q.setFromAxisAngle(fwd, a);
                m.compose(new THREE.Vector3(Math.cos(a) * (1.2 + len / 2), Math.sin(a) * (1.2 + len / 2), 0), q, new THREE.Vector3(len, 1, 1));
                mTicks.setMatrixAt(i, m);
            }
            frame.add(mTicks);
        }

        /* ── 움직임 ── */
        let spinV = BASE_SPIN;
        sphere.rotation.y = 0.85; // 멈춘 한 장에서도 황도대가 비스듬히 보이는 자세
        const turn = new Spin(-0.42);
        let pitch = 0;
        root.rotation.set(0, turn.angle, 0);

        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                spinV = approach(spinV, input.hover ? FAST_SPIN : BASE_SPIN, input.hover ? 2.6 : 1.4, dt);
                sphere.rotation.y += spinV * dt;
                turn.step(dt, input.dragging, input.dragX);
                pitch = input.dragging ? clamp(pitch + input.dragY * 0.006, -0.42, 0.42) : approach(pitch, 0, 2, dt);
                root.rotation.set(pitch, turn.angle, 0);
                return true; // 천구는 늘 천천히 돈다
            },
            setTone: (t) => gold.setTone(t),
            dispose: () => bag.dispose(),
        };
    },
};
