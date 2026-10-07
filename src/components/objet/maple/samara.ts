/**
 * 시과(단풍나무 씨앗) — 씨 한 알에 얇은 날개 하나. 떨어질 때처럼 날개를 비스듬히 기울인 채 씨를 축으로 빙글 돈다.
 * 날개는 잎맥이 부채살처럼 퍼진 반투명 막(황토빛, 가장자리는 붉게), 씨는 둥근 갈색 알.
 * 손: 올리면(또는 active) 빨리 돈다. options.still: 가만히 있다가 올렸을 때만 돈다.
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput, ObjetTone } from "../types";
import { Bag, approach } from "../kit";

/** 날개 그림 — 씨 쪽(왼쪽)이 좁고 끝이 둥글게 넓어지는 날, 씨에서 퍼지는 잎맥, 가장자리는 붉게 물든다 */
function wingTexture() {
    const W = 512, H = 192;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    if (!g) return c;
    const path = new Path2D();
    path.moveTo(18, H * 0.56);
    path.bezierCurveTo(W * 0.3, H * 0.18, W * 0.62, H * 0.04, W * 0.88, H * 0.12);
    path.bezierCurveTo(W * 1.0, H * 0.18, W * 0.99, H * 0.6, W * 0.86, H * 0.74);
    path.bezierCurveTo(W * 0.62, H * 0.92, W * 0.3, H * 0.86, 18, H * 0.66);
    path.closePath();
    const fill = g.createLinearGradient(0, 0, W, 0);
    fill.addColorStop(0, "#9C6A3C");
    fill.addColorStop(0.35, "#D8B07A");
    fill.addColorStop(0.8, "#D9975A");
    fill.addColorStop(1, "#B5432B");
    g.fillStyle = fill;
    g.fill(path);
    g.save();
    g.clip(path);
    // 잎맥 — 씨에서 날개 끝으로 퍼진다(위쪽 가장자리를 따라 굵은 맥 하나)
    g.strokeStyle = "rgba(90, 52, 26, 0.55)";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(18, H * 0.58);
    g.bezierCurveTo(W * 0.3, H * 0.24, W * 0.62, H * 0.1, W * 0.9, H * 0.16);
    g.stroke();
    g.lineWidth = 1.2;
    g.strokeStyle = "rgba(110, 66, 34, 0.4)";
    for (let k = 1; k <= 11; k++) {
        const y0 = H * 0.58;
        const ex = W * (0.32 + k * 0.055), ey = H * (0.2 + k * 0.05);
        g.beginPath();
        g.moveTo(18 + k * 6, y0);
        g.quadraticCurveTo(W * (0.2 + k * 0.04), H * (0.5 + k * 0.012), ex, Math.min(H * 0.92, ey + H * 0.45));
        g.stroke();
    }
    // 가장자리는 조금 더 짙게 물든다
    g.lineWidth = 10;
    g.strokeStyle = "rgba(160, 60, 34, 0.35)";
    g.stroke(path);
    g.restore();
    return c;
}

export const samara: ObjetDef = {
    interaction: "hover",
    create({ env, tone, options, lite }) {
        const still = options.still === true;
        const bag = new Bag();
        const map = bag.add(new THREE.CanvasTexture(wingTexture()));
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = 4;
        const wingMat = bag.add(new THREE.MeshStandardMaterial({
            map, envMap: env, roughness: 0.6, metalness: 0, transparent: true, opacity: 0.92, alphaTest: 0.03,
            side: THREE.DoubleSide, depthWrite: false,
        }));
        const seedMat = bag.add(new THREE.MeshStandardMaterial({ color: "#6E4326", envMap: env, roughness: 0.45, metalness: 0 }));
        const key = new THREE.DirectionalLight(0xfff0d8, 1.6);
        key.position.set(-1.8, 3, 2.6);

        // 날개 — 씨(원점)에서 +x 로 뻗어 거의 눕고(떨어지는 시과처럼), 길이 방향으로 살짝 비틀린다
        const wingGeo = bag.add(new THREE.PlaneGeometry(1.05, 0.46, lite ? 16 : 28, 6));
        const p = wingGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < p.count; i++) {
            const x = p.getX(i) + 0.525, y = p.getY(i);
            p.setXYZ(i, x, y, y * x * 0.3 + 0.04 * Math.sin(x * 2.6));
        }
        wingGeo.computeVertexNormals();
        const wing = new THREE.Mesh(wingGeo, wingMat);
        wing.rotation.x = -Math.PI / 2 + 0.32;
        const seed = new THREE.Mesh(bag.add(new THREE.SphereGeometry(1, lite ? 24 : 36, lite ? 16 : 24)), seedMat);
        seed.scale.set(0.15, 0.1, 0.09);
        seed.position.set(0.04, 0.0, 0.0);

        // 떨어지는 시과처럼 — 날개를 비스듬히(원뿔처럼) 기울여 씨를 축으로 돈다
        const rotor = new THREE.Group();
        const cone = new THREE.Group();
        cone.rotation.z = -0.16;
        cone.add(wing, seed);
        rotor.add(cone);
        const tilt = new THREE.Group();
        tilt.rotation.set(0.08, 0, 0.06);
        tilt.position.set(0, 0.06, 0);
        tilt.add(rotor);

        const scene = new THREE.Scene();
        scene.add(key, tilt);
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
        camera.position.set(0, 2.75, 2.15);
        camera.lookAt(0, 0, 0);

        const tint = (t: ObjetTone) => {
            wingMat.envMapIntensity = t.dark ? 0.55 : 0.75;
            seedMat.envMapIntensity = t.dark ? 0.6 : 0.85;
            key.intensity = t.dark ? 1.3 : 1.6;
        };
        tint(tone);

        let speed = still ? 0 : 0.9;
        let t = 0;
        rotor.rotation.y = 0.6;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                t += dt;
                speed = approach(speed, input.hover ? 3.2 : still ? 0 : 0.9, 2, dt);
                rotor.rotation.y += speed * dt;
                tilt.position.y = 0.08 + Math.sin(t * 1.1) * 0.03 * Math.min(1, speed);
                return !still || speed > 0.004;
            },
            setTone: tint,
            dispose: () => { bag.dispose(); key.dispose(); },
        };
    },
};
