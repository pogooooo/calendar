import { Bag, approach } from "../kit";
import type { ObjetContext, ObjetInput, ObjetRegistry, ObjetTone, Three } from "../types";
import { crystalFragment, crystalVertex, glintFragment, glintVertex } from "./crystalOptics";

// Amethyst & Pearl moodboard swatches and the center-right raw amethyst band.
const PEARL = "#efdbcd";
const LILAC = "#d8bcd4";
const AMETHYST = "#62236a";
const WELL = "#4b224d";
const GLINT_ANGLES = [.3, -.6, .87];

function seededRandom(seed: number) {
    return () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
}

/** Convex hexagonal quartz. The optical planes and the rendered faces share the same vertices. */
function quartz(THREE: Three, variant: number) {
    const positions: number[] = [];
    const planes = [];
    const radius = variant === 1 ? .75 : 1;
    const crownZ = 1.08 + variant * .22;
    const ring = (size: number, z: number) => Array.from({ length: 6 }, (_, i) => {
        const angle = i * Math.PI / 3;
        return new THREE.Vector3(Math.cos(angle) * size, Math.sin(angle) * size, z);
    });
    const base = ring(radius * .72, -.32);
    const girdle = ring(radius, .05);
    const crown = ring(radius, crownZ);
    const tip = new THREE.Vector3(.12 * variant, -.13 + variant * .085, crownZ + .7);
    const bottom = new THREE.Vector3(0, 0, -.32);
    const plane = (a: typeof bottom, b: typeof bottom, c: typeof bottom) => {
        const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
        planes.push(new THREE.Vector4(normal.x, normal.y, normal.z, normal.dot(a)));
    };
    const triangle = (a: typeof bottom, b: typeof bottom, c: typeof bottom) => {
        positions.push(...a.toArray(), ...b.toArray(), ...c.toArray());
    };
    for (let i = 0; i < 6; i++) {
        const j = (i + 1) % 6;
        triangle(bottom, base[j], base[i]);
        triangle(base[i], base[j], girdle[j]);
        triangle(base[i], girdle[j], girdle[i]);
        triangle(girdle[i], girdle[j], crown[j]);
        triangle(girdle[i], crown[j], crown[i]);
        triangle(crown[i], crown[j], tip);
        plane(base[i], base[j], girdle[j]);
        plane(girdle[i], girdle[j], crown[j]);
        plane(crown[i], crown[j], tip);
    }
    planes.push(new THREE.Vector4(0, 0, -1, .32));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return { geometry, planes, anchors: [tip, crown[1], crown[3]] };
}

/** Bevelled step cut. Each concentric ring forms a distinct reflecting facet. */
function stepCut(THREE: Three) {
    const outline = [[-.66, -1], [.66, -1], [1, -.66], [1, .66],
        [.66, 1], [-.66, 1], [-1, .66], [-1, -.66]];
    const ring = (x: number, y: number, z: number) =>
        outline.map(([u, v]) => new THREE.Vector3(u * x, v * y, z));
    const tiers = [ring(.41, .48, -.83), ring(.81, 1.09, -.31),
        ring(1, 1.32, .02), ring(.91, 1.21, .32), ring(.68, .93, .62)];
    const points: number[] = [];
    const planes = [];
    const face = (a: (typeof tiers)[number][number], b: typeof a, c: typeof a, d?: typeof a) => {
        const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
        planes.push(new THREE.Vector4(normal.x, normal.y, normal.z, normal.dot(a)));
        points.push(...a.toArray(), ...b.toArray(), ...c.toArray());
        if (d) points.push(...a.toArray(), ...c.toArray(), ...d.toArray());
    };
    for (let tier = 0; tier < tiers.length - 1; tier++) {
        const low = tiers[tier];
        const high = tiers[tier + 1];
        for (let i = 0; i < outline.length; i++) {
            const j = (i + 1) % outline.length;
            face(low[i], low[j], high[j], high[i]);
        }
    }
    const bottom = tiers[0];
    const table = tiers[tiers.length - 1];
    for (let i = 1; i < outline.length - 1; i++) {
        points.push(...bottom[0].toArray(), ...bottom[i + 1].toArray(), ...bottom[i].toArray(),
            ...table[0].toArray(), ...table[i].toArray(), ...table[i + 1].toArray());
    }
    planes.push(new THREE.Vector4(0, 0, -1, .83), new THREE.Vector4(0, 0, 1, .62));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    geometry.computeVertexNormals();
    return { geometry, planes, anchors: [table[4], table[2], tiers[2][6]] };
}

