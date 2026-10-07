/**
 * 혼천의(armillary sphere) — 금 고리로 엮은 하늘 공.
 *   정면의 자오환과 극축은 서 있고, 안쪽 천구(적도·두 분지경선·회귀선·극권·23.44° 기운 황도대)가 극축을 따라 천천히 돈다.
 *   황도대에는 5° 마다 잔눈금, 30° 마다 긴 눈금(황도 12궁의 경계), 그리고 오늘 해가 있는 자리에 작은 해 구슬.
 *   한가운데에는 작은 지구.
 * 손: 올리면(또는 active) 천구가 빨리 돌고, 가로로 끌면 혼천의 전체가 돌아간다(놓으면 관성으로 조금 더).
 *
 * options
 *   detail: 'emblem'(기본 — 사이드바처럼 작은 자리) | 'hero'(큰 자리 — 지평환과 자오환 눈금까지)
 *           | 'mark'(아주 작은 자리 20~30px — 고리 넷과 축만, 굵게. 제목 줄·위젯 손잡이 줄)
 *   tilt:   극축이 기운 각(라디안, 화면 안에서). 0 이면 곧게 선다(사이드바의 세로선과 한 줄)
 *   still:  가만히 있다가 올렸을 때(active)만 돈다 — 멈추면 그리기도 멈춘다
 *   stars:  둘레에 성긴 별 껍질(내려받기 화면처럼 넓은 빈자리에서)
 *   frame:  카메라를 이만큼 물린다(1.4 면 혼천의가 칸의 1/1.4) — 칸을 넓혀 둘레의 별이 숨 쉴 틈을 줄 때
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput, ObjetTone } from "../types";
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

/** 성긴 별 껍질 — 둥근 빛 알갱이, 잔별 여럿과 밝은 별 몇 (밝은 벌은 먹 금빛 점, 어두운 벌은 빛) */
function starShell(bag: Bag, tone: ObjetTone, count: number) {
    let s = 11;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const c = sprite.getContext("2d")!;
    const grad = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.75)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = grad;
    c.fillRect(0, 0, 32, 32);
    const map = bag.add(new THREE.CanvasTexture(sprite));
    const group = new THREE.Group();
    const mats: THREE.PointsMaterial[] = [];
    for (const [n, size] of [[count, 0.075], [Math.round(count / 9), 0.14]] as const) {
        const pos = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
            // 혼천의(지평환 1.44) 바로 바깥부터 — 칸 가장자리에서 둥글게 옅어진다
            const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, r = 1.55 + Math.pow(rnd(), 0.7) * 1.05, k = Math.sqrt(1 - u * u);
            pos.set([k * Math.cos(th) * r, u * r, k * Math.sin(th) * r], i * 3);
        }
        const g = bag.add(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const mat = bag.add(new THREE.PointsMaterial({ size, sizeAttenuation: true, map, transparent: true, depthWrite: false }));
        mats.push(mat);
        group.add(new THREE.Points(g, mat));
    }
    const tint = (t: ObjetTone) => mats.forEach((mat) => {
        mat.color.copy(new THREE.Color(t.primary).lerp(new THREE.Color(t.dark ? "#FFF6DC" : "#5E4C20"), t.dark ? 0.45 : 0.35));
        mat.blending = t.dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        mat.opacity = t.dark ? 1 : 0.8;
        mat.needsUpdate = true;
    });
    tint(tone);
    return { points: group, tint };
}

