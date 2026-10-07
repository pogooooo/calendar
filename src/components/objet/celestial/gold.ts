/**
 * Celestial 오브제의 금 — 공단처럼 은은하게 비치는 금속(스튜디오 반사광 + 위 왼쪽의 따뜻한 빛 하나).
 *
 * 밝은 벌(아이보리 종이) 위에서는 금이 종이에 묻히거나 주황으로 뜬다 → 채도를 눌러 옛 놋쇠 쪽으로, 선이 또렷하게.
 * 어두운 벌(남색 밤) 위에서는 밝은 금, 해 구슬은 살짝 스스로 빛난다.
 * 색은 테마의 primary 에서 나온다 — 갈래 이름은 보지 않는다.
 */
import * as THREE from "three";
import type { ObjetTone } from "../types";

const tint = (base: string, toward: string, t: number) => new THREE.Color(base).lerp(new THREE.Color(toward), t);

export class Gold {
    /** 고리·축 — 주인공 금 */
    readonly satin: THREE.MeshStandardMaterial;
    /** 구슬·꼭지·눈금 — 더 밝고 매끈하게 */
    readonly bright: THREE.MeshStandardMaterial;
    /** 속 공·받침 — 한 톤 깊고 거칠게 (면이 넓어 번쩍이면 시끄럽다) */
    readonly deep: THREE.MeshStandardMaterial;
    /** 띠의 면 — 비치는 얇은 금박 (선 사이를 살짝 메운다) */
    readonly veil: THREE.MeshStandardMaterial;
    /** 해 — 어두운 벌에서는 스스로 조금 빛난다 */
    readonly sun: THREE.MeshStandardMaterial;
    readonly key: THREE.DirectionalLight;

    constructor(env: THREE.Texture, tone: ObjetTone) {
        this.satin = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.3, envMap: env });
        this.bright = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.2, envMap: env });
        this.deep = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.42, envMap: env });
        this.veil = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.38, envMap: env, side: THREE.DoubleSide, transparent: true, depthWrite: false });
        this.sun = new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.25, envMap: env });
        this.key = new THREE.DirectionalLight(0xfff0d4, 1);
        this.key.position.set(-2.6, 3.8, 4.2);
        this.setTone(tone);
    }

    get all() { return [this.satin, this.bright, this.deep, this.veil, this.sun]; }

    setTone(tone: ObjetTone) {
        const p = tone.primary;
        if (tone.dark) {
            this.satin.color.copy(tint(p, "#FFF1C8", 0.12));
            this.bright.color.copy(tint(p, "#FFF6DE", 0.3));
            this.deep.color.copy(tint(p, "#6A5226", 0.3));
            this.veil.color.copy(tint(p, "#FFF1C8", 0.1));
            this.veil.opacity = 0.32;
            this.sun.color.copy(tint(p, "#FFE7A8", 0.4));
            this.sun.emissive.copy(tint(p, "#FFB84A", 0.4)).multiplyScalar(0.55);
            this.all.forEach((m) => { m.envMapIntensity = 1.05; });
            this.key.intensity = 1.5;
        } else {
            // 노랗게 뜨지 않게 올리브빛 갈색 쪽으로 — 종이 위의 오래된 놋쇠(넓은 면일수록 더 깊게)
            this.satin.color.copy(tint(p, "#5E4C20", 0.36));
            this.bright.color.copy(tint(p, "#75602C", 0.2));
            this.deep.color.copy(tint(p, "#3A2C10", 0.55));
            this.veil.color.copy(tint(p, "#5E4C20", 0.25));
            this.veil.opacity = 0.28;
            this.sun.color.copy(tint(p, "#8A5C0E", 0.25));
            this.sun.emissive.setRGB(0, 0, 0);
            this.all.forEach((m) => { m.envMapIntensity = 0.92; });
            this.deep.envMapIntensity = 0.78;
            this.key.intensity = 1.05;
        }
    }

    dispose() {
        this.all.forEach((m) => m.dispose());
        this.key.dispose();
    }
}
