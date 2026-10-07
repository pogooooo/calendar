/**
 * 잎 — 수채 단풍잎 한 장의 표본(art.ts 의 그림). 가로로 오목하게 말리고 끝이 조금 들려 있어, 돌 때 빛이 면을 따라 흐른다.
 * 스튜디오 반사광(무대의 env) 아래 얇은 밀랍 윤기, 잎맥은 그림의 밝기로 살짝 파인 결, 뒷면은 옅다.
 * 손: 올리면(또는 active) 꼭지를 축으로 천천히 돌아 앞뒤를 보이고, 가로로 끌면 돌릴 수 있다.
 *
 * options
 *   sprite: 'red'|'orange'|'yellow'|'brown'|'today'(기본 red — 표본처럼 날마다 바뀌게 하려면 today)
 *   still:  가만히 있다가 올렸을 때(active)만 돈다 — 멈추면 그리기도 쉰다(테마 고르기 타일)
 */
import * as THREE from "three";
import type { ObjetDef, ObjetInput, ObjetTone } from "../types";
import { Bag, Spin, approach } from "../kit";
import { leafArt, todaySprite, type LeafSprite } from "./art";

/** 잎 판 — 꼭지(아래 가운데)는 평평하고, 가로로 오목하며 끝으로 갈수록 들린다 */
function leafGeometry(seg: number) {
    const g = new THREE.PlaneGeometry(1, 1, seg, seg);
    const p = g.attributes.position as THREE.BufferAttribute;
    const sm = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    for (let i = 0; i < p.count; i++) {
        const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5;
        const d = Math.hypot(u - 0.47, v - 0.17);
        const lift = 0.07 * Math.pow(sm(0.04, 0.86, d), 1.6);
        const cup = 0.09 * Math.pow(Math.abs(u - 0.5) * 2, 2) * sm(0.18, 0.55, d);
        p.setZ(i, lift + cup + 0.025 * (u - 0.5) * (v - 0.5));
    }
    g.computeVertexNormals();
    return g;
}

export const leaf: ObjetDef = {
    interaction: "hover",
    create({ env, tone, options, lite }) {
        const still = options.still === true;
        const sprite: LeafSprite = options.sprite === "today" ? todaySprite() : (options.sprite as LeafSprite) ?? "red";
        const bag = new Bag();
        const map = bag.add(new THREE.CanvasTexture(leafArt(sprite)));
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = 4;
        const front = bag.add(new THREE.MeshStandardMaterial({
            map, bumpMap: map, bumpScale: 0.9, envMap: env, roughness: 0.52, metalness: 0,
            transparent: true, alphaTest: 0.04, depthWrite: false, side: THREE.FrontSide,
        }));
        // 잎 뒷면 — 같은 그림이 거꾸로 비치되 조금 옅고 거칠게
        const back = bag.add(front.clone());
        back.side = THREE.BackSide;
        back.roughness = 0.7;
        const key = new THREE.DirectionalLight(0xfff2dc, 1.6);
        key.position.set(-1.6, 2.4, 3.2);

        const geo = bag.add(leafGeometry(lite ? 20 : 32));
        const pivot = new THREE.Group();
        const body = new THREE.Group();
        body.add(new THREE.Mesh(geo, back), new THREE.Mesh(geo, front));
        // 꼭지 쪽을 축으로 — 돌 때 잎몸이 꼭지를 중심으로 흔들린다
        body.position.y = 0.03;
        pivot.add(body);
        const scene = new THREE.Scene();
        scene.add(key, pivot);
        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
        camera.position.set(0, 0.04, 2.05);

        const tint = (t: ObjetTone) => {
            front.envMapIntensity = t.dark ? 0.6 : 0.78;
            back.envMapIntensity = front.envMapIntensity * 0.8;
            back.color.set(t.dark ? "#B9AC98" : "#E6DAC8");
            key.intensity = t.dark ? 1.35 : 1.6;
        };
        tint(tone);

        const spin = new Spin(0, 0.012);
        // 쉬는 자세 — 살짝 비껴 서서 입체가 보인다
        const rest = { yaw: 0.32, pitch: -0.2, roll: 0.1 };
        const pose = { ...rest };
        let phase = 0;
        let live = still ? 0 : 1;
        return {
            scene,
            camera,
            update(dt: number, input: ObjetInput) {
                const coasting = spin.step(dt, input.dragging, input.dragX);
                live = approach(live, input.hover || !still ? 1 : 0, 2.2, dt);
                phase += dt * live * (input.hover ? 0.9 : 0.55);
                // 꼭지를 축으로 천천히 돌며 앞뒤를 보이고, 고개를 조금 끄덕인다
                const yaw = rest.yaw + live * (Math.sin(phase) * 0.75 - 0.08);
                const pitch = rest.pitch + live * Math.sin(phase * 0.7 + 1) * 0.12;
                const roll = rest.roll + live * Math.sin(phase * 0.5) * 0.06;
                pose.yaw = approach(pose.yaw, yaw, 6, dt);
                pose.pitch = approach(pose.pitch, pitch, 6, dt);
                pose.roll = approach(pose.roll, roll, 6, dt);
                pivot.rotation.set(pose.pitch, pose.yaw + spin.angle, pose.roll, "YXZ");
                const settled = Math.abs(pose.yaw - rest.yaw) + Math.abs(pose.pitch - rest.pitch) + Math.abs(pose.roll - rest.roll) < 0.002;
                return !still || live > 0.002 || coasting || !settled;
            },
            setTone: tint,
            dispose: () => { bag.dispose(); key.dispose(); },
        };
    },
};
