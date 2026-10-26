import * as THREE from 'three';

type Options = { color: string; gold: string; dark: boolean; motion: 'full' | 'gentle' | 'off'; onFail: () => void };
export interface GemSceneController {
    dispose(): void;
    update(options: Omit<Options, 'onFail'>): void;
}

/** A real crown, girdle and pavilion, rather than a sphere with a low segment count. */
function cutStone(segments = 16) {
    const vertices: number[] = [];
    const colors: number[] = [];
    const vertex = (r: number, z: number, i: number, offset = 0) => {
        const a = (i + offset) / segments * Math.PI * 2;
        return [Math.cos(a) * r, Math.sin(a) * r * 1.32, z] as const;
    };
    const face = (a: readonly number[], b: readonly number[], c: readonly number[], light = 1, cool = 0) => {
        vertices.push(...a, ...b, ...c);
        // These are the virtual pavilion reflections seen through each polished face, not random pigment.
        // In linear RGB a few faces exceed 1: their internal light returns read as white scintillation.
        for (let i = 0; i < 3; i++) colors.push(light * (1 - cool), light, light * (1 + cool));
    };
    const rings = [{ r: .54, z: .4, offset: .5 }, { r: 1, z: .025, offset: 0 }, { r: .99, z: -.055, offset: 0 }, { r: .46, z: -.53, offset: .5 }, { r: .045, z: -.72, offset: 0 }];
    const refraction = [.28, 1.72, .64, 1.18, .38, 2.25, .8, .46, 1.55, .58, 2.05, .32, 1.1, .72, 1.82, .52];
    const inner = (i: number) => {
        const a = (i + .18) / segments * Math.PI * 2;
        const r = .22 + Math.sin(i * 1.7) * .018;
        return [Math.cos(a) * r - .055, Math.sin(a) * r * 1.32 + .065, .4] as const;
    };
    for (let i = 0; i < segments; i++) {
        // A cut gemstone's large flat table reveals crossed inner facets. An off-centre inner star
        // breaks the uniform fan and retains depth even when the ornament is only 100px wide.
        const tableA = vertex(.54, .4, i, .5), tableB = vertex(.54, .4, i + 1, .5);
        face(inner(i), tableA, tableB, refraction[i % 16], i % 3 === 0 ? .035 : -.015);
        face(inner(i), tableB, inner(i + 1), refraction[(i + 5) % 16] * .88 + .2);
        face([-.055, .065, .4], inner(i), inner(i + 1), .95 + refraction[(i + 2) % 16] * .38);
        for (let j = 0; j < rings.length - 1; j++) {
            const top = rings[j], bottom = rings[j + 1];
            const a = vertex(top.r, top.z, i, top.offset), b = vertex(bottom.r, bottom.z, i, bottom.offset);
            const c = vertex(bottom.r, bottom.z, i + 1, bottom.offset), d = vertex(top.r, top.z, i + 1, top.offset);
            const returnLight = j === 0 ? refraction[(i + 3) % 16] * .65 + .28 : .7 + (i % 3) * .17;
            face(a, b, c, returnLight); face(a, c, d, returnLight * .8 + .18);
        }
        face([0, 0, -.72], vertex(.045, -.72, i + 1), vertex(.045, -.72, i));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
}

/** Original, procedural softbox environment. No HDR download or third-party image asset. */
function studioEnvironment(renderer: THREE.WebGLRenderer) {
    const image = document.createElement('canvas'); image.width = 1024; image.height = 512;
    const ctx = image.getContext('2d');
    if (!ctx) return null;
    const wash = ctx.createLinearGradient(0, 0, 0, 512);
    wash.addColorStop(0, '#201c27'); wash.addColorStop(.5, '#08060e'); wash.addColorStop(1, '#534957');
    ctx.fillStyle = wash; ctx.fillRect(0, 0, 1024, 512);
    const box = (x: number, y: number, w: number, h: number, color: string) => {
        ctx.shadowBlur = 12; ctx.shadowColor = color; ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
    };
    box(130, 52, 106, 200, '#fff6e9'); box(620, 10, 35, 350, '#ffffff');
    box(785, 192, 165, 42, '#d9e7ff'); box(380, 350, 76, 80, '#c4b8ca');
    ctx.shadowBlur = 0;
    const map = new THREE.CanvasTexture(image); map.mapping = THREE.EquirectangularReflectionMapping; map.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    try { return pmrem.fromEquirectangular(map); }
    finally { pmrem.dispose(); map.dispose(); }
}

export function createGemScene(canvas: HTMLCanvasElement, { color, gold, dark, motion, onFail }: Options): GemSceneController | null {
    let renderer: THREE.WebGLRenderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch { onFail(); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = dark ? 1.05 : 1.12;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
    camera.position.set(0, 0, 8.1);
    let env: THREE.WebGLRenderTarget | null;
    try { env = studioEnvironment(renderer); }
    catch { renderer.dispose(); onFail(); return null; }
    if (env) scene.environment = env.texture;
    const hemi = new THREE.HemisphereLight('#fff7ee', '#32213f', .7); scene.add(hemi);
    const key = new THREE.DirectionalLight('#fff8ea', 2.6); key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight('#d9e7ff', 1.8); rim.position.set(4, -1, 2); scene.add(rim);

    const jewelry = new THREE.Group(); scene.add(jewelry);
    const stoneColor = new THREE.Color(color);
    const goldMaterial = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(gold).lerp(new THREE.Color('#f1d6a1'), .35), metalness: .98, roughness: .21, clearcoat: .75, clearcoatRoughness: .15, envMapIntensity: 1.5 });
    const stoneMaterial = new THREE.MeshPhysicalMaterial({
        color: stoneColor.clone().lerp(new THREE.Color('#ffffff'), .055),
        metalness: .08, roughness: .025, transmission: .22, thickness: 1.2,
        ior: 2.15, dispersion: .055, clearcoat: 1, clearcoatRoughness: .025,
        attenuationColor: stoneColor.clone(), attenuationDistance: 1.5,
        envMapIntensity: 2.7, flatShading: true, vertexColors: true,
    });
    const diamondMaterial = new THREE.MeshPhysicalMaterial({ color: '#ffefdd', metalness: .12, roughness: .06, transmission: .3, ior: 2.25, thickness: .2, clearcoat: 1, envMapIntensity: 2.1, flatShading: true });
    const mainGeo = cutStone(16);
    const smallGeo = cutStone(8);
    const main = new THREE.Mesh(mainGeo, stoneMaterial); jewelry.add(main);
    // The setting is an actual double gallery and botanical scrollwork behind the crown.
    const tube = (points: THREE.Vector3[], radius = .027, closed = false) => {
        const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
        const geometry = new THREE.TubeGeometry(curve, Math.max(32, points.length * 4), radius, 7, closed);
        const mesh = new THREE.Mesh(geometry, goldMaterial); jewelry.add(mesh); return mesh;
    };
    const oval = (radius: number, z: number) => Array.from({ length: 48 }, (_, i) => {
        const a = i / 48 * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius * 1.32, z);
    });
    tube(oval(1.035, -.02), .038, true);
    tube(oval(1.15, -.16), .024, true);
    tube(oval(.86, -.43), .032, true);
    const ballGeo = new THREE.SphereGeometry(.045, 10, 7);
    for (let i = 0; i < 28; i++) {
        const a = i / 28 * Math.PI * 2;
        const stone = new THREE.Mesh(smallGeo, i % 4 ? diamondMaterial : stoneMaterial);
        stone.position.set(Math.cos(a) * 1.107, Math.sin(a) * 1.107 * 1.32, -.045);
        stone.scale.setScalar(.043); stone.rotation.z = a; jewelry.add(stone);
    }
    // Six fine claws clasp the girdle. Their tips catch a small highlight over the outer facets.
    for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2 + Math.PI / 6;
        tube([
            new THREE.Vector3(Math.cos(a) * .86, Math.sin(a) * 1.135, -.4),
            new THREE.Vector3(Math.cos(a) * 1.08, Math.sin(a) * 1.425, -.02),
            new THREE.Vector3(Math.cos(a) * .93, Math.sin(a) * 1.228, .15),
        ], .027);
        const tip = new THREE.Mesh(ballGeo, goldMaterial);
        tip.position.set(Math.cos(a) * .93, Math.sin(a) * 1.228, .15); tip.scale.setScalar(.73); jewelry.add(tip);
    }
    for (const side of [-1, 1]) {
        const p = (x: number, y: number, z = -.16) => new THREE.Vector3(x * side, y, z);
        tube([p(.42, -1.48), p(1.04, -.97), p(1.45, -.35), p(1.5, .33), p(1.25, .78), p(1.06, .6), p(1.23, .38)], .026);
        tube([p(.66, -1.34), p(1.27, -1.12), p(1.65, -.54), p(1.63, -.1), p(1.43, .03), p(1.29, -.13), p(1.44, -.27)], .019);
        for (let i = 0; i < 3; i++) {
            const y = -.87 + i * .65, x = 1.33 + (i === 1 ? .17 : 0);
            const leaf = new THREE.Mesh(smallGeo, i === 1 ? stoneMaterial : diamondMaterial);
            leaf.scale.set(.095, .18, .14); leaf.position.set(x * side, y, -.04); leaf.rotation.z = side * -.58; jewelry.add(leaf);
            const outline = [p(x - .1, y - .2), p(x - .19, y), p(x + .1, y + .24), p(x + .19, y), p(x - .1, y - .2)];
            tube(outline, .013);
        }
    }
    jewelry.rotation.set(.16, -.28, -.24);
    jewelry.position.set(.08, -.1, 0);

    let frame = 0, last = 0, time = 0, active = true;
    let px = 0, py = 0, targetX = 0, targetY = 0;
    const dispose = () => {
        if (!active) return;
        active = false; cancelAnimationFrame(frame); observer.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('pointermove', pointer);
        canvas.removeEventListener('webglcontextlost', lost);
        const geometries = new Set<THREE.BufferGeometry>();
        scene.traverse(object => { if (object instanceof THREE.Mesh) geometries.add(object.geometry); });
        geometries.forEach(geometry => geometry.dispose());
        goldMaterial.dispose(); stoneMaterial.dispose(); diamondMaterial.dispose();
        env?.dispose(); renderer.dispose();
    };
    const render = () => {
        try { renderer.render(scene, camera); } catch { dispose(); onFail(); }
    };
    const tick = (stamp: number) => {
        frame = 0;
        if (!active || document.hidden || motion === 'off') return;
        if (stamp - last >= 1000 / (motion === 'gentle' ? 20 : 30)) {
            const dt = Math.min((stamp - last) / 1000, .07); last = stamp; time += dt;
            px += (targetX - px) * .035; py += (targetY - py) * .035;
            const pace = motion === 'gentle' ? .4 : 1;
            jewelry.rotation.y = -.28 + Math.sin(time * .19 * pace) * .11 + px * .1;
            jewelry.rotation.x = .16 + Math.cos(time * .15 * pace) * .045 + py * .06;
            jewelry.rotation.z = -.24 + Math.sin(time * .1 * pace) * .025;
            jewelry.position.y = -.1 + Math.sin(time * .23 * pace) * .035;
            key.position.x = -3 + Math.sin(time * .13 * pace) * .45 + px * .5;
            render();
        }
        if (active) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
        if (!active) return;
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
    };
    const visibility = () => {
        cancelAnimationFrame(frame); frame = 0; last = performance.now();
        if (!document.hidden && active && motion !== 'off') frame = requestAnimationFrame(tick);
    };
    const pointer = (event: PointerEvent) => {
        if (motion !== 'full' || event.pointerType === 'touch') return;
        targetX = event.clientX / window.innerWidth * 2 - 1; targetY = event.clientY / window.innerHeight * 2 - 1;
    };
    const lost = (event: Event) => { event.preventDefault(); dispose(); onFail(); };
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('webglcontextlost', lost);
    window.addEventListener('pointermove', pointer, { passive: true });
    resize(); visibility();
    return {
        dispose,
        // RGB sliders update uniforms/materials in place: never recreate WebGL or PMREM per input.
        update: next => {
            if (!active) return;
            stoneColor.set(next.color);
            stoneMaterial.color.copy(stoneColor).lerp(new THREE.Color('#ffffff'), .055);
            stoneMaterial.attenuationColor.copy(stoneColor);
            goldMaterial.color.set(next.gold).lerp(new THREE.Color('#f1d6a1'), .35);
            renderer.toneMappingExposure = next.dark ? 1.05 : 1.12;
            if (motion !== next.motion) {
                motion = next.motion;
                if (motion !== 'full') targetX = targetY = 0;
                visibility();
            }
            if (!document.hidden) render();
        },
    };
}