function createSurface({ THREE, tone, options, lite }: ObjetContext, rail: boolean) {
    const bag = new Bag();
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 24);
    camera.position.z = 7;
    const stone = new THREE.Group();
    scene.add(stone);
    const tint = typeof options.color === "string" ? new THREE.Color(options.color) : null;
    const uniforms = {
        uAmethyst: { value: new THREE.Color(AMETHYST) },
        uPearl: { value: new THREE.Color(PEARL) },
        uWell: { value: new THREE.Color(WELL) },
        uDark: { value: 0 },
        uRail: { value: Number(rail) },
        uSheen: { value: 0 },
        uLightHeight: { value: 0 },
        uFlash: { value: 0 },
    };
    const materialFor = (planes: ReturnType<typeof quartz>["planes"]) => bag.add(new THREE.ShaderMaterial({
        vertexShader: crystalVertex,
        fragmentShader: crystalFragment,
        defines: { PLANE_COUNT: planes.length },
        uniforms: { ...uniforms, uPlanes: { value: planes } },
    }));

    const random = seededRandom(rail ? 622 : 319);
    const count = rail ? 25 : lite ? 23 : 43;
    const groups = Array.from({ length: 3 }, (_, variant) => {
        const { geometry, planes } = quartz(THREE, variant);
        const mesh = new THREE.InstancedMesh(bag.add(geometry), materialFor(planes), count);
        mesh.frustumCulled = false;
        stone.add(mesh);
        const placements = Array.from({ length: count }, (_, i) => ({
            upper: i % 4 !== 0,
            x: random(),
            y: random(),
            z: random(),
            size: .025 + random() ** 2.5 * .105,
            pitch: .42 + random() * .9,
            yaw: -.9 + random() * 1.7,
            roll: random() * Math.PI * 2,
        }));
        return { mesh, placements };
    });
    const majorCut = rail ? stepCut(THREE) : quartz(THREE, 1);
    const centerpiece = new THREE.Mesh(bag.add(majorCut.geometry), materialFor(majorCut.planes));
    stone.add(centerpiece);
    const glintGeometry = bag.add(new THREE.PlaneGeometry(1, 1));
    const glints = majorCut.anchors.map((anchor, index) => {
        const material = bag.add(new THREE.ShaderMaterial({
            vertexShader: glintVertex,
            fragmentShader: glintFragment,
            uniforms: { uLight: { value: 0 }, uAngle: { value: .43 + index * .66 } },
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        }));
        const glint = new THREE.Mesh(glintGeometry, material);
        glint.renderOrder = 2;
        scene.add(glint);
        return { glint, anchor };
    });

    const setTone = (next: ObjetTone) => {
        uniforms.uDark.value = Number(next.dark);
        uniforms.uPearl.value.set(next.dark ? LILAC : PEARL);
        uniforms.uAmethyst.value.set(next.dark ? AMETHYST : "#9e619c");
        uniforms.uWell.value.set(next.dark ? "#311234" : WELL);
        if (tint) {
            uniforms.uAmethyst.value.lerp(tint, .72);
            uniforms.uWell.value.lerp(tint, .42);
            uniforms.uPearl.value.lerp(tint, .18);
        }
    };
    setTone(tone);
    const placement = new THREE.Object3D();
    let pointerX = 0;
    let pointerY = 0;
    let energy = 0;
    let flash = 1;
    let burstX = 0;
    let burstY = 0;
    return {
        scene,
        camera,
        setTone,
        resize(width: number, height: number) {
            const aspect = width / height;
            camera.left = -aspect;
            camera.right = aspect;
            camera.updateProjectionMatrix();
            for (const { mesh, placements } of groups) {
                placements.forEach((p, i) => {
                    const reach = p.x;
                    const x = rail ? (.65 - reach * 1.45) * aspect
                        : (p.upper ? .6 + reach * .53 : -.66 - reach * .45) * aspect;
                    const y = rail ? -.87 + reach * .16 + (p.y - .5) * .21
                        : p.upper ? 1.04 - reach * .33 + (p.y - .55) * .31
                            : -.96 + reach * .22 + (p.y - .57) * .21;
                    const size = p.size * (rail ? Math.min(1.12, aspect * 4.4) : Math.min(.82, aspect * 1.3));
                    placement.position.set(x, y, -.08 + p.z * .14);
                    placement.rotation.set(p.pitch * (p.upper ? 1 : -1), p.yaw, p.roll);
                    placement.scale.set(size, size, size * (rail ? 1.2 : .9));
                    placement.updateMatrix();
                    mesh.setMatrixAt(i, placement.matrix);
                });
                mesh.instanceMatrix.needsUpdate = true;
            }
            const size = rail ? Math.min(.181, aspect * .79) : Math.min(.115, aspect * .27);
            centerpiece.position.set(aspect * (rail ? -.055 : .92), rail ? -.744 : .795, rail ? .17 : .1);
            centerpiece.scale.set(size, size, size);
        },
        update(dt: number, input: ObjetInput) {
            if (!dt) {
                pointerX = pointerY = energy = 0;
                flash = 1;
            }
            if (input.pressed) {
                flash = 0;
                burstX = input.x;
                burstY = input.y;
            }
            const x = input.hover ? input.x : 0;
            const y = input.hover ? input.y : 0;
            const distance = Math.hypot(x - pointerX, y - pointerY);
            pointerX = approach(pointerX, x, 12, dt);
            pointerY = approach(pointerY, y, 12, dt);
            energy = approach(energy, input.hover ? Math.min(1, distance * 1.6) : 0, 9, dt);
            const burst = Math.sin(flash * Math.PI) * (1 - flash * .28);
            flash = Math.min(1, flash + dt / .79);
            uniforms.uSheen.value = pointerX * .83 + burst * (flash - .42) * (burstX < 0 ? -1.8 : 1.8);
            uniforms.uLightHeight.value = -pointerY * .83 - burstY * burst * .46;
            uniforms.uFlash.value = energy * .66 + burst * .92;
            stone.rotation.y = pointerX * (rail ? .32 : .17);
            stone.rotation.x = pointerY * (rail ? .15 : .105);
            centerpiece.rotation.set((rail ? .22 : .87) + pointerY * .33,
                (rail ? -.29 : -.47) + pointerX * .65, (rail ? -.36 : .33) + pointerX * .16);
            centerpiece.updateWorldMatrix(true, false);
            glints.forEach(({ glint, anchor }, index) => {
                glint.position.copy(anchor).applyMatrix4(centerpiece.matrixWorld);
                glint.position.z = 2;
                const alignment = 1 - Math.min(1, Math.abs(pointerX - GLINT_ANGLES[index]) * 2.7);
                const pulse = burst * Math.max(0, Math.sin(flash * Math.PI * 3 - index * .8));
                const glintLight = (index === 0 ? .51 : 0) + energy * alignment * .88 + pulse * 1.16;
                glint.material.uniforms.uLight.value = glintLight;
                glint.visible = glintLight > .025;
                glint.scale.setScalar((rail ? .22 : .16) * (1 + pulse * .68));
            });
            return distance > .002 || energy > .003 || flash < 1;
        },
        dispose() {
            groups.forEach(({ mesh }) => mesh.dispose());
            bag.dispose();
        },
    };
}

export default {
    geode: { interaction: "surface", create: context => createSurface(context, false) },
    amethyst: { interaction: "surface", create: context => createSurface(context, true) },
} satisfies ObjetRegistry;