export const armillary: ObjetDef = {
    interaction: "drag",
    create({ env, tone, options, lite }) {
        const hero = options.detail === "hero";
        const mark = options.detail === "mark";
        const still = options.still === true;
        const tilt = typeof options.tilt === "number" ? options.tilt : 0;
        const bag = new Bag();
        const gold = bag.add(new Gold(env, tone));
        const seg = mark ? 72 : lite ? 112 : 180;
        const tubeSeg = mark ? 6 : lite ? 6 : 10;
        // 아주 작은 자리에서는 선을 굵게 — 24px 에서 0.02 굵기는 반 픽셀도 안 된다
        const w = mark ? 2.6 : 1;
        const geo = <G extends THREE.BufferGeometry>(g: G) => bag.add(g);
        const ring = (r: number, tube: number, mat: THREE.Material) =>
            new THREE.Mesh(geo(new THREE.TorusGeometry(r, tube * w, tubeSeg, seg)), mat);

        const scene = new THREE.Scene();
        scene.add(gold.key);
        const far = typeof options.frame === "number" ? options.frame : 1;
        const camera = new THREE.PerspectiveCamera(hero ? 25 : 26, 1, 0.1, 40);
        camera.position.set(0, hero ? 1.55 : 1.45, hero ? 7.3 : mark ? 6.6 : 7.0).multiplyScalar(far);
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
        const axis = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.012 * w, 0.012 * w, mark ? 2.9 : 3.02, 8)), gold.satin);
        frame.add(axis);
        const bead = geo(new THREE.SphereGeometry(1, 16, 12));
        for (const s of [-1, 1]) {
            const tip = new THREE.Mesh(bead, gold.bright);
            tip.scale.setScalar(mark ? 0.09 : 0.048);
            tip.position.y = s * (mark ? 1.45 : 1.53);
            frame.add(tip);
            if (mark) continue;
            const collar = ring(0.034, 0.011, gold.bright);
            collar.rotation.x = Math.PI / 2;
            collar.position.y = s * 1.17;
            frame.add(collar);
        }

        /* ── 도는 것: 천구 ── */
        const equator = ring(1, 0.017, gold.satin);
        equator.rotation.x = Math.PI / 2;
        sphere.add(equator);
        for (const yaw of mark ? [0] : [0, Math.PI / 2]) {
            const colure = ring(1, 0.012, gold.satin);
            colure.rotation.y = yaw;
            sphere.add(colure);
        }
        if (!mark) {
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
        }

        // 황도대 — 기운 띠: 가는 테 둘 사이에 눈금이 사다리처럼(면은 아주 옅게), 그리고 해 구슬
        // (아주 작은 자리에서는 띠 대신 밝은 고리 하나)
        const ecliptic = new THREE.Group();
        ecliptic.rotation.x = OBLIQUITY;
        sphere.add(ecliptic);
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        if (mark) {
            const band = ring(1, 0.016, gold.bright);
            band.rotation.x = Math.PI / 2;
            ecliptic.add(band);
        } else {
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
            for (let i = 0; i < TICKS; i++) {
                const a = (i / TICKS) * Math.PI * 2;
                const long = i % 6 === 0;
                const h = long ? BAND : BAND * 0.45;
                q.setFromAxisAngle(up, a);
                m.compose(new THREE.Vector3(Math.cos(a) * 1.003, BAND / 2 - h / 2, -Math.sin(a) * 1.003), q, new THREE.Vector3(1, h, 1));
                ticks.setMatrixAt(i, m);
            }
            ecliptic.add(ticks);
        }
        const sun = new THREE.Mesh(bead, gold.sun);
        const lambda = sunLongitude();
        sun.scale.setScalar(mark ? 0.12 : 0.062);
        sun.position.set(Math.cos(lambda) * 1.03, 0, -Math.sin(lambda) * 1.03);
        ecliptic.add(sun);

        // 가운데 작은 지구
        const earth = new THREE.Mesh(bead, gold.deep);
        earth.scale.setScalar(mark ? 0.2 : 0.12);
        sphere.add(earth);
        if (!mark) {
            const belt = ring(0.127, 0.006, gold.bright);
            belt.rotation.x = Math.PI / 2;
            sphere.add(belt);
        }

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

        // 둘레의 별 — 혼천의와 함께 돌아 깊이가 보인다
        const shell = options.stars ? starShell(bag, tone, lite ? 160 : 300) : null;
        if (shell) root.add(shell.points);

        /* ── 움직임 ── */
        const base = still ? 0 : BASE_SPIN;
        let spinV = base;
        sphere.rotation.y = 0.85; // 멈춘 한 장에서도 황도대가 비스듬히 보이는 자세
        const turn = new Spin(-0.42);
        let pitch = 0;
        root.rotation.set(0, turn.angle, 0);

        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                spinV = approach(spinV, input.hover ? FAST_SPIN : base, input.hover ? 2.6 : 1.4, dt);
                sphere.rotation.y += spinV * dt;
                const coasting = turn.step(dt, input.dragging, input.dragX);
                pitch = input.dragging ? clamp(pitch + input.dragY * 0.006, -0.42, 0.42) : approach(pitch, 0, 2, dt);
                root.rotation.set(pitch, turn.angle, 0);
                // 늘 천천히 돈다 — 가만히 있는 혼천의(still)는 다 멈추면 그리기를 쉰다
                return !still || spinV > 0.004 || coasting || Math.abs(pitch) > 0.002;
            },
            setTone: (t) => { gold.setTone(t); shell?.tint(t); },
            dispose: () => bag.dispose(),
        };
    },
};
